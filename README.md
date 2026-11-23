# WedTheme Weddings

A website and admin panel for a wedding and event photography, cinematography and drone studio.
The colour theme is inspired by WedMeGood: rose pink `#E72E77`, charcoal text and soft blush backgrounds.

- **Frontend and backend:** Next.js 16 (App Router, Route Handlers)
- **Database:** MongoDB (Mongoose)
- **Images and PDFs:** Cloudinary (direct signed uploads from the browser)

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `MONGODB_URI`: MongoDB Atlas or local connection string
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (Cloudinary dashboard, API Keys)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`: the first login creates this admin account
   - `AUTH_SECRET`: a long random string
3. Run `npm run dev` and open http://localhost:3000
4. Sign in at http://localhost:3000/admin and click **Load demo content** on the dashboard to fill the site with sample data.

## Website pages

| Page | Path |
| --- | --- |
| Home (hero search, event categories, services, portfolio, gear, packages, reviews, enquiry form) | `/` |
| Services and service detail | `/services`, `/services/[slug]` |
| Portfolio (filter by event) and album with lightbox and film | `/portfolio`, `/portfolio/[slug]` |
| Packages and brochure PDF downloads | `/packages` |
| About | `/about` |
| Contact / booking form | `/contact` |

## Admin panel (`/admin`)

- **Dashboard:** content counts, latest enquiries, demo content loader
- **Inquiries:** leads from the website forms, status (new, contacted, booked, closed), notes, call/WhatsApp/email shortcuts
- **Portfolio, Services, Packages, Gear & Drones, Testimonials, Brochures (PDF):** full add, edit and delete
- **Media library:** every file in the Cloudinary folder, marked *In use* or *Unused*, with single, bulk and "delete all unused" options
- **Site settings:** studio name, hero slideshow, about section, contact details, cities, social links and stats

## How Cloudinary deletion works

All uploads go to the `CLOUDINARY_FOLDER` folder (`wedtheme/images`, `wedtheme/documents`). Images are stored as `image` assets and PDFs as `raw` assets so they can always be downloaded.

- **Removing a file you just uploaded** (not saved yet) deletes it from Cloudinary immediately.
- **Removing a saved file** takes it off the form; when you click **Save**, the server deletes it from Cloudinary.
- **Replacing an image or PDF** deletes the old file from Cloudinary on save.
- **Deleting an item** (album, service, package, and so on) deletes all of its images and PDFs from Cloudinary.
- **Cancel** on a form deletes any new uploads that were not saved.
- The **Media library** catches anything left over (for example a browser closed mid-edit) and lets you delete unused files.

Only files inside this site's Cloudinary folder can be deleted through the API.

## Adding a new content type

Content types are defined once in `src/lib/resources.ts`. The Mongoose schema, admin list, admin form, validation and Cloudinary cleanup are all generated from that config.
