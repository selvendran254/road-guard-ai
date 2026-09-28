import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.login(username, password);
      login(res.token, res.username, res.role);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl w-full max-w-md border border-slate-700">
        <h1 className="text-2xl font-bold text-red-500 mb-2">RoadGuard AI</h1>
        <p className="text-slate-400 mb-6">Authority Dashboard Login</p>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <label className="block mb-4">
          <span className="text-sm text-slate-400">Username</span>
          <input
            className="mt-1 w-full px-3 py-2 bg-slate-700 rounded border border-slate-600"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label className="block mb-6">
          <span className="text-sm text-slate-400">Password</span>
          <input
            type="password"
            className="mt-1 w-full px-3 py-2 bg-slate-700 rounded border border-slate-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-red-600 hover:bg-red-700 rounded font-medium disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="text-xs text-slate-500 mt-4">Demo: admin / admin123</p>
      </form>
    </div>
  );
}
