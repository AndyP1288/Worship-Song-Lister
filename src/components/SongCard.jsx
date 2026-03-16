import { Link } from 'react-router-dom';

export default function SongCard({ song }) {
  return (
    <Link to={`/songs/${song.id}`} className="card block hover:ring-2 hover:ring-brand-500">
      <h3 className="text-base font-semibold">{song.title}</h3>
      {song.artist && <p className="text-sm text-slate-600">{song.artist}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {(song.keys || []).map((key) => (
          <span key={key} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
            {key}
          </span>
        ))}
      </div>
      {(song.tags || []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {song.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
