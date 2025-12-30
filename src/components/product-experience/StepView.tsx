'use client';

import { ChatWindow } from './ChatWindow';
import { useRef, useState, useEffect } from 'react';
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
  onFileUpload: (files: File[]) => void;
  uploadedFiles: string[];
  uploadError?: string | null;
  assistantReply?: string;
  isSubmitting: boolean;
  onRemoveFile?: (path: string) => void;
  processingMessages?: string[];
}

export function StepView({
  step,
  stepNumber,
  totalSteps,
  response,
  onResponseChange,
  onSubmit,
  onBack,
  onFileUpload,
  uploadedFiles,
  uploadError,
  assistantReply,
  isSubmitting,
  onRemoveFile,
  processingMessages,
}: StepViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentProcessingMessage, setCurrentProcessingMessage] = useState(0);

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

  const handleAttachClick = () => fileInputRef.current?.click();
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      onSubmit();
    }
  };

  const processingText = processingMessages && processingMessages.length > 0
    ? processingMessages[currentProcessingMessage]
    : 'Thinking…';

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
              <div className="prose prose-invert prose-sm max-w-none [&_strong]:text-purple-300 [&_strong]:font-semibold [&_p]:text-gray-300 [&_li]:text-gray-300 [&_h1]:text-gray-200 [&_h2]:text-gray-200 [&_h3]:text-gray-200">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {assistantReply}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {step.question && step.title && (
            <div className="prose prose-invert prose-lg max-w-none [&_strong]:text-purple-400 [&_strong]:font-bold [&_p]:text-white [&_li]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white mb-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {step.question}
              </ReactMarkdown>
            </div>
          )}

          <textarea
            value={response}
            onChange={(e) => onResponseChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your answer here..."
            className="w-full h-64 bg-gray-900/50 border border-gray-700/50 rounded-xl px-6 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
            disabled={isSubmitting}
            autoFocus
          />

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
                  {uploadedFiles.map((file) => (
                    <div
                      key={file}
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
              disabled={!response.trim() || isSubmitting}
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
          <p className="text-center text-gray-500 text-sm">
            Press <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs">⌘</kbd> + <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs">Enter</kbd> to continue
          </p>
        </div>
      </div>
    </div>
  );
}
