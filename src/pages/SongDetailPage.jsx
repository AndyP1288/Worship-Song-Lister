import { useMemo, useState } from 'react';

export default function SongDetailPage({ song, onSongOpened, onAddKeyVersion }) {
  const [selectedKey, setSelectedKey] = useState(song?.keys?.[0] || 'C');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const selectedSheet = useMemo(() => song?.sheets?.find((sheet) => sheet.key === selectedKey), [song, selectedKey]);

  if (!song) return <p className="card">Song not found.</p>;

  const handleOpen = async () => {
    await onSongOpened(song.id);
  };

  const handleAddKeyVersion = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      await onAddKeyVersion({ songId: song.id, key: selectedKey, file });
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="card space-y-2">
        <h1 className="text-2xl font-bold">{song.title}</h1>
        {song.artist && <p className="text-slate-600">{song.artist}</p>}
        {(song.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {song.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-slate-500">Select key version:</p>
        <div className="flex flex-wrap gap-2">
          {song.keys?.map((keyOption) => (
            <button
              key={keyOption}
              type="button"
              className={`btn ${selectedKey === keyOption ? 'bg-brand-500 text-white' : 'btn-secondary'}`}
              onClick={() => setSelectedKey(keyOption)}
            >
              {keyOption}
            </button>
          ))}
        </div>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <label className="btn-secondary inline-block cursor-pointer">
          {uploading ? 'Uploading...' : `Upload/Replace PDF in ${selectedKey}`}
          <input className="hidden" type="file" accept="application/pdf" onChange={handleAddKeyVersion} />
        </label>
      </div>

      {selectedSheet ? (
        <div className="card space-y-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary" onClick={handleOpen}>
              Mark as recently used
            </button>
            <a href={selectedSheet.pdfUrl} target="_blank" rel="noreferrer" className="btn-secondary">
              View PDF
            </a>
            <a href={selectedSheet.pdfUrl} download className="btn-secondary">
              Download PDF
            </a>
            <button type="button" className="btn-secondary" onClick={() => window.print()}>
              Print
            </button>
          </div>
          <iframe title="Chord Sheet" src={selectedSheet.pdfUrl} className="h-[70vh] w-full rounded-xl border" />
        </div>
      ) : (
        <p className="card text-sm text-slate-600">No PDF uploaded for key {selectedKey} yet.</p>
      )}
    </div>
  );
}
