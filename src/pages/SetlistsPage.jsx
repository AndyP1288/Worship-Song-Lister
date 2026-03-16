import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, getDocs, query, updateDoc, where, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function SetlistsPage({ songs, userId }) {
  const [setlists, setSetlists] = useState([]);
  const [name, setName] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);

  useEffect(() => {
    const loadSetlists = async () => {
      const setlistQuery = query(collection(db, 'setlists'), where('userId', '==', userId));
      const snapshot = await getDocs(setlistQuery);
      setSetlists(snapshot.docs.map((docRef) => ({ id: docRef.id, ...docRef.data() })));
    };

    if (userId) loadSetlists();
  }, [userId]);

  const songMap = useMemo(() => Object.fromEntries(songs.map((song) => [song.id, song])), [songs]);

  const createSetlist = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    const setlistRef = await addDoc(collection(db, 'setlists'), {
      userId,
      name: name.trim(),
      songs: selectedSongs
    });
    setSetlists((prev) => [...prev, { id: setlistRef.id, userId, name: name.trim(), songs: selectedSongs }]);
    setName('');
    setSelectedSongs([]);
  };

  const moveSong = async (setlist, index, direction) => {
    const next = [...setlist.songs];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await updateDoc(doc(db, 'setlists', setlist.id), { songs: next });
    setSetlists((prev) => prev.map((item) => (item.id === setlist.id ? { ...item, songs: next } : item)));
  };

  const printSetlistWithChordSheets = (setlist) => {
    const rows = setlist.songs
      .map((songId) => songMap[songId])
      .filter(Boolean)
      .map((song) => {
        const sheet = song.sheets?.[0];
        return `
          <section style="page-break-after: always; margin-bottom: 24px;">
            <h2 style="margin: 0 0 8px; font-family: system-ui;">${song.title}</h2>
            <p style="margin: 0 0 12px; color: #475569; font-family: system-ui;">${song.artist || ''}</p>
            ${sheet ? `<iframe src="${sheet.pdfUrl}" style="width: 100%; height: 88vh; border: 1px solid #cbd5e1; border-radius: 8px;"></iframe>` : '<p>No chord sheet uploaded.</p>'}
          </section>
        `;
      })
      .join('');

    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>${setlist.name}</title></head>
        <body>${rows}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Setlist Builder</h1>
      <form className="card space-y-3" onSubmit={createSetlist}>
        <input className="input" placeholder="Setlist name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="max-h-44 space-y-2 overflow-auto rounded-xl border p-3">
          {songs.map((song) => (
            <label key={song.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedSongs.includes(song.id)}
                onChange={(e) =>
                  setSelectedSongs((prev) => (e.target.checked ? [...prev, song.id] : prev.filter((id) => id !== song.id)))
                }
              />
              {song.title}
            </label>
          ))}
        </div>
        <button className="btn-primary">Create Setlist</button>
      </form>

      <div className="space-y-3">
        {setlists.map((setlist) => (
          <div key={setlist.id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{setlist.name}</h2>
              <button type="button" className="btn-secondary" onClick={() => printSetlistWithChordSheets(setlist)}>
                Print with Chord Sheets
              </button>
            </div>
            {setlist.songs.map((songId, index) => (
              <div key={`${songId}-${index}`} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <span>{songMap[songId]?.title || 'Unknown song'}</span>
                <div className="flex gap-1">
                  <button type="button" className="btn-secondary" onClick={() => moveSong(setlist, index, -1)}>
                    ↑
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => moveSong(setlist, index, 1)}>
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
