# JTAC Logbook

Offline-first JTAC logbook available as a static web app and as the original SwiftUI iPhone app.

## Web App

Open `index.html` in a browser, or host the repository directly with GitHub Pages. The web app stores data locally in the browser with `localStorage`; use Settings -> Export Data / Backup before clearing browser data or changing devices.

### GitHub Pages

1. Push this repository to GitHub.
2. In the repository settings, open Pages.
3. Select "Deploy from a branch".
4. Choose the `main` branch and `/ (root)` folder.
5. Save. GitHub will publish the static app from `index.html`.

For local browser testing:

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## iOS Build

1. Open `JTAC Logbook.xcodeproj`.
2. Build the `JTAC Logbook` scheme for iOS 18 or later.

For unsigned local verification:

```sh
xcodebuild -project "JTAC Logbook.xcodeproj" -scheme "JTAC Logbook" \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  CODE_SIGNING_ALLOWED=NO build
```

## Operational Note

The iOS app stores its SwiftData database locally on the iPhone. The web app stores its data locally in the current browser. Existing Excel-exported JTAC CAS Mission Log HTML files can be imported from Settings in either app.

The bundled 6-in-6-month and 12-in-12-month requirements must be validated against the current controlling JTAC policy before operational use.
