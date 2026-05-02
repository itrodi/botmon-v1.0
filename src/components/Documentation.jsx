import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Layers,
  Route as RouteIcon,
  Network,
  Lock,
  Database,
  Zap,
  AlertTriangle,
  GitBranch,
  Plug,
  Settings as SettingsIcon,
  ChevronRight,
  Search,
} from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Input } from '@/components/ui/input';

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'architecture', label: 'Architecture', icon: Layers },
  { id: 'routes', label: 'Pages & Routes', icon: RouteIcon },
  { id: 'api', label: 'API Endpoints', icon: Network },
  { id: 'auth', label: 'Authentication', icon: Lock },
  { id: 'storage', label: 'State & Storage', icon: Database },
  { id: 'realtime', label: 'Real-time & Sockets', icon: Zap },
  { id: 'integrations', label: 'External Integrations', icon: Plug },
  { id: 'patterns', label: 'Common Patterns', icon: GitBranch },
  { id: 'impact', label: 'Change Impact Map', icon: AlertTriangle },
  { id: 'config', label: 'Build & Config', icon: SettingsIcon },
];

const Section = ({ id, title, icon: Icon, children }) => (
  <section id={id} className="scroll-mt-20 mb-12">
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
      {Icon && <Icon className="w-5 h-5 text-purple-600" />}
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
    <div className="prose prose-sm max-w-none text-gray-700 space-y-4">{children}</div>
  </section>
);

const Sub = ({ children }) => (
  <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{children}</h3>
);

const Code = ({ children }) => (
  <code className="px-1.5 py-0.5 bg-gray-100 text-purple-700 rounded text-xs font-mono">
    {children}
  </code>
);

const Pill = ({ color = 'gray', children }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-800',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
};

