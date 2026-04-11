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
          <div className="grid gap-6 md:grid-cols-[220px_1fr] items-start">
            <nav
              aria-label="Settings"
              className="flex flex-col gap-1 text-sm md:sticky md:top-20"
            >
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`px-3 py-2 rounded-md font-medium transition-colors ${
                      active
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
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
