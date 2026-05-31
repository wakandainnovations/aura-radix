import React, { useState, useEffect } from 'react';
import { Gift, TrendingUp, TrendingDown, AlertTriangle, Users, ShieldCheck, Loader2 } from 'lucide-react';
import { dashboardService } from '../../api/dashboardService';

// Keys match WhatsNewCard.kind from the backend.
const ICON_MAP = {
  ABUSE_REPORT_UPHELD: ShieldCheck,
  COMPETITOR_DROP: TrendingDown,
  NEW_POSITIVE_SUPER_SPREADER: Users,
  SENTIMENT_RISE: TrendingUp,
  NEGATIVE_SPIKE: AlertTriangle,
};

const COLOR_MAP = {
  ABUSE_REPORT_UPHELD: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  COMPETITOR_DROP: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  NEW_POSITIVE_SUPER_SPREADER: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  SENTIMENT_RISE: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  NEGATIVE_SPIKE: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function WhatsNewCards({ entityId }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) return;
    const controller = new AbortController();
    setLoading(true);
    dashboardService.getWhatsNew(entityId, { signal: controller.signal })
      .then((result) => {
        const items = Array.isArray(result) ? result : (result?.cards || result?.items || []);
        setCards(items);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setCards([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [entityId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No new updates since your last visit
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-foreground">What's New</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((card, idx) => {
          const Icon = ICON_MAP[card.kind] || Gift;
          const colorClass = COLOR_MAP[card.kind] || 'text-slate-400 bg-slate-400/10 border-slate-400/20';
          return (
            <div
              key={idx}
              className={`rounded-xl border p-4 ${colorClass}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{card.headline}</p>
                  {card.value != null && (
                    <p className="text-xs mt-1 opacity-80">
                      {card.value > 0 ? '+' : ''}{typeof card.value === 'number' ? card.value.toFixed(1) : card.value}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
