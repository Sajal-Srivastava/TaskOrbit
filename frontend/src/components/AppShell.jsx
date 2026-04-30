import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/dashboard" className="brand">
          Team Task Manager
        </Link>
        <div className="user-meta">
          <span>{user?.name}</span>
          <span className="badge">{user?.role}</span>
          <button type="button" onClick={handleLogout} className="secondary-btn">
            Log out
          </button>
        </div>
      </header>
      <nav className="tabs">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
          Dashboard
        </NavLink>
      </nav>
      <main className="content">{children}</main>
    </div>
  );
}
