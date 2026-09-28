import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navAll = [
  { to: '/', label: 'Dashboard', adminOnly: false },
  { to: '/map', label: 'Live Map', adminOnly: false },
  { to: '/chat', label: 'Emergency Chat', adminOnly: false },
  { to: '/incidents', label: 'Incidents', adminOnly: false },
  { to: '/hazards', label: 'Hazards', adminOnly: false },
  { to: '/ambulances', label: 'Ambulances', adminOnly: false },
  { to: '/hospitals', label: 'Hospitals', adminOnly: true },
  { to: '/blood', label: 'Blood Requests', adminOnly: true },
  { to: '/black-spots', label: 'Black Spots', adminOnly: false },
  { to: '/sms-logs', label: 'SMS Logs', adminOnly: true },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { username, role, logout } = useAuth();
  const nav = navAll.filter((item) => !item.adminOnly || role === 'admin');
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-slate-800 border-r border-slate-700 p-4 flex flex-col">
        <h1 className="text-xl font-bold text-red-500 mb-1">RoadGuard AI</h1>
        <p className="text-xs text-slate-400 mb-6">Authority Dashboard</p>
        <nav className="flex-1 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`block px-3 py-2 rounded text-sm ${
                location.pathname === item.to ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-700 pt-4">
          <p className="text-sm text-slate-400">{username} ({role})</p>
          <button onClick={logout} className="text-sm text-red-400 hover:text-red-300 mt-1">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
