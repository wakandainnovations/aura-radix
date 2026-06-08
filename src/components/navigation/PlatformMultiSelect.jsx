import React, { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, Filter } from 'lucide-react';

export default function PlatformMultiSelect({ selectedPlatforms, onPlatformsChange }) {
  // Platform ids must match the backend `mention.platform` values used everywhere
  // else (see SocialMediaFeed grouping and audienceIntelShared.PLATFORMS):
  // 'x', 'reddit', 'instagram', 'youtube'.
  const platforms = [
    { id: 'x', name: 'X', color: '#000000' },
    { id: 'reddit', name: 'Reddit', color: '#FF4500' },
    { id: 'instagram', name: 'Instagram', color: '#E1306C' },
    { id: 'youtube', name: 'YouTube', color: '#FF0000' }
  ];

  const togglePlatform = (platformId) => {
    if (selectedPlatforms.includes(platformId)) {
      onPlatformsChange(selectedPlatforms.filter(p => p !== platformId));
    } else {
      onPlatformsChange([...selectedPlatforms, platformId]);
    }
  };

  const selectedCount = selectedPlatforms.length;
  const allSelected = selectedCount === platforms.length;

  return (
    <div className="relative">
      <Select.Root>
        <Select.Trigger className="inline-flex items-center gap-2 px-4 py-2 h-10 bg-card border border-border rounded-lg hover:bg-accent transition-colors min-w-[160px]">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Select.Value>
            {selectedCount === 0 ? (
              <span className="text-sm text-muted-foreground">Select Platforms</span>
            ) : allSelected ? (
              <span className="text-sm text-foreground">All Platforms</span>
            ) : (
              <span className="text-sm text-foreground font-medium">{selectedCount} Platform{selectedCount > 1 ? 's' : ''}</span>
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
                    onPlatformsChange([]);
                  } else {
                    onPlatformsChange(platforms.map(p => p.id));
                  }
                }}
                className="relative flex items-center gap-3 px-3 py-2 pr-8 rounded cursor-pointer outline-none hover:bg-accent transition-colors"
              >
                <span className="text-sm font-medium text-foreground">All Platforms</span>
                <div className="absolute right-2 w-4 h-4 border-2 border-green-500 rounded flex items-center justify-center">
                  {allSelected && <Check className="w-3 h-3 text-green-500" />}
                </div>
              </div>

              <div className="h-px bg-border my-1" />

              {/* Individual Platform Options */}
              {platforms.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);
                return (
                  <div
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className="relative flex items-center gap-3 px-3 py-2 pr-8 rounded cursor-pointer outline-none hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: platform.color }}
                      />
                      <span className="text-sm text-foreground">{platform.name}</span>
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
