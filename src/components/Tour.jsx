import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE = 'https://api.automation365.io';

const Tour = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const retryRef = useRef(null);

  const steps = useMemo(() => ([
    { id: 'overview', selector: '[data-tour="nav-overview"]', title: 'Overview', body: 'See your key metrics and activity at a glance.' },
    { id: 'notifications', selector: '[data-tour="nav-notifications"]', title: 'Notifications', body: 'Stay on top of new activity in real time.' },
    { id: 'messages', selector: '[data-tour="nav-messages"]', title: 'Messages', body: 'Chat with customers across your channels.' },
    { id: 'customers', selector: '[data-tour="nav-customers"]', title: 'Customers', body: 'View your customer list and details.' },
    { id: 'orders', selector: '[data-tour="nav-orders"]', title: 'Orders', body: 'Manage orders and fulfillment status.' },
    { id: 'bookings', selector: '[data-tour="nav-bookings"]', title: 'Bookings', body: 'Handle service bookings in one place.' },
    { id: 'chatbot', selector: '[data-tour="nav-chatbot"]', title: 'Chat Bot', body: 'Test and tune your automation flows.' },
    { id: 'bell', selector: '[data-tour="header-notifications"]', title: 'Notification Bell', body: 'Quick access to unread alerts.' },
  ]), []);

  const markSeen = () => {
    const userId = localStorage.getItem('userId') || 'guest';
    localStorage.setItem(`tourSeen_${userId}`, '1');
  };

  useEffect(() => {
    const publicPaths = ['/', '/login', '/forgot-password', '/reset-password', '/adminanalytics'];
    if (publicPaths.includes(location.pathname.toLowerCase())) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const userId = localStorage.getItem('userId') || 'guest';
    const hasSeen = localStorage.getItem(`tourSeen_${userId}`);
    if (hasSeen) return;

    const controller = new AbortController();
    const headers = { Authorization: `Bearer ${token}` };
    const endpoints = [
      `${API_BASE}/products`,
      `${API_BASE}/services`,
      `${API_BASE}/orders`,
      `${API_BASE}/bookings`,
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
        setIsOpen(true);
      })
      .catch(() => {
        setIsOpen(true);
      });

    return () => controller.abort();
  }, [location.pathname]);

  const measureTarget = (index) => {
    const step = steps[index];
    if (!step) return null;
    const el = document.querySelector(step.selector);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return rect;
  };

  const resolveStep = (index, attempts = 0) => {
    const rect = measureTarget(index);
    if (rect) {
      setStepIndex(index);
      setTargetRect(rect);
      return;
    }
    if (attempts < 6) {
      retryRef.current = setTimeout(() => resolveStep(index, attempts + 1), 200);
      return;
    }
    if (index + 1 < steps.length) resolveStep(index + 1, 0);
    else handleFinish();
  };

  useEffect(() => {
    if (!isOpen) return;
    resolveStep(stepIndex);
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [isOpen, stepIndex, location.pathname]);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, stepIndex]);

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
    setIsOpen(false);
  };

  if (!isOpen || !steps[stepIndex]) return null;

  const step = steps[stepIndex];
  const padding = 6;
  const rect = targetRect;

  const tooltipStyle = (() => {
    if (!rect) return { top: 80, left: 24 };
    const spacing = 12;
    const maxWidth = 320;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const preferredTop = rect.bottom + spacing;
    const preferredLeft = Math.min(rect.left, viewportW - maxWidth - 16);
    const placeBelow = preferredTop + 160 < viewportH;
    return {
      width: maxWidth,
      top: placeBelow ? preferredTop : Math.max(16, rect.top - spacing - 160),
      left: Math.max(16, preferredLeft),
    };
  })();

  return (
    <div className="fixed inset-0 z-[9999]">
      {rect && (
        <div
          className="absolute rounded-lg border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] pointer-events-none"
          style={{
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          }}
        />
      )}

      <div
        className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4"
        style={tooltipStyle}
      >
        <div className="text-xs text-gray-400 mb-1">Step {stepIndex + 1} of {steps.length}</div>
        <div className="font-semibold text-gray-900 mb-1">{step.title}</div>
        <div className="text-sm text-gray-600 mb-4">{step.body}</div>
        <div className="flex items-center justify-between">
          <button className="text-sm text-gray-500 hover:text-gray-700" onClick={handleFinish}>Skip</button>
          <div className="flex items-center gap-2">
            <button className="text-sm px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50" onClick={handlePrev} disabled={stepIndex === 0}>Back</button>
            <button className="text-sm px-3 py-1.5 rounded-md bg-purple-600 text-white hover:bg-purple-700" onClick={handleNext}>
              {stepIndex + 1 === steps.length ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tour;
