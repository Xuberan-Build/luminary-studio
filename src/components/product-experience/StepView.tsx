'use client';

import { ChatWindow } from './ChatWindow';
import WheelOfLife from './WheelOfLife';
import { SliderAllocation } from './SliderAllocation';
import { useRef, useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StepViewProps {
  step: any;
  stepNumber: number;
  totalSteps: number;
  response: string;
  onResponseChange: (value: string) => void;
  onSubmit: () => void;
  onBack?: () => void;
  onReviewCharts?: () => void;
  onFileUpload: (files: File[]) => void;
  uploadedFiles: string[];
  uploadError?: string | null;
  assistantReply?: string;
  isSubmitting: boolean;
  onRemoveFile?: (path: string) => void;
  processingMessages?: string[];
  showReviewCharts?: boolean;
}

export function StepView({
  step,
  stepNumber,
  totalSteps,
  response,
  onResponseChange,
  onSubmit,
  onBack,
  onReviewCharts,
  onFileUpload,
  uploadedFiles,
  uploadError,
  assistantReply,
  isSubmitting,
  onRemoveFile,
  processingMessages,
  showReviewCharts,
}: StepViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentProcessingMessage, setCurrentProcessingMessage] = useState(0);
  const [wheelRatings, setWheelRatings] = useState<Record<string, number>>({});
  const [structuredValue, setStructuredValue] = useState<string | string[]>('');
  const [structuredOther, setStructuredOther] = useState('');
  const [textValue, setTextValue] = useState('');
  const [multiTextValues, setMultiTextValues] = useState<Record<string, string>>({});
  const [dutyCycleValues, setDutyCycleValues] = useState<Record<string, number>>({});
  const textMinLength = step?.text_input?.min_length || 0;
  const textLength = textValue.trim().length;

  // Handle WheelOfLife rating changes - update response with all 8 ratings
  const handleWheelRatingChange = (ratings: Record<string, number>) => {
    setWheelRatings(ratings);

    // Format all ratings for GPT to analyze
    const ratingsText = `My Wheel of Life Ratings:
Health: ${ratings.health}/10
Relationships: ${ratings.relationships}/10
Purpose: ${ratings.purpose}/10
Money: ${ratings.money}/10
Growth: ${ratings.growth}/10
Creativity: ${ratings.creativity}/10
Environment: ${ratings.environment}/10
Contribution: ${ratings.contribution}/10

`;

    // Update response
    onResponseChange(ratingsText);
  };

  // Handle duty cycle slider changes
  const handleDutyCycleChange = (values: Record<string, number>) => {
    setDutyCycleValues(values);

    // Format as percentages for GPT
    const dutyCycleText = `Duty Cycle Allocation:
Green (Energizing): ${values.green}%
Yellow (Neutral): ${values.yellow}%
Red (Draining): ${values.red}%
Black (Recovery): ${values.black}%

${textValue}`.trim();

    onResponseChange(dutyCycleText);
  };

  // Rotate through processing messages every 2.5 seconds
  useEffect(() => {
    if (!isSubmitting || !processingMessages || processingMessages.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentProcessingMessage((prev) => (prev + 1) % processingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isSubmitting, processingMessages]);

  // Reset to first message when submission starts
  useEffect(() => {
    if (isSubmitting) {
      setCurrentProcessingMessage(0);
    }
  }, [isSubmitting]);

  useEffect(() => {
    setWheelRatings({});
    setStructuredValue('');
    setStructuredOther('');
    setTextValue('');
    setMultiTextValues({});
    setDutyCycleValues({});
    onResponseChange('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepNumber]);

  const handleAttachClick = () => fileInputRef.current?.click();
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      onSubmit();
    }
  };

  const processingText = processingMessages && processingMessages.length > 0
    ? processingMessages[currentProcessingMessage]
    : 'Thinking…';

  const buildStructuredResponse = () => {
    const parts: string[] = [];
    const structured = step?.structured_options;

    if (structured) {
      const selected = Array.isArray(structuredValue) ? structuredValue : structuredValue ? [structuredValue] : [];
      if (selected.length > 0) {
        parts.push(`Selected options: ${selected.join(', ')}`);
      }
      if (structured.allow_other && structuredOther.trim()) {
        parts.push(`Other: ${structuredOther.trim()}`);
      }
    }

    if (step?.text_inputs && Array.isArray(step.text_inputs)) {
      const multiLines = step.text_inputs
        .map((field: any) => {
          const value = (multiTextValues[field.field_name] || '').trim();
          return value ? `${field.label} ${value}` : '';
        })
        .filter(Boolean);
      if (multiLines.length > 0) {
        parts.push(multiLines.join('\n'));
      }
    }

    if (step?.text_input && textValue.trim()) {
      parts.push(textValue.trim());
    }

    return parts.join('\n\n');
  };

  const canSubmit = useMemo(() => {
    // Special handling for duty cycle map
    if (step?.title === 'Duty Cycle Map') {
      const total = Object.values(dutyCycleValues).reduce((sum, val) => sum + val, 0);
      const hasAllocation = total === 100;
      const hasText = textValue.trim().length >= (step?.text_input?.min_length || 0);
      return hasAllocation && hasText;
    }

    if (step?.input_type === 'mixed') {
      const structured = step?.structured_options;
      const selected = Array.isArray(structuredValue) ? structuredValue : structuredValue ? [structuredValue] : [];
      const minRequired = structured?.required_count ?? 0;
      const hasStructured = selected.length >= minRequired;
      const requiresText = step?.text_input?.required;
      const hasText = !requiresText || textValue.trim().length >= (step?.text_input?.min_length || 0);
      return hasStructured && hasText;
    }

    if (step?.input_type === 'multi_text') {
      const fields = step?.text_inputs || [];
      const requiredFieldsFilled = fields.every((field: any) => {
        if (!field.required) return true;
        return (multiTextValues[field.field_name] || '').trim().length > 0;
      });
      const requiresText = step?.text_input?.required;
      const hasText = !requiresText || textValue.trim().length >= (step?.text_input?.min_length || 0);
      return requiredFieldsFilled && hasText;
    }

    if (step?.input_type === 'interactive') {
      return textValue.trim().length >= (step?.text_input?.min_length || 0);
    }

    if (step?.input_type === 'text') {
      if (step?.text_inputs) {
        const fields = step?.text_inputs || [];
        const requiredFieldsFilled = fields.every((field: any) => {
          if (!field.required) return true;
          return (multiTextValues[field.field_name] || '').trim().length > 0;
        });
        const requiresText = step?.text_input?.required;
        const hasText = !requiresText || textValue.trim().length >= (step?.text_input?.min_length || 0);
        return requiredFieldsFilled && hasText;
      }
      if (step?.text_input) {
        const minLen = step?.text_input?.min_length || 0;
        return textValue.trim().length >= minLen;
      }
    }

    return response.trim().length > 0;
  }, [step, structuredValue, structuredOther, textValue, multiTextValues, response, dutyCycleValues]);

  // Update response when text changes (for duty cycle reflection)
  useEffect(() => {
    if (step?.title === 'Duty Cycle Map' && Object.keys(dutyCycleValues).length > 0) {
      handleDutyCycleChange(dutyCycleValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textValue]);

  useEffect(() => {
    if (
      step?.input_type === 'mixed' ||
      step?.input_type === 'multi_text' ||
      step?.input_type === 'interactive' ||
      step?.input_type === 'text' ||
      step?.text_inputs ||
      step?.text_input
    ) {
      // Skip if this is duty cycle map (handled separately)
      if (step?.title === 'Duty Cycle Map') {
        return;
      }
      const nextResponse = buildStructuredResponse();
      onResponseChange(nextResponse);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structuredValue, structuredOther, textValue, multiTextValues]);

  // If this is a file upload step, use ChatWindow (prefer the premium upload UI even if a question is present)
  if (step?.allow_file_upload && !step?.question) {
    const descriptionText = step.description || step.subtitle || '';
    const instructionsText = step.file_upload_prompt || step.description || '';

    return (
      <ChatWindow
        title={step.title}
        description={descriptionText}
        instructions={instructionsText}
        onFileUpload={onFileUpload}
        uploadedFiles={uploadedFiles}
        uploadError={uploadError}
        onContinue={onSubmit}
        isSubmitting={isSubmitting}
        onRemoveFile={onRemoveFile}
      />
    );
  }

  // Otherwise show text input in chat format
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-900 to-black p-6 md:p-8">
      <div className="w-full max-w-4xl flex flex-col">
        {/* Step Header */}
        <div className="text-center mb-12">
          <div className="text-teal-400 text-sm font-semibold mb-3 tracking-wide uppercase">
            Step {stepNumber} of {totalSteps}
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">{step.title || step.question}</h1>
          {step.subtitle && (
            <p className="text-xl text-gray-400">{step.subtitle}</p>
          )}
        </div>

        {/* Question Card */}
      <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 shadow-2xl mb-6">
        {assistantReply && (
            <div className="mb-6 rounded-2xl border border-gray-700/50 bg-gray-800/60 p-4 relative">
              {isSubmitting && (
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center text-sm text-white">
                  {processingText}
                </div>
              )}
              <p className="text-xs uppercase tracking-[0.16em] text-gray-400 mb-2">Wizard</p>
              <div className="prose prose-invert prose-sm max-w-none [&_strong]:text-[#F8F5FF] [&_strong]:font-semibold [&_p]:text-gray-300 [&_li]:text-gray-300 [&_h1]:text-gray-200 [&_h2]:text-gray-200 [&_h3]:text-gray-200">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {assistantReply}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {step.question && step.title && (
            <div className="prose prose-invert prose-lg max-w-none [&_strong]:text-[#F8F5FF] [&_strong]:font-bold [&_p]:text-white [&_li]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white mb-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {step.question}
              </ReactMarkdown>
            </div>
          )}

          {/* Wheel of Life rating component for alignment rating steps */}
          {step.question?.includes('Rate it 1-10') && (
            <div className="my-8 pt-4">
              <WheelOfLife
                onRatingChange={handleWheelRatingChange}
                initialRatings={wheelRatings}
              />
            </div>
          )}

          {step?.input_type === 'mixed' && step?.structured_options && (
            <div className="space-y-6">
              <div className="grid gap-3 md:grid-cols-2">
                {step.structured_options.options?.map((option: any) => {
                  const isSelected = Array.isArray(structuredValue)
                    ? structuredValue.includes(option.value)
                    : structuredValue === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`text-left rounded-xl border px-4 py-3 transition ${
                        isSelected
                          ? 'border-teal-400 bg-teal-500/10 text-white'
                          : 'border-gray-700/60 bg-gray-900/40 text-gray-200 hover:border-gray-500'
                      }`}
                      onClick={() => {
                        if (step.structured_options.type === 'checkbox') {
                          const current = Array.isArray(structuredValue) ? structuredValue : [];
                          const next = current.includes(option.value)
                            ? current.filter((item) => item !== option.value)
                            : [...current, option.value];
                          setStructuredValue(next);
                        } else {
                          setStructuredValue(option.value);
                        }
                      }}
                    >
                      <div className="font-semibold">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-gray-400">{option.description}</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {step.structured_options.allow_other && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">
                    {step.structured_options.other_label || 'Other'}
                  </label>
                  <input
                    value={structuredOther}
                    onChange={(e) => setStructuredOther(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full rounded-xl border border-gray-700/60 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {step.text_input && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">{step.text_input.label}</label>
                  <textarea
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={step.text_input.placeholder || 'Type your answer here...'}
                    className="w-full h-48 bg-gray-900/50 border border-gray-700/50 rounded-xl px-6 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
                    disabled={isSubmitting}
                  />
                  {textMinLength > 0 && (
                    <p className="text-xs text-gray-500">
                      Minimum {textMinLength} characters · {textLength}/{textMinLength}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {step?.input_type === 'multi_text' && step?.text_inputs && (
            <div className="space-y-6">
              {step.text_inputs.map((field: any) => (
                <div key={field.field_name} className="space-y-2">
                  <label className="text-sm text-gray-400">{field.label}</label>
                  <input
                    value={multiTextValues[field.field_name] || ''}
                    onChange={(e) => setMultiTextValues((prev) => ({ ...prev, [field.field_name]: e.target.value }))}
                    placeholder={field.placeholder || 'Type your answer...'}
                    className="w-full rounded-xl border border-gray-700/60 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={isSubmitting}
                  />
                </div>
              ))}

              {step.text_input && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">{step.text_input.label}</label>
                  <textarea
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={step.text_input.placeholder || 'Type your answer here...'}
                    className="w-full h-48 bg-gray-900/50 border border-gray-700/50 rounded-xl px-6 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
                    disabled={isSubmitting}
                  />
                  {textMinLength > 0 && (
                    <p className="text-xs text-gray-500">
                      Minimum {textMinLength} characters · {textLength}/{textMinLength}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {step?.input_type === 'interactive' && step?.text_input && (
            <div className="space-y-6">
              {step.title === 'Duty Cycle Map' ? (
                <>
                  <SliderAllocation
                    categories={[
                      {
                        key: 'green',
                        label: 'Green - Energizing',
                        description: 'Activities that energize and restore you (exercise, creative flow, deep connection)',
                        color: 'bg-green-500',
                      },
                      {
                        key: 'yellow',
                        label: 'Yellow - Neutral',
                        description: 'Necessary activities that are neither draining nor energizing (emails, errands, admin)',
                        color: 'bg-yellow-500',
                      },
                      {
                        key: 'red',
                        label: 'Red - Draining',
                        description: 'Draining but necessary activities (difficult conversations, hard decisions)',
                        color: 'bg-red-500',
                      },
                      {
                        key: 'black',
                        label: 'Black - Recovery',
                        description: 'True rest and recovery time (sleep, stillness, unplugged time)',
                        color: 'bg-gray-500',
                      },
                    ]}
                    onChange={handleDutyCycleChange}
                    disabled={isSubmitting}
                  />
                  <div className="space-y-2 mt-6">
                    <label className="text-sm text-gray-400">{step.text_input.label}</label>
                    <textarea
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={step.text_input.placeholder || 'Type your answer here...'}
                      className="w-full h-32 bg-gray-900/50 border border-gray-700/50 rounded-xl px-6 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
                      disabled={isSubmitting}
                    />
                    {textMinLength > 0 && (
                      <p className="text-xs text-gray-500">
                        Minimum {textMinLength} characters · {textLength}/{textMinLength}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">{step.text_input.label}</label>
                  <textarea
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={step.text_input.placeholder || 'Type your answer here...'}
                    className="w-full h-64 bg-gray-900/50 border border-gray-700/50 rounded-xl px-6 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
                    disabled={isSubmitting}
                  />
                  {textMinLength > 0 && (
                    <p className="text-xs text-gray-500">
                      Minimum {textMinLength} characters · {textLength}/{textMinLength}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {step?.input_type === 'text' && (
            <div className="space-y-6">
              {step.text_inputs && step.text_inputs.map((field: any) => (
                <div key={field.field_name} className="space-y-2">
                  <label className="text-sm text-gray-400">{field.label}</label>
                  <input
                    value={multiTextValues[field.field_name] || ''}
                    onChange={(e) => setMultiTextValues((prev) => ({ ...prev, [field.field_name]: e.target.value }))}
                    placeholder={field.placeholder || 'Type your answer...'}
                    className="w-full rounded-xl border border-gray-700/60 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={isSubmitting}
                  />
                </div>
              ))}

              {step.text_input && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">{step.text_input.label}</label>
                  <textarea
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={step.text_input.placeholder || 'Type your answer here...'}
                    className="w-full h-64 bg-gray-900/50 border border-gray-700/50 rounded-xl px-6 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
                    disabled={isSubmitting}
                  />
                  {textMinLength > 0 && (
                    <p className="text-xs text-gray-500">
                      Minimum {textMinLength} characters · {textLength}/{textMinLength}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {!step?.input_type && (
            <textarea
              value={response}
              onChange={(e) => onResponseChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your answer here..."
              className="w-full h-64 bg-gray-900/50 border border-gray-700/50 rounded-xl px-6 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
              disabled={isSubmitting}
              autoFocus
            />
          )}

          {/* File Upload Option (if allowed) */}
          {step.allow_file_upload && step.file_upload_prompt && (
            <div className="mt-4 p-4 bg-gray-900/30 border border-gray-700/30 rounded-xl">
              <p className="text-gray-400 text-sm mb-2">{step.file_upload_prompt}</p>
              <button
                onClick={handleAttachClick}
                type="button"
                className="text-teal-400 hover:text-teal-300 text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Attach files (optional)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length) {
                    onFileUpload(Array.from(files));
                  }
                }}
              />
              {uploadedFiles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={`uploaded-file-${idx}`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
                    >
                      <span className="max-w-[140px] truncate">{file.split('/').pop()}</span>
                      {onRemoveFile && (
                        <button
                          type="button"
                          onClick={() => onRemoveFile(file)}
                          className="text-slate-300 hover:text-red-300"
                          title="Remove file"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-6 mb-2">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round((stepNumber / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            {onBack && (
              <button
                onClick={onBack}
                disabled={isSubmitting}
                className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/60 disabled:text-gray-500 text-white font-bold py-4 rounded-xl transition-all disabled:cursor-not-allowed shadow-inner"
              >
                ← Back
              </button>
            )}
            <button
              onClick={onSubmit}
              disabled={!canSubmit || isSubmitting}
              className="flex-1 bg-teal-500 hover:bg-teal-400 disabled:bg-gray-700/50 disabled:text-gray-600 text-white font-bold py-4 rounded-xl transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-teal-500/50 text-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                stepNumber === totalSteps ? 'Generate Your Blueprint →' : 'Continue →'
              )}
            </button>
          </div>
          {showReviewCharts && onReviewCharts && (
            <button
              type="button"
              onClick={onReviewCharts}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Review chart data
            </button>
          )}
          <p className="text-center text-gray-500 text-sm">
            Press <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs">⌘</kbd> + <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs">Enter</kbd> to continue
          </p>
        </div>
      </div>
    </div>
  );
}
