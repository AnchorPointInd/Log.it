# JTAC Logbook

Offline-first JTAC logbook available as a static web app.

## Web App

Use the live app here:

[https://anchorpointind.github.io/Log.it/](https://anchorpointind.github.io/Log.it/)

The web app opens on a username/password sign-in screen and stores signed-in users' controls in Supabase. Public self-service signup is disabled; accounts are created by an admin. Settings -> Export Data / Backup remains available for a local JSON backup.

To create an account, add a Supabase Auth user with email `<username>@jtac.it` and a password, then add a matching row in `profiles` with that user's `user_id`, visible username in `email`, rank, name and service number. Users sign in with only the `<username>` part.

Admin visibility is controlled in Supabase through the `app_admins` table. Add the admin user's Supabase auth `user_id` to that table after the admin account has been created.

Aircraft type and aircraft category options are loaded from the Supabase `app_options` table after sign-in. Add rows with `group_key` set to `aircraft_types` or `aircraft_categories`, then set `value`, `label`, `sort_order`, and `active`. Set `active` to `false` to hide an option without deleting historical controls that already used it.

## Local Development

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Operational Note

Existing Excel-exported JTAC CAS Mission Log HTML files can be imported from Settings. Imported controls sync to the signed-in account.

The bundled 6-in-6-month and 12-in-12-month requirements must be validated against the current controlling JTAC policy before operational use.
