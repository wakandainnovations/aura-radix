import React, { useState } from 'react';
import { Command } from 'cmdk';
import * as Dialog from '@radix-ui/react-dialog';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  MessageSquare, 
  AlertTriangle,
  TrendingUp,
  BarChart
} from 'lucide-react';

export default function CommandPalette({ open, onOpenChange, mentions = [], onSelectMention, onRefresh }) {
  const [search, setSearch] = useState('');

  const actions = [
    {
      id: 'refresh',
      label: 'Refresh Data',
      icon: RefreshCw,
      action: () => {
        if (onRefresh) onRefresh();
        onOpenChange(false);
      }
    },
    {
      id: 'filter-anomalies',
      label: 'Show Only Anomalies',
      icon: AlertTriangle,
      action: () => {
        // This would trigger the anomaly filter
        onOpenChange(false);
      }
    },
    {
      id: 'view-analytics',
      label: 'View Analytics Dashboard',
      icon: BarChart,
      action: () => {
        onOpenChange(false);
      }
    }
  ];

  const highThreatMentions = (mentions || [])
    .filter(m => m && m.aiThreatScore >= 60)
    .slice(0, 10);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-[10%] -translate-x-1/2 w-[90vw] max-w-2xl bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
          <Command className="w-full" shouldFilter={false}>
            <div className="flex items-center border-b border-border px-4">
              <Search className="w-5 h-5 text-muted-foreground mr-2" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Type a command or search mentions..."
                className="flex-1 bg-transparent py-4 outline-none text-sm placeholder:text-muted-foreground"
              />
              <kbd className="px-2 py-1 text-xs bg-accent rounded">
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-[400px] overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>

              {/* Quick Actions */}
              <Command.Group heading="Quick Actions" className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {actions.map(action => (
                  <Command.Item
                    key={action.id}
                    onSelect={action.action}
                    className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer data-[selected=true]:bg-accent outline-none"
                  >
                    <action.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{action.label}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              {/* High Priority Mentions */}
              {highThreatMentions.length > 0 && (
                <Command.Group heading="High Priority Mentions" className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-2 mt-4">
                  {highThreatMentions
                    .filter(m => 
                      search === '' || 
                      m.author.toLowerCase().includes(search.toLowerCase()) ||
                      m.textSnippet.toLowerCase().includes(search.toLowerCase())
                    )
                    .map(mention => (
                      <Command.Item
                        key={mention.id}
                        onSelect={() => onSelectMention(mention)}
                        className="px-3 py-3 rounded cursor-pointer data-[selected=true]:bg-accent outline-none"
                      >
                        <div className="flex items-start gap-3">
                          <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{mention.author || 'Unknown Author'}</span>
                              <span className="text-xs text-threat-high font-mono">
                                {mention.aiThreatScore}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {mention.textSnippet}
                            </p>
                          </div>
                        </div>
                      </Command.Item>
                    ))}
                </Command.Group>
              )}

              {/* All Mentions (if searching) */}
              {search && (
                <Command.Group heading="Search Results" className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-2 mt-4">
                  {mentions
                    .filter(m => 
                      (m.author || 'Unknown Author').toLowerCase().includes(search.toLowerCase()) ||
                      m.textSnippet.toLowerCase().includes(search.toLowerCase())
                    )
                    .slice(0, 20)
                    .map(mention => (
                      <Command.Item
                        key={mention.id}
                        onSelect={() => onSelectMention(mention)}
                        className="px-3 py-3 rounded cursor-pointer data-[selected=true]:bg-accent outline-none"
                      >
                        <div className="flex items-start gap-3">
                          <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{mention.author || 'Unknown Author'}</span>
                              <span className="text-xs text-muted-foreground">
                                {mention.platform}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {mention.textSnippet}
                            </p>
                          </div>
                        </div>
                      </Command.Item>
                    ))}
                </Command.Group>
              )}
            </Command.List>

            <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-accent rounded">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-accent rounded">↵</kbd>
                  Select
                </span>
              </div>
              <span>Cmd/Ctrl + K to open</span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
