import React, { useState, useEffect } from 'react';
import { Gift, TrendingUp, TrendingDown, AlertTriangle, Users, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('whatsNew.collapsed') === 'true'
  );

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('whatsNew.collapsed', String(next));
      return next;
    });
  };

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

  // Welcome-back digest: stay hidden entirely while loading and when there's
  // nothing new, so the dashboard isn't left with an empty bordered box.
  if (loading) return null;
  if (!cards || cards.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="space-y-3">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          className="flex w-full items-center gap-2 mb-4 text-left"
        >
          <Gift className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-foreground">What's New</h3>
          <span className="ml-1 text-xs text-muted-foreground">({cards.length})</span>
          {collapsed
            ? <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
            : <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto" />}
        </button>
        {!collapsed && (
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
        )}
      </div>
    </div>
  );
}
