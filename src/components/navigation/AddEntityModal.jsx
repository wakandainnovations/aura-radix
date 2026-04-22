import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Search, Film, Star } from 'lucide-react';

export default function AddEntityModal({ 
  open, 
  onOpenChange, 
  onEntitySelect, 
  movieEntities = [],
  celebrityEntities = [],
  currentEntityIds = [] // IDs of already-selected entities to disable in selection
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'movie', 'celebrity'

  // Combine and group entities
  const allEntities = useMemo(() => {
    const entities = [];
    
    // Add movies
    movieEntities.forEach(entity => {
      entities.push({
        ...entity,
        entityType: 'movie',
        icon: Film,
      });
    });
    
    // Add celebrities
    celebrityEntities.forEach(entity => {
      entities.push({
        ...entity,
        entityType: 'celebrity',
        icon: Star,
      });
    });
    
    return entities;
  }, [movieEntities, celebrityEntities]);

  // Filter entities
  const filteredEntities = useMemo(() => {
    return allEntities.filter(entity => {
      const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || entity.entityType === selectedType;
      const notAlreadySelected = !currentEntityIds.includes(entity.id);
      return matchesSearch && matchesType && notAlreadySelected;
    });
  }, [allEntities, searchQuery, selectedType, currentEntityIds]);

  // Group filtered entities by type for display
  const groupedEntities = useMemo(() => {
    const groups = {
      movie: [],
      celebrity: [],
    };
    filteredEntities.forEach(entity => {
      groups[entity.entityType].push(entity);
    });
    return groups;
  }, [filteredEntities]);

  const handleSubmit = () => {
    if (selectedId) {
      const entity = allEntities.find(e => e.id === selectedId);
      if (entity) {
        onEntitySelect(entity);
        setSelectedId(null);
        setSearchQuery('');
        setSelectedType('all');
        onOpenChange(false);
      }
    }
  };

  const handleClose = () => {
    setSelectedId(null);
    setSearchQuery('');
    setSelectedType('all');
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={document.body}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" onClick={handleClose} />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-2xl font-bold text-foreground">Add Entity</Dialog.Title>
              <p className="text-sm text-muted-foreground mt-1">
                Select a movie or celebrity to add ({currentEntityIds.length}/5)
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

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            {['all', 'movie', 'celebrity'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  selectedType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground hover:bg-accent'
                }`}
              >
                {type === 'all' ? 'All' : type === 'movie' ? `Movies (${groupedEntities.movie.length})` : `Celebrities (${groupedEntities.celebrity.length})`}
              </button>
            ))}
          </div>

          {/* Entity List */}
          <div className="bg-background rounded-lg border border-border max-h-[400px] overflow-y-auto mb-6">
            {filteredEntities.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No entities found matching your search
              </div>
            ) : (
              <div>
                {/* Movies Section */}
                {groupedEntities.movie.length > 0 && (
                  <div>
                    <div className="sticky top-0 bg-card px-4 py-2 border-b border-border">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Film className="w-3 h-3" />
                        Movies
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {groupedEntities.movie.map((entity) => (
                        <button
                          key={entity.id}
                          onClick={() => setSelectedId(entity.id)}
                          className={`w-full text-left px-4 py-3 transition-colors ${
                            selectedId === entity.id
                              ? 'bg-primary/10 border-l-2 border-primary'
                              : 'hover:bg-accent border-l-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-foreground">{entity.name}</div>
                              {entity.description && (
                                <div className="text-xs text-muted-foreground mt-1">{entity.description}</div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">ID: {entity.id}</div>
                            </div>
                            {selectedId === entity.id && (
                              <div className="w-4 h-4 rounded-full bg-primary"></div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Celebrities Section */}
                {groupedEntities.celebrity.length > 0 && (
                  <div>
                    {groupedEntities.movie.length > 0 && <div className="h-px bg-border" />}
                    <div className="sticky top-0 bg-card px-4 py-2 border-b border-border">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Star className="w-3 h-3" />
                        Celebrities
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {groupedEntities.celebrity.map((entity) => (
                        <button
                          key={entity.id}
                          onClick={() => setSelectedId(entity.id)}
                          className={`w-full text-left px-4 py-3 transition-colors ${
                            selectedId === entity.id
                              ? 'bg-primary/10 border-l-2 border-primary'
                              : 'hover:bg-accent border-l-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-foreground">{entity.name}</div>
                              {entity.description && (
                                <div className="text-xs text-muted-foreground mt-1">{entity.description}</div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">ID: {entity.id}</div>
                            </div>
                            {selectedId === entity.id && (
                              <div className="w-4 h-4 rounded-full bg-primary"></div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedId || currentEntityIds.length >= 5}
              className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={currentEntityIds.length >= 5 ? 'Maximum 5 entities allowed' : 'Add selected entity'}
            >
              {currentEntityIds.length >= 5 ? 'Maximum Reached' : 'Add Entity'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
