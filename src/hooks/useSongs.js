import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase/config';

export const MUSICAL_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export function useSongs(userId) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setSongs([]);
      setLoading(false);
      return;
    }

    const loadSongs = async () => {
      setLoading(true);
      const songsQuery = query(collection(db, 'songs'), where('userId', '==', userId), orderBy('title'));
      const songSnapshot = await getDocs(songsQuery);

      const songList = await Promise.all(
        songSnapshot.docs.map(async (songDoc) => {
          const sheetQuery = query(collection(db, 'chordSheets'), where('songId', '==', songDoc.id));
          const sheetSnapshot = await getDocs(sheetQuery);
          return {
            id: songDoc.id,
            ...songDoc.data(),
            sheets: sheetSnapshot.docs.map((sheet) => ({ id: sheet.id, ...sheet.data() }))
          };
        })
      );

      setSongs(songList);
      localStorage.setItem(`offline-songs-${userId}`, JSON.stringify(songList));
      setLoading(false);
    };

    loadSongs().catch(() => {
      const cached = localStorage.getItem(`offline-songs-${userId}`);
      if (cached) setSongs(JSON.parse(cached));
      setLoading(false);
    });
  }, [userId]);

  const recentlyUsed = useMemo(
    () => [...songs].sort((a, b) => (b.lastOpenedAt?.seconds || 0) - (a.lastOpenedAt?.seconds || 0)).slice(0, 5),
    [songs]
  );

  const addSongWithSheet = async ({ title, artist, key, file }) => {
    const normalizedTitle = title.trim();
    const existing = songs.find((song) => song.title.toLowerCase() === normalizedTitle.toLowerCase());
    let songId = existing?.id;

    if (!songId) {
      const songRef = await addDoc(collection(db, 'songs'), {
        userId,
        title: normalizedTitle,
        artist: artist?.trim() || '',
        tags: [],
        createdAt: serverTimestamp(),
        keys: [key],
        recentOpens: 0
      });
      songId = songRef.id;
    } else {
      await updateDoc(doc(db, 'songs', songId), {
        keys: arrayUnion(key)
      });
    }

    const fileRef = ref(storage, `users/${userId}/songs/${songId}/${key}-${Date.now()}.pdf`);
    await uploadBytes(fileRef, file);
    const pdfUrl = await getDownloadURL(fileRef);

    await addDoc(collection(db, 'chordSheets'), {
      songId,
      key,
      pdfUrl,
      uploadedAt: serverTimestamp()
    });
  };

  const markSongOpened = async (songId) => {
    const songRef = doc(db, 'songs', songId);
    const snapshot = await getDoc(songRef);
    const currentOpens = snapshot.data()?.recentOpens || 0;
    await setDoc(
      songRef,
      { recentOpens: currentOpens + 1, lastOpenedAt: serverTimestamp() },
      { merge: true }
    );
  };

  return { songs, loading, recentlyUsed, addSongWithSheet, markSongOpened };
}
