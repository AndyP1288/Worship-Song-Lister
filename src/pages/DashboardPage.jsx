import { Link } from 'react-router-dom';
import SongCard from '../components/SongCard';
import SongSearchBar from '../components/SongSearchBar';

export default function DashboardPage({ songs, recentlyUsed, search, onSearch, loading }) {
  const normalized = search.toLowerCase();
  const filtered = songs.filter((song) => [song.title, song.artist, ...(song.tags || [])].join(' ').toLowerCase().includes(normalized));
  const filtered = songs.filter((song) => song.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <SongSearchBar value={search} onChange={onSearch} placeholder="Search your library..." />
      <Link to="/add-song" className="btn-primary inline-block">
        + Add Song
      </Link>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recently Used</h2>
        {recentlyUsed.length === 0 ? (
          <p className="card text-sm text-slate-600">No recently used songs yet.</p>
        ) : (
          <div className="grid gap-3">{recentlyUsed.map((song) => <SongCard key={song.id} song={song} />)}</div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">All Songs</h2>
        {loading ? (
          <p className="card">Loading songs...</p>
        ) : filtered.length === 0 ? (
          <p className="card text-sm text-slate-600">No songs found.</p>
        ) : (
          <div className="grid gap-3">{filtered.map((song) => <SongCard key={song.id} song={song} />)}</div>
        )}
      </section>
    </div>
  );
}
