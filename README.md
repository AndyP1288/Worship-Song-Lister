# Worship Song Library (Full PWA)

Worship Song Library is a production-ready Progressive Web App for worship leaders and musicians to manage personal song libraries, upload key-specific PDF chord sheets, and access songs across devices.

## Highlights

- Firebase Auth (email/password): signup, login, logout, session persistence.
- User-scoped song library in Firestore.
- Key-based chord sheets in Firebase Storage.
- Song detail page with key selector, PDF viewer, print/download/view actions.
- Dashboard with search + recently used songs.
- Song tags (e.g. Christmas, Easter, Communion).
- Setlist builder with song ordering controls.
- PWA install support (manifest + service worker).
- Offline fallback for cached app shell and local song list cache.

## Stack

- React + Vite
- Tailwind CSS
- React Router
- Firebase (Auth, Firestore, Storage)

## Folder Structure

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

```bash
npm install
```

### 2. Configure Firebase env vars

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

```bash
npm run dev
```

### 5. Production build

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
