import {createClient} from  '@supabase/supabase-js'

const supabaseUrl = 'https://uzfjlndypjonnkugeaev.supabase.co'

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6ZmpsbmR5cGpvbm5rdWdlYWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyOTcxODAsImV4cCI6MjA2Mzg3MzE4MH0.UlYtqJEKF8C23bDFcNPXGXutBjVryalnm07onBRxxAY';

export const supabase = createClient(supabaseUrl, supabaseKey)
