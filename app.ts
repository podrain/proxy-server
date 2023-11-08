import { serve } from "https://deno.land/std@0.184.0/http/server.ts"
import { Hono } from "https://deno.land/x/hono@v3.9.0/mod.ts"
import { cors } from 'https://deno.land/x/hono@v3.9.0/middleware.ts'
import "https://deno.land/std@0.205.0/dotenv/load.ts";

const app = new Hono()

app.use(cors({
  origin: Deno.env.get('ALLOWED_DOMAINS')?.split(',') || [],
}))

app.get('/:proxy_url', async (c) => {
  const raw_url = c.req.param('proxy_url')
  console.log(raw_url)
  return await fetch(raw_url)
})

app.get('/', async c => {
  const url = c.req.query('url')
  if (!url) {
    return c.text('irrelevant')
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
  }

  const response = await fetch(url, {
    method: 'HEAD',
    headers
  })

  const content_length = response.headers.get('Content-Length')

  if (response.headers.get('Content-Type') == 'audio/mpeg') headers['Content-Length'] = content_length

  return new Response((await fetch(url, { headers })).body, {
    headers
  })
})

await serve(app.fetch)