import { Clapperboard, Tag, Languages, Clock, Wallet, Building2, MonitorPlay, CalendarDays, ArrowRight } from 'lucide-react';
import { CARD } from './theme';
import useEntityImage from '../../hooks/useEntityImage';

const META_ROWS = (poster) => [
  { icon: Tag, label: 'Genre', value: poster.genre },
  { icon: Languages, label: 'Language', value: poster.language },
  { icon: Clock, label: 'Runtime', value: poster.runtime },
  { icon: Wallet, label: 'Budget', value: poster.budget },
  { icon: Building2, label: 'Distributor', value: poster.distributor },
  { icon: MonitorPlay, label: 'Format', value: poster.format },
  { icon: CalendarDays, label: 'Release Date', value: poster.releaseDate },
];

export default function MoviePosterPanel({ title, poster }) {
  const posterSrc = useEntityImage(poster.imageUrl);

  return (
    <div className={`${CARD} p-4 h-full flex flex-col`}>
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shrink-0">
        {posterSrc ? (
          <img src={posterSrc} alt={`${title} poster`} className="w-full h-full object-cover" />
        ) : (
          <>
            <Clapperboard className="w-12 h-12 text-white/20" />
            <span className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/30 px-3">
              Poster placeholder
            </span>
          </>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {META_ROWS(poster).map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white/45">
                <Icon className="w-3.5 h-3.5" />
                {row.label}
              </div>
              <span className="text-white/85 font-medium truncate ml-3">{row.value}</span>
            </div>
          );
        })}
      </div>

      <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-blue-500/40 text-blue-400 text-sm font-medium hover:bg-blue-500/10 transition-colors">
        View Movie Profile
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
