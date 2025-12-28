'use client';

import { useState, ReactElement } from 'react';

interface DeliverableViewerProps {
  deliverable: string | null;
  productName: string;
}

export default function DeliverableViewer({ deliverable, productName }: DeliverableViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!deliverable) {
    return (
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20">
          <span className="text-3xl">📋</span>
        </div>
        <h3 className="text-xl font-semibold text-white">No Briefing Yet</h3>
        <p className="mt-2 text-sm text-slate-400">
          Complete the product experience to generate your personalized blueprint.
        </p>
      </div>
    );
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Use PDFService for clean, reusable PDF generation
      const { PDFService } = await import('@/lib/services/PDFService');

      await PDFService.generatePDF({
        title: productName,
        content: deliverable,
        fileName: `${productName.replace(/\s+/g, '-')}-Blueprint.pdf`,
        author: 'Quantum Strategies',
        includeDate: true,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Format the deliverable text for display
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    const elements: ReactElement[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Section headers (##)
      if (line.startsWith('##')) {
        const headerText = line.replace(/^#+\s*/, '');
        elements.push(
          <h2
            key={key++}
            className="mt-8 mb-4 bg-gradient-to-r from-violet-200 to-purple-200 bg-clip-text text-2xl font-bold text-transparent first:mt-0"
          >
            {headerText}
          </h2>
        );
      }
      // Bold headers (**)
      else if (line.startsWith('**') && line.endsWith('**')) {
        const headerText = line.replace(/\*\*/g, '');
        elements.push(
          <h3
            key={key++}
            className="mt-6 mb-3 text-lg font-semibold text-violet-100"
          >
            {headerText}
          </h3>
        );
      }
      // Bullet points
      else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        const bulletText = line.replace(/^[\s-•]+/, '');
        elements.push(
          <div key={key++} className="mb-2 flex items-start gap-3 pl-2">
            <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-violet-400 to-purple-400"></span>
            <p className="flex-1 text-base leading-relaxed text-slate-200">
              {formatInlineStyles(bulletText)}
            </p>
          </div>
        );
      }
      // Regular paragraphs
      else if (line.trim()) {
        elements.push(
          <p key={key++} className="mb-4 text-base leading-relaxed text-slate-200">
            {formatInlineStyles(line)}
          </p>
        );
      }
      // Empty lines
      else {
        elements.push(<div key={key++} className="h-2"></div>);
      }
    }

    return elements;
  };

  // Format inline bold, italic, etc.
  const formatInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-white">
            {part.replace(/\*\*/g, '')}
          </strong>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-transparent p-8 shadow-2xl shadow-violet-500/10">
      {/* Header with Download Button */}
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-500/30">
            <span className="text-2xl">✨</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Your Quantum Blueprint</h2>
            <p className="text-xs text-violet-300">Personalized strategic guidance</p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="group flex items-center gap-2 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-purple-500/10 px-5 py-2.5 text-sm font-medium text-violet-200 transition-all hover:border-violet-500/50 hover:from-violet-500/20 hover:to-purple-500/20 disabled:opacity-50"
        >
          <span className="text-lg transition-transform group-hover:scale-110">📥</span>
          {isDownloading ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>

      {/* Formatted Content */}
      <div className="prose prose-invert max-w-none">
        {formatContent(deliverable)}
      </div>
    </div>
  );
}
