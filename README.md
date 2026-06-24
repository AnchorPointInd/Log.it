# JTAC Logbook

Offline-first JTAC logbook available as a static web app.

## Web App

Use the live app here:

[https://anchorpointind.github.io/Log.it/](https://anchorpointind.github.io/Log.it/)

The web app supports email/password accounts and stores signed-in users' controls in Supabase. Settings -> Export Data / Backup remains available for a local JSON backup.

## Local Development

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Operational Note

Existing Excel-exported JTAC CAS Mission Log HTML files can be imported from Settings. Imported controls sync to the signed-in account.

The bundled 6-in-6-month and 12-in-12-month requirements must be validated against the current controlling JTAC policy before operational use.
