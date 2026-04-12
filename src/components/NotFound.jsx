import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      role="alert"
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
    >
      <div className="max-w-md w-full text-center">
        <p className="text-purple-600 font-semibold text-sm uppercase tracking-wide">
          404 error
        </p>
        <h1 className="mt-2 text-4xl font-bold text-gray-900 sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 text-base text-gray-600">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It may
          have moved or no longer exists.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/Overview"
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-sm font-medium"
          >
            Go to dashboard
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
