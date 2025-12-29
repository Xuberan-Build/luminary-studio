import { vi } from 'vitest';
import { mockSupabaseClient } from './client';

export const supabaseAdmin = mockSupabaseClient;
export const createServerSupabaseClient = vi.fn(() => Promise.resolve(mockSupabaseClient));
