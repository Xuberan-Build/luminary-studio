import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { openai } from '@/lib/openai/client';
import { chartAnalysisModel } from '@/lib/ai/models';
// @ts-ignore
import pdfParse from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storagePaths = [] } = body || {};

    if (!Array.isArray(storagePaths) || storagePaths.length === 0) {
      return NextResponse.json({ error: 'No files provided for extraction' }, { status: 400 });
    }

    // Separate astro vs HD inputs, sign URLs for images, extract text from PDFs
    const astroImages: string[] = [];
    const hdImages: string[] = [];
    const pdfTexts: string[] = [];

    const isAstro = (path: string) =>
      path.toLowerCase().includes('astro') ||
      path.toLowerCase().includes('birth') ||
      path.toLowerCase().includes('chart');
    const isHD = (path: string) =>
      path.toLowerCase().includes('humandesign') ||
      path.toLowerCase().includes('human-design') ||
      path.toLowerCase().includes('myhumandesign');

    for (const path of storagePaths.slice(0, 6)) {
      const lower = path.toLowerCase();
      const isPdf = lower.endsWith('.pdf');

      if (isPdf) {
        const { data, error } = await supabaseAdmin.storage.from('product-uploads').download(path);
        if (error || !data) {
          console.error('PDF download error:', error);
          throw new Error(`Could not download PDF: ${path}`);
        }
        const buffer = Buffer.from(await data.arrayBuffer());
        const parsed = await pdfParse(buffer);
        if (parsed?.text) {
          pdfTexts.push(parsed.text.slice(0, 8000));
        }
      } else {
        const { data, error } = await supabaseAdmin.storage
          .from('product-uploads')
          .createSignedUrl(path, 60 * 10); // 10 minutes
        if (error || !data?.signedUrl) {
          console.error('File signing error:', error);
          throw new Error(`Could not sign file: ${path}`);
        }
        if (isHD(path)) {
          hdImages.push(data.signedUrl);
        } else {
          astroImages.push(data.signedUrl);
        }
      }
    }

const astroPrompt = `
You are an expert astrologer. You will receive up to 3 birth chart images (signed URLs). Extract ONLY visible placements from the chart wheel and any planet/house tables. Ignore narrative text. If unclear, set "UNKNOWN". Never guess.

Return JSON ONLY, in this exact shape:
{
  "astrology": {
    "sun": "",
    "moon": "",
    "rising": "",
    "mercury": "",
    "venus": "",
    "mars": "",
    "jupiter": "",
    "saturn": "",
    "uranus": "",
    "neptune": "",
    "pluto": "",
    "houses": ""
  }
}

Rules:
- For planets, include sign and house if visible (e.g., "Sun: Taurus 12th house" or "UNKNOWN").
- For rising, include sign (and house if shown).
- For houses: summarize any visible house info. If money houses are visible, list them explicitly (2nd/8th/11th/10th).
- Do NOT invent data. Use "UNKNOWN" for anything not clearly visible.
`;

const hdPrompt = `
You are an expert Human Design analyst. You will receive up to 3 HD chart images (signed URLs) and optional PDF text. Extract ONLY visible fields. If unclear, set "UNKNOWN". Never guess. Ignore narrative text.
Return JSON only:
{
  "human_design": {
    "type": "",
    "strategy": "",
    "authority": "",
    "profile": "",
    "centers": "",
    "gifts": ""
  }
}
`;

    const callExtraction = async (promptText: string, images: string[], pdfText: string | null) => {
      const content: any[] = [{ type: 'text', text: promptText }];
      if (pdfText) {
        content.push({ type: 'text', text: `PDF extracted text:\n${pdfText.slice(0, 8000)}` });
      }
      if (images.length) {
        content.push(...images.map((url) => ({ type: 'image_url', image_url: { url } })));
      }
      const completion = await openai.chat.completions.create({
        model: chartAnalysisModel,
        messages: [{ role: 'user', content }],
        temperature: 0,
        max_completion_tokens: 1500,
        response_format: { type: 'json_object' },
      });
      return JSON.parse(completion.choices[0].message.content || '{}');
    };

    // Astro extraction
    const astroResult = await callExtraction(astroPrompt, astroImages.slice(0, 3), null);
    // HD extraction with any PDF text
    const hdResult = await callExtraction(hdPrompt, hdImages.slice(0, 3), pdfTexts.join('\n\n---\n\n') || null);

    const merged = {
      astrology: astroResult?.astrology || {
        sun: 'UNKNOWN',
        moon: 'UNKNOWN',
        rising: 'UNKNOWN',
        mercury: 'UNKNOWN',
        venus: 'UNKNOWN',
        mars: 'UNKNOWN',
        jupiter: 'UNKNOWN',
        saturn: 'UNKNOWN',
        uranus: 'UNKNOWN',
        neptune: 'UNKNOWN',
        pluto: 'UNKNOWN',
        houses: 'UNKNOWN',
      },
      human_design: hdResult?.human_design || {
        type: 'UNKNOWN',
        strategy: 'UNKNOWN',
        authority: 'UNKNOWN',
        profile: 'UNKNOWN',
        centers: 'UNKNOWN',
        gifts: 'UNKNOWN',
      },
    };

    return NextResponse.json({ placements: merged });
  } catch (err: any) {
    console.error('Extraction API error:', err);
    return NextResponse.json({ error: err?.message || 'Extraction failed' }, { status: 500 });
  }
}
