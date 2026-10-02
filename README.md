# HUMBLE STUDIO — Vercel Production Build

This version keeps the original HUMBLE STUDIO visual design from the supplied `HumbleStudio-main(3).zip` and adds the requested production features without replacing the original color system or layout.

## Included

- Original visual design and existing cinematic tool transition
- Dynamic tool cards through Supabase
- Separate `/admin` dashboard
- Supabase email/password authentication
- Image-only tool uploader: click or drag/drop
- PNG / JPG / WEBP, max 5 MB
- Tool headline
- Description
- Works with: common creative/editing software + Windows/macOS, with admin-added platform options
- Redirect URL
- Publish/hide + display order
- SEO meta tags + Open Graph
- Organization + WebSite JSON-LD
- robots.txt
- sitemap.xml
- llms.txt + LLM.txt
- Privacy Policy
- Terms & Conditions
- Cookie notice
- Custom 404
- Last updated date
- Vercel security headers
- Responsive/accessibility improvements
- Supplied 3D contact PNGs rendered monochrome
- UTM-ready tool redirects can be stored directly as full URLs

## Deploy to Vercel

1. Push the contents of `HumbleStudio-main` to your GitHub repository.
2. Import the repository into Vercel.
3. No framework build command is required.
4. Use the project root as the output/root directory.
5. Vercel automatically serves `index.html`, `404.html`, `robots.txt`, and `sitemap.xml`.

The site metadata currently uses:
`https://humblestudio.vercel.app/`

If Vercel assigns a different final production URL, update the absolute URL in:
- `index.html`
- `privacy.html`
- `terms.html`
- `robots.txt`
- `sitemap.xml`
- `llms.txt`
- `LLM.txt`

## Supabase setup

1. Create/use your Supabase project.
2. Open SQL Editor.
3. Run `supabase-schema.sql`.
4. The SQL seeds the initial platform checkbox list.
5. In Supabase Authentication, create the administrator email/password account.
6. Copy that Auth user's UUID.
7. Add the UUID to `public.admin_users`.
8. Seed the two original HUMBLE tools using the commented seed section at the bottom of `supabase-schema.sql`, replacing `YOUR_PUBLIC_SITE` with the final HTTPS domain.
9. Put only the Supabase project URL and public anon/publishable key in `supabase-config.js`.

Example:

```js
window.HUMBLE_SUPABASE = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY"
};
```

NEVER put the Supabase service-role/secret key in this file or anywhere in the browser.

## Admin

After deployment:
`https://YOUR-DOMAIN/admin`

Sign in with the Supabase Auth account.

The admin page can:
- add a tool
- upload an image
- select supported platforms
- add new platform/software options for future tools
- set redirect URL
- set display order
- publish/hide
- edit
- delete

## Tool animation

The original `page-transition` animation is preserved. Dynamic tool cards receive the same click handler. The transition title is populated from the clicked card's actual tool name before redirecting.

## Contact artwork

The supplied Gmail, Discord, YouTube, Instagram, Spotify, and GitHub 3D PNGs are stored in `assets/social/` and displayed with a monochrome treatment. On desktop the section is icon-first: the logo is shown normally and the contact label/details expand on hover/focus. On mobile the details remain visible for touch usability.

## Security

The frontend only contains the public Supabase client key. Database and storage access is protected with Supabase Row Level Security. The admin area is not indexed. Vercel security headers are defined in `vercel.json`.

## Tools teaser

The `Something More...` / `MORE SOON.` card is an intentional permanent teaser. New published database tools render before it; the teaser remains at the end.
