import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { ItemsScreen } from './components/ItemsScreen';
import { LogoScreen } from './components/LogoScreen';
import { MenuBuilderScreen } from './components/MenuBuilderScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { StudioScreen } from './components/StudioScreen';
export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-cream-hi border-b border-door/10 sticky top-0 z-10 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="font-display font-semibold text-xl tracking-tight lowercase hover:opacity-70 transition-opacity">
              grey door bakery<span className="text-terracotta">.</span>
            </NavLink>
          </div>
          <nav className="flex items-center gap-1 text-sm">
            <TabLink to="/">Menu</TabLink>
            <TabLink to="/studio">Studio</TabLink>
            <TabLink to="/logo">Logo</TabLink>
            <TabLink to="/items">Items</TabLink>
            <TabLink to="/settings">Settings</TabLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<MenuBuilderScreen />} />
          <Route path="/items" element={<ItemsScreen />} />
          <Route path="/studio" element={<StudioScreen />} />
          <Route path="/logo" element={<LogoScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function TabLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          'px-3 py-1.5 rounded-full transition-colors font-medium',
          isActive
            ? 'bg-door text-cream'
            : 'text-door-soft hover:bg-door/5',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  );
}
