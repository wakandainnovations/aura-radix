import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import LeftNavbar from './navigation/LeftNavbar';
// COMMENTED OUT: Old entity selection approach
// import EntitySelector from './navigation/EntitySelector';
import AddEntityModal from './navigation/AddEntityModal';
import DashboardView from './dashboard/DashboardView';
import AnalyticsView from './analytics/AnalyticsView';
import AIAnalyticsView from './analytics/AIAnalyticsView';
import CrisisFocusView from './feed/CrisisFocusView';
import CrisisManagementCenter from './crisis/CrisisManagementCenter';
import NegativeCommentSummary from './crisis/NegativeCommentSummary';
import EnhancedMetricsDashboard from './metrics/EnhancedMetricsDashboard';
import CommandPalette from './navigation/CommandPalette';
import LoginModal from './auth/LoginModal';
// Import API services
import { entityService, dashboardService, analyticsService, authService } from '../api';
// Import utilities and hooks
import { filterMentions } from '../utils/filterMentions';
import { useAuth } from '../hooks/useAuth';

// Constants
const REFETCH_INTERVAL = 300000; // 5 minutes
const ANALYTICS_REFETCH_INTERVAL = 600000; // 10 minutes
const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 minutes

// View registry for conditional rendering
const VIEW_REGISTRY = {
  dashboard: DashboardView,
  analytics: AnalyticsView,
  'ai-analytics': AIAnalyticsView,
  'crisis-center': CrisisFocusView,
  'crisis-management': CrisisManagementCenter,
  'negative-analysis': NegativeCommentSummary,
  metrics: EnhancedMetricsDashboard,
};

