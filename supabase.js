// ==============================
// Supabase Client Helper
// ==============================
(function () {
  let client = null;

  function getConfig() {
    return window.APP_CONFIG || {};
  }

  function isConfigured() {
    const config = getConfig();
    const hasUrl = config.SUPABASE_URL && !config.SUPABASE_URL.includes("YOUR_PROJECT_ID");
    const hasKey = config.SUPABASE_ANON_KEY && !config.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY");

    return Boolean(hasUrl && hasKey);
  }

  function getClient() {
    if (!isConfigured()) {
      return null;
    }

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      throw new Error("Supabase JavaScript SDK belum termuat.");
    }

    if (!client) {
      const config = getConfig();
      client = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    }

    return client;
  }

  window.HoptechSupabase = {
    getClient,
    isConfigured,
    getConfig,
  };
})();
