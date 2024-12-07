// supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xmabufgfagnwpjglxwzq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtYWJ1ZmdmYWdud3BqZ2x4d3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5NTU5NTMsImV4cCI6MjA0ODUzMTk1M30.wKyp8ym5bWInT2Ox759eYO7TA5wSZrdcJNQ-EES15zU";

export const supabase = createClient(supabaseUrl, supabaseKey);
