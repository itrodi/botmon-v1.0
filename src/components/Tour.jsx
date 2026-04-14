import { API_BASE_URL } from '@/config/api';
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const TOUR_STORAGE_KEY = (identifier) => `tourSeen_${identifier || 'guest'}`;

// Resolve a stable per-user identifier. Prefer email (written on signup/login)
// but fall back to a one-time device token so two different users on the same
// browser still each see the tour once.
const getTourIdentifier = () => {
  const email = localStorage.getItem('userEmail');
  if (email) return email;
  let deviceId = localStorage.getItem('tourDeviceId');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('tourDeviceId', deviceId);
  }
  return deviceId;
};

const Tour = () => {
  const location = useLocation();
  const [phase, setPhase] = useState('idle'); // idle | welcome | touring | done
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [animating, setAnimating] = useState(false);
  const retryRef = useRef(null);

  const steps = useMemo(() => [
    {
      selector: '[data-tour="nav-overview"]',
      title: 'Dashboard overview',
      body: 'Get a bird\'s-eye view of revenue, orders, and recent activity — all in one place.',
      icon: '📊',
    },
    {
      selector: '[data-tour="nav-products"]',
      title: 'Your products',
      body: 'Add, edit, and manage everything you sell. Upload images, set prices, and track inventory.',
      icon: '🛍️',
    },
    {
      selector: '[data-tour="nav-chatbot"]',
      title: 'AI chatbot',
      body: 'Your AI-powered assistant replies to customers automatically across all your channels.',
      icon: '🤖',
    },
    {
      selector: '[data-tour="nav-payments"]',
      title: 'Payments',
      body: 'Track all transactions, view receipts, and manage your bank account for payouts.',
      icon: '💳',
    },
    {
      selector: '[data-tour="nav-notifications"]',
      title: 'Notifications',
      body: 'Real-time alerts when customers place orders, send messages, or need attention.',
      icon: '🔔',
    },
    {
      selector: '[data-tour="nav-messages"]',
      title: 'Messages',
      body: 'All your customer conversations from Instagram, WhatsApp, and Messenger in one inbox.',
      icon: '💬',
    },
    {
      selector: '[data-tour="nav-orders"]',
      title: 'Orders',
      body: 'Review incoming orders, confirm or reject them, and track fulfillment.',
      icon: '📦',
    },
    {
      selector: '[data-tour="nav-customers"]',
      title: 'Customers',
      body: 'See every customer who has interacted with your store and their purchase history.',
      icon: '👥',
    },
    {
      selector: '[data-tour="nav-bookings"]',
      title: 'Bookings',
      body: 'Manage service appointments and bookings from your customers.',
      icon: '📅',
    },
    {
      selector: '[data-tour="header-search"]',
      title: 'Quick search',
      body: 'Find any product or service instantly by typing its name here.',
      icon: '🔍',
    },
    {
      selector: '[data-tour="header-notifications"]',
      title: 'Notification bell',
      body: 'Quick glance at unread notifications without leaving the page you\'re on.',
      icon: '🛎️',
    },
    {
      selector: '[data-tour="nav-settings"]',
      title: 'Settings',
      body: 'Configure your business profile, connect social channels, and manage your account.',
      icon: '⚙️',
    },
  ], []);

  // ── Persistence ──
  const markSeen = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY(getTourIdentifier()), '1');
    // The "new user" flag is one-shot — clear it once the tour has been shown
    localStorage.removeItem('isNewUser');
  }, []);

  // ── Allow other components to restart the tour ──
  useEffect(() => {
    const handleRestart = () => {
      setStepIndex(0);
      setTargetRect(null);
      setPhase('welcome');
    };
    window.addEventListener('tour:restart', handleRestart);
    return () => window.removeEventListener('tour:restart', handleRestart);
  }, []);

  // ── Auto-launch for first-time users ──
  useEffect(() => {
    const publicPaths = ['/', '/login', '/forgot-password', '/reset-password', '/adminanalytics'];
    if (publicPaths.includes(location.pathname.toLowerCase())) return;

    // Don't trigger the tour on the onboarding screens — wait until they land
    // on the real dashboard so the sidebar and header targets actually exist.
    const onboardingPrefixes = ['/onboarding'];
    if (onboardingPrefixes.some((p) => location.pathname.toLowerCase().startsWith(p))) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const identifier = getTourIdentifier();
    if (localStorage.getItem(TOUR_STORAGE_KEY(identifier))) return;

    // Primary signal: signup flow flagged this browser as a new user. Show
    // immediately — don't gate on API activity checks, which can false-positive.
    if (localStorage.getItem('isNewUser') === 'true') {
      // Small delay so the dashboard layout mounts before the welcome modal
      const t = setTimeout(() => setPhase('welcome'), 400);
      return () => clearTimeout(t);
    }

    // Fallback signal for users who existed before the flag was introduced:
    // if they have no products / services / orders / bookings, assume they're
    // still new and show the tour.
    const controller = new AbortController();
    const headers = { Authorization: `Bearer ${token}` };
    const endpoints = [
      `${API_BASE_URL}/products`,
      `${API_BASE_URL}/services`,
      `${API_BASE_URL}/orders`,
      `${API_BASE_URL}/bookings`,
    ];

    const hasAnyActivity = (payload) => {
      if (Array.isArray(payload) && payload.length > 0) return true;
      if (Array.isArray(payload?.data) && payload.data.length > 0) return true;
      if (Array.isArray(payload?.products) && payload.products.length > 0) return true;
      if (Array.isArray(payload?.services) && payload.services.length > 0) return true;
      return false;
    };

    Promise.allSettled(
      endpoints.map((url) =>
        fetch(url, { headers, signal: controller.signal }).then((res) => (res.ok ? res.json() : null))
      )
    )
      .then((results) => {
        const active = results.some((r) => r.status === 'fulfilled' && hasAnyActivity(r.value));
        if (active) {
          markSeen();
          return;
        }
        setPhase('welcome');
      })
      .catch(() => {
        setPhase('welcome');
      });

    return () => controller.abort();
  }, [location.pathname, markSeen]);

  // ── Step measurement + retry ──
  const measureTarget = useCallback((index) => {
    const step = steps[index];
    if (!step) return null;
    const el = document.querySelector(step.selector);
    if (!el) return null;
    return el.getBoundingClientRect();
  }, [steps]);

  const resolveStep = useCallback((index, attempts = 0) => {
    const rect = measureTarget(index);
    if (rect) {
      setAnimating(true);
      setStepIndex(index);
      setTargetRect(rect);
      setTimeout(() => setAnimating(false), 300);
      return;
    }
    if (attempts < 6) {
      retryRef.current = setTimeout(() => resolveStep(index, attempts + 1), 200);
      return;
    }
    // Skip missing element
    if (index + 1 < steps.length) resolveStep(index + 1, 0);
    else handleFinish();
  }, [measureTarget, steps.length]);

  useEffect(() => {
    if (phase !== 'touring') return;
    resolveStep(stepIndex);
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [phase, stepIndex, resolveStep]);

  // ── Resize / scroll re-measure ──
  useEffect(() => {
    if (phase !== 'touring') return;
    const update = () => {
      const rect = measureTarget(stepIndex);
      if (rect) setTargetRect(rect);
    };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [phase, stepIndex, measureTarget]);

  // ── Keyboard navigation ──
  useEffect(() => {
    if (phase !== 'touring' && phase !== 'welcome') return;
    const handler = (e) => {
      if (e.key === 'Escape') handleFinish();
      if (phase === 'touring') {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, stepIndex]);

  // ── Navigation ──
  const handleStartTour = () => {
    setStepIndex(0);
    setPhase('touring');
  };

  const handleNext = () => {
    if (stepIndex + 1 >= steps.length) {
      handleFinish();
      return;
    }
    resolveStep(stepIndex + 1, 0);
  };

  const handlePrev = () => {
    if (stepIndex <= 0) return;
    resolveStep(stepIndex - 1, 0);
  };

  const handleFinish = () => {
    markSeen();
    setPhase('done');
    setTimeout(() => setPhase('idle'), 400);
  };

  const handleSkip = () => {
    markSeen();
    setPhase('idle');
  };

  // ── Welcome screen ──
  if (phase === 'welcome') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scaleIn">
          {/* Header illustration */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 px-8 py-10 text-center">
            <div className="text-5xl mb-4">👋</div>
            <h1 className="text-2xl font-bold text-white">Welcome to Botmon!</h1>
            <p className="text-purple-200 mt-2 text-sm">
              Your AI-powered business dashboard
            </p>
          </div>
          {/* Body */}
          <div className="px-8 py-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              Let us show you around. This quick tour will help you
              understand the key features so you can start managing your
              business right away.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-base">📊</span>
                <span>Track sales, revenue &amp; customers</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-base">🤖</span>
                <span>AI chatbot for automatic replies</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-base">💬</span>
                <span>Unified inbox for all channels</span>
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="px-8 pb-8 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip tour
            </button>
            <button
              onClick={handleStartTour}
              className="px-6 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/25"
            >
              Start tour
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
          .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
          .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        `}</style>
      </div>
    );
  }

  // ── Touring state ──
  if (phase !== 'touring') return null;

  const step = steps[stepIndex];
  if (!step) return null;

  const padding = 8;
  const rect = targetRect;

  // Smart tooltip positioning
  const tooltipStyle = (() => {
    if (!rect) return { top: 80, left: 24 };
    const spacing = 16;
    const tooltipWidth = 340;
    const tooltipHeight = 200;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // Try below
    let top = rect.bottom + spacing;
    let left = rect.left;

    // If overflows bottom, place above
    if (top + tooltipHeight > viewportH) {
      top = Math.max(16, rect.top - spacing - tooltipHeight);
    }

    // If overflows right, shift left
    if (left + tooltipWidth > viewportW - 16) {
      left = viewportW - tooltipWidth - 16;
    }

    // Ensure not off-screen left
    left = Math.max(16, left);

    return { width: tooltipWidth, top, left };
  })();

  return (
    <div className="fixed inset-0 z-[9999]" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Dark overlay with spotlight cutout */}
      {rect && (
        <div
          className="absolute rounded-lg pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
            border: '2px solid rgba(147, 51, 234, 0.6)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={`absolute bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ease-out ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        style={tooltipStyle}
      >
        {/* Step header with icon */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-2">
          <span className="text-2xl">{step.icon}</span>
          <div>
            <div className="font-semibold text-gray-900">{step.title}</div>
          </div>
        </div>

        {/* Body */}
        <p className="text-sm text-gray-600 leading-relaxed px-5 pb-4">{step.body}</p>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => resolveStep(i, 0)}
                aria-label={`Go to step ${i + 1}`}
                className={`rounded-full transition-all duration-200 ${
                  i === stepIndex
                    ? 'w-6 h-2 bg-purple-600'
                    : i < stepIndex
                    ? 'w-2 h-2 bg-purple-300'
                    : 'w-2 h-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            <button
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
              onClick={handleSkip}
            >
              Skip
            </button>
            {stepIndex > 0 && (
              <button
                className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={handlePrev}
              >
                Back
              </button>
            )}
            <button
              className="text-xs px-3 py-1.5 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium"
              onClick={handleNext}
            >
              {stepIndex + 1 === steps.length ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Tour;
