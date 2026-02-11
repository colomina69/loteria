import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://huelwkbyujjoxfvmrdwr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZWx3a2J5dWpqb3hmdm1yZHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3OTUwNjcsImV4cCI6MjA4NjM3MTA2N30.snMSIZ84kdJyD15JQQcAjXrHeMI-RDhHJoBSgm3OyI8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
