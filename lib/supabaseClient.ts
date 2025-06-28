// supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jbmkxqrqcqyrdxwuvbdl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibWt4cXJxY3F5cmR4d3V2YmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDE0NDIsImV4cCI6MjA2NjUxNzQ0Mn0.WHIAdq2efV7NHERoRZZ9mnkbf42gUq1qjEhQbUgJ_3M";


export const supabase = createClient(supabaseUrl, supabaseKey);
