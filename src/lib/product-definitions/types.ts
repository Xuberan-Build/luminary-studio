/**
 * Type definitions for product configurations
 */

export interface ProductStep {
  step: number;
  title: string;
  subtitle: string;
  question: string;
  prompt: string;
  allow_file_upload: boolean;
  file_upload_prompt?: string;
  required: boolean;
  max_follow_ups: number;
}

export interface ProductDefinition {
  product_slug: string;
  name: string;
  description: string;
  price: number;
  total_steps: number;
  estimated_duration: string;
  model?: string; // OpenAI model (default: gpt-4)

  // AI Prompts
  system_prompt: string;
  final_deliverable_prompt: string;

  // Steps configuration
  steps: ProductStep[];

  // CRM Configuration (for webhook)
  sheet_id: string;
  from_email: string;
  from_name: string;
}
