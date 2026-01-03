'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProgressBar } from './ProgressBar';
import { StepView } from './StepView';
import { FollowUpChat } from './FollowUpChat';
import { DeliverableView } from './DeliverableView';
import { WelcomeBanner } from './WelcomeBanner';
import { supabase } from '@/lib/supabase/client';
import { isPlacementsEmpty } from '@/lib/utils/placements';
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
  const [actionableNudges, setActionableNudges] = useState<string[]>([]);
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
  const [showWelcome, setShowWelcome] = useState(
    !!product.instructions && currentStep === 1 && !session.completed_at
  );

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

  // Use steps directly from product (now stored in Supabase)
  const steps = product.steps || [];
  const currentStepData = steps[currentStep - 1];
  const isLastStep = currentStep === steps.length;
  const completionPercentage = Math.round((currentStep / steps.length) * 100);
  const hasPlacementData = !isPlacementsEmpty(placements);
  // CRITICAL: Show auto-copied gate when placements exist but not confirmed
  // Remove uploadedFiles check - gate must show regardless
  const showAutoCopiedGate =
    currentStep === 1 &&
    hasPlacementData &&
    !placementsConfirmed;

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

  // Extract actionable nudges from conversations when deliverable is ready
  useEffect(() => {
    const extractNudges = async () => {
      if (!deliverable) return;

      const { data, error } = await supabase
        .from('conversations')
        .select('messages, step_number')
        .eq('session_id', session.id)
        .order('step_number', { ascending: true });

      if (error || !data) return;

      const nudges: string[] = [];

      // Extract actionable insights from assistant responses
      data.forEach((conversation: any) => {
        const messages = conversation.messages || [];

        // Only process messages that follow user input (actual AI responses, not prompts)
        for (let i = 1; i < messages.length; i++) {
          const msg = messages[i];
          const prevMsg = messages[i - 1];

          // Skip if not an assistant message following a user message
          if (msg.role !== 'assistant' || prevMsg.role !== 'user') continue;
          if (!msg.content) continue;

          // PRIORITY 1: Extract explicitly formatted "Actionable nudge (timeframe):" statements
          // Pattern: "Actionable nudge (this week): do something"
          const explicitNudges = msg.content.match(/Actionable nudge[^:]{0,60}:[^.!?\n]{20,300}[.!]?/gi);
          if (explicitNudges) {
            explicitNudges.forEach((nudge: string) => {
              const trimmed = nudge.trim().replace(/\*\*/g, ''); // Remove markdown bold
              if (trimmed.length > 30) {
                nudges.push(trimmed);
              }
            });
          }

          // Extract specific insights/observations about them
          // Pattern: "Your [chart thing] says/means/shows [insight]"
          const insights = msg.content.match(/Your [^.!?]{10,80}(?:says|means|shows|suggests|confirms|reveals)[^.!?]{20,120}[.!]/gi);
          if (insights) {
            insights.forEach((insight: string) => {
              const trimmed = insight.trim();
              if (!trimmed.includes('Example:') &&
                  !trimmed.includes('Step ') &&
                  trimmed.length > 50 &&
                  trimmed.length < 200) {
                nudges.push(trimmed);
              }
            });
          }

          // Extract actionable next steps (imperative statements with action verbs)
          // Expanded verb list to catch more actionable advice
          const actions = msg.content.match(/(?:^|\n)(?:Choose|Write|Pick|Post|Add|Send|Reach out|Schedule|Plan|Draft|Review|Try|Start|Begin|Consider|Focus on|Design|Build|Create|Shift to|Release|Let go of|Lean into|Explore|Test|Practice|Run|Launch|Set up|Configure|Update|Refine)[^.!?]{30,200}[.!]/gi);
          if (actions) {
            actions.forEach((action: string) => {
              const trimmed = action.trim();
              // Filter out questions disguised as actions and template content
              const lower = trimmed.toLowerCase();
              const isQuestion = trimmed.includes('?') ||
                                 lower.includes(': are you') ||
                                 lower.includes(': do you') ||
                                 lower.includes(': can you') ||
                                 lower.includes(': would you');

              if (!isQuestion &&
                  !trimmed.includes('Example:') &&
                  !trimmed.includes('Step ') &&
                  trimmed.length > 40 &&
                  trimmed.length < 250) {
                nudges.push(trimmed);
              }
            });
          }
        }
      });

      // Deduplicate, remove generic statements and clarifying questions, limit to top 6
      const unique = [...new Set(nudges)]
        .filter(n => {
          const lower = n.toLowerCase();
          // Filter out overly generic, template-like content, and clarifying questions
          return !lower.includes('looking at') &&
                 !lower.includes('based on') &&
                 !lower.includes('let me show') &&
                 !lower.includes('quick clarifier') &&
                 !lower.includes('let me ask') &&
                 !lower.includes('i need to know') &&
                 !lower.includes('help me understand') &&
                 !lower.includes('can you tell me') &&
                 !lower.startsWith('you ') &&
                 !lower.startsWith('question:') &&
                 !n.includes('?'); // Exclude any remaining questions
        })
        .slice(0, 6);

      setActionableNudges(unique);
    };

    extractNudges();
  }, [deliverable, session.id]);

  // Preload any existing uploaded documents (handles refresh)
  useEffect(() => {
    const loadUploads = async () => {
      const { data, error } = await supabase
        .from('uploaded_documents')
        .select('storage_path')
        .eq('session_id', session.id);
      if (!error && data) {
        const paths = data.map((d: any) => d.storage_path).filter(Boolean);
        if (paths.length) {
          setUploadedFiles(paths);
          setUploadsLoaded(true);
          return;
        }
      }

      // Fallback: reuse latest confirmed session uploads for this user
      const { data: sourceSession } = await supabase
        .from('product_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('placements_confirmed', true)
        .not('placements', 'is', null)
        .neq('id', session.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sourceSession?.id) {
        const { data: sourceDocs } = await supabase
          .from('uploaded_documents')
          .select('storage_path,file_name,file_type,file_size')
          .eq('session_id', sourceSession.id)
          .order('created_at', { ascending: false });

        if (sourceDocs && sourceDocs.length > 0) {
          const insertRows = sourceDocs.map((doc: any) => ({
            user_id: userId,
            session_id: session.id,
            step_number: 1,
            file_name: doc.file_name,
            storage_path: doc.storage_path,
            file_type: doc.file_type,
            file_size: doc.file_size,
          }));
          await supabase.from('uploaded_documents').insert(insertRows);
          const paths = sourceDocs.map((doc: any) => doc.storage_path).filter(Boolean);
          if (paths.length) setUploadedFiles(paths);
        }
      }

      setUploadsLoaded(true);
    };
    loadUploads();
  }, [session.id]);

  // Force confirmation gate on first load of step 1 to allow re-confirmation
  useEffect(() => {
    if (currentStep === 1 && !forcedConfirmOnce) {
      const hasUploads = uploadedFiles.length > 0;
      setConfirmGate(hasUploads);

      setForcedConfirmOnce(true);
    }
  }, [currentStep, placementsConfirmed, forcedConfirmOnce, uploadedFiles.length, placements]);

  // Only force reset if placements are actually empty (not if just on step > 1)
  useEffect(() => {
    if (!forcedInitReset && session.placements_confirmed && isPlacementsEmpty(session.placements)) {
      console.log('[PX] Session claims placements confirmed but they are empty - forcing reconfirmation');
      setPlacementsConfirmed(false);
      setConfirmGate(true);
      setCurrentStep(1);
      setForcedInitReset(true);
    }
  }, [forcedInitReset, session.placements_confirmed, session.placements]);

  // Auto intro reply after placements confirmed
  useEffect(() => {
    const sendIntro = async () => {
      if (placementsConfirmed && !assistantReply && currentStep === 1 && !showIntroReply) {
        try {
          // Product-specific intro prompts
          const isPersonalAlignment = product.product_slug === 'personal-alignment';
          const introQuestion = isPersonalAlignment
            ? 'Acknowledge placements and core identity/values themes using Sun/Moon/Rising, Venus, and HD type.'
            : 'Acknowledge placements and money/creation themes.';

          const res = await fetch('/api/products/step-insight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stepNumber: 0,
              stepData: { title: 'Chart Read', question: introQuestion },
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

  // Seed an initial chart insight when the user first lands on step 2
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
          // Product-specific seed prompts
          const isPersonalAlignment = product.product_slug === 'personal-alignment';
          const seedTitle = isPersonalAlignment
            ? 'Initial chart + identity clarity'
            : 'Initial chart + money clarity';
          const seedQuestion = isPersonalAlignment
            ? 'Give 2-3 sentences on their core identity, natural energy design, and value system using confirmed placements only. Reference Sun/Moon/Rising for core self, Venus for values, Mars for action style, and HD type/strategy/authority for energy design. Include one actionable alignment nudge. No speculation on unknowns.'
            : 'Give 2-3 sentences on money/self-worth/creation using confirmed placements only. Include: 2nd house sign+ruler+its location; if 2nd is empty, say what that means; note key money houses (2/8/10/11) only when known; one actionable business/money takeaway. No speculation on unknowns.';

          const res = await fetch('/api/products/step-insight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stepNumber: 0,
              stepData: {
                title: seedTitle,
                question: seedQuestion,
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

  const handleReviewCharts = async () => {
    setPlacementsConfirmed(false);
    setConfirmGate(false);
    setCurrentStep(1);
    setStepResponse('');
    setShowFollowUp(false);
    await supabase
      .from('product_sessions')
      .update({ current_step: 1, placements_confirmed: false })
      .eq('id', session.id)
      .eq('user_id', userId)
      .throwOnError();
  };

  const handleFileUpload = async (files: File[]) => {
    setUploadError(null);
    const uploadedUrls: string[] = [];
    // If user uploads new files, force re-confirmation
    if (placementsConfirmed) {
      console.log('[PX] new upload - resetting placementsConfirmed false');
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
    console.log('=== CLIENT: EXTRACTION STARTED ===');
    console.log('[PX] extract placements trigger', {
      uploadedFiles,
      placementsConfirmed,
      currentStep,
    });
    console.log('Calling extraction API with:', {
      sessionId: session.id,
      storagePaths: uploadedFiles,
      fileCount: uploadedFiles.length
    });

    setPlacementsError(null);
    setIsExtracting(true);

    try {
      const startTime = Date.now();
      console.log('Fetching /api/products/extract-placements...');

      const response = await fetch('/api/products/extract-placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, storagePaths: uploadedFiles }),
      });

      const elapsed = Date.now() - startTime;
      console.log(`API response received after ${elapsed}ms, status: ${response.status}`);

      if (!response.ok) {
        const text = await response.text();
        console.error('API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: text
        });
        throw new Error(text || 'Extraction failed');
      }

      const responseData = await response.json();
      console.log('API success response:', responseData);
      console.log('Extracted placements:', JSON.stringify(responseData.placements, null, 2));

      const { placements: extracted } = responseData;
      setPlacements(extracted);
      console.log('=== CLIENT: EXTRACTION COMPLETED ===');
    } catch (err: any) {
      console.error('=== CLIENT: EXTRACTION FAILED ===');
      console.error('Error details:', {
        message: err?.message,
        name: err?.name,
        stack: err?.stack
      });
      setPlacementsError(err?.message || 'Failed to extract placements. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Show confirmation gate on step 1 upload step ONLY after files are uploaded
  useEffect(() => {
    if (currentStep === 1 && currentStepData?.allow_file_upload) {
      const hasFiles = uploadedFiles.length > 0;

      // Show confirm gate ONLY if the user has uploaded files
      if (hasFiles) {
        if (!confirmGate) {
          console.log('[PX] showing confirm gate after files uploaded', {
            confirmGate,
            placementsConfirmed,
            placementsEmpty: !hasPlacementData,
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

  // If placements already confirmed, skip the upload gate and proceed
  useEffect(() => {
    if (
      currentStep === 1 &&
      placementsConfirmed &&
      hasPlacementData &&
      !confirmGate &&
      !showWelcome
    ) {
      supabase
        .from('product_sessions')
        .update({ current_step: 2, current_section: 1 })
        .eq('id', session.id)
        .eq('user_id', userId)
        .throwOnError();
      setCurrentStep(2);
    }
  }, [
    currentStep,
    placementsConfirmed,
    hasPlacementData,
    confirmGate,
    showWelcome,
    session.id,
    userId,
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
    return (
      <DeliverableView
        deliverable={deliverable}
        productName={product.name}
        instructions={product.instructions}
        actionableNudges={actionableNudges}
      />
    );
  }

  if (showWelcome && product.instructions) {
    return (
      <WelcomeBanner
        instructions={product.instructions}
        onBegin={() => setShowWelcome(false)}
      />
    );
  }

  // Auto-copied placements confirmation gate (when placements already exist)
  if (showAutoCopiedGate) {
    console.log('[PX] showing auto-copied placements confirmation gate');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-900 to-black p-6 md:p-10">
        <div className="w-full max-w-3xl space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-xl shadow-[0_25px_120px_-40px_rgba(0,0,0,0.75)]">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-teal-200/80">Chart data found</p>
            <h1 className="text-3xl font-semibold text-white">Use existing placements?</h1>
            <p className="text-slate-200/85">
              We found your chart data from a previous product. You can use the same placements or upload new charts if anything has changed.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300/80">Your placements</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <p className="text-sm font-semibold text-white">Astrology</p>
                <div className="space-y-2 text-sm text-slate-200">
                  {['sun', 'moon', 'rising', 'venus', 'mars'].map((key) => {
                    const val = placements?.astrology?.[key] || 'Unknown';
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize text-slate-400">{key}:</span>
                        <span className="font-medium">{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <p className="text-sm font-semibold text-white">Human Design</p>
                <div className="space-y-2 text-sm text-slate-200">
                  {['type', 'strategy', 'authority', 'profile'].map((key) => {
                    const val = placements?.human_design?.[key] || 'Unknown';
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize text-slate-400">{key}:</span>
                        <span className="font-medium text-right ml-2">{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={async () => {
                // Use existing placements - advance to step 2
                await supabase
                  .from('product_sessions')
                  .update({ current_step: 2, current_section: 1, placements_confirmed: true })
                  .eq('id', session.id)
                  .eq('user_id', userId);
                setPlacementsConfirmed(true);
                setCurrentStep(2);
              }}
              className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:shadow-xl hover:shadow-teal-500/40 hover:scale-[1.02]"
            >
              ✓ Use These Placements
            </button>
            <button
              onClick={() => {
                // Reset to allow new upload
                setPlacementsConfirmed(false);
                setPlacements(null);
                supabase
                  .from('product_sessions')
                  .update({ placements_confirmed: false, placements: null })
                  .eq('id', session.id)
                  .eq('user_id', userId);
              }}
              className="flex-1 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 font-semibold text-white transition-all hover:bg-white/10"
            >
              Upload New Charts
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Placement confirmation gate after uploads
  if (confirmGate && !placementsConfirmed && !showAutoCopiedGate) {
    console.log('[PX] showing confirmation gate', {
      placementsEmpty: !hasPlacementData,
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
                    setUploadedFiles([]);
                    setUploadError(null);
                    setPlacementsError(null);
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
                  setUploadedFiles([]);
                  setUploadError(null);
                  setPlacementsError(null);
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

  return (
    <>
      {!showFollowUp ? (
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
          onReviewCharts={handleReviewCharts}
          showReviewCharts={Boolean(steps[0]?.allow_file_upload && placementsConfirmed && currentStep > 1)}
          onFileUpload={handleFileUpload}
          uploadedFiles={uploadedFiles}
          uploadError={uploadError}
          assistantReply={assistantReply}
          isSubmitting={isSubmitting}
          onRemoveFile={handleRemoveFile}
          processingMessages={product.instructions?.processing}
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
      )}
    </>
  );
}