const Table = ({ headers, rows }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200">
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((h) => (
            <th
              key={h}
              className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50">
            {row.map((cell, j) => (
              <td key={j} className="py-2 px-3 align-top text-gray-700">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Note = ({ type = 'info', children }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warn: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    danger: 'bg-red-50 border-red-200 text-red-900',
    tip: 'bg-purple-50 border-purple-200 text-purple-900',
  };
  return (
    <div className={`border-l-4 px-4 py-3 rounded-r my-3 text-sm ${styles[type]}`}>{children}</div>
  );
};

const Documentation = () => {
  const [active, setActive] = useState('overview');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = () => {
      const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
      const top = window.scrollY + 120;
      const current = sections.reverse().find((el) => el.offsetTop <= top);
      if (current) setActive(current.id);
    };
    const main = document.getElementById('docs-main');
    if (main) {
      main.addEventListener('scroll', handler);
      return () => main.removeEventListener('scroll', handler);
    }
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
  };

  const filteredSections = useMemo(() => {
    if (!query.trim()) return SECTIONS;
    const q = query.toLowerCase();
    return SECTIONS.filter((s) => s.label.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Documentation" />
        <div className="flex-1 flex overflow-hidden">
          {/* Left section nav */}
          <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200 bg-white overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Filter sections..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
            </div>
            <nav className="p-2 flex-1">
              {filteredSections.map((s) => {
                const Icon = s.icon;
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md text-left transition-colors ${
                      isActive
                        ? 'bg-purple-50 text-purple-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 truncate">{s.label}</span>
                    {isActive && <ChevronRight className="w-3 h-3" />}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-100 text-[11px] text-gray-400">
              Botmon v1.0 — internal docs
            </div>
          </aside>

          <main id="docs-main" className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Botmon Webapp Documentation
                </h1>
                <p className="text-gray-600">
                  Architecture, data flow, and change-impact reference for the Botmon dashboard.
                  Use this when planning changes to understand which other parts of the app a given
                  edit will affect.
                </p>
              </div>

              {/* OVERVIEW */}
              <Section id="overview" title="Overview" icon={BookOpen}>
                <p>
                  Botmon is a SaaS dashboard for managing an AI chatbot that handles sales,
                  bookings, and customer support across Instagram, Facebook Messenger, and WhatsApp.
                  Merchants log in to manage their products, services, orders, customers,
                  notifications, payments, and store settings.
                </p>
                <Sub>Tech stack at a glance</Sub>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <Pill color="blue">React 18.2</Pill> + <Pill color="blue">Vite 5.2</Pill> — SPA
                    bundled and served as a single page.
                  </li>
                  <li>
                    <Pill color="blue">React Router 6</Pill> — client-side routing wrapped in{' '}
                    <Code>BrowserRouter</Code>.
                  </li>
                  <li>
                    <Pill color="blue">Axios</Pill> with interceptors for auth + 401 token refresh.
                  </li>
                  <li>
                    <Pill color="blue">Socket.io-client</Pill> for live chat and real-time
                    notifications.
                  </li>
                  <li>
                    <Pill color="blue">Tailwind CSS</Pill> + <Pill color="blue">shadcn/ui</Pill>{' '}
                    (Radix primitives) for the UI layer.
                  </li>
                  <li>
                    <Pill color="blue">react-hot-toast</Pill> for transient feedback,{' '}
                    <Pill color="blue">Recharts</Pill> for analytics, <Pill color="blue">jsPDF</Pill>{' '}
                    for receipts.
                  </li>
                </ul>

                <Sub>Key conventions</Sub>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <strong>Path alias:</strong> <Code>@/...</Code> resolves to <Code>src/...</Code>{' '}
                    (configured in <Code>vite.config.js</Code>).
                  </li>
                  <li>
                    <strong>API base URL:</strong> Centralized in{' '}
                    <Code>src/config/api.js</Code> as <Code>API_BASE_URL</Code>. Always import from
                    here — do not hardcode hosts.
                  </li>
                  <li>
                    <strong>Auth token:</strong> Stored in <Code>localStorage</Code> under the key{' '}
                    <Code>token</Code>. Always retrieved via <Code>localStorage.getItem('token')</Code>{' '}
                    or <Code>getAuthHeaders()</Code> from <Code>@/utils/authUtils</Code>.
                  </li>
                  <li>
                    <strong>API responses are not consistently shaped.</strong> Some endpoints
                    return flat arrays, others wrap data in <Code>{'{ products: [...] }'}</Code>,{' '}
                    <Code>{'{ data: [...] }'}</Code>, or <Code>{'{ data: { products: [...] } }'}</Code>
                    . Always normalize before <Code>.map()</Code> or <Code>.find()</Code>.
                  </li>
                </ul>
              </Section>

              {/* ARCHITECTURE */}
              <Section id="architecture" title="Architecture" icon={Layers}>
                <p>
                  The app is a single-page React application. <Code>src/main.jsx</Code> mounts{' '}
                  <Code>App.jsx</Code>, which wires up:
                </p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>
                    <Code>ErrorBoundary</Code> — catches render errors and shows a recovery UI.
                  </li>
                  <li>
                    <Code>SocketProvider</Code> — establishes the websocket connection and exposes
                    it via <Code>useSocket()</Code>.
                  </li>
                  <li>
                    <Code>BrowserRouter</Code> + <Code>Routes</Code> — all page routes, public and
                    protected.
                  </li>
                  <li>
                    <Code>{'<Toaster />'}</Code> from <Code>react-hot-toast</Code> at the root.
                  </li>
                  <li>
                    <Code>{'<Tour />'}</Code> — the onboarding tour overlay rendered globally so it
                    can spotlight elements on any page.
                  </li>
                </ol>

                <Sub>The page shell</Sub>
                <p>
                  Every protected page follows the same shell:{' '}
                  <Code>{'<Sidebar /> + <Header /> + <main>'}</Code>. If you need a new page,
                  follow the existing pattern — for example see <Code>Dashboard/Payments.jsx</Code>.
                  Two consequences:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <strong>Sidebar links</strong> live in <Code>src/components/Sidebar.jsx</Code>.
                    Adding a route alone does not add a nav entry.
                  </li>
                  <li>
                    <strong>Header search</strong> queries products, services, customers, and
                    orders. If you add a new searchable entity type, update both{' '}
                    <Code>performSearch()</Code> and <Code>handleSearchResultClick()</Code> in{' '}
                    <Code>Header.jsx</Code>.
                  </li>
                </ul>

                <Sub>Folder map</Sub>
                <Table
                  headers={['Path', 'What lives there']}
                  rows={[
                    [<Code key="1">src/components/ui/</Code>, 'shadcn/ui primitives (Button, Dialog, Input, Calendar, Popover, etc.). Don’t edit these unless you really mean to — they\'re shared by every page.'],
                    [<Code key="2">src/components/Dashboard/</Code>, 'Top-level dashboard pages: Overview, ProductPage, Payments, Messages, Chatbot, Analytics, ManageStore, BankAccountCard.'],
                    [<Code key="3">src/components/DashboardSubPages/</Code>, 'Detail pages and sub-flows: Customers, SingleCustomerPage, Orders, Bookings, Services, AddProductPage, EditProductPage, LinkAccount, PersonalDetails, Bank, etc.'],
                    [<Code key="4">src/components/Auth/</Code>, 'AuthenticationPage (signup), Login, ForgotPassword, ResetPassword.'],
                    [<Code key="5">src/components/Onboarding/</Code>, 'Onboarding1 (business info), Onboarding2 (link social accounts).'],
                    [<Code key="6">src/components/context/</Code>, 'React context providers (currently SocketContext).'],
                    [<Code key="7">src/utils/</Code>, 'authUtils, axiosConfig, banks (Paystack helper).'],
                    [<Code key="8">src/config/api.js</Code>, 'Single source of truth for API_BASE_URL.'],
                  ]}
                />
              </Section>

              {/* ROUTES */}
              <Section id="routes" title="Pages & Routes" icon={RouteIcon}>
                <p>
                  Routes are declared in <Code>src/App.jsx</Code>. Public routes render directly;
                  protected routes are wrapped in <Code>{'<ProtectedRoute>'}</Code>, which checks
                  for a valid token and redirects to <Code>/Login</Code> if missing or expired.
                </p>
                <Sub>Public routes</Sub>
                <Table
                  headers={['Path', 'Component', 'Purpose']}
                  rows={[
                    ['/', 'AuthenticationPage', 'Sign-up landing'],
                    ['/Login', 'Login', 'Email + Google login'],
                    ['/forgot-password', 'ForgotPassword', 'Request password reset link'],
                    ['/reset-password', 'ResetPassword', 'Confirm new password'],
                    ['/AdminAnalytics', 'AdminAnalytics', 'Admin-only analytics view'],
                  ]}
                />
                <Sub>Protected routes (selected)</Sub>
                <Table
                  headers={['Path', 'Component', 'Notes']}
                  rows={[
                    ['/Overview', 'Overview', 'Default landing after login. Pulls /analytics + /notifications.'],
                    ['/ProductPage', 'ProductPage', 'Products + services management grid.'],
                    ['/product/:id', 'IndividualProductPage', 'Reads list of products and finds by id. Accepts location.state.product to skip refetch.'],
                    ['/service/:id', 'IndividualServicePage', 'Same shape as product detail.'],
                    ['/Customers', 'Customers', 'Customer list.'],
                    ['/customer/:id', 'SingleCustomerPage', 'Uses location.state.customer if available; otherwise fetches /customers and finds by id.'],
                    ['/Orders', 'Orders', 'Order list with confirm/reject actions.'],
                    ['/Bookings', 'Bookings', 'Booking list with accept/reject/reschedule.'],
                    ['/Notifications', 'NotificationPage', 'Unread badge in Header is driven by this page.'],
                    ['/Payments', 'Payments', 'Transactions table sourced from /orders + bank card.'],
                    ['/Messages', 'Messages', 'Chat inbox; consumes SocketContext.'],
                    ['/Chatbot', 'Chatbot', 'Chatbot configuration + sandbox.'],
                    ['/ManageStore', 'ManageStore', 'Store settings, FAQs, open/close.'],
                    ['/Bookings, /Bank, /AddBank, /Link, /Advance, /PersonalDetails, /StoreSettings, /Onboarding1, /Onboarding2', 'various', 'See App.jsx for full list.'],
                    ['*', 'NotFound', '404 catch-all.'],
                  ]}
                />
                <Note type="warn">
                  <strong>If you add a new route:</strong> (1) add the <Code>{'<Route>'}</Code> in{' '}
                  <Code>App.jsx</Code>, (2) wrap with <Code>{'<ProtectedRoute>'}</Code> if it
                  requires auth, (3) add a Sidebar entry if the user should be able to find it from
                  the nav, (4) consider whether Header search results should deep-link to it.
                </Note>
              </Section>

              {/* API */}
              <Section id="api" title="API Endpoints" icon={Network}>
                <p>
                  All API calls go to <Code>API_BASE_URL</Code> (see{' '}
                  <Code>src/config/api.js</Code>, defaults to{' '}
                  <Code>https://api.automation365.io</Code>, overridable via{' '}
                  <Code>VITE_API_URL</Code>). Requests carry a Bearer token via the axios
                  interceptor in <Code>src/utils/axiosConfig.js</Code>.
                </p>

                <Sub>Auth & session</Sub>
                <Table
                  headers={['Method', 'Path', 'Used by']}
                  rows={[
                    [<Pill key="1" color="green">POST</Pill>, '/auth/register', 'AuthenticationPage'],
                    [<Pill key="2" color="green">POST</Pill>, '/auth/login', 'Login'],
                    [<Pill key="3" color="green">POST</Pill>, '/auth/google-register | /auth/google-login', 'OAuth flows'],
                    [<Pill key="4" color="green">POST</Pill>, '/auth/refresh', 'axiosConfig (automatic on 401)'],
                    [<Pill key="5" color="green">POST</Pill>, '/auth/logout', 'Header.handleLogout, authUtils.logout'],
                    [<Pill key="6" color="green">POST</Pill>, '/auth/reset-password | /auth/password', 'ForgotPassword, ResetPassword'],
                    [<Pill key="7" color="green">POST</Pill>, '/auth/buisness', 'Onboarding1'],
                    [<Pill key="8" color="blue">GET</Pill>, '/auth/user-header-info', 'Header (loads business name + logo)'],
                  ]}
                />

                <Sub>Catalog & commerce</Sub>
                <Table
                  headers={['Method', 'Path', 'Used by']}
                  rows={[
                    [<Pill key="1" color="blue">GET</Pill>, '/products', 'ProductPage, IndividualProductPage, Header search, Tour'],
                    [<Pill key="2" color="blue">GET</Pill>, '/services', 'ProductPage, IndividualServicePage, Header search, Tour'],
                    [<Pill key="3" color="blue">GET</Pill>, '/customers', 'Customers, SingleCustomerPage (deep-link), Header search'],
                    [<Pill key="4" color="blue">GET</Pill>, '/orders', 'Orders, Payments, Header search'],
                    [<Pill key="5" color="blue">GET</Pill>, '/bookings', 'Bookings, Tour'],
                    [<Pill key="6" color="green">POST</Pill>, '/upload | /supload', 'AddProductPage, AddServicesPage (image upload)'],
                    [<Pill key="7" color="green">POST</Pill>, '/add-products | /add-services', 'New product/service'],
                    [<Pill key="8" color="green">POST</Pill>, '/edit-product | /edit-service', 'Edit product/service'],
                    [<Pill key="9" color="green">POST</Pill>, '/product-status | /service-status', 'Toggle published flag'],
                    [<Pill key="10" color="red">DELETE</Pill>, '/delete-products | /delete-services', 'ProductPage'],
                    [<Pill key="11" color="green">POST</Pill>, '/confirm-order | /reject-order', 'Orders'],
                    [<Pill key="12" color="green">POST</Pill>, '/accept-bookings | /reject-bookings | /reschedule-bookings', 'Bookings'],
                  ]}
                />

                <Sub>Notifications, store settings, bank</Sub>
                <Table
                  headers={['Method', 'Path', 'Used by']}
                  rows={[
                    [<Pill key="1" color="blue">GET</Pill>, '/notification-page', 'Header (unread count), NotificationPage'],
                    [<Pill key="2" color="green">POST</Pill>, '/mark-notifications', 'NotificationPage'],
                    [<Pill key="3" color="blue">GET</Pill>, '/settings | /psettings | /ssettings', 'ManageStore, PersonalDetails, StoreSettings'],
                    [<Pill key="4" color="green">POST</Pill>, '/notification | /others', 'StoreSettings'],
                    [<Pill key="5" color="green">POST</Pill>, '/discountp | /faq | /varian', 'Discounts, FAQs, product variations'],
                    [<Pill key="6" color="blue">GET</Pill>, '/bank', 'BankAccountCard, BankAccount'],
                    [<Pill key="7" color="green">POST</Pill>, '/bank', 'BankAccountCard.handleSave'],
                    [<Pill key="8" color="blue">GET</Pill>, '/banks', 'banks.js (with Paystack fallback)'],
                  ]}
                />

                <Sub>Social linking</Sub>
                <Table
                  headers={['Method', 'Path', 'Used by']}
                  rows={[
                    [<Pill key="1" color="green">POST</Pill>, '/auth/instagram | /auth/messenger | /auth/whatsapp', 'OAuth callbacks (Onboarding2)'],
                    [<Pill key="2" color="green">POST</Pill>, '/instagram | /messenger | /whatsapp', 'LinkAccount initiate'],
                    [<Pill key="3" color="red">DELETE</Pill>, '/unlink-instagram | /unlink-messenger | /unlink-whatsapp', 'LinkAccount'],
                  ]}
                />

                <Note type="warn">
                  <strong>Response shape gotcha.</strong> The <Code>/orders</Code> endpoint returns{' '}
                  <Code>{'{ status, data: [...] }'}</Code> while <Code>/bank</Code> returns{' '}
                  <Code>{'{ bankn, name, number, bvn, verified }'}</Code> with backend-specific
                  field names. Existing pages each have a <em>normalize</em> step before reading.
                  Copy that pattern when adding a new consumer of an endpoint.
                </Note>
              </Section>

              {/* AUTH */}
              <Section id="auth" title="Authentication" icon={Lock}>
                <p>
                  Auth is built around a Bearer token in <Code>localStorage</Code>. Every page that
                  hits a protected endpoint reads the token and adds the{' '}
                  <Code>Authorization</Code> header — most via the axios interceptor, some via raw{' '}
                  <Code>fetch</Code> (e.g. <Code>Payments.fetchTransactions</Code>).
                </p>

                <Sub>Login / signup flow</Sub>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>
                    User submits credentials → backend returns <Code>token</Code> +{' '}
                    <Code>refreshToken</Code>.
                  </li>
                  <li>
                    Both are stored in localStorage. <Code>userEmail</Code>,{' '}
                    <Code>userName</Code>, and <Code>isNewUser</Code> are set when applicable.
                  </li>
                  <li>
                    For Google OAuth, the backend redirects back with{' '}
                    <Code>?success=true&token=…&refresh_token=…</Code>.{' '}
                    <Code>authUtils.processOAuthCallback()</Code> parses these, stores them, marks{' '}
                    <Code>oauth_callback_processed</Code> in <Code>sessionStorage</Code>, and
                    cleans the URL with <Code>history.replaceState</Code>.
                  </li>
                </ol>

                <Sub>Token refresh on 401</Sub>
                <p>
                  <Code>src/utils/axiosConfig.js</Code> registers a response interceptor. On any{' '}
                  <Code>401</Code>:
                </p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>The original request is queued.</li>
                  <li>A <Code>POST /auth/refresh</Code> is fired with the refresh token.</li>
                  <li>If it succeeds, the new token replaces the old one and queued requests retry.</li>
                  <li>
                    If it fails, <Code>clearUserData()</Code> wipes localStorage, a "Session
                    expired" toast fires, and the user is bounced to <Code>/Login</Code>.
                  </li>
                </ol>

                <Sub>Logout</Sub>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <Code>Header.handleLogout</Code> calls <Code>POST /auth/logout</Code>{' '}
                    (best-effort) then delegates to <Code>authUtils.logout()</Code>.
                  </li>
                  <li>
                    <Code>authUtils.logout()</Code> clears tokens + user data and redirects to{' '}
                    <Code>/Login</Code>.
                  </li>
                  <li>
                    <strong>Side effect:</strong> SocketContext disconnects when the token
                    disappears.
                  </li>
                </ul>

                <Note type="danger">
                  <strong>If you change anything about how the token is stored</strong> (key name,
                  storage location, format), every consumer breaks at once. Audit:{' '}
                  <Code>authUtils.js</Code>, <Code>axiosConfig.js</Code>,{' '}
                  <Code>ProtectedRoute.jsx</Code>, <Code>SocketContext.jsx</Code>,{' '}
                  <Code>Header.jsx</Code>, every page that uses raw <Code>fetch</Code>, and the
                  OAuth callback parser.
                </Note>
              </Section>

              {/* STORAGE */}
              <Section id="storage" title="State & Storage" icon={Database}>
                <p>
                  There is no global state library (no Redux, no Zustand). State is local to each
                  component, with three shared persistence layers:
                </p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>
                    <strong>localStorage</strong> — auth tokens, user info, UI persistence (paused
                    chats, tour-seen flag), cached bank list.
                  </li>
                  <li>
                    <strong>sessionStorage</strong> — short-lived OAuth callback flags.
                  </li>
                  <li>
                    <strong>React Context</strong> — currently only <Code>SocketContext</Code>.
                  </li>
                </ol>

                <Sub>localStorage keys</Sub>
                <Table
                  headers={['Key', 'Set by', 'Read by', 'Notes']}
                  rows={[
                    ['token', 'Login, AuthenticationPage, axiosConfig (refresh)', 'Every authenticated request', 'Wiped on logout / failed refresh.'],
                    ['refreshToken / refresh_token', 'Login, AuthenticationPage, OAuth callback', 'axiosConfig refresh flow', 'Two key spellings exist for legacy reasons.'],
                    ['userEmail', 'Auth flows', 'Header (display name fallback), Tour (per-user tour key)', 'Used as part of tour storage key.'],
                    ['userName', 'Header.fetchBusinessData, auth flows', 'Header, dropdown', 'Display only.'],
                    ['userId', 'Auth (when backend provides it)', 'Header (per-user businessData cache)', null],
                    ['businessData_${userId}', 'Header.fetchBusinessData', 'Header.loadUserData', 'Cached display info.'],
                    ['isNewUser', 'AuthenticationPage signup, Onboarding1 (post-OAuth)', 'Tour (primary trigger), Overview', 'Cleared once tour finishes / onboarding completes.'],
                    ['tourSeen_<email>', 'Tour', 'Tour', 'Per-user flag so the tour does not re-trigger.'],
                    ['tourDeviceId', 'Tour', 'Tour', 'Fallback identifier when no email is available.'],
                    ['pausedChats', 'Messages page', 'Messages page', 'JSON array of paused conversation IDs.'],
                    ['allChatsPaused', 'Messages page', 'Messages page', 'Boolean as string.'],
                    ['banks_cache_v1', 'banks.js fetcher', 'banks.js fetcher', '24h TTL cache for the bank list.'],
                    ['linkedAccounts / instagram_profile / facebook_profile / whatsapp_config', 'LinkAccount, Onboarding2', 'LinkAccount, Header', 'JSON blobs cached after OAuth handshake.'],
                  ]}
                />

                <Note type="tip">
                  When adding a new persisted preference, prefer a namespaced key (e.g.{' '}
                  <Code>botmon:settings:foo</Code>) and document it here. Avoid storing anything
                  sensitive — the token is the exception, not the rule.
                </Note>
              </Section>

              {/* REALTIME */}
              <Section id="realtime" title="Real-time & Sockets" icon={Zap}>
                <p>
                  <Code>src/context/SocketContext.jsx</Code> exposes a singleton{' '}
                  <Code>socket</Code> via <Code>useSocket()</Code>. It auto-connects when a token is
                  present and disconnects on auth failure.
                </p>
                <Sub>Events currently in use</Sub>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <Code>new_notification</Code> — Header listens and increments the unread badge.
                  </li>
                  <li>
                    <Code>new_message</Code> / inbox events — consumed by Messages and Chatbot.
                  </li>
                </ul>
                <Note type="info">
                  <strong>Adding a new realtime event:</strong> emit it from the backend, then
                  attach a listener inside a <Code>useEffect</Code> in the consuming component.
                  Always return a cleanup function that calls <Code>socket.off(eventName, handler)</Code>{' '}
                  — otherwise listeners stack on every re-render and you get duplicate handling.
                </Note>
              </Section>

              {/* INTEGRATIONS */}
              <Section id="integrations" title="External Integrations" icon={Plug}>
                <Sub>Google OAuth</Sub>
                <p>
                  Google handles signup/login. The only frontend touch points are the buttons in{' '}
                  <Code>AuthenticationPage</Code> / <Code>Login</Code> and the callback parser in{' '}
                  <Code>authUtils.processOAuthCallback()</Code>. Apple sign-in shows a "coming
                  soon" notice.
                </p>

                <Sub>Paystack (banks list)</Sub>
                <p>
                  <Code>src/utils/banks.js</Code> first tries the backend{' '}
                  <Code>/banks</Code> endpoint, then falls back to{' '}
                  <Code>https://api.paystack.co/bank?country=nigeria</Code>. The result is cached
                  for 24h in <Code>localStorage</Code> under <Code>banks_cache_v1</Code>. The bank
                  picker in <Code>BankAccountCard</Code> calls <Code>fetchBanks()</Code> only when
                  the dialog opens, and only if the in-memory list is empty.
                </p>

                <Sub>Instagram / Messenger / WhatsApp</Sub>
                <p>
                  All three follow the same pattern: <Code>LinkAccount</Code> kicks off an OAuth
                  redirect to the backend, the backend handles the platform handshake, and on
                  return Onboarding2 / LinkAccount calls{' '}
                  <Code>POST /auth/&lt;platform&gt;</Code> with the code. Linked profiles are
                  cached in localStorage.
                </p>

                <Sub>Socket.io</Sub>
                <p>
                  Connects to the same origin as the API with the token in the auth handshake. See
                  the Real-time section for events.
                </p>

                <Note type="warn">
                  Anything that depends on a third-party identity (Instagram username, Facebook page
                  ID, WhatsApp business number) will silently break if the user disconnects an
                  account. Always read from the backend's authoritative source rather than the
                  cached profile blobs in localStorage where possible.
                </Note>
              </Section>

              {/* PATTERNS */}
              <Section id="patterns" title="Common Patterns" icon={GitBranch}>
                <Sub>1. Normalize API response shapes</Sub>
                <p>
                  The backend is inconsistent: some endpoints return arrays, others wrap in{' '}
                  <Code>{'{ data: [...] }'}</Code> or <Code>{'{ products: [...] }'}</Code>. Always
                  normalize before iterating:
                </p>
                <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded overflow-x-auto">
{`const raw = response.data;
const items = Array.isArray(raw)
  ? raw
  : Array.isArray(raw?.products) ? raw.products
  : Array.isArray(raw?.data) ? raw.data
  : Array.isArray(raw?.data?.products) ? raw.data.products
  : [];`}
                </pre>

                <Sub>2. Pass entity via location.state to skip a refetch</Sub>
                <p>
                  Detail pages (<Code>IndividualProductPage</Code>,{' '}
                  <Code>SingleCustomerPage</Code>) accept the full object via{' '}
                  <Code>location.state</Code> when the caller already has it (e.g. Header search
                  passes <Code>{'navigate(`/product/${id}`, { state: { product: raw } })'}</Code>).
                  Detail pages still fall back to a fetch when there's no state — required for hard
                  refreshes and shared deep links.
                </p>

                <Sub>3. Optimistic UI + delayed refetch</Sub>
                <p>
                  When a mutation completes, set the local state immediately from the form input,
                  then call <Code>setTimeout(() =&gt; refetch(), 800)</Code> to let server-side
                  enrichment catch up. See <Code>BankAccountCard.handleSave</Code>.
                </p>

                <Sub>4. Click-outside dropdowns</Sub>
                <p>
                  When a panel is open and you want to close it on outside click, use a{' '}
                  <Code>mousedown</Code> document listener that checks{' '}
                  <Code>ref.current.contains(event.target)</Code>. <strong>Important:</strong> if
                  the same component renders twice (e.g. desktop and mobile variants), use{' '}
                  <em>two refs</em> — a single ref will only point at the last-rendered instance and
                  the desktop variant's clicks will be misclassified as outside.
                </p>

                <Sub>5. Per-endpoint error isolation</Sub>
                <p>
                  When fan-out fetching from multiple endpoints (Header search, Tour preload), wrap
                  each call in a <Code>safeGet</Code> that returns <Code>null</Code> on failure so
                  one bad endpoint doesn't poison the others.
                </p>

                <Sub>6. Toasts, not alerts</Sub>
                <p>
                  Use <Code>toast.success / toast.error</Code> from <Code>react-hot-toast</Code> for
                  user-facing feedback. Never use <Code>alert()</Code> or <Code>confirm()</Code>.
                </p>
              </Section>

              {/* IMPACT */}
              <Section id="impact" title="Change Impact Map" icon={AlertTriangle}>
                <p>
                  Where to look <em>before</em> shipping a change. Pick the row that matches what
                  you're touching.
                </p>
                <Table
                  headers={['If you change…', 'Audit / update these too']}
                  rows={[
                    [
                      'API_BASE_URL or VITE_API_URL',
                      <span key="1">Smoke-test every page. SocketContext also points here. Local <Code>.env</Code> overrides need to match.</span>,
                    ],
                    [
                      'Token storage key or refresh contract',
                      <span key="2"><Code>authUtils.js</Code>, <Code>axiosConfig.js</Code>, <Code>ProtectedRoute.jsx</Code>, <Code>SocketContext.jsx</Code>, <Code>Header.jsx</Code>, and any page using raw <Code>fetch</Code> (Payments, NotificationPage).</span>,
                    ],
                    [
                      'OAuth callback URL params',
                      <span key="3"><Code>authUtils.processOAuthCallback</Code>, <Code>AuthenticationPage</Code>, <Code>Login</Code>, <Code>Onboarding1</Code>, and the <Code>oauth_callback_processed</Code> sessionStorage flag.</span>,
                    ],
                    [
                      '/products or /services response shape',
                      <span key="4"><Code>ProductPage</Code>, <Code>IndividualProductPage</Code>, <Code>IndividualServicePage</Code>, <Code>Header.performSearch</Code>, <Code>Tour</Code> (preload), <Code>Overview</Code>.</span>,
                    ],
                    [
                      '/orders response shape',
                      <span key="5"><Code>Orders</Code>, <Code>Payments</Code> (uses raw fetch + transform), <Code>Header.performSearch</Code>.</span>,
                    ],
                    [
                      '/bank field names',
                      <span key="6"><Code>BankAccountCard</Code> (GET normalizer + POST payload), <Code>Bank</Code>, <Code>InputBankDetails</Code>. Today the backend uses <Code>bankn / name / number / bvn / verified</Code>.</span>,
                    ],
                    [
                      'Notification unread logic',
                      <span key="7"><Code>NotificationPage</Code> (source of truth) and <Code>Header.fetchUnreadCount</Code> (badge). Both must agree on what counts as "read" — currently <Code>marked || read</Code>.</span>,
                    ],
                    [
                      'Sidebar nav entries',
                      <span key="8"><Code>Sidebar.jsx</Code>, plus the same list duplicated in <Code>Header.jsx</Code> for the mobile drawer. Keep them in sync.</span>,
                    ],
                    [
                      'A new searchable entity (e.g. invoices)',
                      <span key="9">Add the fetch + filter + result mapping in <Code>Header.performSearch</Code>, an icon in the <Code>iconMap</Code>, and a routing branch in <Code>handleSearchResultClick</Code>.</span>,
                    ],
                    [
                      'Tour steps',
                      <span key="10"><Code>Tour.jsx</Code> reads <Code>data-tour="…"</Code> attributes off DOM nodes. If you remove or rename a node (e.g. Header search), the matching step will skip silently. Update the steps array when re-arranging the layout.</span>,
                    ],
                    [
                      'Logout behavior',
                      <span key="11"><Code>Header.handleLogout</Code>, <Code>authUtils.logout</Code>, and the SocketContext (must disconnect when token disappears).</span>,
                    ],
                    [
                      'localStorage schema',
                      <span key="12">Add new keys to the table above. Old users may have stale values — handle that with a try/catch around <Code>JSON.parse</Code>.</span>,
                    ],
                  ]}
                />

                <Note type="danger">
                  <strong>Avoid these traps:</strong>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Hardcoding URLs or tokens. Always use <Code>API_BASE_URL</Code> + the auth helpers.</li>
                    <li>Assuming an API returns an array. It often returns a wrapper.</li>
                    <li>Sharing one ref across desktop + mobile variants of a component.</li>
                    <li>Calling <Code>setBankDetails(rawResponse)</Code> without normalizing field names.</li>
                    <li>Forgetting to <Code>socket.off()</Code> in a useEffect cleanup.</li>
                  </ul>
                </Note>
              </Section>

              {/* CONFIG */}
              <Section id="config" title="Build & Config" icon={SettingsIcon}>
                <Sub>Scripts</Sub>
                <ul className="list-disc pl-6 space-y-1">
                  <li><Code>npm run dev</Code> — Vite dev server with HMR.</li>
                  <li><Code>npm run build</Code> — Production build into <Code>dist/</Code>.</li>
                  <li><Code>npm run preview</Code> — Serves the production build locally.</li>
                  <li><Code>npm run lint</Code> — ESLint over <Code>src/</Code>.</li>
                </ul>

                <Sub>Environment</Sub>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <Code>VITE_API_URL</Code> — backend base URL (default in <Code>config/api.js</Code>).
                  </li>
                </ul>

                <Sub>Aliases</Sub>
                <p>
                  <Code>vite.config.js</Code> maps <Code>@</Code> → <Code>src/</Code>. Use{' '}
                  <Code>{`import x from '@/utils/foo'`}</Code> rather than relative paths from deep
                  trees.
                </p>

                <Sub>Key dependencies</Sub>
                <Table
                  headers={['Package', 'Version', 'Why it’s here']}
                  rows={[
                    ['react / react-dom', '18.2', 'UI'],
                    ['react-router-dom', '6.22', 'Routing'],
                    ['axios', '1.7', 'HTTP + interceptors'],
                    ['socket.io-client', '4.8', 'Realtime'],
                    ['react-hot-toast', '2.5', 'Toasts'],
                    ['react-day-picker + date-fns', '—', 'Calendar / date range filters'],
                    ['recharts', '2.12', 'Analytics charts'],
                    ['lucide-react', '0.363', 'Icons'],
                    ['@radix-ui/*', '1.x', 'shadcn/ui primitives'],
                    ['tailwindcss', '3.4', 'Styling'],
                    ['jspdf', '3.0', 'PDF receipts'],
                  ]}
                />

                <Note type="tip">
                  Bundle size warning: the production bundle is ~1.9 MB before gzip. If you add
                  another heavy dependency, consider a dynamic <Code>import()</Code> for the page
                  that needs it (Recharts and html2canvas are good candidates) and let Vite
                  code-split.
                </Note>
              </Section>

              <div className="text-xs text-gray-400 text-center py-8 border-t border-gray-200">
                Botmon documentation · keep this page updated when you ship architectural changes.
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
