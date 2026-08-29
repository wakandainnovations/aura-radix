import { AlertCircle } from 'lucide-react';

// Renders a react-query error inline instead of letting the caller fall
// through to an empty/"no results" state that looks identical to there
// genuinely being no data. `error.message` comes from apiClient's response
// interceptor (see src/api/client.js) - usually short and human-readable,
// but a raw backend failure (e.g. a SQL error) can leak a very long
// message, so anything implausibly long falls back to a generic string
// rather than dumping it into the UI.
export default function ErrorState({ error, label = 'posts' }) {
  const message = typeof error?.message === 'string' && error.message.length <= 160
    ? error.message
    : 'Something went wrong on the server. Please try again in a moment.';

  return (
    <div className="flex flex-col items-center gap-1.5 text-center py-8">
      <AlertCircle className="w-5 h-5 text-red-400" />
      <p className="text-sm text-red-400">Couldn't load {label}{error?.status ? ` (${error.status})` : ''}</p>
      <p className="text-xs text-white/30 max-w-sm">{message}</p>
    </div>
  );
}
