const ACCOUNT_FIRST_PROFILE_KEY = "jtac-logbook-pending-profile-v1";
const ACCOUNT_FIRST_SUPABASE_URL = "https://gildqlfchrsmdovhvyuj.supabase.co";
const ACCOUNT_FIRST_SUPABASE_KEY = "sb_publishable_pPG2UaFree6CgIyFB5UAIA_bL6nLKqD";
const accountFirstClient = window.supabase.createClient(ACCOUNT_FIRST_SUPABASE_URL, ACCOUNT_FIRST_SUPABASE_KEY);

let accountFirstMode = "signIn";
let accountFirstStatus = "Sign in to continue.";

function accountFirstEscape(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

function saveAccountFirstPendingProfile(email, profile) {
  try {
    const pending = JSON.parse(localStorage.getItem(ACCOUNT_FIRST_PROFILE_KEY)) || {};
    pending[email.toLowerCase()] = profile;
    localStorage.setItem(ACCOUNT_FIRST_PROFILE_KEY, JSON.stringify(pending));
  } catch {
    // Best-effort recovery after email confirmation.
  }
}

function accountFirstSignupFields() {
  if (accountFirstMode !== "signUp") return "";
  return `
    <div class="signup-fields">
      <div class="form-grid">
        <label>Rank<input id="accountFirstRank" autocomplete="honorific-prefix" required></label>
        <label>Name<input id="accountFirstName" autocomplete="name" required></label>
        <label>Service Number<input id="accountFirstServiceNumber" autocomplete="off" required></label>
      </div>
      <label class="check-row"><input id="accountFirstFormationSenior" type="checkbox"> Request formation senior access</label>
    </div>`;
}

function renderAccountFirst() {
  document.body.classList.add("signed-out");
  document.body.classList.remove("is-admin");
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  const dashboard = document.querySelector("#dashboardView");
  if (!dashboard) return;
  dashboard.classList.add("active");
  dashboard.innerHTML = `
    <div class="auth-screen">
      <section class="auth-card">
        <div>
          <p class="eyebrow">JTAC Logbook</p>
          <h1>Account Access</h1>
        </div>
        <div class="auth-mode-tabs">
          <button class="button ${accountFirstMode === "signIn" ? "active" : "secondary"}" type="button" data-account-mode="signIn">Sign In</button>
          <button class="button ${accountFirstMode === "signUp" ? "active" : "secondary"}" type="button" data-account-mode="signUp">Create Account</button>
        </div>
        <form id="accountFirstForm" class="stack">
          <div class="form-grid">
            <label>Username<input id="accountFirstEmail" type="text" autocomplete="username" required></label>
            <label>Password<input id="accountFirstPassword" type="password" autocomplete="${accountFirstMode === "signUp" ? "new-password" : "current-password"}" minlength="6" required></label>
          </div>
          ${accountFirstSignupFields()}
          <button class="button primary" type="submit">${accountFirstMode === "signUp" ? "Create Account" : "Sign In"}</button>
        </form>
        <p class="entry-meta">${accountFirstEscape(accountFirstStatus)}</p>
      </section>
    </div>`;
}

async function syncAccountFirstProfile(user, profile) {
  const { error } = await accountFirstClient.from("profiles").upsert({
    user_id: user.id,
    email: user.email || profile.email || "",
    rank: profile.rank || "",
    name: profile.name || "",
    service_number: profile.serviceNumber || "",
    formation_senior_requested: Boolean(profile.formationSeniorRequested),
    formation_senior_requested_at: profile.formationSeniorRequested ? (profile.formationSeniorRequestedAt || new Date().toISOString()) : null,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });
  if (error) throw error;
}

document.addEventListener("click", (event) => {
  const modeButton = event.target.closest("[data-account-mode]");
  if (!modeButton) return;
  accountFirstMode = modeButton.dataset.accountMode;
  renderAccountFirst();
});

document.addEventListener("submit", async (event) => {
  if (event.target.id !== "accountFirstForm") return;
  event.preventDefault();
  const email = document.querySelector("#accountFirstEmail").value.trim();
  const password = document.querySelector("#accountFirstPassword").value;
  const isSignUp = accountFirstMode === "signUp";
  let profile = null;
  if (isSignUp) {
    const formationSeniorRequested = document.querySelector("#accountFirstFormationSenior").checked;
    profile = {
      email,
      rank: document.querySelector("#accountFirstRank").value.trim(),
      name: document.querySelector("#accountFirstName").value.trim(),
      serviceNumber: document.querySelector("#accountFirstServiceNumber").value.trim(),
      formationSeniorRequested,
      formationSeniorRequestedAt: formationSeniorRequested ? new Date().toISOString() : ""
    };
    if (!profile.rank || !profile.name || !profile.serviceNumber) {
      accountFirstStatus = "Rank, name and service number are required.";
      renderAccountFirst();
      return;
    }
    saveAccountFirstPendingProfile(email, profile);
  }
  accountFirstStatus = isSignUp ? "Creating account..." : "Signing in...";
  renderAccountFirst();
  const result = isSignUp
    ? await accountFirstClient.auth.signUp({ email, password, options: { data: profile } })
    : await accountFirstClient.auth.signInWithPassword({ email, password });
  if (result.error) {
    accountFirstStatus = result.error.message;
    renderAccountFirst();
    return;
  }
  if (isSignUp && result.data.session && result.data.user) await syncAccountFirstProfile(result.data.user, profile);
  if (isSignUp && !result.data.session) {
    accountFirstStatus = "Check your email to confirm the account, then sign in.";
    renderAccountFirst();
    return;
  }
  window.location.reload();
});

accountFirstClient.auth.getSession().then(({ data }) => {
  if (!data.session) renderAccountFirst();
});
