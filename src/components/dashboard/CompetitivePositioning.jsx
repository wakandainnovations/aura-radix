import React, { useState, useMemo } from 'react';
import { Target, MessageSquare, TrendingUp, Zap, Plus, X } from 'lucide-react';

export default function CompetitivePositioning({ competitiveData = [], entities = [], onAddCompetitor = null, entityType = 'movie' }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEntities, setSelectedEntities] = useState([]);

  // Filter entities to exclude already added competitors
  const availableEntities = useMemo(() => {
    const competitorIds = new Set(competitiveData.map(c => c.id));
    return entities.filter(entity => {
      const notAlreadyAdded = !competitorIds.has(entity.id);
      // Business rule: if primary entity is a movie, only movies can be added as competitors
      const matchesPrimaryType = entityType === 'movie' ? entity.entityType === 'movie' : true;
      return notAlreadyAdded && matchesPrimaryType;
    });
  }, [entities, competitiveData, entityType]);

  // Handle tag selection for multi-select
  const handleSelectEntity = (entity) => {
    setSelectedEntities(prev => {
      const isSelected = prev.some(e => e.id === entity.id);
      if (isSelected) {
        return prev.filter(e => e.id !== entity.id);
      } else {
        return [...prev, entity];
      }
    });
  };
  const formatMentions = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const formatPercentage = (value) => {
    // If value is already a ratio (0-1), multiply by 100
    if (value <= 1) {
      return Math.round(value * 100);
    }
    // If value is already a percentage (0-100), round it
    return Math.round(value);
  };

  const getPositiveRatioColor = (ratio) => {
    const percentage = ratio <= 1 ? ratio * 100 : ratio;
    if (percentage >= 60) return 'text-green-500';
    if (percentage >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPositiveRatioBarColor = (ratio) => {
    const percentage = ratio <= 1 ? ratio * 100 : ratio;
    if (percentage >= 60) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getNetSentimentColor = (score) => {
    if (score > 1.5) return 'text-green-500';
    if (score >= 1.0) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Competitor Snapshot</h3>
        </div>
        {onAddCompetitor && availableEntities.length > 0 && (
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Competitor
          </button>
        )}
      </div>

      {/* Add Competitor Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-foreground">Add Competitor</h4>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setSelectedEntities([]);
                }}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Entity List as Tags */}
            <div className="mb-4 p-4 bg-accent/20 rounded-lg border border-border">
              {availableEntities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableEntities.map((entity) => (
                    <button
                      key={entity.id}
                      onClick={() => handleSelectEntity(entity)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                        selectedEntities.some(e => e.id === entity.id)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent/50'
                      }`}
                      title={entity.description}
                    >
                      {entity.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All entities are already added as competitors
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setSelectedEntities([]);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedEntities.length > 0 && onAddCompetitor) {
                    // Pass all selected entities at once (single API call)
                    onAddCompetitor(selectedEntities);
                    setShowAddDialog(false);
                    setSelectedEntities([]);
                  }
                }}
                disabled={selectedEntities.length === 0}
                className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add ({selectedEntities.length})
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-0">
        {competitiveData && competitiveData.length > 0 ? (
          competitiveData.map((competitor, idx) => (
            <div 
              key={idx}
              className="p-4 bg-accent/30 border border-border rounded-lg hover:border-primary/50 transition-colors"
            >
              {/* Competitor Name */}
              <h4 className="text-sm font-semibold text-primary mb-2">
                {competitor.entityName}
              </h4>

              {/* Total Mentions */}
              <div className="mb-2 pb-2 border-b border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Mentions
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatMentions(competitor.totalMentions)}
                  </span>
                </div>
              </div>

              {/* Sentiment Metrics */}
              <div className="space-y-2">
                {/* Overall Sentiment */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Overall Sentiment
                  </span>
                  <span className="text-sm font-semibold text-blue-500">
                    {formatPercentage(competitor.overallSentiment)}%
                  </span>
                </div>

                {/* Positive Ratio Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Positive Ratio
                    </span>
                    <span className={`text-sm font-semibold ${getPositiveRatioColor(competitor.positiveRatio)}`}>
                      {formatPercentage(competitor.positiveRatio)}%
                    </span>
                  </div>
                  
                  {/* Positive Ratio Bar */}
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getPositiveRatioBarColor(competitor.positiveRatio)} transition-all`}
                      style={{ width: `${formatPercentage(competitor.positiveRatio)}%` }}
                    />
                  </div>
                </div>

                {/* Net Sentiment Score */}
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    Net Sentiment
                  </span>
                  <span className={`text-sm font-semibold ${getNetSentimentColor(competitor.netSentimentScore)}`}>
                    {competitor.netSentimentScore.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-12 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm">No competitor data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
