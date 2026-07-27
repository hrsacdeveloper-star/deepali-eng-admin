import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as postgres from "https://deno.land/x/postgres@v0.14.2/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const databaseUrl = Deno.env.get("SUPABASE_DB_URL")!
    const pool = new postgres.Pool(databaseUrl, 1)
    const connection = await pool.connect()
    try {
      const res = await connection.queryObject(`
        SELECT table_name, column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
      `)
      return new Response(JSON.stringify(res.rows), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      })
    } finally {
      connection.release()
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })
  }
})
