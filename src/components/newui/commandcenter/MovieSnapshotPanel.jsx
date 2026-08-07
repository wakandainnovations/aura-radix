import { Clapperboard, CalendarClock, Tag, Languages, Clock, Building2, RefreshCw, ArrowRight } from 'lucide-react';
import { CARD } from '../theme';
import useEntityImage from '../../../hooks/useEntityImage';
import { releaseCountdownLabel } from '../dateUtils';

const META_ROWS = (snapshot) => {
  const { isPast, days } = releaseCountdownLabel(snapshot.releaseInDays);
  return [
    {
      icon: CalendarClock,
      label: isPast ? 'Released' : 'Releasing in',
      value: isPast ? `${days} Days ago` : `${days} Days`,
    },
    { icon: Tag, label: 'Genre', value: snapshot.genre },
    { icon: Languages, label: 'Language', value: snapshot.language },
    { icon: Clock, label: 'Runtime', value: snapshot.runtime },
    { icon: Building2, label: 'Distributor', value: snapshot.distributor },
    { icon: RefreshCw, label: 'Last Updated', value: snapshot.lastUpdatedLabel },
  ];
};

export default function MovieSnapshotPanel({ title, poster, snapshot, onOpenWorkspace }) {
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
        {META_ROWS(snapshot).map((row) => {
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

      <button
        onClick={onOpenWorkspace}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
      >
        Open Movie Workspace
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
