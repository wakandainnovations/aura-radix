import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Search } from 'lucide-react';

export default function AddEntityModal({ 
  open, 
  onOpenChange, 
  onEntitySelect, 
  movieEntities = [],
  celebrityEntities = [],
  currentEntityIds = [] // IDs of already-selected entities to disable in selection
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Combine entities
  const allEntities = useMemo(() => {
    return [...movieEntities, ...celebrityEntities];
  }, [movieEntities, celebrityEntities]);

  // Filter entities
  const filteredEntities = useMemo(() => {
    return allEntities.filter(entity => {
      const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase());
      const notAlreadySelected = !currentEntityIds.includes(entity.id);
      return matchesSearch && notAlreadySelected;
    });
  }, [allEntities, searchQuery, currentEntityIds]);

  const groupedEntities = useMemo(() => {
    return filteredEntities.reduce(
      (groups, entity) => {
        const type = entity.entityType === 'celebrity' ? 'celebrities' : 'movies';
        groups[type].push(entity);
        return groups;
      },
      { movies: [], celebrities: [] }
    );
  }, [filteredEntities]);

  const handleEntityClick = (entity) => {
    onEntitySelect(entity);
    setSearchQuery('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSearchQuery('');
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={document.body}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" onClick={handleClose} />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,960px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-lg font-semibold text-foreground">Add Entity</Dialog.Title>
              <p className="text-sm text-muted-foreground mt-1">
                Click any entity to add ({currentEntityIds.length}/5)
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-accent rounded transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-border mb-4">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search movies or celebrities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
          </div>

          {/* Entity Tags (same style as Add Competitor) */}
          <div className="mb-4 p-4 bg-accent/20 rounded-lg border border-border">
            {filteredEntities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No entities available to add
              </p>
            ) : (
              <div className="space-y-4">
                {groupedEntities.movies.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Movies ({groupedEntities.movies.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {groupedEntities.movies.map((entity) => (
                        <button
                          key={entity.id}
                          onClick={() => handleEntityClick(entity)}
                          className="px-3 py-1.5 text-sm font-medium rounded-full border bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
                          title={entity.description}
                        >
                          {entity.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {groupedEntities.celebrities.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Celebrities ({groupedEntities.celebrities.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {groupedEntities.celebrities.map((entity) => (
                        <button
                          key={entity.id}
                          onClick={() => handleEntityClick(entity)}
                          className="px-3 py-1.5 text-sm font-medium rounded-full border bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
                          title={entity.description}
                        >
                          {entity.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
