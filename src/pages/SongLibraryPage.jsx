import SongCard from '../components/SongCard';
import SongSearchBar from '../components/SongSearchBar';

export default function SongLibraryPage({ songs, search, onSearch }) {
  const filtered = [...songs]
    .filter((song) => song.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Song Library</h1>
      <SongSearchBar value={search} onChange={onSearch} />
      <div className="grid gap-3">
        {filtered.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
}
