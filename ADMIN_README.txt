# Devdaha E.B.S.S. School — Production CMS

This package upgrades **only the administration/CMS layer** of the existing school website. The existing public HTML pages, filenames, asset folders, PHOTOS structure, forms, integrations, navigation markup, animations and visual design are preserved.

## What changed

- Replaced browser-only admin credentials with server-side authentication.
- Added SQLite persistent database for CMS records.
- Added server-side session authentication with hashed passwords.
- Added persistent server-side media storage in `uploads/`.
- Added admin API with permission checks.
- Added dashboard, pages, visual editor, notices, media library, galleries, events, achievements, testimonials, magazine, ECA, year-in-review, content blocks, school information, navigation, marquees, search, recycle bin, and backup/restore controls.
- Existing `assets/` and `PHOTOS/` media are indexed into the server-side media library on first startup without renaming or moving them.
- Existing public pages continue to be served as the same files. `admin-system.js` is the CMS bridge that reads published backend content while retaining the original page as the fallback.

## Requirements

- Node.js 20+
- npm 10+
- A server capable of running Node continuously (VPS, managed Node host, Docker, etc.)

## 1. Install backend

```bash
npm install
```

## 2. Configure database and authentication

Copy `.env.example` to `.env` and change the values.

Important production settings:

- `SESSION_SECRET`: use a long random secret.
- `ADMIN_USERNAME`: initial administrator username.
- `ADMIN_PASSWORD`: initial administrator password. Change it before handing the site to the school.
- `DB_PATH`: persistent location for the SQLite database.
- `UPLOAD_DIR`: persistent location for uploaded media.

The database is created automatically at first startup.

## 3. Create/change the admin account

The first configured `ADMIN_USERNAME`/`ADMIN_PASSWORD` account is seeded automatically if it does not already exist.

You can also explicitly create/update an account:

```bash
npm run create-admin -- schooladmin 'A-strong-new-password'
```

Do not put real passwords into source-controlled files.

## 4. Start the CMS

Development:

```bash
npm run dev
```

Production:

```bash
NODE_ENV=production npm start
```

Open the site through the Node server, for example:

`http://localhost:3000/Devdaha.html`

Admin login:

`http://localhost:3000/admin-login.html`

## 5. Deployment

Deploy the entire folder to a Node-capable server. Keep these directories persistent:

- `data/` — SQLite database
- `uploads/` — administrator-uploaded media
- existing `assets/` and `PHOTOS/` — original website media

Put the application behind HTTPS in production. The session cookie is configured as secure when `NODE_ENV=production`.

A reverse proxy such as Nginx/Caddy can forward HTTPS traffic to the Node process.

## 6. Administrator workflow

1. Open `admin-login.html`.
2. Sign in with the server-created admin account.
3. Use the dashboard to see actual database counts and recent activity.
4. Use **Visual Editor** to open an existing public page and edit highlighted text, links, images or videos.
5. Use the dedicated management sections for structured content such as notices, galleries, events, achievements, testimonials, magazine, ECA and year-in-review.
6. Upload media in **Media Library**, then reuse its Media ID from structured content forms.
7. Use **Backup / Restore** to export or restore CMS data.
8. Use **Recycle Bin** to review deleted CMS records.

## 7. Backend/API behavior

Public content is available through:

- `GET /api/public/content?page=...`

Admin APIs require the authenticated server session. The browser is never given the administrator password or privileged database credentials.

## 8. Backup and restore

**Backup** downloads CMS records as `devdaha-cms-backup.json`.

The restore function replaces CMS-managed database records only. It does not overwrite public HTML, `assets/`, or `PHOTOS/` files.

For complete disaster recovery, also back up the server filesystem containing:

- `data/cms.sqlite`
- `uploads/`
- the website source/assets

## Important compatibility note

The original ZIP contains a browser/localStorage CMS from an earlier implementation. Browser localStorage/IndexedDB data is not embedded in the ZIP and therefore cannot be migrated automatically from the package alone. Existing static website content and media files are preserved; new CMS changes are stored server-side.

## Public-site safety rule

Do not rename or delete the existing HTML pages, asset files, PHOTOS directories, JavaScript files, or integrations merely to use the CMS. The CMS is intentionally layered over the existing frontend instead of replacing it with a new public framework.
