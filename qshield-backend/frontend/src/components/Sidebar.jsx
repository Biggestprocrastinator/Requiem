import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const navItems = [
  { path: '/', icon: 'dashboard', label: 'Dashboard' },
  { path: '/assets', icon: 'inventory_2', label: 'Assets' },
  { path: '/asset-inventory', icon: 'account_tree', label: 'Asset Inventory' },
  // { path: '/monitoring', icon: 'monitor_heart', label: 'Monitoring' },
  { path: '/security', icon: 'security', label: 'Security' },
  { path: '/vulnerability-scan', icon: 'bug_report', label: 'Vulnerability Scan' },
  { path: '/cbom', icon: 'inventory', label: 'CBOM' },
  { path: '/cyber-rating', icon: 'grade', label: 'Cyber Rating' },
  { path: '/analytics', icon: 'policy', label: 'Posture of PQC' },
  { path: '/reports', icon: 'description', label: 'Reports', fill: true },
];

export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex flex-col py-6 bg-primary docked left-0 h-full w-64 shadow-[4px_0_24px_rgba(181,10,46,0.15)] border-r border-primary-variant/30">
      <div className="px-6 mb-10">
        <h1 className="text-xl font-bold text-white tracking-tighter uppercase">Requiem</h1>
        {/* <p className="text-[10px] text-white/50 font-medium tracking-[0.2em] uppercase mt-1">Ethereal Fortress v1.0</p> */}
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "bg-secondary text-on-secondary rounded-xl mx-2 px-4 py-3 flex items-center gap-3 shadow-[0_4px_12px_rgba(250,188,10,0.3)] font-inter text-sm font-bold tracking-wide uppercase transition-all"
                : "text-white/80 hover:text-white mx-2 px-4 py-3 flex items-center gap-3 transition-all font-inter text-sm font-medium tracking-wide uppercase group hover:bg-white/5 rounded-xl"
            }
          >
            <span
              className="material-symbols-outlined"
              style={item.fill ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-4 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive
              ? "bg-secondary text-on-secondary rounded-xl mx-2 px-4 py-3 flex items-center gap-3 shadow-[0_4px_12px_rgba(250,188,10,0.3)] font-inter text-sm font-bold tracking-wide uppercase transition-all"
              : "text-white/80 hover:text-white mx-2 px-4 py-3 flex items-center gap-3 transition-all font-inter text-sm font-medium tracking-wide uppercase hover:bg-white/5 rounded-xl"
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full mt-2 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white py-3 px-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
