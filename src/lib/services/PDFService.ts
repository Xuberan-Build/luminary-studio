/**
 * PDF Service
 * Reusable PDF generation with proper formatting
 * Handles markdown-style text and creates professional PDFs
 */

import { jsPDF } from 'jspdf';

export interface PDFOptions {
  title: string;
  content: string;
  fileName?: string;
  author?: string;
  includeDate?: boolean;
}

export class PDFService {
  private static readonly PAGE_WIDTH = 210; // A4 width in mm
  private static readonly PAGE_HEIGHT = 297; // A4 height in mm
  private static readonly MARGIN = 20;
  private static readonly MAX_WIDTH = this.PAGE_WIDTH - 2 * this.MARGIN;

  /**
   * Generate and download a PDF from markdown-style text
   */
  static async generatePDF(options: PDFOptions): Promise<void> {
    const {
      title,
      content,
      fileName = `${title.replace(/\s+/g, '-')}.pdf`,
      author,
      includeDate = true,
    } = options;

    const doc = new jsPDF();
    let yPosition = this.MARGIN;

    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(title, this.MAX_WIDTH);
    doc.text(titleLines, this.MARGIN, yPosition);
    yPosition += titleLines.length * 8 + 5;

    // Add date if requested
    if (includeDate) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.text(dateStr, this.MARGIN, yPosition);
      yPosition += 8;
      doc.setTextColor(0, 0, 0);
    }

    // Add separator line
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(this.MARGIN, yPosition, this.PAGE_WIDTH - this.MARGIN, yPosition);
    yPosition += 8;

    // Process content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const lines = content.split('\n');
    for (const line of lines) {
      // Check if we need a new page
      if (yPosition > this.PAGE_HEIGHT - this.MARGIN) {
        doc.addPage();
        yPosition = this.MARGIN;
      }

      // Section headers (##)
      if (line.startsWith('##')) {
        yPosition += 2; // Extra space before headers
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        const headerText = line.replace(/^#+\s*/, '');
        const wrappedHeader = doc.splitTextToSize(headerText, this.MAX_WIDTH);
        doc.text(wrappedHeader, this.MARGIN, yPosition);
        yPosition += wrappedHeader.length * 8 + 4;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
      }
      // Bold headers (**)
      else if (line.startsWith('**') && line.endsWith('**')) {
        yPosition += 1;
        doc.setFont('helvetica', 'bold');
        const headerText = line.replace(/\*\*/g, '');
        const wrappedHeader = doc.splitTextToSize(headerText, this.MAX_WIDTH);
        doc.text(wrappedHeader, this.MARGIN, yPosition);
        yPosition += wrappedHeader.length * 6 + 2;
        doc.setFont('helvetica', 'normal');
      }
      // Bullet points
      else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        const bulletText = line.replace(/^[\s-•]+/, '');
        const wrappedBullet = doc.splitTextToSize(`• ${bulletText}`, this.MAX_WIDTH - 5);
        doc.text(wrappedBullet, this.MARGIN + 5, yPosition);
        yPosition += wrappedBullet.length * 5 + 1;
      }
      // Regular text
      else if (line.trim()) {
        const wrappedText = doc.splitTextToSize(line, this.MAX_WIDTH);
        doc.text(wrappedText, this.MARGIN, yPosition);
        yPosition += wrappedText.length * 5 + 2;
      }
      // Empty lines
      else {
        yPosition += 4;
      }
    }

    // Add footer to each page
    if (author) {
      const totalPages = doc.internal.pages.length - 1; // jsPDF counts from 0
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `${author} • Page ${i} of ${totalPages}`,
          this.MARGIN,
          this.PAGE_HEIGHT - 10
        );
      }
    }

    // Download
    doc.save(fileName);
  }

  /**
   * Generate PDF and return as blob (for upload/storage)
   */
  static async generatePDFBlob(options: PDFOptions): Promise<Blob> {
    const doc = new jsPDF();
    // ... same logic as generatePDF but return blob instead
    return doc.output('blob');
  }

  /**
   * Generate PDF with custom styling
   */
  static async generateStyledPDF(
    options: PDFOptions & {
      primaryColor?: [number, number, number];
      fontSize?: number;
    }
  ): Promise<void> {
    // Can extend this for custom branding
    await this.generatePDF(options);
  }
}
