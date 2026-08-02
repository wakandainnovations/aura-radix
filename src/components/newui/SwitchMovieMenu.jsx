import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown, Search, Film } from 'lucide-react';
import useEntityImage from '../../hooks/useEntityImage';

// Dark-themed movie switcher for the new UI sidebar. Built on Popover rather
// than Select: Select.Content has built-in type-ahead keyboard handling that
// steals focus away from a nested search <input> after the first keystroke,
// which breaks a search-inside-dropdown pattern like this one.
export default function SwitchMovieMenu({ movies = [], selectedMovie, onSelect, fallbackTitle, releaseInDays }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMovies = movies.filter((movie) =>
    movie.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayTitle = selectedMovie?.name ?? fallbackTitle;
  const selectedThumb = useEntityImage(selectedMovie?.imageUrl);

  const handleSelect = (movie) => {
    onSelect?.(movie);
    setSearchQuery('');
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors outline-none">
          <div className="w-8 h-10 rounded bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 shrink-0 overflow-hidden">
            {selectedThumb && (
              <img src={selectedThumb} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm text-white/90 truncate">{displayTitle}</div>
            <div className="text-xs text-white/40">Releasing in {releaseInDays} days</div>
          </div>
          <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />
        </button>
      </Popover.Trigger>

      <Popover.Portal container={document.body}>
        <Popover.Content
          className="overflow-hidden bg-[#0b0e19] rounded-lg border border-white/[0.07] shadow-xl w-[280px] z-[999]"
          side="top"
          align="start"
          sideOffset={8}
          avoidCollisions
        >
          <div className="p-2 border-b border-white/[0.07]">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-white/[0.04] rounded">
              <Search className="w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-sm outline-none text-white/90 placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="p-1 max-h-[280px] overflow-y-auto">
            {filteredMovies.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-white/40">No movies found</div>
            )}
            {filteredMovies.map((movie) => {
              const isSelected = selectedMovie?.id === movie.id;
              return (
                <button
                  key={movie.id}
                  onClick={() => handleSelect(movie)}
                  className="w-full relative flex items-center gap-2 px-3 py-2 pr-8 rounded text-left outline-none text-sm text-white/80 hover:bg-white/[0.06]"
                >
                  <Film className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <span className="truncate">{movie.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 absolute right-2 shrink-0" />}
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
