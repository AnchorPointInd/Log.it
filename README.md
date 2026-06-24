# JTAC Logbook

Offline-first JTAC logbook available as a static web app.

## Web App

Use the live app here:

[https://anchorpointind.github.io/Log.it/](https://anchorpointind.github.io/Log.it/)

The web app stores data locally in the browser with `localStorage`; use Settings -> Export Data / Backup before clearing browser data or changing devices.

## Local Development

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Operational Note

The web app stores its data locally in the current browser. Existing Excel-exported JTAC CAS Mission Log HTML files can be imported from Settings.

The bundled 6-in-6-month and 12-in-12-month requirements must be validated against the current controlling JTAC policy before operational use.
