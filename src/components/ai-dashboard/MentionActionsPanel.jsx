import React, { useState, useEffect } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { dashboardService } from '../../api/dashboardService';
import MentionActionCard from './MentionActionCard';

export default function MentionActionsPanel({ entityId }) {
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!entityId) return;
    setLoading(true);
    dashboardService.getMentions(entityId, { page, size: 10 })
      .then((result) => {
        setMentions(result.content || []);
      })
      .catch(() => setMentions([]))
      .finally(() => setLoading(false));
  }, [entityId, page]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-foreground">Mention Actions</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : mentions.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">No mentions found</div>
      ) : (
        <div className="space-y-2">
          {mentions.map((mention) => (
            <MentionActionCard key={mention.id} mention={mention} />
          ))}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-xs rounded-lg bg-accent text-muted-foreground disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-xs text-muted-foreground">Page {page + 1}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={mentions.length < 10}
              className="px-3 py-1 text-xs rounded-lg bg-accent text-muted-foreground disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
