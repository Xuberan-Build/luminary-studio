import { vi } from 'vitest';

export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    signInWithPassword: vi.fn(() => Promise.resolve({ data: { session: null, user: null }, error: null })),
  },
  from: vi.fn((table: string) => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      order: vi.fn(() => ({
        limit: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        throwOnError: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
  storage: {
    from: vi.fn((bucket: string) => ({
      upload: vi.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null })),
      download: vi.fn(() => Promise.resolve({ data: new Blob(), error: null })),
      createSignedUrl: vi.fn(() =>
        Promise.resolve({ data: { signedUrl: 'http://test.url' }, error: null })
      ),
      remove: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
  rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
};

export const supabase = mockSupabaseClient;
