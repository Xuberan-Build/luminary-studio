'use client';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  percentage: number;
}

export function ProgressBar({ currentStep, totalSteps, percentage }: ProgressBarProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-baseline mb-4">
        <span className="text-gray-500 text-sm font-medium tracking-wide">
          STEP {currentStep} OF {totalSteps}
        </span>
        <span className="text-gray-400 text-sm">
          {percentage}% complete
        </span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-700 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
