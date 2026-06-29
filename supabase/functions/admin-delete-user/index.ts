import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

function isUuid(value: unknown) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ""));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: "Function is not configured." }, 500);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } }
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return jsonResponse({ error: "Unauthorized" }, 401);

  const { data: adminRow, error: adminError } = await userClient
    .from("app_admins")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (adminError) return jsonResponse({ error: adminError.message }, 500);
  if (!adminRow) return jsonResponse({ error: "Admin access required" }, 403);

  const body = await req.json().catch(() => ({}));
  const userId = String(body.userId || "").trim();
  if (!isUuid(userId)) return jsonResponse({ error: "Use a valid user ID." }, 400);
  if (userId === userData.user.id) {
    return jsonResponse({ error: "You cannot delete your own account while signed in." }, 400);
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: existingUser, error: getUserError } = await serviceClient.auth.admin.getUserById(userId);
  if (getUserError) return jsonResponse({ error: getUserError.message }, 400);
  if (!existingUser.user) return jsonResponse({ error: "User not found." }, 404);

  const cleanupSteps = [
    serviceClient.from("controls").delete().eq("user_id", userId),
    serviceClient.from("app_formation_seniors").delete().eq("user_id", userId),
    serviceClient.from("app_admins").delete().eq("user_id", userId),
    serviceClient.from("profiles").delete().eq("user_id", userId)
  ];
  const cleanupResults = await Promise.all(cleanupSteps);
  const cleanupError = cleanupResults.find((result) => result.error)?.error;
  if (cleanupError) return jsonResponse({ error: cleanupError.message }, 500);

  const { error: deleteError } = await serviceClient.auth.admin.deleteUser(userId);
  if (deleteError) return jsonResponse({ error: deleteError.message }, 400);

  return jsonResponse({ userId });
});
