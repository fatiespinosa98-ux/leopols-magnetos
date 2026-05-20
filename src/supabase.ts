import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sjdhtvbuwswzwwelfvsm.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqZGh0dmJ1d3N3end3ZWxmdnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyOTkzMjIsImV4cCI6MjA5NDg3NTMyMn0.FwL6ZCcgg8GkhEvRprdHgXcaqFNDJ-1sSz4-_ut6COo";

export const supabase = createClient(supabaseUrl, supabaseKey);