/**
 * Supabase utilities
 *
 * Usage:
 * - Client Components: import { createClient } from '@/lib/supabase/client'
 * - Server Components / Actions / Routes: import { createClient } from '@/lib/supabase/server'
 * - Admin (service role): import { createAdminClient } from '@/lib/supabase/admin'
 */
export { updateSession } from './proxy'
export { createAdminClient } from './admin'
