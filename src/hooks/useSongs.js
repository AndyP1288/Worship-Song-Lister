import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase/config';

export const MUSICAL_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const OFFLINE_SONGS_PREFIX = 'offline-songs-';

export function useSongs(userId) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setSongs([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    const songsQuery = query(collection(db, 'songs'), where('userId', '==', userId), orderBy('title'));

    const unsubscribe = onSnapshot(
      songsQuery,
      async (songSnapshot) => {
        const songsWithSheets = await Promise.all(
          songSnapshot.docs.map(async (songDoc) => {
            const sheetsQuery = query(
              collection(db, 'chordSheets'),
              where('songId', '==', songDoc.id),
              orderBy('uploadedAt', 'desc')
            );
            const sheetsSnapshot = await getDocs(sheetsQuery);

            const dedupedByKey = new Map();
            for (const sheetDoc of sheetsSnapshot.docs) {
              const data = { id: sheetDoc.id, ...sheetDoc.data() };
              if (!dedupedByKey.has(data.key)) dedupedByKey.set(data.key, data);
            }

            return {
              id: songDoc.id,
              ...songDoc.data(),
              sheets: [...dedupedByKey.values()].sort((a, b) => a.key.localeCompare(b.key))
            };
          })
        );

        setSongs(songsWithSheets);
        localStorage.setItem(`${OFFLINE_SONGS_PREFIX}${userId}`, JSON.stringify(songsWithSheets));
        setLoading(false);
      },
      () => {
        const cached = localStorage.getItem(`${OFFLINE_SONGS_PREFIX}${userId}`);
        setSongs(cached ? JSON.parse(cached) : []);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const recentlyUsed = useMemo(
    () => [...songs].sort((a, b) => (b.lastOpenedAt?.seconds || 0) - (a.lastOpenedAt?.seconds || 0)).slice(0, 6),
    [songs]
  );

  const addSongWithSheet = async ({ title, artist, key, file, tags = [] }) => {
    const normalizedTitle = title.trim();
    const existing = songs.find((song) => song.title.toLowerCase() === normalizedTitle.toLowerCase());
    let songId = existing?.id;

    if (!songId) {
      const songRef = await addDoc(collection(db, 'songs'), {
        userId,
        title: normalizedTitle,
        artist: artist?.trim() || '',
        tags,
        createdAt: serverTimestamp(),
        keys: [key],
        recentOpens: 0
      });
      songId = songRef.id;
    } else {
      const updates = {
        keys: arrayUnion(key)
      };
      if (!existing.artist && artist?.trim()) updates.artist = artist.trim();
      if (tags.length > 0) updates.tags = arrayUnion(...tags);
      await updateDoc(doc(db, 'songs', songId), updates);
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

  const addKeyVersion = async ({ songId, key, file }) => {
    const fileRef = ref(storage, `users/${userId}/songs/${songId}/${key}-${Date.now()}.pdf`);
    await uploadBytes(fileRef, file);
    const pdfUrl = await getDownloadURL(fileRef);

    await addDoc(collection(db, 'chordSheets'), {
      songId,
      key,
      pdfUrl,
      uploadedAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'songs', songId), { keys: arrayUnion(key) });
  };

  const markSongOpened = async (songId) => {
    await updateDoc(doc(db, 'songs', songId), {
      recentOpens: increment(1),
      lastOpenedAt: serverTimestamp()
    });
  };

  return { songs, loading, recentlyUsed, addSongWithSheet, addKeyVersion, markSongOpened };
}
