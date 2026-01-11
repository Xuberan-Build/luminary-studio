'use client';

interface AILoadingAnimationProps {
  message?: string;
  variant?: 'default' | 'compact';
}

export default function AILoadingAnimation({
  message = "Analyzing your chart data...",
  variant = 'default'
}: AILoadingAnimationProps) {
  if (variant === 'compact') {
    return (
      <div className="flex justify-start">
        <div className="bg-white/10 rounded-2xl px-5 py-3 backdrop-blur-sm">
          <div className="flex space-x-2 items-center">
            <div className="flex space-x-1.5">
              <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.15s' }}
              />
              <div
                className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.3s' }}
              />
            </div>
            <span className="text-xs text-gray-400 ml-2">Thinking...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="absolute inset-0">
          <svg className="w-24 h-24 animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient1)"
              strokeWidth="2"
              strokeDasharray="70 200"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Middle rotating ring */}
        <div className="absolute inset-0">
          <svg
            className="w-24 h-24 animate-spin"
            style={{ animationDuration: '2s', animationDirection: 'reverse' }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="url(#gradient2)"
              strokeWidth="2"
              strokeDasharray="50 150"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0891b2" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Center pulsing icon */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute w-12 h-12 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full animate-pulse" />
          <div className="text-3xl animate-pulse" style={{ animationDuration: '1.5s' }}>
            ✨
          </div>
        </div>
      </div>

      {/* Loading message */}
      <div className="absolute mt-32 space-y-2">
        <p className="text-sm font-medium bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
          {message}
        </p>
        <div className="flex justify-center space-x-1">
          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" />
          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
}
