import React, { useState, useCallback } from 'react';
import { Search, ThumbsUp, ThumbsDown } from 'lucide-react';
import { auraMathService } from '../../api/auraMathService';
import {
  PlatformBadge, CollapsibleKV,
  Section, KeywordSearch,
} from './audienceIntelShared';

function AspectDriversDisplay({ data }) {
  if (!data) return null;
  const platforms = data.totalPostsAnalyzed || {};
  const platformEntries = Object.entries(platforms).filter(([k]) => k !== 'total');
  return (
    <div className="mt-3 space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="bg-background border border-border rounded-lg px-4 py-3 text-center">
          <p className="text-lg font-bold text-foreground">{(platforms.total ?? 0).toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Posts</p>
        </div>
        {platformEntries.map(([plat, count]) => (
          <div key={plat} className="bg-background border border-border rounded-lg px-4 py-3 text-center">
            <p className="text-lg font-bold text-foreground">{(count ?? 0).toLocaleString()}</p>
            <p className="text-[10px] uppercase tracking-wider"><PlatformBadge platform={plat} /></p>
          </div>
        ))}
      </div>
      {data.keyword && (
        <p className="text-xs text-muted-foreground">Keyword: <span className="text-foreground font-medium">{data.keyword}</span></p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.strengths && data.strengths.length > 0 && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Strengths</p>
            <ul className="space-y-1">
              {data.strengths.map((s, i) => (
                <li key={i} className="text-xs text-emerald-300/80">
                  {typeof s === 'object' ? (
                    <span><span className="font-medium">{s.aspect}</span> — sentiment {s.averageSentiment?.toFixed(1)}, {s.postsMentioning} posts, impact {s.impactScore?.toFixed(1)}</span>
                  ) : s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.weaknesses && data.weaknesses.length > 0 && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> Weaknesses</p>
            <ul className="space-y-1">
              {data.weaknesses.map((w, i) => (
                <li key={i} className="text-xs text-red-300/80">
                  {typeof w === 'object' ? (
                    <span><span className="font-medium">{w.aspect}</span> — sentiment {w.averageSentiment?.toFixed(1)}, {w.postsMentioning} posts, impact {w.impactScore?.toFixed(1)}</span>
                  ) : w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {data.byPlatform && Object.keys(data.byPlatform).length > 0 && (
        <CollapsibleKV title="Per-Platform Breakdown" data={data.byPlatform} />
      )}
    </div>
  );
}

export default function ContentAnalysisView() {
  const [aspectDrivers, setAspectDrivers] = useState(null);
  const [loading, setLoading] = useState({});

  const withLoading = useCallback(async (key, fn) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      return await fn();
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Search className="w-7 h-7 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Content Analysis</h2>
            <p className="text-sm text-muted-foreground">Analyze aspect-level sentiment drivers across platforms</p>
          </div>
        </div>

        <Section icon={Search} title="Aspect Drivers" color="text-blue-400">
          <KeywordSearch
            label="Enter keyword for aspect drivers..."
            loading={loading.aspectDrivers}
            onSearch={(kw) => withLoading('aspectDrivers', () => auraMathService.getAspectDrivers(kw).then(setAspectDrivers))}
          />
          <AspectDriversDisplay data={aspectDrivers} />
        </Section>
      </div>
    </div>
  );
}
