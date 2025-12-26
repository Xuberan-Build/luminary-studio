'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProgressBar } from './ProgressBar';
import { StepView } from './StepView';
import { FollowUpChat } from './FollowUpChat';
import { DeliverableView } from './DeliverableView';
import { supabase } from '@/lib/supabase/client';
import { chartAnalysisModel, conversationalModel } from '@/lib/ai/models';

interface ProductExperienceProps {
  product: any;
  session: any;
  userId: string;
}

export default function ProductExperience({
  product,
  session,
  userId,
}: ProductExperienceProps) {
  const [currentStep, setCurrentStep] = useState(session.current_step);
  const [stepResponse, setStepResponse] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliverable, setDeliverable] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [placements, setPlacements] = useState<any>(session.placements || null);
  const [placementsConfirmed, setPlacementsConfirmed] = useState<boolean>(
    !!session.placements_confirmed
  );
  const [uploadsLoaded, setUploadsLoaded] = useState<boolean>(false);
  const [placementsAcknowledgedUnknowns, setPlacementsAcknowledgedUnknowns] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<number>(
    session.current_section || 1
  );
  const [followupCounts, setFollowupCounts] = useState<Record<number, number>>(
    session.followup_counts || {}
  );
  const [confirmGate, setConfirmGate] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [placementsError, setPlacementsError] = useState<string | null>(null);
  const [placementNotes, setPlacementNotes] = useState<string>('');
  const searchParams = useSearchParams();
  const [assistantReply, setAssistantReply] = useState<string>('');
  const [showIntroReply, setShowIntroReply] = useState<boolean>(false);
