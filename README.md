# JTAC Logbook

Offline-first JTAC logbook available as a static web app.

## Web App

Use the live app here:

[https://anchorpointind.github.io/Log.it/](https://anchorpointind.github.io/Log.it/)

The web app opens on a username/password sign-in screen and stores signed-in users' controls in Supabase. Users can request access from the signed-out screen; requests are stored for admin review and do not create Auth users until approved. Settings -> Export Data / Backup remains available for a local JSON backup.

To create or approve an account, sign in as an app admin and use the Admin page. Account creation is handled by the `admin-create-account` Supabase Edge Function, which creates the Supabase Auth user and matching `profiles` row. Users sign in with only the `<username>` part of `<username>@jtac.it`.

Admin visibility is controlled in Supabase through the `app_admins` table. The `admin@jtac.it` user is configured as an app admin. Admin users can approve, edit, or reject pending account requests, edit profile details, edit recent controls, delete controls, and create new accounts from the Admin page.

Aircraft type and aircraft category options are loaded from the Supabase `app_options` table after sign-in. Add rows with `group_key` set to `aircraft_types` or `aircraft_categories`, then set `value`, `label`, `sort_order`, and `active`. Set `active` to `false` to hide an option without deleting historical controls that already used it.

## Local Development

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Operational Note

Existing Excel-exported JTAC CAS Mission Log HTML files can be imported from Settings. Imported controls sync to the signed-in account.

The bundled 6-in-6-month and 12-in-12-month requirements must be validated against the current controlling JTAC policy before operational use.
