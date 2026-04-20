import React, { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, Search, Film, Star } from 'lucide-react';

export default function EntitySelector({ selectedEntity, onEntityChange, entities, entityType = 'movie' }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const Icon = entityType === 'celebrity' ? Star : Film;

  return (
    <Select.Root value={selectedEntity?.id || ''} onValueChange={(id) => {
      if (id === 'none') {
        onEntityChange(null);
      } else {
        const entity = entities.find(e => e.id === id);
        onEntityChange(entity);
      }
    }}>
      <Select.Trigger className="inline-flex items-center gap-2 px-4 py-2 h-10 bg-card border border-border rounded-lg hover:bg-accent transition-colors min-w-[180px]">
        <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Select.Value>
          {selectedEntity ? (
            <span className="text-sm font-semibold text-foreground">
              {selectedEntity.name} <span className="text-xs text-muted-foreground ml-1">({selectedEntity.id})</span>
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Select {entityType}...</span>
          )}
        </Select.Value>
        <Select.Icon className="ml-auto">
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal container={document.body}>
        <Select.Content 
          className="overflow-hidden bg-card rounded-lg border border-border shadow-lg w-[400px] z-[999]"
          side="bottom"
          align="start"
          sideOffset={8}
          avoidCollisions={true}
          forceMount={false}
        >
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-background rounded">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${entityType}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <Select.Viewport className="p-1 max-h-[300px] overflow-y-auto">
            {/* None Option */}
            <Select.Item
              value="none"
              className="relative flex items-center gap-2 px-3 py-2 pr-8 rounded cursor-pointer outline-none hover:bg-accent data-[highlighted]:bg-accent"
            >
              <Select.ItemText>
                <div className="font-medium text-foreground">None</div>
              </Select.ItemText>
              <Select.ItemIndicator className="absolute right-2">
                <Check className="w-4 h-4 text-green-500" />
              </Select.ItemIndicator>
            </Select.Item>

            {filteredEntities.map((entity) => (
              <Select.Item
                key={entity.id}
                value={entity.id}
                className="relative flex items-center gap-2 px-3 py-2 pr-8 rounded cursor-pointer outline-none hover:bg-accent data-[highlighted]:bg-accent"
              >
                <Select.ItemText>
                  <div>
                    <div className="font-medium text-foreground">
                      {entity.name} <span className="text-xs text-muted-foreground ml-1">ID: {entity.id}</span>
                    </div>
                    {entity.description && (
                      <div className="text-xs text-muted-foreground">{entity.description}</div>
                    )}
                  </div>
                </Select.ItemText>
                <Select.ItemIndicator className="absolute right-2">
                  <Check className="w-4 h-4 text-green-500" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
            
            {filteredEntities.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No {entityType}s found
              </div>
            )}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
