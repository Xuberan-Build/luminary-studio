/**
 * Input validation and sanitization to prevent prompt injection
 */

// Patterns that might indicate prompt injection attempts
const SUSPICIOUS_PATTERNS = [
  /ignore\s+(previous|all)\s+(instructions|prompts)/i,
  /system\s*:\s*/i,
  /you\s+are\s+now/i,
  /forget\s+(everything|all|previous)/i,
  /disregard\s+(previous|all)/i,
  /new\s+instructions/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<\|.*?\|>/i,
];

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  warnings: string[];
}

/**
 * Validate and sanitize user input for AI prompts
 */
export function validateUserInput(
  input: string,
  options: {
    maxLength?: number;
    allowSystemKeywords?: boolean;
  } = {}
): ValidationResult {
  const { maxLength = 5000, allowSystemKeywords = false } = options;
  const warnings: string[] = [];
  let sanitized = input;

  // Check length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
    warnings.push(`Input truncated to ${maxLength} characters`);
  }

  // Check for suspicious patterns
  if (!allowSystemKeywords) {
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(sanitized)) {
        warnings.push('Suspicious pattern detected and removed');
        sanitized = sanitized.replace(pattern, '[REDACTED]');
      }
    }
  }

  // Remove control characters and excessive whitespace
  sanitized = sanitized
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return {
    isValid: warnings.length === 0,
    sanitized,
    warnings,
  };
}

/**
 * Validate session ownership to prevent unauthorized access
 */
export async function validateSessionOwnership(
  sessionId: string,
  userId: string,
  supabase: any
): Promise<boolean> {
  const { data, error } = await supabase
    .from('product_sessions')
    .select('user_id')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle();

  return !error && !!data;
}
