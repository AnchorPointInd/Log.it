# JTAC Logbook

Offline-first JTAC logbook available as a static web app.

## Web App

Use the live app here:

[https://anchorpointind.github.io/Log.it/](https://anchorpointind.github.io/Log.it/)

The web app opens on an email/password account screen and stores signed-in users' controls in Supabase. New account requests collect rank, name, service number and an optional formation senior access request for admin review. Settings -> Export Data / Backup remains available for a local JSON backup.

Admin visibility is controlled in Supabase through the `app_admins` table. Add the admin user's Supabase auth `user_id` to that table after the admin account has been created.

## Local Development

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Operational Note

Existing Excel-exported JTAC CAS Mission Log HTML files can be imported from Settings. Imported controls sync to the signed-in account.

The bundled 6-in-6-month and 12-in-12-month requirements must be validated against the current controlling JTAC policy before operational use.
