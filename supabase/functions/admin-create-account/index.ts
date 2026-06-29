import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const USERNAME_AUTH_DOMAIN = "jtac.it";
const TEMPORARY_PASSWORD = "password123";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

function normalizeIdentifier(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function sendApprovalEmail(to: string, username: string) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const emailFrom = Deno.env.get("ACCOUNT_EMAIL_FROM") || "JTAC Logbook <onboarding@resend.dev>";
  if (!resendApiKey) throw new Error("Email service is not configured. Set RESEND_API_KEY in Supabase Edge Function secrets.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: emailFrom,
      to,
      subject: "JTAC Logbook account approved",
      text: [
        "Your JTAC Logbook account has been approved.",
        "",
        `Username: ${username}`,
        `Temporary password: ${TEMPORARY_PASSWORD}`,
        "",
        "You will be required to set a new password the first time you sign in."
      ].join("\n")
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email send failed: ${body || response.statusText}`);
  }
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
  const username = normalizeIdentifier(body.username);
  const contactEmail = normalizeEmail(body.contactEmail);
  const requestId = String(body.requestId || "").trim();
  if (!/^[a-z0-9][a-z0-9._-]{0,62}$/.test(username)) {
    return jsonResponse({ error: "Use a valid username." }, 400);
  }
  if (!isValidEmail(contactEmail)) return jsonResponse({ error: "Use a valid email address." }, 400);

  const email = `${username}@${USERNAME_AUTH_DOMAIN}`;
  const serviceClient = createClient(supabaseUrl, serviceRoleKey);
  if (requestId) {
    const { data: request, error: requestError } = await serviceClient
      .from("account_requests")
      .select("id,status,contact_email")
      .eq("id", requestId)
      .maybeSingle();
    if (requestError) return jsonResponse({ error: requestError.message }, 500);
    if (!request || request.status !== "pending") {
      return jsonResponse({ error: "Account request is not pending." }, 400);
    }
  }
  const { data: created, error: createError } = await serviceClient.auth.admin.createUser({
    email,
    password: TEMPORARY_PASSWORD,
    email_confirm: true,
    user_metadata: {
      contactEmail,
      name: String(body.name || ""),
      rank: String(body.rank || ""),
      serviceNumber: String(body.serviceNumber || ""),
      requirePasswordChange: true
    }
  });
  if (createError) return jsonResponse({ error: createError.message }, 400);

  const userId = created.user?.id;
  if (!userId) return jsonResponse({ error: "Account was not created." }, 500);

  const { error: profileError } = await serviceClient.from("profiles").upsert({
    user_id: userId,
    email: username,
    contact_email: contactEmail,
    name: String(body.name || ""),
    rank: String(body.rank || ""),
    service_number: String(body.serviceNumber || ""),
    unit: String(body.unit || ""),
    capbadge: String(body.capbadge || ""),
    qualification: String(body.qualification || ""),
    formation_senior_requested: Boolean(body.formationSeniorRequested),
    require_password_change: true,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });
  if (profileError) return jsonResponse({ error: profileError.message }, 500);

  try {
    await sendApprovalEmail(contactEmail, username);
  } catch (error) {
    await serviceClient.from("profiles").delete().eq("user_id", userId);
    await serviceClient.auth.admin.deleteUser(userId);
    return jsonResponse({ error: error instanceof Error ? error.message : "Unable to send approval email." }, 500);
  }

  if (requestId) {
    const { error: requestUpdateError } = await serviceClient
      .from("account_requests")
      .update({
        status: "approved",
        reviewed_by: userData.user.id,
        reviewed_at: new Date().toISOString(),
        approved_user_id: userId,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId);
    if (requestUpdateError) return jsonResponse({ error: requestUpdateError.message }, 500);
  }

  return jsonResponse({ userId, username });
});
