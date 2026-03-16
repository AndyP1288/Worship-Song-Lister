import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage({ mode = 'login' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const isLogin = mode === 'login';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form className="card w-full space-y-4" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold">{isLogin ? 'Login' : 'Create account'}</h1>
        <p className="text-sm text-slate-600">Manage your worship songs anywhere.</p>

        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn-primary w-full" type="submit">
          {isLogin ? 'Login' : 'Sign up'}
        </button>

        <p className="text-center text-sm text-slate-600">
          {isLogin ? 'No account yet?' : 'Already have an account?'}{' '}
          <Link to={isLogin ? '/signup' : '/login'} className="text-brand-700">
            {isLogin ? 'Create one' : 'Login'}
          </Link>
        </p>
      </form>
    </div>
  );
}
