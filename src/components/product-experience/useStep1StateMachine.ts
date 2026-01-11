import { useState, useEffect } from 'react';

/**
 * Step 1 State Machine
 *
 * Replaces fragile boolean flags with a single state enum.
 * Makes the flow predictable and resilient.
 */

export type Step1State =
  | 'WELCOME'        // Show welcome modal
  | 'CONFIRMATION'   // Show "Use existing placements?" confirmation screen
  | 'UPLOAD'         // Show upload interface
  | 'EXTRACTING'     // Extraction in progress
  | 'REVIEW'         // Show review/edit gate with extracted placements
  | 'READY';         // Placements confirmed, ready to move to step 2

interface Step1StateMachineProps {
  hasInstructions: boolean;
  hasPlacementsData: boolean;
  placementsConfirmed: boolean;
  isExtracting: boolean;
  currentStep: number;
}

export function useStep1StateMachine({
  hasInstructions,
  hasPlacementsData,
  placementsConfirmed,
  isExtracting,
  currentStep,
}: Step1StateMachineProps) {
  const [state, setState] = useState<Step1State>(() => {
    // Only apply state machine to step 1
    if (currentStep !== 1) return 'READY';

    // Initial state determination
    if (hasInstructions) return 'WELCOME';
    if (hasPlacementsData && !placementsConfirmed) return 'CONFIRMATION';
    if (hasPlacementsData && placementsConfirmed) return 'READY';
    return 'UPLOAD';
  });

  // Update state when extraction status changes
  useEffect(() => {
    if (currentStep !== 1) return;

    if (isExtracting && state !== 'EXTRACTING') {
      setState('EXTRACTING');
    }
  }, [isExtracting, currentStep, state]);

  // State transition functions
  const transitions = {
    welcomeComplete: () => {
      if (hasPlacementsData) {
        setState('CONFIRMATION');
      } else {
        setState('UPLOAD');
      }
    },

    confirmUseExisting: () => {
      setState('READY');
    },

    confirmEditPlacements: () => {
      setState('REVIEW');
    },

    confirmUploadNew: () => {
      setState('UPLOAD');
    },

    uploadComplete: () => {
      setState('EXTRACTING');
    },

    extractionComplete: () => {
      setState('REVIEW');
    },

    reviewConfirmed: () => {
      setState('READY');
    },

    reviewReupload: () => {
      setState('UPLOAD');
    },
  };

  return {
    state,
    transitions,
    // Helper booleans for render logic
    shouldShowWelcome: state === 'WELCOME',
    shouldShowConfirmation: state === 'CONFIRMATION',
    shouldShowUpload: state === 'UPLOAD',
    shouldShowExtracting: state === 'EXTRACTING',
    shouldShowReview: state === 'REVIEW',
    isReadyForStep2: state === 'READY',
  };
}
