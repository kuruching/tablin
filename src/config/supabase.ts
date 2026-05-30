import { createClient } from "@supabase/supabase-js";

//const SUPABASE_URL = "https://izqtbtxmrbvxmmrdwhvj.supabase.co/rest/v1/";
const SUPABASE_URL = "https://izqtbtxmrbvxmmrdwhvj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cXRidHhtcmJ2eG1tcmR3aHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTgyODcsImV4cCI6MjA5NDc3NDI4N30.3AljD0DJzq61USnw2Jh-wYLOcAVmL02FCbf1yW9kM7Y";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
