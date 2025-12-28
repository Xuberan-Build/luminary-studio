/**
 * Google Docs Service
 * Handles reading and parsing Google Docs for product templates
 */

import { google } from 'googleapis';

export interface GoogleDocsAuth {
  clientEmail: string;
  privateKey: string;
}

export interface ParsedProduct {
  name: string;
  slug: string;
  price: number;
  description: string;
  estimatedDuration: string;
  totalSteps: number;
  model: string;
  systemPrompt: string;
  steps: ProductStep[];
  finalDeliverablePrompt: string;
  stripeConfig: {
    successUrl: string;
  };
  crmConfig: {
    sheetId: string;
    fromEmail: string;
    fromName: string;
  };
}

export interface ProductStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  question: string;
  allowFileUpload: boolean;
  fileUploadPrompt?: string;
  required: boolean;
  maxFollowUps: number;
  stepInsightPrompt: string;
  followupPrompt: string;
}

export class GoogleDocsService {
  private docs: any;
  private drive: any;

  constructor(auth: GoogleDocsAuth) {
    const googleAuth = new google.auth.JWT({
      email: auth.clientEmail,
      key: auth.privateKey,
      scopes: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive', // Full Drive access (not just .file)
      ],
    });

    this.docs = google.docs({ version: 'v1', auth: googleAuth });
    this.drive = google.drive({ version: 'v3', auth: googleAuth });
  }

  /**
   * Read a Google Doc by ID
   */
  async readDocument(docId: string): Promise<any> {
    try {
      const response = await this.docs.documents.get({
        documentId: docId,
      });

      return response.data;
    } catch (error: any) {
      console.error('[GoogleDocsService] Error reading document:', error?.message);
      throw new Error(`Failed to read document: ${error?.message}`);
    }
  }

  /**
   * Create a new Google Doc
   */
  async createDocument(title: string, folderId?: string, ownerEmail?: string): Promise<string> {
    console.log('[GoogleDocsService] Creating document...');
    console.log(`  Title: "${title}"`);
    console.log(`  Folder ID: ${folderId || 'root'}`);
    console.log(`  Will transfer ownership to: ${ownerEmail || 'service account (no transfer)'}`);

    try {
      // Create the document via Drive API (not Docs API)
      // This works better with service accounts
      const fileMetadata: any = {
        name: title,
        mimeType: 'application/vnd.google-apps.document',
      };

      if (folderId) {
        fileMetadata.parents = [folderId];
      }

      console.log('  File metadata:', JSON.stringify(fileMetadata, null, 2));
      console.log('  Making API call to drive.files.create...');

      const file = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id,name,mimeType,parents,webViewLink',
      });

      console.log('  API response:', JSON.stringify(file.data, null, 2));
      console.log(`  ✓ Document created: ${file.data.id}`);

      // Transfer ownership to user if specified
      // This makes the file count against user's storage quota instead of service account's
      if (ownerEmail && file.data.id) {
        console.log(`  Transferring ownership to ${ownerEmail}...`);

        try {
          // First, add the user as a writer
          await this.drive.permissions.create({
            fileId: file.data.id,
            requestBody: {
              type: 'user',
              role: 'writer',
              emailAddress: ownerEmail,
            },
            transferOwnership: false,
          });

          console.log(`  ✓ Added ${ownerEmail} as writer`);

          // Then transfer ownership
          await this.drive.permissions.create({
            fileId: file.data.id,
            requestBody: {
              type: 'user',
              role: 'owner',
              emailAddress: ownerEmail,
            },
            transferOwnership: true,
          });

          console.log(`  ✓ Ownership transferred to ${ownerEmail}`);
          console.log(`  ✓ File now counts against user's storage quota`);
        } catch (ownerError: any) {
          console.error('  ⚠️  Ownership transfer failed (continuing anyway):', ownerError.message);
          // Don't fail the whole operation if ownership transfer fails
        }
      }

      return file.data.id || '';
    } catch (error: any) {
      console.error('\n[GoogleDocsService] ❌ Document creation failed!');
      console.error('  Error type:', error?.constructor?.name);
      console.error('  Error message:', error?.message);
      console.error('  Error code:', error?.code);
      console.error('  Error status:', error?.status);

      if (error?.response) {
        console.error('  Response status:', error.response.status);
        console.error('  Response statusText:', error.response.statusText);
        console.error('  Response data:', JSON.stringify(error.response.data, null, 2));
      }

      if (error?.errors) {
        console.error('  Error details:', JSON.stringify(error.errors, null, 2));
      }

      console.error('\n  Full error object:', JSON.stringify(error, null, 2));

      throw new Error(`Failed to create document: ${error?.message}`);
    }
  }

  /**
   * Share document with service account
   */
  async shareDocument(docId: string, email: string, role: 'reader' | 'writer' = 'writer'): Promise<void> {
    try {
      await this.drive.permissions.create({
        fileId: docId,
        requestBody: {
          type: 'user',
          role,
          emailAddress: email,
        },
      });

      console.log(`[GoogleDocsService] Shared ${docId} with ${email}`);
    } catch (error: any) {
      console.error('[GoogleDocsService] Error sharing document:', error?.message);
      throw new Error(`Failed to share document: ${error?.message}`);
    }
  }

  /**
   * Create a folder in Google Drive
   */
  async createFolder(name: string, parentFolderId?: string): Promise<string> {
    try {
      const folderMetadata: any = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
      };

      if (parentFolderId) {
        folderMetadata.parents = [parentFolderId];
      }

      const folder = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });

      return folder.data.id || '';
    } catch (error: any) {
      console.error('[GoogleDocsService] Error creating folder:', error?.message);
      throw new Error(`Failed to create folder: ${error?.message}`);
    }
  }

  /**
   * Insert content into a Google Doc
   */
  async insertContent(docId: string, content: string): Promise<void> {
    try {
      await this.docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: content,
              },
            },
          ],
        },
      });

      console.log(`[GoogleDocsService] Inserted content into ${docId}`);
    } catch (error: any) {
      console.error('[GoogleDocsService] Error inserting content:', error?.message);
      throw new Error(`Failed to insert content: ${error?.message}`);
    }
  }

  /**
   * Parse product template document
   */
  parseProductDocument(doc: any): ParsedProduct {
    const content = doc.body.content;
    const text = this.extractText(content);

    // Parse sections
    const product: ParsedProduct = {
      name: this.extractSection(text, 'Product Name', 'Product Metadata') || 'Untitled Product',
      slug: this.extractMetadata(text, 'Product Slug') || '',
      price: parseFloat(this.extractMetadata(text, 'Price')?.replace(/[$,]/g, '') || '0'),
      description: this.extractMetadata(text, 'Description') || '',
      estimatedDuration: this.extractMetadata(text, 'Estimated Duration') || '15-30 minutes',
      totalSteps: parseInt(this.extractMetadata(text, 'Total Steps') || '7'),
      model: this.extractMetadata(text, 'OpenAI Model') || 'gpt-4o',
      systemPrompt: this.extractSection(text, 'System Prompt', 'Step 1:') || '',
      steps: this.extractSteps(text),
      finalDeliverablePrompt: this.extractSection(text, 'Final Deliverable Prompt', 'Stripe Configuration') || '',
      stripeConfig: {
        successUrl: this.extractMetadata(text, 'Success URL') || '',
      },
      crmConfig: {
        sheetId: this.extractMetadata(text, 'Google Sheet ID') || '',
        fromEmail: this.extractMetadata(text, 'From Email') || '',
        fromName: this.extractMetadata(text, 'From Name') || '',
      },
    };

    return product;
  }

  /**
   * Extract text from document content
   */
  private extractText(content: any[]): string {
    let text = '';

    for (const element of content) {
      if (element.paragraph) {
        for (const textElement of element.paragraph.elements || []) {
          if (textElement.textRun) {
            text += textElement.textRun.content;
          }
        }
      }
    }

    return text;
  }

  /**
   * Extract section between two headings
   */
  private extractSection(text: string, startHeading: string, endHeading: string): string {
    const startPattern = new RegExp(`${startHeading}[\\s\\S]*?\\n`, 'i');
    const endPattern = new RegExp(`${endHeading}`, 'i');

    const startMatch = text.match(startPattern);
    if (!startMatch) return '';

    const startIndex = startMatch.index! + startMatch[0].length;
    const remainingText = text.substring(startIndex);

    const endMatch = remainingText.match(endPattern);
    const endIndex = endMatch ? endMatch.index! : remainingText.length;

    return remainingText.substring(0, endIndex).trim();
  }

  /**
   * Extract metadata value (e.g., "Product Slug: quantum-pricing")
   */
  private extractMetadata(text: string, key: string): string {
    const pattern = new RegExp(`${key}:\\s*(.+?)(?:\\n|$)`, 'i');
    const match = text.match(pattern);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract all 7 steps from document
   */
  private extractSteps(text: string): ProductStep[] {
    const steps: ProductStep[] = [];

    for (let i = 1; i <= 7; i++) {
      const stepSection = this.extractSection(
        text,
        `Step ${i}:`,
        i < 7 ? `Step ${i + 1}:` : 'Final Deliverable Prompt'
      );

      if (!stepSection) continue;

      const step: ProductStep = {
        stepNumber: i,
        title: this.extractMetadata(stepSection, 'Step Title') || '',
        subtitle: this.extractMetadata(stepSection, 'Step Subtitle') || '',
        question: this.extractSection(stepSection, 'Main Question:', 'Settings:') || '',
        allowFileUpload: this.extractMetadata(stepSection, 'Allow File Upload')?.toUpperCase() === 'YES',
        fileUploadPrompt: this.extractMetadata(stepSection, 'File Upload Prompt') || undefined,
        required: this.extractMetadata(stepSection, 'Required')?.toUpperCase() === 'YES',
        maxFollowUps: parseInt(this.extractMetadata(stepSection, 'Max Follow-ups') || '3'),
        stepInsightPrompt: this.extractSection(stepSection, 'Assistant Response Prompt (step_insight)', 'Follow-up Response Prompt') || '',
        followupPrompt: this.extractSection(stepSection, 'Follow-up Response Prompt', '---') || this.extractSection(stepSection, 'Follow-up Response Prompt', `Step ${i + 1}:`) || '',
      };

      steps.push(step);
    }

    return steps;
  }

  /**
   * Validate parsed product
   */
  validateProduct(product: ParsedProduct): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!product.slug) errors.push('Product slug is required');
    if (!product.name) errors.push('Product name is required');
    if (product.price <= 0) errors.push('Price must be greater than 0');
    if (!product.systemPrompt) errors.push('System prompt is required');
    if (product.steps.length !== 7) errors.push(`Expected 7 steps, found ${product.steps.length}`);
    if (!product.finalDeliverablePrompt) errors.push('Final deliverable prompt is required');

    // Validate each step
    product.steps.forEach((step, index) => {
      if (!step.title) errors.push(`Step ${index + 1}: Title is required`);
      if (!step.question) errors.push(`Step ${index + 1}: Question is required`);
      if (!step.stepInsightPrompt) errors.push(`Step ${index + 1}: Step insight prompt is required`);
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
