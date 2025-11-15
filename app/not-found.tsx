import Link from 'next/link';

/**
 * 404 Not Found page
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-indigo-600">404</h1>
        </div>

        {/* Error Message */}
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">
          Page not found
        </h2>
        <p className="mb-8 text-base text-gray-600">
          Sorry, we couldn't find the page you're looking for. The page may have been moved or
          deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <svg
              className="-ml-0.5 mr-1.5 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                clipRule="evenodd"
              />
            </svg>
            Go Home
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500">
          Need help?{' '}
          <a href="mailto:support@datastory.ai" className="font-medium text-indigo-600 hover:text-indigo-500">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
