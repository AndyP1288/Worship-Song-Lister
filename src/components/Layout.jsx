import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-6 pt-4">
      <header className="mb-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-brand-700">
          Worship Song Library
        </Link>
        <button className="btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <nav className="mb-4 flex flex-wrap gap-2 rounded-xl bg-white p-2 shadow-sm">
        <NavLink to="/" className={({ isActive }) => `btn ${isActive ? 'bg-brand-500 text-white' : 'hover:bg-slate-100'}`}>
          Dashboard
        </NavLink>
        <NavLink to="/songs" className={({ isActive }) => `btn ${isActive ? 'bg-brand-500 text-white' : 'hover:bg-slate-100'}`}>
          Library
        </NavLink>
        <NavLink to="/add-song" className={({ isActive }) => `btn ${isActive ? 'bg-brand-500 text-white' : 'hover:bg-slate-100'}`}>
          Add Song
        </NavLink>
        <NavLink to="/setlists" className={({ isActive }) => `btn ${isActive ? 'bg-brand-500 text-white' : 'hover:bg-slate-100'}`}>
          Setlists
        </NavLink>
      <nav className="mb-4 flex gap-2 rounded-xl bg-white p-2 shadow-sm">
        <NavLink
          to="/"
          className={({ isActive }) => `btn ${isActive ? 'bg-brand-500 text-white' : 'hover:bg-slate-100'}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/songs"
          className={({ isActive }) => `btn ${isActive ? 'bg-brand-500 text-white' : 'hover:bg-slate-100'}`}
        >
          Library
        </NavLink>
        <NavLink
          to="/add-song"
          className={({ isActive }) => `btn ${isActive ? 'bg-brand-500 text-white' : 'hover:bg-slate-100'}`}
        >
          Add Song
        </NavLink>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
