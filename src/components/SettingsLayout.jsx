import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from './Header';

const SettingsLayout = ({ title = 'Settings', children }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { href: '/Overview', label: 'Home' },
    { href: '/ManageStore', label: 'Business Details' },
    { href: '/PersonalDetails', label: 'Personal details' },
    { href: '/StoreSetting', label: 'Store settings' },
    { href: '/Bank', label: 'Payments' },
    { href: '/Link', label: 'Connect Social channels' },
    { href: '/Advance', label: 'Advance' },
  ];

  const isActive = (href) => {
    if (currentPath === href) return true;
    if (href !== '/' && currentPath.startsWith(href)) {
      const nextChar = currentPath[href.length];
      return !nextChar || nextChar === '/' || nextChar === '?';
    }
    return false;
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={title} />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col bg-muted/40 p-4 md:p-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <nav className="grid gap-2 text-sm text-muted-foreground">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`font-semibold transition-colors ${
                    isActive(item.href) ? 'text-purple-600' : 'hover:text-purple-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="grid gap-6">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsLayout;
