import { useMemo, useState } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useSongs } from './hooks/useSongs';
import AddSongPage from './pages/AddSongPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import SetlistsPage from './pages/SetlistsPage';
import SongDetailPage from './pages/SongDetailPage';
import SongLibraryPage from './pages/SongLibraryPage';

function AppRoutes() {
  const { user } = useAuth();
  const { songs, recentlyUsed, loading, addSongWithSheet, addKeyVersion, markSongOpened } = useSongs(user?.uid);
  const { songs, recentlyUsed, loading, addSongWithSheet, markSongOpened } = useSongs(user?.uid);
  const [search, setSearch] = useState('');

  const songMap = useMemo(() => Object.fromEntries(songs.map((song) => [song.id, song])), [songs]);

  const SongDetailRoute = () => {
    const { songId } = useParams();
    return <SongDetailPage song={songMap[songId]} onSongOpened={markSongOpened} onAddKeyVersion={addKeyVersion} />;
    return <SongDetailPage song={songMap[songId]} userId={user?.uid} onSongOpened={markSongOpened} />;
  };

  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<DashboardPage songs={songs} recentlyUsed={recentlyUsed} search={search} onSearch={setSearch} loading={loading} />}
        />
        <Route index element={<DashboardPage songs={songs} recentlyUsed={recentlyUsed} search={search} onSearch={setSearch} loading={loading} />} />
        <Route path="songs" element={<SongLibraryPage songs={songs} search={search} onSearch={setSearch} />} />
        <Route path="songs/:songId" element={<SongDetailRoute />} />
        <Route path="add-song" element={<AddSongPage onSubmit={addSongWithSheet} />} />
        <Route path="setlists" element={<SetlistsPage songs={songs} userId={user?.uid} />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
