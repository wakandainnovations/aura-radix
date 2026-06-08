import React from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, ShieldAlert } from 'lucide-react';

// Filters mentions by AI threat-score tier. The tier ids and thresholds must
// stay in sync with filterMentions() (THREAT_LEVELS). This is NOT a reply-status
// filter — mentions carry no reply state; the buckets are purely threat severity.
export default function ThreatLevelFilter({ selectedThreatLevels, onThreatLevelsChange }) {
  const threatLevels = [
    { id: 'critical', name: 'Critical', color: '#ef4444' },
    { id: 'elevated', name: 'Elevated', color: '#f97316' },
    { id: 'low', name: 'Low', color: '#84cc16' }
  ];

  const toggleThreatLevel = (levelId) => {
    if (selectedThreatLevels.includes(levelId)) {
      onThreatLevelsChange(selectedThreatLevels.filter(l => l !== levelId));
    } else {
      onThreatLevelsChange([...selectedThreatLevels, levelId]);
    }
  };

  const selectedCount = selectedThreatLevels.length;
  const allSelected = selectedCount === threatLevels.length;

  return (
    <div className="relative">
      <Select.Root>
        <Select.Trigger className="inline-flex items-center gap-2 px-4 py-2 h-10 bg-card border border-border rounded-lg hover:bg-accent transition-colors min-w-[140px]">
          <ShieldAlert className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Select.Value>
            {selectedCount === 0 ? (
              <span className="text-sm text-muted-foreground">Threat Level</span>
            ) : allSelected ? (
              <span className="text-sm text-foreground">All Threat Levels</span>
            ) : (
              <span className="text-sm text-foreground font-medium">{selectedCount} Level{selectedCount > 1 ? 's' : ''}</span>
            )}
          </Select.Value>
          <Select.Icon className="ml-auto">
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className="overflow-hidden bg-card rounded-lg border border-border shadow-lg z-[100]">
            <Select.Viewport className="p-2">
              {/* Select All Option */}
              <div
                onClick={() => {
                  if (allSelected) {
                    onThreatLevelsChange([]);
                  } else {
                    onThreatLevelsChange(threatLevels.map(l => l.id));
                  }
                }}
                className="relative flex items-center gap-3 px-3 py-2 pr-8 rounded cursor-pointer outline-none hover:bg-accent transition-colors"
              >
                <span className="text-sm font-medium text-foreground">All Threat Levels</span>
                <div className="absolute right-2 w-4 h-4 border-2 border-green-500 rounded flex items-center justify-center">
                  {allSelected && <Check className="w-3 h-3 text-green-500" />}
                </div>
              </div>

              <div className="h-px bg-border my-1" />

              {/* Individual Threat Level Options */}
              {threatLevels.map((level) => {
                const isSelected = selectedThreatLevels.includes(level.id);
                return (
                  <div
                    key={level.id}
                    onClick={() => toggleThreatLevel(level.id)}
                    className="relative flex items-center gap-3 px-3 py-2 pr-8 rounded cursor-pointer outline-none hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: level.color }}
                      />
                      <span className="text-sm text-foreground">{level.name}</span>
                    </div>
                    <div className="absolute right-2 w-4 h-4 border-2 border-green-500 rounded flex items-center justify-center">
                      {isSelected && <Check className="w-3 h-3 text-green-500" />}
                    </div>
                  </div>
                );
              })}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
