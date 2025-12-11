import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://vycxsbliihujgeojkjgr.supabase.co';
const supabaseAnonKey = 'sb_publishable_HrnFvZUd_2yEGLA7sSrOxA_igL4gO0o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);