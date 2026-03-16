# Worship Song Library (Final PWA)

Worship Song Library is a mobile-first Progressive Web App for worship leaders and musicians to manage a private song library with key-specific chord sheet PDFs.

## Implemented Features

### 1) Authentication
- Email/password signup
- Login/logout
- Persistent user sessions with Firebase Auth
- User document creation in Firestore

### 2) Dashboard
- Real-time search bar
- Add song button
- Song list
- Recently used songs (tracked when song pages are opened)

### 3) Song Library
- Alphabetical song listing
- Live filter by title, artist, and tags
- Click-through to song detail

### 4) Song Details
- Shows title, artist, tags, available keys
- Key selector buttons
- Embedded PDF viewer
- View PDF, download PDF, print
- Upload/replace key version PDFs

### 5) Add Song
- Song title
- Optional artist
- Key selector (C, D, E, F, G, A, B)
- PDF upload
- Optional tags
- If song already exists, new key version is added to the same song

### 6) Setlist Builder (optional feature)
- Create setlists
- Add songs
- Reorder songs (up/down)
- Print full setlist with chord sheets

### 7) Song Tagging (optional feature)
- Supports tags like Christmas, Easter, Communion, etc.

### 8) PWA
- `manifest.json`
- `service-worker.js`
- Installable metadata
- Offline navigation fallback page
- Local song cache fallback when Firestore is unavailable

## Tech Stack
- React + Vite
- Tailwind CSS
- React Router
- Firebase Auth
- Firestore
- Firebase Storage

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
  offline.html
```

## Setup

### 1) Install
```bash
npm install
```

### 2) Configure env variables
```bash
cp .env.example .env
```
Fill in Firebase values.

### 3) Firebase setup
1. Create Firebase project
2. Enable Email/Password Auth
3. Enable Firestore
4. Enable Storage
5. Add a Web App in Firebase settings and copy config to `.env`

### 4) Run app
```bash
npm run dev
```

### 5) Production build
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
- `recentOpens`
- `lastOpenedAt`

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
