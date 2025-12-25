'use client';

import { useState, useMemo } from 'react';

interface DeliverableViewProps {
  deliverable: string;
  productName: string;
}

interface Section {
  number: string;
  title: string;
  content: string;
}

export function DeliverableView({ deliverable, productName }: DeliverableViewProps) {
  const [copied, setCopied] = useState(false);

  // Parse deliverable into sections
  const sections = useMemo(() => {
    const parsed: Section[] = [];
    const lines = deliverable.split('\n');
    let currentSection: Section | null = null;

    for (const line of lines) {
      // Match patterns like "## 1. Brand Essence" or "**1. Brand Essence**" or "# 1. Brand Essence"
      const headerMatch = line.match(/^(?:#{1,3}\s*)?(?:\*\*)?(\d+)\.\s*([^*\n]+?)(?:\*\*)?$/);

      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          parsed.push(currentSection);
        }
        // Start new section
        currentSection = {
          number: headerMatch[1],
          title: headerMatch[2].trim(),
          content: ''
        };
      } else if (currentSection && line.trim()) {
        // Add content to current section
        currentSection.content += line + '\n';
      }
    }

    // Add last section
    if (currentSection) {
      parsed.push(currentSection);
    }

    return parsed;
  }, [deliverable]);

  const handleCopy = () => {
    navigator.clipboard.writeText(deliverable);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([deliverable], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName.replace(/\s+/g, '-').toLowerCase()}-deliverable.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030048] via-[#1a0066] to-[#030048] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-full mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-[#F8F5FF] mb-4">
            Your Blueprint is Ready!
          </h1>
          <p className="text-[#F8F5FF]/70 text-lg">
            Congratulations on completing {productName}
          </p>
        </div>

        {/* Deliverable Card */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-[#F8F5FF]/10 overflow-hidden">
          {/* Action Buttons */}
          <div className="bg-white/5 border-b border-[#F8F5FF]/10 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#F8F5FF]">
              Your Quantum Blueprint
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-[#F8F5FF] font-medium px-4 py-2 rounded-lg transition-all"
              >
                {copied ? (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white font-semibold px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-[#6C5CE7]/50 transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Deliverable Content */}
          <div className="p-8 space-y-6">
            {sections.length > 0 ? (
              sections.map((section, index) => (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-[#6C5CE7]/50 transition-all duration-300"
                >
                  {/* Section Number Badge */}
                  <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-full flex items-center justify-center shadow-lg shadow-[#6C5CE7]/30">
                    <span className="text-white font-bold text-lg">{section.number}</span>
                  </div>

                  {/* Section Title */}
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F8F5FF] to-[#E8DEFF] mb-4 pl-10">
                    {section.title}
                  </h3>

                  {/* Section Content */}
                  <div className="text-[#F8F5FF]/90 leading-relaxed space-y-3">
                    {section.content.split('\n').map((line, lineIndex) => {
                      const trimmedLine = line.trim();
                      if (!trimmedLine) return null;

                      // Bold text: **text**
                      const boldFormatted = trimmedLine.replace(
                        /\*\*([^*]+)\*\*/g,
                        '<strong class="text-[#F8F5FF] font-semibold">$1</strong>'
                      );

                      // Bullet points: - or •
                      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
                        return (
                          <div key={lineIndex} className="flex items-start space-x-3 ml-4">
                            <span className="text-[#6C5CE7] mt-1.5 flex-shrink-0">●</span>
                            <p
                              className="flex-1"
                              dangerouslySetInnerHTML={{ __html: boldFormatted.replace(/^[-•]\s*/, '') }}
                            />
                          </div>
                        );
                      }

                      // Regular paragraph
                      return (
                        <p
                          key={lineIndex}
                          className="text-[#F8F5FF]/90"
                          dangerouslySetInnerHTML={{ __html: boldFormatted }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              // Fallback if parsing fails
              <div className="text-[#F8F5FF] whitespace-pre-wrap leading-relaxed">
                {deliverable}
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-[#F8F5FF]/70 hover:text-[#F8F5FF] transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Return to Dashboard</span>
          </a>
        </div>
      </div>
    </div>
  );
}
