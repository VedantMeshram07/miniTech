# Image Assets and Event Posters

This directory contains logo images and general visual assets for the TechFest website. Event posters are now hardcoded assets that live in a separate folder and are loaded by naming convention.

## Logos (this folder)

- `college-logo.png` — GCOEJ College logo (recommended: 150×150 px, PNG with transparent background)
- `event-logo.png` — TechCarvaan event logo (recommended: 150×150 px, PNG with transparent background)

Guidelines:

- Use transparent PNGs for logos when possible
- Keep file size small (< 200 KB) and optimize for web
- Maintain consistent visual style

## Event Posters (hardcoded assets)

- Location: `assets/posterss/`
- File name pattern: `poster-<eventId>.jpg`
- Aspect ratio: A4 portrait (1:1.414)
- Recommended size: 744×1052 px or higher (e.g., 1240×1754 px) at the same ratio
- Format: JPG only (the site currently looks for `.jpg` specifically)
- Suggested file size: < 500 KB (optimize images)
- Fallback: If the poster is missing, a placeholder SVG is shown automatically

Why A4? The event cards and details page display posters in an A4 portrait frame for consistent, print-like presentation.

### How to find your `<eventId>`

You can get the event ID in several ways—use whichever is most convenient:

1. From the website URL

- Open the event on the site (click “View Details”).
- Look at the address bar. The ID is the value of the `id` parameter, e.g.:
  - `.../events/details.html?id=hackathon-2025` → eventId is `hackathon-2025`.

2. From the Admin Dashboard

- Go to the admin dashboard and click “Edit” on the event.
- In the edit form, the “Event ID” field shows the exact ID used by the site.
  - If you don’t see the field, copy the ID from the details URL as above.

3. From Firebase (Firestore)

- In the Firebase Console, open Firestore → `events` collection.
- Use the same identifier the site uses (commonly the document ID or the `id` field). This will match what appears in the site URL.

4. Advanced (Developer Tools)

- On the landing page, right‑click an event card and Inspect.
- The card has a `data-event-id` attribute you can copy.

Note: Use the ID exactly as shown (case and characters must match). Avoid spaces; IDs are typically slug-like (e.g., `code-golf`, `ai-summit-2025`).

### Add or update a poster

1. Identify the event ID (see methods above).
2. Export your poster to JPG at A4 portrait ratio (744×1052 px or higher).
3. Save it as: `assets/posterss/poster-<eventId>.jpg` (replace `<eventId>`).
4. Hard‑refresh the page (Ctrl+F5) to bypass cache.

If the poster doesn’t appear:

- Check that the filename matches exactly (including `.jpg`).
- Confirm the file is in `assets/posterss/` (note the double “s” in `posterss`).
- Verify the event ID is correct (compare with the details page URL).
- Use the browser Network tab to look for a 404 on the poster path.
- Clear cache or try a private window.

## Manual logos upload (optional)

If not using the admin flow yet, you can still place `college-logo.png` and `event-logo.png` in this folder. The site will pick them up if referenced. For admin-managed logos, upload through the Admin panel and they’ll be stored in Firebase Storage.

## Fallback behavior

- Missing posters: a placeholder A4 SVG is displayed automatically.
- Missing logos: the site will gracefully fall back to text or empty states without breaking layout.
