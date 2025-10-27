// @ts-check
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert';
import { env } from 'node:process'

const { SUPABASE_URL, SUPABASE_KEY } = env

assert(SUPABASE_URL, "SUPABASE_URL env variable must be set!")
assert(SUPABASE_KEY, "SUPABASE_KEY env variable must be set!")

// Create a single supabase client for interacting with your database
export default createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
