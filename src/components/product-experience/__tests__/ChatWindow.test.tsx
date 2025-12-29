import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWindow } from '../ChatWindow';

describe('ChatWindow', () => {
  const defaultProps = {
    title: 'Upload Your Charts',
    description: 'Upload your astrology and human design charts',
    instructions: 'Astrology Chart\nUpload your natal chart\n\nHuman Design Chart\nUpload your bodygraph',
    onFileUpload: vi.fn(),
    uploadedFiles: [],
    onContinue: vi.fn(),
    isSubmitting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render title and description', () => {
      render(<ChatWindow {...defaultProps} />);

      expect(screen.getByText('Upload Your Charts')).toBeInTheDocument();
      expect(screen.getByText('Upload your astrology and human design charts')).toBeInTheDocument();
    });

    it('should render without description', () => {
      const props = {
        ...defaultProps,
        description: undefined,
      };

      render(<ChatWindow {...props} />);

      expect(screen.getByText('Upload Your Charts')).toBeInTheDocument();
    });

    it('should render instructions when provided', () => {
      render(<ChatWindow {...defaultProps} />);

      expect(screen.getByText('Astrology Chart')).toBeInTheDocument();
      expect(screen.getByText('Human Design Chart')).toBeInTheDocument();
    });

    it('should render URLs in instructions as links', () => {
      const props = {
        ...defaultProps,
        instructions: 'Section Heading\nGet your chart from https://example.com/chart',
      };

      render(<ChatWindow {...props} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com/chart');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should show drag and drop zone', () => {
      render(<ChatWindow {...defaultProps} />);

      expect(screen.getByText('Drag & drop or browse')).toBeInTheDocument();
      expect(screen.getByText(/PDF, PNG, or JPG/)).toBeInTheDocument();
    });

    it('should show upload error when present', () => {
      const props = {
        ...defaultProps,
        uploadError: 'File too large',
      };

      render(<ChatWindow {...props} />);

      expect(screen.getByText('File too large')).toBeInTheDocument();
    });

    it('should not show error when uploadError is null', () => {
      render(<ChatWindow {...defaultProps} uploadError={null} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('File Upload', () => {
    it('should handle file selection', async () => {
      const user = userEvent.setup();
      render(<ChatWindow {...defaultProps} />);

      const file = new File(['content'], 'chart.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      expect(defaultProps.onFileUpload).toHaveBeenCalledWith([file]);
    });

    it('should handle multiple file selection', async () => {
      const user = userEvent.setup();
      render(<ChatWindow {...defaultProps} />);

      const files = [
        new File(['content1'], 'chart1.png', { type: 'image/png' }),
        new File(['content2'], 'chart2.png', { type: 'image/png' }),
      ];
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, files);

      expect(defaultProps.onFileUpload).toHaveBeenCalledWith(files);
    });

    it('should accept image and PDF files', () => {
      render(<ChatWindow {...defaultProps} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toHaveAttribute('accept', 'image/*,application/pdf');
      expect(input).toHaveAttribute('multiple');
    });

    it('should trigger file input on browse button click', async () => {
      const user = userEvent.setup();
      render(<ChatWindow {...defaultProps} />);

      const browseButton = screen.getByRole('button', { name: /attach file/i });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      await user.click(browseButton);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should disable browse button when submitting', () => {
      const props = {
        ...defaultProps,
        isSubmitting: true,
      };

      render(<ChatWindow {...props} />);

      const browseButton = screen.getByRole('button', { name: /attach file/i });
      expect(browseButton).toBeDisabled();
    });
  });

  describe('Drag and Drop', () => {
    it('should handle file drop', () => {
      render(<ChatWindow {...defaultProps} />);

      const file = new File(['content'], 'chart.png', { type: 'image/png' });
      const dropZone = screen.getByText('Drag & drop or browse').closest('div');

      fireEvent.dragOver(dropZone!);
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [file],
        },
      });

      expect(defaultProps.onFileUpload).toHaveBeenCalledWith([file]);
    });

    it('should set dragActive on drag over', () => {
      const { container } = render(<ChatWindow {...defaultProps} />);

      // Find the drop zone container - it's the parent of the text "Drag & drop or browse"
      const dropZone = screen.getByText('Drag & drop or browse').parentElement!.parentElement!.parentElement!;
      fireEvent.dragOver(dropZone);

      // Check if the active class is applied (border-teal-400/70)
      expect(dropZone).toHaveClass('border-teal-400/70');
    });

    it('should reset dragActive on drag leave', () => {
      const { container } = render(<ChatWindow {...defaultProps} />);

      const dropZone = screen.getByText('Drag & drop or browse').parentElement!.parentElement!.parentElement!;
      fireEvent.dragOver(dropZone);
      expect(dropZone).toHaveClass('border-teal-400/70');

      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass('border-teal-400/70');
    });
  });

  describe('Uploaded Files Display', () => {
    it('should display uploaded files', () => {
      const props = {
        ...defaultProps,
        uploadedFiles: ['user-uploads/chart.png', 'user-uploads/bodygraph.pdf'],
      };

      render(<ChatWindow {...props} />);

      expect(screen.getByText('Files ready')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('chart.png')).toBeInTheDocument();
      expect(screen.getByText('bodygraph.pdf')).toBeInTheDocument();
    });

    it('should show only first 3 files visibly', async () => {
      const user = userEvent.setup();
      render(<ChatWindow {...defaultProps} />);

      const files = [
        new File(['1'], 'file1.png', { type: 'image/png' }),
        new File(['2'], 'file2.png', { type: 'image/png' }),
        new File(['3'], 'file3.png', { type: 'image/png' }),
        new File(['4'], 'file4.png', { type: 'image/png' }),
      ];
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, files);

      await waitFor(() => {
        expect(screen.getByText('file1.png')).toBeInTheDocument();
        expect(screen.getByText('file2.png')).toBeInTheDocument();
        expect(screen.getByText('file3.png')).toBeInTheDocument();
        expect(screen.getByText('+1 more')).toBeInTheDocument();
      });
    });

    it('should handle file removal for uploaded files', async () => {
      const user = userEvent.setup();
      const onRemoveFile = vi.fn();
      const props = {
        ...defaultProps,
        uploadedFiles: ['user-uploads/chart.png'],
        onRemoveFile,
      };

      render(<ChatWindow {...props} />);

      const removeButtons = screen.getAllByTitle('Remove file');
      await user.click(removeButtons[0]);

      expect(onRemoveFile).toHaveBeenCalledWith('user-uploads/chart.png');
    });

    it('should handle file removal for local files', async () => {
      const user = userEvent.setup();
      render(<ChatWindow {...defaultProps} />);

      const file = new File(['content'], 'local.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('local.png')).toBeInTheDocument();
      });

      const removeButton = screen.getByTitle('Remove file');
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('local.png')).not.toBeInTheDocument();
      });
    });

    it('should not show files section when no files', () => {
      render(<ChatWindow {...defaultProps} />);

      expect(screen.queryByText('Files ready')).not.toBeInTheDocument();
    });
  });

  describe('Continue Button', () => {
    it('should be disabled when no files uploaded', () => {
      render(<ChatWindow {...defaultProps} />);

      // The continue button is the arrow button
      const buttons = screen.getAllByRole('button');
      const continueButton = buttons.find((btn) => btn.querySelector('svg path[d*="M13 7l5 5"]'));

      expect(continueButton).toBeDisabled();
    });

    it('should be enabled when files are uploaded', () => {
      const props = {
        ...defaultProps,
        uploadedFiles: ['user-uploads/chart.png'],
      };

      render(<ChatWindow {...props} />);

      const buttons = screen.getAllByRole('button');
      const continueButton = buttons.find((btn) => btn.querySelector('svg path[d*="M13 7l5 5"]'));

      expect(continueButton).not.toBeDisabled();
    });

    it('should call onContinue when clicked', async () => {
      const user = userEvent.setup();
      const props = {
        ...defaultProps,
        uploadedFiles: ['user-uploads/chart.png'],
      };

      render(<ChatWindow {...props} />);

      const buttons = screen.getAllByRole('button');
      const continueButton = buttons.find((btn) => btn.querySelector('svg path[d*="M13 7l5 5"]'));

      await user.click(continueButton!);

      expect(defaultProps.onContinue).toHaveBeenCalled();
    });

    it('should show spinner when submitting', () => {
      const props = {
        ...defaultProps,
        uploadedFiles: ['user-uploads/chart.png'],
        isSubmitting: true,
      };

      render(<ChatWindow {...props} />);

      const buttons = screen.getAllByRole('button');
      const continueButton = buttons.find((btn) => btn.querySelector('svg circle.opacity-25'));

      expect(continueButton).toBeInTheDocument();
      expect(continueButton).toBeDisabled();
    });

    it('should be disabled when submitting', () => {
      const props = {
        ...defaultProps,
        uploadedFiles: ['user-uploads/chart.png'],
        isSubmitting: true,
      };

      render(<ChatWindow {...props} />);

      const buttons = screen.getAllByRole('button');
      const continueButton = buttons.find((btn) => btn.querySelector('svg circle.opacity-25'));

      expect(continueButton).toBeDisabled();
    });
  });

  describe('Instructions Formatting', () => {
    it('should strip markdown bold markers from instructions', () => {
      const props = {
        ...defaultProps,
        instructions: '**Bold heading**\nRegular text',
      };

      render(<ChatWindow {...props} />);

      expect(screen.getByText('Bold heading')).toBeInTheDocument();
      expect(screen.queryByText('**Bold heading**')).not.toBeInTheDocument();
    });

    it('should split instructions into sections by double newline', () => {
      const props = {
        ...defaultProps,
        instructions: 'Section 1\nLine 1\n\nSection 2\nLine 2',
      };

      render(<ChatWindow {...props} />);

      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
    });

    it('should not show instructions section when empty', () => {
      const props = {
        ...defaultProps,
        instructions: '',
      };

      render(<ChatWindow {...props} />);

      expect(screen.queryByText('Files we need to craft your blueprint')).not.toBeInTheDocument();
    });
  });
});
