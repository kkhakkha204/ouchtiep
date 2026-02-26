import { createClient } from "@supabase/supabase-js"

const supabaseUrl  = process.env.PLASMO_PUBLIC_SUPABASE_URL
const supabaseAnon = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    `[supabase] Missing env vars:\n` +
    `  PLASMO_PUBLIC_SUPABASE_URL = ${supabaseUrl ?? "❌ undefined"}\n` +
    `  PLASMO_PUBLIC_SUPABASE_ANON_KEY = ${supabaseAnon ? "✅ loaded" : "❌ undefined"}`
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    storage: {
      getItem:    (key) => chrome.storage.local.get(key).then((r) => r[key] ?? null),
      setItem:    (key, value) => chrome.storage.local.set({ [key]: value }),
      removeItem: (key) => chrome.storage.local.remove(key)
    },
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false
  }
})