'use client';

import { useState } from 'react';

interface WheelOfLifeProps {
  onRatingChange: (ratings: Record<string, number>) => void;
  initialRatings?: Record<string, number>;
}

const categories = [
  { key: 'health', label: 'Health', angle: 0, color: '#14b8a6' },
  { key: 'relationships', label: 'Relationships', angle: 45, color: '#06b6d4' },
  { key: 'purpose', label: 'Purpose', angle: 90, color: '#8b5cf6' },
  { key: 'money', label: 'Money', angle: 135, color: '#ec4899' },
  { key: 'growth', label: 'Growth', angle: 180, color: '#f59e0b' },
  { key: 'creativity', label: 'Creativity', angle: 225, color: '#10b981' },
  { key: 'environment', label: 'Environment', angle: 270, color: '#3b82f6' },
  { key: 'contribution', label: 'Contribution', angle: 315, color: '#a855f7' },
];

export default function WheelOfLife({ onRatingChange, initialRatings }: WheelOfLifeProps) {
  const [ratings, setRatings] = useState<Record<string, number>>(
    initialRatings || categories.reduce((acc, cat) => ({ ...acc, [cat.key]: 5 }), {})
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleRatingChange = (categoryKey: string, value: number) => {
    const newRatings = { ...ratings, [categoryKey]: value };
    setRatings(newRatings);
    onRatingChange(newRatings);

    // Auto-advance to next category after rating
    const currentIndex = categories.findIndex(c => c.key === categoryKey);
    const nextIndex = (currentIndex + 1) % categories.length;
    setSelectedCategory(categories[nextIndex].key);
  };

  const selectedCat = categories.find(c => c.key === selectedCategory);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Step 1: Category Selection Grid */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all text-left group"
            style={{
              borderColor: selectedCategory === cat.key ? cat.color : undefined,
              backgroundColor: selectedCategory === cat.key ? `${cat.color}15` : undefined,
            }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{cat.label}</span>
              <span
                className="text-lg font-bold transition-colors"
                style={{
                  color: selectedCategory === cat.key ? cat.color : '#ffffff',
                }}
              >{ratings[cat.key]}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Step 2: Rating Selector (appears when category selected) */}
      {selectedCategory && selectedCat && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">{selectedCat.label}</h3>
            <div className="text-sm text-gray-400">Click to rate 1-10</div>
          </div>

          <div className="space-y-4">
            {/* Rating dots */}
            <div className="relative pb-8">
              <div className="flex justify-between items-center relative">
                {/* Progress bar background - positioned behind buttons */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-700" />
                <div
                  className="absolute top-5 left-5 h-1 transition-all duration-300 rounded-full"
                  style={{
                    width: `calc(${((ratings[selectedCategory] - 1) / 9) * 100}% - 2.5rem)`,
                    backgroundColor: selectedCat.color,
                  }}
                />

                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => {
                  const currentRating = ratings[selectedCategory] || 5;
                  return (
                    <button
                      key={value}
                      onClick={() => handleRatingChange(selectedCategory, value)}
                      className={`relative w-10 h-10 rounded-full transition-all duration-200 z-10 ${
                        value <= currentRating
                          ? 'scale-110 shadow-lg'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      style={{
                        backgroundColor: value <= currentRating ? selectedCat.color : undefined,
                        boxShadow: value <= currentRating ? `0 4px 20px ${selectedCat.color}80` : undefined,
                      }}
                    >
                      <span className={`absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-sm font-semibold ${
                        value <= currentRating ? 'text-white' : 'text-gray-500'
                      }`}>
                        {value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Wheel Visualization - Pure visual summary at bottom */}
      <div className="relative w-full aspect-square max-w-sm mx-auto py-4">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
          {/* Grid circles */}
          {[2, 4, 6, 8, 10].map((level) => (
            <circle
              key={level}
              cx="100"
              cy="100"
              r={level * 9}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="0.5"
            />
          ))}

          {/* Draw filled pie slices for each category */}
          {categories.map((cat, i) => {
            const rating = ratings[cat.key] || 5;
            const startAngle = (cat.angle - 22.5) * (Math.PI / 180);
            const endAngle = (cat.angle + 22.5) * (Math.PI / 180);
            const radius = rating * 9;

            // Create path for pie slice
            const x1 = 100 + Math.cos(startAngle) * radius;
            const y1 = 100 + Math.sin(startAngle) * radius;
            const x2 = 100 + Math.cos(endAngle) * radius;
            const y2 = 100 + Math.sin(endAngle) * radius;

            const largeArcFlag = 0;

            const pathData = `M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            return (
              <g key={cat.key}>
                {/* Slice background */}
                <path
                  d={`M 100 100 L ${100 + Math.cos(startAngle) * 90} ${100 + Math.sin(startAngle) * 90} A 90 90 0 0 1 ${100 + Math.cos(endAngle) * 90} ${100 + Math.sin(endAngle) * 90} Z`}
                  fill="rgba(255, 255, 255, 0.02)"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="0.5"
                />
                {/* Filled slice based on rating */}
                <path
                  d={pathData}
                  fill={cat.color}
                  fillOpacity="0.4"
                  stroke={cat.color}
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Spokes */}
          {categories.map((cat, i) => {
            const angle = cat.angle * (Math.PI / 180);
            const x2 = 100 + Math.cos(angle) * 90;
            const y2 = 100 + Math.sin(angle) * 90;
            return (
              <line
                key={i}
                x1="100"
                y1="100"
                x2={x2}
                y2={y2}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* Center instruction */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center px-4">
            <div className="text-sm text-gray-400 font-medium">Your Life Balance</div>
            <div className="text-xs text-gray-500 mt-1">Visual summary</div>
          </div>
        </div>
      </div>
    </div>
  );
}
