# 3D Sign Builder Online

A browser tool for previewing what images, videos and text will look like on a sign before it's built. Pick a sign type and size, then drop artwork onto the lit cabinet faces or the LED message board. View it as a scale 2D front elevation or an orbitable 3D model.

It runs entirely in the browser, so uploaded artwork never leaves the visitor's computer. There is no server and no build step for users.

## Features

- **Sign presets:** a pylon (top cabinet + LED, from LED Sign Builder v02) plus the Q4 promo signs:
  - CC-A: 4' x 8' changeable copy
  - CC-B: 5' x 8' changeable copy
  - CC-C: 5' x 8' peak roof changeable copy
  - LED-A: 24" x 85" cabinet + 10mm 72 x 216 LED
  - LED-B: 24" x 75" cabinet + 10mm 72 x 192 LED
- **Demo trailer presets:** LED screens on a mobile trailer (chassis, tandem wheels, tongue, jacks, mast):
  - Vantage Demo Trailer 3: 480 x 240 px (10mm pitch assumed: 189" x 94.5")
  - Media Display Demo Trailer: 12mm, 400 x 240 px (189" x 113.4")
- **Fully adjustable:** top and bottom cabinets (flat or pan face, peak roof, retainer width, depth), changeable copy (lines, letter and panel size, letter text), reveals, LED pitch and pixel matrix, and the base: pole and cover, or a mobile trailer (length, width, screen height).
- **Content on every face:** an image, a video (MP4/WebM) or scrolling text, with fill / fit / stretch modes. Upload a file, drag it straight onto a face, or paste a link. In 3D, each face's back side can match the front, show different artwork, or be blank.
- **Paste a link:** direct links to image or video files (`.jpg`, `.png`, `.gif`, `.mp4`, `.webm` …) load onto any face. YouTube links (watch, youtu.be, Shorts, live) play as an overlay on the face in the 2D view.
- **True LED resolution:** LED content is resampled to the board's real pixel matrix. **LED close-up** shows individual diodes. Each panel shows the exact size to design content at (e.g. 216 x 72 px).
- **2D view:** scale front elevation with dimension lines, a 6 ft (72") silhouette for scale, day/night, and placement on an uploaded site photo.
- **3D view:** orbit, zoom and pan; real cabinet depths, retainers, shadows; front / 3/4 / back views; day/night lighting.
- **Snapshot:** export the current 2D or 3D view as a PNG.
- **Share (Apps Script version):** saves the sign and any uploaded images or videos to a Google Drive folder and gives a link that reopens it exactly, in 2D or 3D. Files up to 100 MB per share.

## Repository layout

| Path | What it is |
| --- | --- |
| `src/sign_builder.html` | The single source file. Edit this one. |
| `tools/build.py` | Regenerates the two deployable pages from the source. |
| `index.html` | Standalone page: GitHub Pages, any web host, or open it locally. |
| `apps-script/Index.html` | The same app for Google Apps Script HtmlService. |
| `apps-script/Code.gs` | Apps Script entry point (`doGet`). |
| `apps-script/SETUP.txt` | Step-by-step Apps Script deployment. |

After editing `src/sign_builder.html`, run:

```bash
python3 tools/build.py
```

and commit the source together with both generated files.

## Running it

**Locally:** open `index.html` in Chrome, Edge, Firefox or Safari.

**GitHub Pages:**
1. In this repo go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
3. The app appears at `https://the-sign-store.github.io/3D-Sign-Builder-Online/` within a few minutes. GitHub Pages on a private repo requires a paid GitHub plan.

**Google Apps Script:** see `apps-script/SETUP.txt`. In short, paste `Code.gs` and `Index.html` into a new Apps Script project and deploy as a web app. This version adds **Share**, which stores shared signs in a `3D Sign Builder Shares` folder in the deploying account's Drive.

## Dependencies

All loaded from CDNs at runtime; there is nothing to install:

- [three.js](https://threejs.org/) 0.147.0 (jsDelivr) for the 3D view. If it can't load, the 2D view still works and the 3D button says why.
- Google Fonts: Barlow Condensed, IBM Plex Sans, IBM Plex Mono (system fonts are used as a fallback).

## Notes and limits

- The sample logo ("Riverbend Coffee") and LED promo are placeholders, clearly marked as samples in the app.
- iPhone `.MOV` video may only play in Safari; MP4 (H.264) works everywhere.
- Site-photo placement is 2D only; the 3D view uses a plain day or night scene.
- **Linked files:** a file from a site that sends CORS headers (`Access-Control-Allow-Origin`) works everywhere. Most CDNs, S3 and Cloudflare can be set to send them. A site without them still shows the file in 2D, but it can't appear in 3D or in a snapshot; the app says so and suggests uploading the file instead.
- **YouTube:** shown with YouTube's own embedded player on top of the face. It has no LED pixel effect, isn't in 3D (the face shows a placeholder) and isn't captured by Snapshot. YouTube doesn't allow other sites to read video frames, so this is the most that's possible.
- Links don't work in the copy published inside Claude, which blocks outside content. Use GitHub Pages or Apps Script.
- Renders are a visual guide, not a color proof: lit polycarbonate and LEDs look different in person.
