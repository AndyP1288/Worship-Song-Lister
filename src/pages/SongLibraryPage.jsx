import SongCard from '../components/SongCard';
import SongSearchBar from '../components/SongSearchBar';

export default function SongLibraryPage({ songs, search, onSearch }) {
  const normalized = search.toLowerCase();
  const filtered = [...songs]
    .filter((song) => {
      const haystack = [song.title, song.artist, ...(song.tags || [])].join(' ').toLowerCase();
      return haystack.includes(normalized);
    })
  const filtered = [...songs]
    .filter((song) => song.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Song Library</h1>
      <SongSearchBar value={search} onChange={onSearch} placeholder="Search by title, artist, or tag" />
      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <p className="card text-sm text-slate-600">No songs match your search.</p>
        ) : (
          filtered.map((song) => <SongCard key={song.id} song={song} />)
        )}
      <SongSearchBar value={search} onChange={onSearch} />
      <div className="grid gap-3">
        {filtered.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
}