export default function PRCommandCenter() {
  const queryClient = useQueryClient();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [selectedMention, setSelectedMention] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  // REWORKED: New entity selection using array of entities
  const [selectedEntities, setSelectedEntities] = useState([]); // Array of selected entities
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedSentiments, setSelectedSentiments] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [commandOpen, setCommandOpen] = useState(false);
  const [addEntityModalOpen, setAddEntityModalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('60m');
  const [competitors, setCompetitors] = useState([]);
  const [dateRange, setDateRange] = useState('DAY');

  // Primary entity is the first selected entity
  const primaryEntity = selectedEntities.length > 0 ? selectedEntities[0] : null;
  const entityType = primaryEntity?.entityType || 'movie';
  
  // Cluster mode is activated when 2 or more entities are selected
  const clusterMode = selectedEntities.length >= 2;
  const clusterEntityIds = clusterMode ? selectedEntities.map(e => e.id) : [];

  // For queries: use cluster IDs if in cluster mode, otherwise use primary entity ID
  const entityIdsForQueries = clusterMode ? clusterEntityIds : (primaryEntity?.id ? [primaryEntity.id] : []);

  // Fetch all movie entities
  const { data: movieEntities = [], isLoading: moviesLoading } = useQuery({
    queryKey: ['entities', 'movie'],
    queryFn: () => entityService.getAll('movie'),
    staleTime: QUERY_STALE_TIME,
    enabled: isAuthenticated,
    select: (data) => data.map(entity => ({ ...entity, entityType: 'movie' })),
  });

  // Fetch all celebrity entities
  const { data: celebrityEntities = [], isLoading: celebritiesLoading } = useQuery({
    queryKey: ['entities', 'celebrity'],
    queryFn: () => entityService.getAll('celebrity'),
    staleTime: QUERY_STALE_TIME,
    enabled: isAuthenticated,
    select: (data) => data.map(entity => ({ ...entity, entityType: 'celebrity' })),
  });

  // Fetch mentions for primary or cluster - supports cluster mode
  const { data: mentionsData = {}, refetch: refetchMentions, isLoading: mentionsLoading } = useQuery({
    queryKey: ['mentions', entityIdsForQueries.join(','), selectedTimeRange],
    queryFn: () => {
      return dashboardService.getClusterMentions(entityIdsForQueries, {
        timeRange: selectedTimeRange,
      });
    },
    enabled: isAuthenticated && entityIdsForQueries.length > 0,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Extract mentions array from response (backend returns paginated { content: [...] })
  const mentions = Array.isArray(mentionsData?.content) ? mentionsData.content : [];

  // Fetch metrics/stats - in cluster mode, aggregates all entities; in single mode, uses primary entity
  const { data: metricsData = {}, isLoading: metricsLoading } = useQuery({
    queryKey: ['stats', clusterMode ? clusterEntityIds.join(',') : primaryEntity?.id, dateRange],
    queryFn: () => {
      if (clusterMode) {
        // In cluster mode, fetch stats for all entities
        return dashboardService.getStats(clusterEntityIds);
      } else if (primaryEntity) {
        return dashboardService.getStats([primaryEntity.id]);
      }
    },
    enabled: isAuthenticated && !!primaryEntity?.id,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Fetch sentiment trend data - supports cluster mode
  const { data: sentimentTrendRaw = {}, isLoading: trendLoading, refetch: refetchSentimentTrend } = useQuery({
    queryKey: ['sentiment-trend', clusterMode ? clusterEntityIds : primaryEntity?.id, clusterMode ? 'cluster' : entityType, dateRange],
    queryFn: () => {
      if (clusterMode) {
        // Use cluster endpoint for multiple entities
        return dashboardService.getSentimentOverTime(primaryEntity.id, dateRange, clusterEntityIds);
      } else if (primaryEntity) {
        // Use regular endpoint for single entity
        return dashboardService.getSentimentOverTime(primaryEntity.id, dateRange);
      }
    },
    enabled: isAuthenticated && !!primaryEntity?.id,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Transform sentiment trend data for 3 separate graphs (positive, neutral, negative)
  // Backend now supplies .total attribute for each sentiment type per day/week/month
  const sentimentGraphs = useMemo(() => {
    if (!sentimentTrendRaw?.entities || sentimentTrendRaw.entities.length === 0) {
      return { positive: [], total: [], negative: [] };
    }
    
    // In cluster mode, merge data from all entities; in single mode, use first entity
    const entitiesToProcess = clusterMode ? sentimentTrendRaw.entities : [sentimentTrendRaw.entities[0]];
    
    // Transform data - create separate arrays for each sentiment type
    const positiveData = [];
    const totalData = [];
    const negativeData = [];
    
    entitiesToProcess.forEach((entity, entityIndex) => {
      entity.sentiments?.forEach((item) => {
        // Handle both old format (direct values) and new format (with .total)
        const positiveTotal = item.positive?.total ?? item.positive ?? 0;
        const neutralTotal = item.neutral?.total ?? item.neutral ?? 0;
        const negativeTotal = item.negative?.total ?? item.negative ?? 0;
        const aggregateTotal = item.total?.total ?? item.total ?? (positiveTotal + neutralTotal + negativeTotal);
        
        if (clusterMode) {
          // In cluster mode, include entity name for multi-line charts
          positiveData.push({ 
            date: item.date, 
            entity: entity.name || `Entity ${entityIndex + 1}`,
            value: positiveTotal,
            total: positiveTotal 
          });
          totalData.push({ 
            date: item.date, 
            entity: entity.name || `Entity ${entityIndex + 1}`,
            value: aggregateTotal,
            total: aggregateTotal 
          });
          negativeData.push({ 
            date: item.date, 
            entity: entity.name || `Entity ${entityIndex + 1}`,
            value: negativeTotal,
            total: negativeTotal 
          });
        } else {
          // In single mode, simple date + value format
          positiveData.push({ date: item.date, value: positiveTotal, total: positiveTotal });
          totalData.push({ date: item.date, value: aggregateTotal, total: aggregateTotal });
          negativeData.push({ date: item.date, value: negativeTotal, total: negativeTotal });
        }
      });
    });
    
    return { positive: positiveData, total: totalData, negative: negativeData };
  }, [sentimentTrendRaw, clusterMode]);

  // Legacy sentimentTrend for backward compatibility
  const sentimentTrend = useMemo(() => {
    if (!sentimentTrendRaw?.entities || sentimentTrendRaw.entities.length === 0) {
      return [];
    }
    const firstEntity = sentimentTrendRaw.entities[0];
    return firstEntity.sentiments.map(item => ({
      date: item.date,
      positive: item.positive || 0,
      negative: item.negative || 0,
      neutral: item.neutral || 0,
    }));
  }, [sentimentTrendRaw]);

  // Fetch platform breakdown - supports cluster mode
  // Response format: { PLATFORM: { POSITIVE: number, NEGATIVE: number, NEUTRAL: number } }
  const { data: platformData = {}, isLoading: platformLoading } = useQuery({
    queryKey: ['platform-mentions', clusterMode ? clusterEntityIds : primaryEntity?.id, clusterMode ? 'cluster' : entityType, dateRange],
    queryFn: () => {
      if (clusterMode) {
        // Use cluster endpoint for multiple entities
        return dashboardService.getClusterPlatformMentions(clusterEntityIds);
      } else if (primaryEntity) {
        // Use regular endpoint for single entity
        return dashboardService.getPlatformMentions(primaryEntity.id);
      }
    },
    enabled: isAuthenticated && !!primaryEntity?.id,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Fetch competitive data (for primary entity)
  const { data: competitiveData = [], isLoading: competitiveLoading } = useQuery({
    queryKey: ['competitive-snapshot', primaryEntity?.id, entityType],
    queryFn: () =>
      dashboardService.getCompetitorSnapshot(primaryEntity?.id),
    enabled: isAuthenticated && !!primaryEntity?.id,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Fetch analytics data
  const { data: analyticsData = {} } = useQuery({
    queryKey: ['analytics', entityType],
    queryFn: async () => {
      if (entityType === 'movie') {
        // Generate ISO format date (today)
        const today = new Date().toISOString().split('T')[0];
        return {
          // topBoxOffice: await analyticsService.getTopBoxOffice(today), // DISABLED
          // genreTrends: await analyticsService.getTrendingGenre(today), // DISABLED
          hitGenres: await analyticsService.getHitGenrePrediction(),
        };
      }
      return {};
    },
    enabled: isAuthenticated,
    refetchInterval: ANALYTICS_REFETCH_INTERVAL,
  });

  // Memoize filtered mentions
  const filteredMentions = useMemo(
    () => filterMentions(mentions, { 
      platforms: selectedPlatforms, 
      sentiments: selectedSentiments, 
      statuses: selectedStatuses 
    }),
    [mentions, selectedPlatforms, selectedSentiments, selectedStatuses]
  );

  // Memoize query invalidation callback
  const handleFetchData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['entities'] });
    queryClient.invalidateQueries({ queryKey: ['mentions'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    queryClient.invalidateQueries({ queryKey: ['sentiment-trend'] });
    queryClient.invalidateQueries({ queryKey: ['platform-mentions'] });
    queryClient.invalidateQueries({ queryKey: ['competitive-snapshot'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
  }, [queryClient]);

  const handleRefreshCurrentEntities = useCallback(async () => {
    if (!primaryEntity?.id || entityIdsForQueries.length === 0) return;

    const mentionsKey = ['mentions', entityIdsForQueries.join(','), selectedTimeRange];
    const statsKey = ['stats', clusterMode ? clusterEntityIds.join(',') : primaryEntity.id, dateRange];
    const trendKey = ['sentiment-trend', clusterMode ? clusterEntityIds : primaryEntity.id, clusterMode ? 'cluster' : entityType, dateRange];
    const platformKey = ['platform-mentions', clusterMode ? clusterEntityIds : primaryEntity.id, clusterMode ? 'cluster' : entityType, dateRange];
    const competitiveKey = ['competitive-snapshot', primaryEntity.id, entityType];
    const analyticsKey = ['analytics', entityType];

    await Promise.all([
      queryClient.refetchQueries({ queryKey: mentionsKey, type: 'active' }),
      queryClient.refetchQueries({ queryKey: statsKey, type: 'active' }),
      queryClient.refetchQueries({ queryKey: trendKey, type: 'active' }),
      queryClient.refetchQueries({ queryKey: platformKey, type: 'active' }),
      queryClient.refetchQueries({ queryKey: competitiveKey, type: 'active' }),
      queryClient.refetchQueries({ queryKey: analyticsKey, type: 'active' }),
    ]);
  }, [
    queryClient,
    primaryEntity?.id,
    entityIdsForQueries,
    selectedTimeRange,
    clusterMode,
    clusterEntityIds,
    dateRange,
    entityType,
  ]);

  // Get current entity types from selectedEntities
  const movieEntitiesSelected = selectedEntities.filter(e => e.entityType === 'movie');
  const celebrityEntitiesSelected = selectedEntities.filter(e => e.entityType === 'celebrity');

  // Combine entities arrays for display
  const combinedEntities = [...movieEntities, ...celebrityEntities];

  // Derived state: hasLoadedEntities
  const hasLoadedEntities = (movieEntities.length > 0 || celebrityEntities.length > 0) && (!moviesLoading && !celebritiesLoading);
  const isLoadingEntities = (moviesLoading || celebritiesLoading) && !hasLoadedEntities;
  const isLoading = (mentionsLoading || metricsLoading) && hasLoadedEntities;

  // Handle adding competitors (accepts array of entities)
  const handleAddCompetitor = useCallback(async (entitiesToAdd) => {
    try {
      // Ensure entitiesToAdd is an array
      const newEntities = Array.isArray(entitiesToAdd) ? entitiesToAdd : [entitiesToAdd];
      
      // Extract new competitor IDs from the entities being added
      const newCompetitorIds = newEntities
        .map(e => e.id)
        .filter(id => id !== undefined && id !== null);
      
      // Extract existing competitor IDs from competitiveData array
      // competitiveData is an array: [mainEntity, competitor1, competitor2, ...]
      const competitorIds = competitiveData
        .slice(1) // Skip the main entity (first item)
        .map(c => {
          if (c.id !== undefined) return c.id;
          if (c.entityId !== undefined) return c.entityId;
          return undefined;
        })
        .filter(id => id !== undefined && id !== null);
      
      // Combine existing and new competitor IDs (avoid duplicates)
      const allCompetitorIds = new Set([...competitorIds, ...newCompetitorIds]);
      const updatedCompetitorIds = Array.from(allCompetitorIds);
      
      // Make a SINGLE API call with all competitor IDs
      await entityService.updateCompetitors(entityType, primaryEntity.id, updatedCompetitorIds);
      
      // Invalidate the competitive snapshot query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['competitive-snapshot', primaryEntity?.id, entityType] });
    } catch (error) {
      console.error('Error adding competitors:', error);
    }
  }, [queryClient, entityType, primaryEntity?.id, competitiveData]);

  // Handle adding a new entity to the selected entities (max 5)
  const handleAddEntity = useCallback((entity) => {
    setSelectedEntities(prev => {
      // Check if entity is already selected
      if (prev.some(e => e.id === entity.id)) {
        return prev;
      }
      // Check if max entities reached (5)
      if (prev.length >= 5) {
        alert('Maximum 5 entities can be selected');
        return prev;
      }
      return [...prev, entity];
    });
  }, []);

  // Handle removing an entity from selection
  const handleRemoveEntity = useCallback((entityId) => {
    setSelectedEntities(prev => prev.filter(e => e.id !== entityId));
  }, []);

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Left Navbar */}
      <div className="w-64">
        <LeftNavbar activeTab={activeView} onTabChange={setActiveView} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
      {/* Header with Entity Selection - REWORKED */}
        <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">Command Center</h1>
            <div className="h-6 w-px bg-border" />
            
            {/* Display Selected Entities */}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedEntities.length === 0 ? (
                <span className="text-sm text-muted-foreground italic">No entities selected</span>
              ) : (
                <>
                  {clusterMode && (
                    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/50 text-xs font-semibold text-yellow-600">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                      Cluster Mode
                    </span>
                  )}
                  {selectedEntities.map((entity, index) => (
                    <div
                      key={entity.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                        index === 0
                          ? 'bg-primary/10 border-primary bg-gradient-to-r from-primary/20 to-primary/5'
                          : 'bg-accent border-border'
                      }`}
                    >
                      {index === 0 && (
                        <span className="text-xs font-semibold text-primary uppercase">Primary</span>
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {entity.name}
                      </span>
                      <button
                        onClick={() => handleRemoveEntity(entity.id)}
                        className="ml-1 p-0.5 hover:bg-red-600/20 hover:text-red-600 rounded transition-colors"
                        title="Remove entity"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Add Entity Button - only shown when authenticated */}
            {isAuthenticated && (
              <button
                onClick={() => setAddEntityModalOpen(true)}
                disabled={selectedEntities.length >= 5}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-medium border border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={selectedEntities.length >= 5 ? 'Maximum 5 entities allowed' : 'Add entity'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Entity
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <button
                onClick={() => setLoginOpen(true)}
                className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors"
              >
                Login
              </button>
            ) : (
              <>
                <button
                  onClick={handleRefreshCurrentEntities}
                  disabled={!primaryEntity?.id}
                  className="px-3 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title={primaryEntity?.id ? 'Refresh all data for selected entities' : 'Select an entity to refresh data'}
                >
                  <RotateCcw className="w-4 h-4" />
                  Refresh
                </button>
                <span className="text-sm text-muted-foreground">Logged in</span>
                <button
                  onClick={() => {
                    authService.logout();
                    setIsAuthenticated(false);
                    setSelectedEntities([]);
                    setAddEntityModalOpen(false);
                  }}
                  className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-red-600 text-white hover:opacity-90 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        {/* Unauthenticated Screen - Show when not logged in */}
        {!isAuthenticated && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-5xl font-bold text-foreground mb-4">Welcome to Project Aura</h2>
              <p className="text-muted-foreground mb-8">Please log in to get started</p>
              <button
                onClick={() => setLoginOpen(true)}
                className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors"
              >
                Open Login
              </button>
            </div>
          </div>
        )}

        {/* Welcome Screen - Show on first load before entities are fetched */}
        {isAuthenticated && isLoadingEntities && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-5xl font-bold text-foreground mb-4">Welcome to Project Aura</h2>
              <p className="text-muted-foreground mb-8">Loading your entities...</p>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          </div>
        )}

        {/* Welcome Screen - Show when no entity is selected yet */}
        {isAuthenticated && hasLoadedEntities && selectedEntities.length === 0 && !isLoadingEntities && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-5xl font-bold text-foreground mb-4">Welcome to Project Aura</h2>
              <p className="text-muted-foreground">Click "Add Entity" above to select a movie or celebrity to get started</p>
            </div>
          </div>
        )}

        {/* Loading state for data after entity is selected */}
        {isLoading && selectedEntities.length > 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          </div>
        )}

        {/* Views Router */}
        {isAuthenticated && !isLoading && selectedEntities.length > 0 && (
          <>
            {activeView === 'dashboard' && !primaryEntity && (
              <div className="h-full flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                  <p className="text-lg font-semibold text-foreground">Select an entity to view the dashboard</p>
                  <p className="text-sm text-muted-foreground">Click "Add Entity" in the header to select</p>
                </div>
              </div>
            )}
            {activeView === 'dashboard' && primaryEntity && (
              <DashboardView
                selectedEntity={primaryEntity}
                entityType={entityType}
                competitiveData={competitiveData}
                entities={combinedEntities}
                onAddCompetitor={handleAddCompetitor}
                mentions={filteredMentions}
                platformData={platformData}
                stats={metricsData}
                sentimentData={sentimentTrend}
                sentimentGraphs={sentimentGraphs}
                sentimentTrendRaw={sentimentTrendRaw}
                clusterMode={clusterMode}
                clusterEntities={selectedEntities}
                dateRange={dateRange}
                setDateRange={setDateRange}
                onMentionSelect={setSelectedMention}
                onRefresh={refetchSentimentTrend}
              />
            )}
            {activeView === 'analytics' && !primaryEntity && (
              <div className="h-full flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                  <p className="text-lg font-semibold text-foreground">Select an entity to view analytics</p>
                  <p className="text-sm text-muted-foreground">Click "Add Entity" in the header to select</p>
                </div>
              </div>
            )}
            {activeView === 'analytics' && primaryEntity && (
              <AnalyticsView
                selectedEntity={primaryEntity}
                entityType={entityType}
                mentions={filteredMentions}
                stats={metricsData}
                sentimentData={sentimentTrend}
                sentimentGraphs={sentimentGraphs}
                platformData={platformData}
                clusterMode={clusterMode}
                clusterEntities={selectedEntities}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            )}
            {activeView === 'ai-analytics' && !primaryEntity && (
              <div className="h-full flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                  <p className="text-lg font-semibold text-foreground">Select an entity to view analytics</p>
                  <p className="text-sm text-muted-foreground">Click "Add Entity" in the header to select</p>
                </div>
              </div>
            )}
            {activeView === 'ai-analytics' && primaryEntity && (
              <AIAnalyticsView
                selectedEntity={primaryEntity}
                entityType={entityType}
                analyticsData={analyticsData}
              />
            )}
            {activeView === 'crisis-center' && !primaryEntity && (
              <div className="h-full flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                  <p className="text-lg font-semibold text-foreground">Select an entity to view crisis center</p>
                  <p className="text-sm text-muted-foreground">Click "Add Entity" in the header to select</p>
                </div>
              </div>
            )}
            {activeView === 'crisis-center' && primaryEntity && (
              <CrisisFocusView
                selectedEntity={primaryEntity}
                entityType={entityType}
                mentions={filteredMentions}
                onMentionSelect={setSelectedMention}
              />
            )}
            {activeView === 'crisis-management' && !primaryEntity && (
              <div className="h-full flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                  <p className="text-lg font-semibold text-foreground">Select an entity to view crisis management</p>
                  <p className="text-sm text-muted-foreground">Click "Add Entity" in the header to select</p>
                </div>
              </div>
            )}
            {activeView === 'crisis-management' && primaryEntity && (
              <CrisisManagementCenter
                selectedEntity={primaryEntity}
                entityType={entityType}
                mentions={filteredMentions}
              />
            )}
            {activeView === 'negative-analysis' && !primaryEntity && (
              <div className="h-full flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                  <p className="text-lg font-semibold text-foreground">Select an entity to view analysis</p>
                  <p className="text-sm text-muted-foreground">Click "Add Entity" in the header to select</p>
                </div>
              </div>
            )}
            {activeView === 'negative-analysis' && primaryEntity && (
              <NegativeCommentSummary
                selectedEntity={primaryEntity}
                entityType={entityType}
                mentions={filteredMentions}
              />
            )}
            {activeView === 'metrics' && !primaryEntity && (
              <div className="h-full flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                  <p className="text-lg font-semibold text-foreground">Select an entity to view metrics</p>
                  <p className="text-sm text-muted-foreground">Click "Add Entity" in the header to select</p>
                </div>
              </div>
            )}
            {activeView === 'metrics' && primaryEntity && (
              <EnhancedMetricsDashboard
                selectedEntity={primaryEntity}
                entityType={entityType}
                stats={metricsData}
                mentions={filteredMentions}
              />
            )}
          </>
        )}
      </div>

      {/* Command Palette */}
      <CommandPalette 
        open={commandOpen} 
        onOpenChange={setCommandOpen}
        mentions={filteredMentions}
        onSelectMention={setSelectedMention}
        onRefresh={refetchMentions}
      />

      {/* Add Entity Modal - REWORKED */}
      {isAuthenticated && (
        <AddEntityModal
          open={addEntityModalOpen}
          onOpenChange={setAddEntityModalOpen}
          onEntitySelect={handleAddEntity}
          movieEntities={movieEntities}
          celebrityEntities={celebrityEntities}
          currentEntityIds={selectedEntities.map(e => e.id)}
        />
      )}

      {/* Login Modal */}
      <LoginModal 
        open={loginOpen} 
        onOpenChange={setLoginOpen}
        onLoginSuccess={() => {
          // Set authenticated state
          setIsAuthenticated(true);
          
          // Refetch entities and other queries now that we're authenticated
          handleFetchData();
        }}
      />
    </div>
  );
}
