## 🚀 Project Structure

Inside of project, you'll see the following folders and files:

```text
/
├── public/
│   ├── admin/
│   │   ├── config.yml         # Decap CMS configuration
│   │   └── index.html         # Decap CMS admin interface
│   └── favicon.svg
├── src/
│   ├── content/
│   │   ├── blog/              # Blog posts (Markdown)
│   │   ├── landing/           # Landing pages (Markdown)
│   │   └── pages/             # Static pages (Markdown)
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run dev:cms`         | Start Decap CMS Proxy Server                     | 

## 📝 Decap CMS Setup (Local Development)

This project uses **Decap CMS** (formerly Netlify CMS) for content management.

### Running Decap CMS Locally

1. **Start the development server:**
   ```bash
   npm run dev:cms
   ```

2. **Access Decap CMS:**
   - Navigate to `http://localhost:4321/admin/`
   - The local configuration (`public/admin/config.local.yml`) uses `backend: local`
   - No authentication required for local development

3. **Managing Content:**
   - Create and edit blog posts, landing pages, and static pages
   - Changes are saved directly to your local files in `src/content/`
   - All content is stored as Markdown files with frontmatter

### Content Collections

Decap CMS manages three content collections:

1. **Blog Posts** (`src/content/blog/`)
   - Articles and blog content
   - Fields: title, date, excerpt, featured image, tags

2. **Landing Pages** (`src/content/landing/`)
   - Marketing and campaign pages
   - Visual page builder with sections

3. **Static Pages** (`src/content/pages/`)
   - About, Contact, etc.
   - Simple Markdown content

### Configuration Files

- **Local Development:** `public/admin/config.local.yml` (uses `backend: local`)
- **Production:** `public/admin/config.yml` (uses GitHub backend - for future deployment)

## 👀 Want to learn more?

- **Astro:** [Documentation](https://docs.astro.build) | [Discord](https://astro.build/chat)
- **Decap CMS:** [Documentation](https://decapcms.org/docs/) | [GitHub](https://github.com/decaporg/decap-cms)
