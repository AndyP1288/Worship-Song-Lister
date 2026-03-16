import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MUSICAL_KEYS } from '../hooks/useSongs';

export default function AddSongPage({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('C');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return setError('Please upload a PDF chord sheet.');

    setSaving(true);
    setError('');
    try {
      const tagList = tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      await onSubmit({ title, artist, key, file, tags: tagList });
      await onSubmit({ title, artist, key, file });
      navigate('/songs');
    } catch (err) {
      setError(err.message || 'Unable to save song.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card mx-auto max-w-lg space-y-4" onSubmit={handleSubmit}>
      <h1 className="text-xl font-bold">Add Song</h1>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <div>
        <label className="mb-1 block text-sm">Song Title</label>
        <input required className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm">Artist (optional)</label>
        <input className="input" value={artist} onChange={(e) => setArtist(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm">Tags (optional, comma-separated)</label>
        <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Christmas, Easter, Communion" />
      </div>

      <div>
        <label className="mb-1 block text-sm">Key</label>
        <select className="input" value={key} onChange={(e) => setKey(e.target.value)}>
          {MUSICAL_KEYS.map((musicalKey) => (
            <option key={musicalKey} value={musicalKey}>
              {musicalKey}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm">Chord Sheet (PDF)</label>
        <input required type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <input
          required
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <button className="btn-primary" type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save Song'}
      </button>
    </form>
  );
}