const [hasGuarded, setHasGuarded] = useState(false);
  const [seedInsightShown, setSeedInsightShown] = useState(false);
  const [forcedConfirmOnce, setForcedConfirmOnce] = useState(false);
  const [forcedInitReset, setForcedInitReset] = useState(false);
  const appendConversation = async (stepNumber: number, newMessages: Array<{ role: string; content: string; type?: string }>) => {
    const { data } = await supabase
      .from('conversations')
      .select('messages')
      .eq('session_id', session.id)
      .eq('step_number', stepNumber)
      .maybeSingle();
    const existing = (data?.messages as any[]) || [];
    const updated = [
      ...existing,
      ...newMessages.map((m) => ({
        ...m,
        created_at: new Date().toISOString(),
      })),
    ];
    await supabase
      .from('conversations')
      .upsert(
        {
          session_id: session.id,
          step_number: stepNumber,
          messages: updated,
        },
        { onConflict: 'session_id,step_number' }
      );
  };
  useEffect(() => {
    console.log(
      '[PX] initial mount',
      JSON.stringify(
        {
          sessionId: session.id,
          sessionCurrentStep: session.current_step,
          sessionPlacementsConfirmed: session.placements_confirmed,
          sessionPlacementsEmpty: isPlacementsEmpty(session.placements),
          stateCurrentStep: currentStep,
          statePlacementsConfirmed: placementsConfirmed,
          statePlacementsEmpty: isPlacementsEmpty(placements),
        },
        null,
        2
      )
    );
  }, []); // log once on mount
  useEffect(() => {
    console.log(
      '[PX] state change',
      JSON.stringify(
        {
          currentStep,
          placementsConfirmed,
          confirmGate,
          placementsEmpty: isPlacementsEmpty(placements),
          uploadedFiles: uploadedFiles.length,
          showFollowUp,
        },
        null,
        2
      )
    );
  }, [placementsConfirmed, currentStep, confirmGate, placements, uploadedFiles.length, showFollowUp]);

  const isPlacementsEmpty = (pl: any) => {
    if (!pl) return true;
    const astro = pl.astrology || {};
    const hd = pl.human_design || {};
    const astroHas = Object.values(astro).some((v) => v && v !== 'UNKNOWN');
    const hdHas = Object.values(hd).some((v) => v && v !== 'UNKNOWN');
    const notesHas = pl.notes && typeof pl.notes === 'string' && pl.notes.trim().length > 0;
    return !(astroHas || hdHas || notesHas);
  };

  // Use steps directly from product (now stored in Supabase)
  const steps = product.steps || [];
  const currentStepData = steps[currentStep - 1];
  const isLastStep = currentStep === steps.length;
  const completionPercentage = Math.round((currentStep / steps.length) * 100);

  // Check if session is complete and load deliverable
  useEffect(() => {
    if (session.completed_at) {
      loadDeliverable();
    }
  }, [session.completed_at]);

  // If placements are not confirmed, force user back to step 1 and the confirmation gate
  useEffect(() => {
    if (!placementsConfirmed && currentStep > 1) {
      setCurrentStep(1);
      setConfirmGate(true);
      supabase
        .from('product_sessions')
        .update({ current_step: 1 })
        .eq('id', session.id)
        .eq('user_id', userId)
        .throwOnError();
    }
  }, [placementsConfirmed, currentStep, steps.length, session.id, userId]);

  // If placements are empty but marked confirmed, reset and force confirmation
  useEffect(() => {
    if (placementsConfirmed && isPlacementsEmpty(placements)) {
      setPlacementsConfirmed(false);
      setConfirmGate(true);
      setCurrentStep(1);
      supabase
        .from('product_sessions')
        .update({
          current_step: 1,
          placements_confirmed: false,
          placements: null,
          current_section: 1,
        })
        .eq('id', session.id)
        .eq('user_id', userId)
        .throwOnError();
    }
  }, [placementsConfirmed, placements, steps.length, session.id, userId]);

  // If query has confirm=1, open the confirmation gate
  useEffect(() => {
    if (!placementsConfirmed) {
      const confirmFlag = searchParams.get('confirm');
      if (confirmFlag === '1') {
        setConfirmGate(true);
      }
    }
  }, [placementsConfirmed, searchParams]);

  // Preload any existing uploaded documents (handles refresh)
  useEffect(() => {
    const loadUploads = async () => {
      const { data, error } = await supabase
        .from('uploaded_documents')
        .select('storage_path')
        .eq('session_id', session.id);
      if (!error && data) {
        const paths = data.map((d: any) => d.storage_path).filter(Boolean);
        if (paths.length) setUploadedFiles(paths);
      }
      setUploadsLoaded(true);
    };
    loadUploads();
  }, [session.id]);

  // Force confirmation gate on first load of step 1 to allow re-confirmation
  useEffect(() => {
    if (currentStep === 1 && !forcedConfirmOnce) {
      // Only show confirm gate if we already have uploads or confirmed placements
      // Otherwise, let the user upload files first
      const hasUploads = uploadedFiles.length > 0;
      const hasConfirmedPlacements = placementsConfirmed && placements;

      if (hasUploads || hasConfirmedPlacements) {
        setConfirmGate(true);
      } else {
        setConfirmGate(false);
      }

      if (placementsConfirmed) {
        setPlacementsConfirmed(false);
      }
      setForcedConfirmOnce(true);
    }
  }, [currentStep, placementsConfirmed, forcedConfirmOnce, uploadedFiles.length, placements]);

  // If session was previously confirmed and current_step > 1, force reset to step 1 and reconfirm
  useEffect(() => {
    if (!forcedInitReset && session.placements_confirmed && session.current_step > 1) {
      setPlacementsConfirmed(false);
      setConfirmGate(true);
      setCurrentStep(1);
      setForcedInitReset(true);
    }
  }, [forcedInitReset, session.placements_confirmed, session.current_step]);

  // Auto intro reply after placements confirmed
  useEffect(() => {
    const sendIntro = async () => {
      if (placementsConfirmed && !assistantReply && currentStep === 1 && !showIntroReply) {
        try {
          const res = await fetch('/api/products/step-insight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stepNumber: 0,
              stepData: { title: 'Chart Read', question: 'Acknowledge placements and money/creation themes.' },
              mainResponse: 'Confirmed chart placements.',
              placements,
              sessionId: session.id,
              userId,
              productSlug: product.product_slug,
              systemPrompt: product.system_prompt,
              productName: product.name,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setAssistantReply(data.aiResponse || '');
            setShowIntroReply(true);
          }
        } catch (e) {
          console.error('Intro reply failed', e);
        }
      }
    };
    sendIntro();
  }, [placementsConfirmed, assistantReply, currentStep, showIntroReply, placements, product.system_prompt, product.name]);

  // Seed an initial chart/money insight when the user first lands on step 2
  useEffect(() => {
    console.log('[PX] seedInsight effect check:', {
      placementsConfirmed,
      currentStep,
      seedInsightShown,
      shouldTrigger: placementsConfirmed && currentStep === 2 && !seedInsightShown
    });

    const seedInsight = async () => {
      if (placementsConfirmed && currentStep === 2 && !seedInsightShown) {
        console.log('[PX] Triggering seed insight for step 2');
        try {
          const res = await fetch('/api/products/step-insight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stepNumber: 0,
              stepData: {
                title: 'Initial chart + money clarity',
                question:
                  'Give 2-3 sentences on money/self-worth/creation using confirmed placements only. Include: 2nd house sign+ruler+its location; if 2nd is empty, say what that means; note key money houses (2/8/10/11) only when known; one actionable business/money takeaway. No speculation on unknowns.',
              },
              mainResponse: 'Use confirmed placements to orient the user before Q&A.',
              placements,
              sessionId: session.id,
              userId,
              productSlug: product.product_slug,
              systemPrompt: product.system_prompt,
              productName: product.name,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            console.log('[PX] Seed insight full data:', data);
            console.log('[PX] Seed insight response:', data.aiResponse?.slice(0, 100));
            console.log('[PX] Setting assistantReply to:', data.aiResponse ? 'CONTENT PRESENT' : 'EMPTY');
            setAssistantReply(data.aiResponse || '');
          } else {
            const errorData = await res.json();
            console.error('[PX] Seed insight API error:', res.status, errorData);
          }
        } catch (e) {
          console.error('[PX] Seed insight failed:', e);
        } finally {
          setSeedInsightShown(true);
        }
      }
    };
    seedInsight();
  }, [placementsConfirmed, currentStep, seedInsightShown, placements, product.system_prompt, product.name]);

  const formatPlacementsForChat = (pl: any) => {
    if (!pl) return 'No placements extracted yet.';
    const astro = pl.astrology || {};
    const hd = pl.human_design || {};
    const astroLines = [
      `Sun: ${astro.sun || 'UNKNOWN'}`,
      `Moon: ${astro.moon || 'UNKNOWN'}`,
      `Rising: ${astro.rising || 'UNKNOWN'}`,
      `Mercury: ${astro.mercury || 'UNKNOWN'}`,
      `Venus: ${astro.venus || 'UNKNOWN'}`,
      `Mars: ${astro.mars || 'UNKNOWN'}`,
      `Jupiter: ${astro.jupiter || 'UNKNOWN'}`,
      `Saturn: ${astro.saturn || 'UNKNOWN'}`,
      `Uranus: ${astro.uranus || 'UNKNOWN'}`,
      `Neptune: ${astro.neptune || 'UNKNOWN'}`,
      `Pluto: ${astro.pluto || 'UNKNOWN'}`,
      `Houses: ${astro.houses || 'UNKNOWN'}`,
    ];
    const hdLines = [
      `Type: ${hd.type || 'UNKNOWN'}`,
      `Strategy: ${hd.strategy || 'UNKNOWN'}`,
      `Authority: ${hd.authority || 'UNKNOWN'}`,
      `Profile: ${hd.profile || 'UNKNOWN'}`,
      `Centers: ${hd.centers || 'UNKNOWN'}`,
      `Gifts: ${hd.gifts || 'UNKNOWN'}`,
    ];
    return `Astrology:\n${astroLines.join('\n')}\n\nHuman Design:\n${hdLines.join('\n')}`;
  };

  const loadDeliverable = async () => {
    const { data } = await supabase
      .from('product_sessions')
      .select('deliverable_content')
      .eq('id', session.id)
      .single();

    if (data?.deliverable_content) {
      setDeliverable(data.deliverable_content);
    }
  };

  const handleStepSubmit = async () => {
    const isUploadStep = currentStepData?.allow_file_upload && !currentStepData?.question;

    // Require files for upload steps, text for others
    if (isUploadStep) {
      if (uploadedFiles.length === 0) {
        setUploadError('Please attach at least one file to continue.');
        return;
      }
      // For step 1, always force confirmation/extraction instead of advancing
      if (currentStep === 1) {
        setUploadError(null);
        setIsSubmitting(true);
        setConfirmGate(true);
        return;
      }
    } else {
      if (!stepResponse.trim()) return;
    }

    setIsSubmitting(true);

    try {
      // Save conversation to database (append to messages array)
      await appendConversation(currentStep, [
        {
          role: 'user',
          content: isUploadStep
            ? `Uploaded files: ${uploadedFiles.join(', ')}`
            : stepResponse,
          type: 'main_response',
        },
      ]);

      // Check if step allows follow-up questions
      if (currentStepData.allow_followup && followUpCount < 3) {
        setShowFollowUp(true);
      } else {
        await moveToNextStep();
      }

      // Generate assistant reply for this step (inline chat)
      if (!isUploadStep) {
        try {
          const insightRes = await fetch('/api/products/step-insight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stepNumber: currentStep,
              stepData: currentStepData,
              mainResponse: stepResponse,
              placements,
              sessionId: session.id,
              userId,
              productSlug: product.product_slug,
              systemPrompt: product.system_prompt,
              productName: product.name,
            }),
          });
          if (insightRes.ok) {
            const data = await insightRes.json();
            setAssistantReply(data.aiResponse || '');
          }
        } catch (e) {
          console.error('Assistant reply failed', e);
        }
      }
    } catch (error) {
      console.error('Error submitting step:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveToNextStep = async () => {
    setIsSubmitting(true);

    try {
      // Move to next step or complete
      const nextStep = currentStep + 1;
      const isComplete = nextStep > steps.length;

      if (isComplete) {
        // Generate final deliverable
        await generateDeliverable();
      } else {
        // Update session progress
        await supabase
          .from('product_sessions')
          .update({
            current_step: nextStep,
            current_section: Math.max(currentSection, 1),
            followup_counts: followupCounts,
          })
          .eq('id', session.id)
          .eq('user_id', userId);

        // Reset state for next step
        setCurrentStep(nextStep);
        setStepResponse('');
        setShowFollowUp(false);
        setFollowUpCount(0);
        setConfirmGate(false); // Reset confirm gate when moving to next step
        setAssistantReply(''); // Clear previous assistant reply for new step
        setSeedInsightShown(false); // Reset so GPT can respond at each step
        setShowIntroReply(false); // Reset intro reply flag
        // clear uploads between steps so prior charts don't linger in later steps
        setUploadedFiles([]);
      }
    } catch (error) {
      console.error('Error moving to next step:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateDeliverable = async () => {
    try {
      console.log('[generateDeliverable] Called with placements:', JSON.stringify(placements, null, 2));
      console.log('[generateDeliverable] Placements astrology:', placements?.astrology);
      console.log('[generateDeliverable] Placements HD:', placements?.human_design);

      // Call API to generate final briefing
      const response = await fetch('/api/products/final-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          placements,
          productSlug: product.product_slug,
          productName: product.name,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[generateDeliverable] API error:', response.status, errorText);
        throw new Error(`Final briefing API failed: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('[generateDeliverable] API response received, briefing length:', responseData.briefing?.length);

      const { briefing: generatedDeliverable } = responseData;

      // Save deliverable and mark complete
      await supabase
        .from('product_sessions')
        .update({
          deliverable_content: generatedDeliverable,
          deliverable_generated_at: new Date().toISOString(),
          is_complete: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      console.log('[generateDeliverable] Deliverable saved to database');
      setDeliverable(generatedDeliverable);
    } catch (error) {
      console.error('[generateDeliverable] Error:', error);
    }
  };

  const handleFollowUpComplete = () => {
    setShowFollowUp(false);
    moveToNextStep();
  };

  const handleFileUpload = async (files: File[]) => {
    setUploadError(null);
    const uploadedUrls: string[] = [];
    // If user uploads new files, force re-confirmation
    if (placementsConfirmed) {
      console.log('[PX] new upload -> resetting placementsConfirmed false');
      setPlacementsConfirmed(false);
      setConfirmGate(true);
      await supabase
        .from('product_sessions')
        .update({ placements_confirmed: false })
        .eq('id', session.id)
        .eq('user_id', userId)
        .throwOnError();
    }

    for (const file of files) {
      const fileName = `${userId}/${session.id}/${Date.now()}_${file.name}`;

      const { data, error } = await supabase.storage
        .from('user-uploads')
        .upload(fileName, file);

      if (!error && data) {
        // Save to database
        await supabase.from('uploaded_documents').insert({
          user_id: userId,
          session_id: session.id,
          step_number: currentStep,
          file_name: file.name,
          storage_path: data.path,
          file_type: file.type,
          file_size: file.size,
        });

        uploadedUrls.push(data.path);
      } else if (error) {
        console.error('File upload error', error);
        const detail = (error as any)?.message || 'Unknown storage error';
        setUploadError(`Upload failed: ${detail}. Ensure bucket "user-uploads" exists and storage policies allow inserts for authenticated users.`);
        return;
      }
    }

    setUploadedFiles([...uploadedFiles, ...uploadedUrls]);
  };

  const handleRemoveFile = async (path: string) => {
    // Remove from state immediately
    setUploadedFiles((prev) => prev.filter((p) => p !== path));
    // Clean up DB entry
    await supabase
      .from('uploaded_documents')
      .delete()
      .eq('session_id', session.id)
      .eq('storage_path', path);
  };

  const handleExtractPlacements = async () => {
    if (uploadedFiles.length === 0) {
      setUploadError('Please attach at least one file to continue.');
      return;
    }
    console.log('[PX] extract placements trigger', {
      uploadedFiles,
      placementsConfirmed,
      currentStep,
    });
    setPlacementsError(null);
    setIsExtracting(true);
    try {
      const response = await fetch('/api/products/extract-placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, storagePaths: uploadedFiles }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Extraction failed');
      }
      const { placements: extracted } = await response.json();
      setPlacements(extracted);
    } catch (err: any) {
      console.error('Extraction error', err);
      setPlacementsError(err?.message || 'Failed to extract placements. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Show confirmation gate on step 1 upload step ONLY after files are uploaded
  useEffect(() => {
    if (currentStep === 1 && currentStepData?.allow_file_upload) {
      const placementsReady = placementsConfirmed && !isPlacementsEmpty(placements);
      const hasFiles = uploadedFiles.length > 0;

      // Show confirm gate ONLY if:
      // 1. User has uploaded files, OR
      // 2. Placements are already confirmed and ready
      if (hasFiles || placementsReady) {
        if (!confirmGate) {
          console.log('[PX] showing confirm gate after files uploaded', {
            confirmGate,
            placementsConfirmed,
            placementsEmpty: isPlacementsEmpty(placements),
            hasFiles,
            uploadsLoaded,
          });
          setConfirmGate(true);
        }
      } else {
        // No files yet - show upload interface
        if (confirmGate) {
          console.log('[PX] hiding confirm gate - no files uploaded yet');
          setConfirmGate(false);
        }
      }
    }
  }, [
    currentStep,
    currentStepData?.allow_file_upload,
    confirmGate,
    placements,
    placementsConfirmed,
    uploadedFiles.length,
    uploadsLoaded,
  ]);

  // Guard: if placements are missing/unconfirmed, normalize state once
  useEffect(() => {
    const needGuard = !placementsConfirmed || isPlacementsEmpty(placements);
    if (needGuard) {
      if (currentStep !== 1) {
        setCurrentStep(1);
      }
      // Don't force confirmGate here - let the upload logic handle it
      // setConfirmGate(true);
      if (!hasGuarded) {
        setHasGuarded(true);
        console.log('[PX] guard effect resetting session to step 1');
        supabase
          .from('product_sessions')
          .update({
            current_step: 1,
            placements_confirmed: false,
            // keep placements if we already have them; only null when empty
            placements: isPlacementsEmpty(placements) ? null : placements,
            current_section: 1,
          })
          .eq('id', session.id)
          .eq('user_id', userId)
          .throwOnError();
      }
    } else {
      if (hasGuarded) setHasGuarded(false);
    }
  }, [placementsConfirmed, placements, currentStep, steps.length, session.id, userId, hasGuarded]);

  // If deliverable is ready, show it
  if (deliverable) {
    return <DeliverableView deliverable={deliverable} productName={product.name} />;
  }

  // Placement confirmation gate after uploads
  if (confirmGate && !placementsConfirmed) {
    console.log('[PX] showing confirmation gate', {
      placementsEmpty: isPlacementsEmpty(placements),
      uploadedFiles: uploadedFiles.length,
    });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-900 to-black p-6 md:p-10">
        <div className="w-full max-w-3xl space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-xl shadow-[0_25px_120px_-40px_rgba(0,0,0,0.75)]">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-teal-200/80">Chart intake</p>
            <h1 className="text-3xl font-semibold text-white">Review your uploads</h1>
            <p className="text-slate-200/85">
              Confirm we should use these chart files for extraction before moving forward. If something is wrong, go back and re-upload. After extraction, review placements and confirm.
            </p>
          </div>

          {uploadedFiles.length > 0 ? (
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300/80">Files ready</p>
              <div className="space-y-2">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/15 text-teal-300">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M5 12l4 4L19 6" />
                      </svg>
                    </span>
                    <span className="truncate text-sm font-semibold text-white flex-1">{file.split('/').pop()}</span>
                    <button
                      onClick={() => handleRemoveFile(file)}
                      className="text-slate-300 hover:text-red-300"
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-100">
              No files detected. Please go back and upload your charts.
            </div>
          )}

          {placements ? (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300/80">Extracted placements</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <p className="text-sm font-semibold text-white">Astrology</p>
                  <div className="space-y-2 text-sm text-slate-200">
                    {[
                      'sun','moon','rising','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','houses'
                    ].map((key) => (
                      <label key={key} className="block">
                        <span className="text-xs uppercase tracking-[0.14em] text-slate-400">{key}</span>
                        <input
                          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white text-sm"
                          value={placements?.astrology?.[key] ?? ''}
                          onChange={(e) =>
                            setPlacements((prev: any) => ({
                              ...prev,
                              astrology: { ...(prev?.astrology || {}), [key]: e.target.value },
                            }))
                          }
                          placeholder="UNKNOWN"
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <p className="text-sm font-semibold text-white">Human Design</p>
                  <div className="space-y-2 text-sm text-slate-200">
                    {['type','strategy','authority','profile','centers','gifts'].map((key) => (
                      <label key={key} className="block">
                        <span className="text-xs uppercase tracking-[0.14em] text-slate-400">{key}</span>
                        <input
                          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white text-sm"
                          value={placements?.human_design?.[key] ?? ''}
                          onChange={(e) =>
                            setPlacements((prev: any) => ({
                              ...prev,
                              human_design: { ...(prev?.human_design || {}), [key]: e.target.value },
                            }))
                          }
                          placeholder="UNKNOWN"
                        />
                      </label>
                    ))}
                  </div>
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Notes (gifts, channels, extra house data)</span>
                    <textarea
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white text-sm h-20"
                      value={placementNotes}
                      onChange={(e) => setPlacementNotes(e.target.value)}
                      placeholder="Add any HD gifts, channels, or extra house details not visible."
                    />
                  </label>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-300/80">Chat review</p>
                <div className="space-y-2">
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-teal-200/80 mb-2">Assistant</p>
                    <pre className="whitespace-pre-wrap text-sm text-slate-100">
                      {formatPlacementsForChat(placements)}
                    </pre>
                    <p className="mt-3 text-xs text-slate-300">
                      If anything is wrong or missing, type corrections below or edit the fields above. When accurate, click Confirm.
                    </p>
                  </div>
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Your corrections (optional)</span>
                    <textarea
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white text-sm h-20"
                      value={placementNotes}
                      onChange={(e) => setPlacementNotes(e.target.value)}
                      placeholder="E.g., Sun: Taurus, Rising: Gemini, HD Type: Generator..."
                    />
                  </label>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    setIsSubmitting(true);
                    setPlacementsError(null);
                    const { error } = await supabase
                      .from('product_sessions')
                      .update({
                        placements: { ...(placements || {}), notes: placementNotes },
                        placements_confirmed: true,
                        current_section: 1,
                      })
                      .eq('id', session.id)
                      .eq('user_id', userId);
                if (!error) {
                  setPlacementsConfirmed(true);
                  setConfirmGate(false);
                  // clear upload list now that charts are confirmed so later steps don't show them
                  setUploadedFiles([]);
                  await moveToNextStep();
                } else {
                  setPlacementsError('Could not save placements. Please try again.');
                }
                    setIsSubmitting(false);
                  }}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_15px_45px_-18px_rgba(20,184,166,0.75)] transition hover:scale-105 hover:shadow-[0_18px_50px_-16px_rgba(20,184,166,0.85)] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
                >
                  Confirm and continue
                </button>
                <button
                  onClick={() => {
                    setConfirmGate(false);
                    setPlacements(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Re-upload
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExtractPlacements}
                disabled={isExtracting || uploadedFiles.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_15px_45px_-18px_rgba(20,184,166,0.75)] transition hover:scale-105 hover:shadow-[0_18px_50px_-16px_rgba(20,184,166,0.85)] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
              >
                {isExtracting ? 'Extracting…' : 'Extract placements'}
              </button>
              <button
                onClick={() => {
                  setConfirmGate(false);
                  setUploadError('Please re-upload your charts to proceed.');
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Re-upload
              </button>
            </div>
          )}

          {uploadError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {uploadError}
            </div>
          )}
          {placementsError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {placementsError}
            </div>
          )}
        </div>
      </div>
    );
  }

  return !showFollowUp ? (
    <StepView
      step={currentStepData}
      stepNumber={currentStep}
      totalSteps={steps.length}
      response={stepResponse}
      onResponseChange={setStepResponse}
      onSubmit={handleStepSubmit}
      onBack={() => {
        if (currentStep > 1) {
          const prev = currentStep - 1;
          setCurrentStep(prev);
          supabase
            .from('product_sessions')
            .update({
              current_step: prev,
            })
            .eq('id', session.id)
            .eq('user_id', userId);
        }
      }}
      onFileUpload={handleFileUpload}
      uploadedFiles={uploadedFiles}
      uploadError={uploadError}
      assistantReply={assistantReply}
      isSubmitting={isSubmitting}
      onRemoveFile={handleRemoveFile}
    />
  ) : (
    <FollowUpChat
      sessionId={session.id}
      stepNumber={currentStep}
        stepData={currentStepData}
        systemPrompt={product.system_prompt}
        mainResponse={stepResponse}
        productSlug={product.product_slug}
        followUpCount={followUpCount}
        onFollowUpCountChange={setFollowUpCount}
        onComplete={handleFollowUpComplete}
        userId={userId}
        placements={placements}
      />
  );
}
