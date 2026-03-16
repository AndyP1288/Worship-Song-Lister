# Worship Song Library (PWA)

Worship Song Library is a Progressive Web App for worship leaders and musicians to manage a personal song catalog with chord sheets by key.

## Features

- Email/password authentication with Firebase Auth.
- User-scoped song data (each user only sees their own songs).
- Add songs with key-specific PDF chord sheets.
- Real-time search and alphabetized library browsing.
- Song detail page with key selector, PDF viewer, download, and print.
- Recently used songs on dashboard.
- Optional setlist builder.
- PWA-ready (`manifest.json` + `service-worker.js`) with offline shell and local cached song list fallback.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + React Router
- **Backend:** Firebase (Auth, Firestore, Storage)
- **PWA:** Web manifest + custom service worker

## Project Structure

```text
src/
  components/
  firebase/
  hooks/
  pages/
  styles/
public/
  manifest.json
  service-worker.js
```

## Setup

### 1. Install
### 1) Install dependencies

```bash
npm install
```

### 2. Configure Firebase env vars
### 2) Create environment file

Copy `.env.example` to `.env` and fill your Firebase project values:

```bash
cp .env.example .env
```

Fill `.env` using your Firebase web app credentials.

### 3. Firebase Console

- Create project
- Enable Authentication (Email/Password)
- Enable Firestore
- Enable Storage

### 4. Run locally
### 3) Create Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a project.
3. Enable **Authentication** > Email/Password.
4. Create **Firestore Database** (production or test mode).
5. Enable **Storage**.
6. In Project Settings > General > Your Apps, add a web app and copy config values into `.env`.

### 4) Recommended Firestore model

Collections used by this app:

- `users`
  - `userId`, `email`, `createdAt`
- `songs`
  - `userId`, `title`, `artist`, `createdAt`, `keys[]`, `recentOpens`, `lastOpenedAt`
- `chordSheets`
  - `songId`, `key`, `pdfUrl`, `uploadedAt`
- `setlists`
  - `userId`, `name`, `songs[]`

### 5) Run app locally

```bash
npm run dev
```

### 5. Production build
### 6) Build for production

```bash
npm run build
```

## Data Model

### `users`
- `userId`
- `email`
- `createdAt`

### `songs`
- `userId`
- `title`
- `artist`
- `tags[]`
- `keys[]`
- `createdAt`
- `lastOpenedAt`
- `recentOpens`

### `chordSheets`
- `songId`
- `key`
- `pdfUrl`
- `uploadedAt`

### `setlists`
- `userId`
- `name`
- `songs[]`

## Suggested Firestore Rules
## Firebase security rules (starter example)

### Firestore rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /songs/{songId} {
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    match /chordSheets/{sheetId} {
      allow read, write: if request.auth != null;
    }

    match /setlists/{setlistId} {
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Suggested Storage Rules
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Storage rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/songs/{songId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## PWA Notes

- `public/manifest.json` enables installability.
- `public/service-worker.js` handles static caching and offline document fallback.
- Song list uses localStorage fallback if Firestore is unavailable.
## PWA behavior

- Installable (manifest + standalone display mode).
- Service worker caches app shell and static assets.
- Song list falls back to last local cache when network is unavailable.

## Notes

- PDF rendering is done with an `<iframe>` for simplicity.
- Song detail upload currently refreshes the page after adding/replacing a key PDF.
