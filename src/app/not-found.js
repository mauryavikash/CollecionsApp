import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <h1 className="text-3xl font-semibold text-slate-900">404</h1>
        <p className="mt-3 text-slate-600">The page you’re looking for doesn’t exist.</p>
        <Link
          href="/home"
          className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}