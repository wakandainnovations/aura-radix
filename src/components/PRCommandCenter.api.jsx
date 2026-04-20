import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import LeftNavbar from './navigation/LeftNavbar';
import EntitySelector from './navigation/EntitySelector';
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
import { entityService, dashboardService, analyticsService } from '../api';
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
  const [selectedMovieEntity, setSelectedMovieEntity] = useState(null);
  const [selectedCelebrityEntity, setSelectedCelebrityEntity] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedSentiments, setSelectedSentiments] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [commandOpen, setCommandOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('60m');
  const [competitors, setCompetitors] = useState([]);
  const [dateRange, setDateRange] = useState('DAY');
  const [clearErrorBorder, setClearErrorBorder] = useState(null); // 'movie' or 'celebrity' or null

  // Determine which entity is currently selected (prefer movie, fallback to celebrity)
  const selectedEntity = selectedMovieEntity || selectedCelebrityEntity;
  const entityType = selectedMovieEntity ? 'movie' : 'celebrity';
  
  // Determine if we're in cluster mode (both movie AND celebrity selected)
  const clusterMode = selectedMovieEntity && selectedCelebrityEntity;
  const clusterEntityIds = clusterMode ? [selectedMovieEntity.id, selectedCelebrityEntity.id] : [];

  // Fetch all movie entities
  const { data: movieEntities = [], isLoading: moviesLoading } = useQuery({
    queryKey: ['entities', 'movie'],
    queryFn: () => entityService.getAll('movie'),
    staleTime: QUERY_STALE_TIME,
    enabled: isAuthenticated,
  });

  // Fetch all celebrity entities
  const { data: celebrityEntities = [], isLoading: celebritiesLoading } = useQuery({
    queryKey: ['entities', 'celebrity'],
    queryFn: () => entityService.getAll('celebrity'),
    staleTime: QUERY_STALE_TIME,
    enabled: isAuthenticated,
  });

  // No default selection - user must manually select Movie and Celebrity entities

  // Fetch mentions for selected entity (or cluster)
  const { data: mentionsData = {}, refetch: refetchMentions, isLoading: mentionsLoading } = useQuery({
    queryKey: ['mentions', clusterMode ? clusterEntityIds : selectedEntity?.id, clusterMode ? 'cluster' : entityType, selectedTimeRange],
    queryFn: () => {
      if (clusterMode) {
        return dashboardService.getClusterMentions(clusterEntityIds, {
          timeRange: selectedTimeRange,
        });
      } else {
        return dashboardService.getMentions(selectedEntity?.id, {
          timeRange: selectedTimeRange,
        });
      }
    },
    enabled: isAuthenticated && !!selectedEntity?.id,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Extract mentions array from response (backend returns paginated { content: [...] })
  const mentions = Array.isArray(mentionsData?.content) ? mentionsData.content : [];

  // Fetch metrics/stats for selected entity - ALWAYS use movie stats for KPIs
  // Do not override with cluster stats when celebrity is selected
  const { data: metricsData = {}, isLoading: metricsLoading } = useQuery({
    queryKey: ['stats', selectedMovieEntity?.id, selectedCelebrityEntity?.id, dateRange],
    queryFn: () => {
      // Always prioritize movie stats for KPIs, even if celebrity is also selected
      if (selectedMovieEntity) {
        return dashboardService.getStats([selectedMovieEntity.id]);
      } else if (selectedCelebrityEntity) {
        return dashboardService.getStats([selectedCelebrityEntity.id]);
      }
    },
    enabled: isAuthenticated && !!selectedEntity?.id,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Fetch sentiment trend data
  const { data: sentimentTrendRaw = {}, isLoading: trendLoading, refetch: refetchSentimentTrend } = useQuery({
    queryKey: ['sentiment-trend', clusterMode ? clusterEntityIds : selectedEntity?.id, clusterMode ? 'cluster' : entityType, dateRange],
    queryFn: () => {
      // dateRange is already in API format (DAY, WEEK, MONTH)
      if (clusterMode) {
        return dashboardService.getSentimentOverTime(selectedMovieEntity.id, dateRange, clusterEntityIds);
      } else {
        return dashboardService.getSentimentOverTime(selectedEntity?.id, dateRange);
      }
    },
    enabled: isAuthenticated && !!selectedEntity?.id,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Transform sentiment trend data for chart
  const sentimentTrend = useMemo(() => {
    if (!sentimentTrendRaw?.entities || sentimentTrendRaw.entities.length === 0) {
      return [];
    }
    
    // Extract first entity's sentiments
    const firstEntity = sentimentTrendRaw.entities[0];
    return firstEntity.sentiments.map(item => ({
      date: item.date, // Use date as label (not parsed as date)
      positive: item.positive || 0,
      negative: item.negative || 0,
      neutral: item.neutral || 0,
    }));
  }, [sentimentTrendRaw]);

  // Fetch platform breakdown (or cluster)
  // Response format: { PLATFORM: { POSITIVE: number, NEGATIVE: number, NEUTRAL: number } }
  const { data: platformData = {}, isLoading: platformLoading } = useQuery({
    queryKey: ['platform-mentions', clusterMode ? clusterEntityIds : selectedEntity?.id, clusterMode ? 'cluster' : entityType, dateRange],
    queryFn: () => {
      if (clusterMode) {
        return dashboardService.getClusterPlatformMentions(clusterEntityIds);
      } else {
        return dashboardService.getPlatformMentions(selectedEntity?.id);
      }
    },
    enabled: isAuthenticated && !!selectedEntity?.id,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Fetch competitive data (only for single entity mode)
  const { data: competitiveData = [], isLoading: competitiveLoading } = useQuery({
    queryKey: ['competitive-snapshot', selectedEntity?.id, entityType],
    queryFn: () =>
      dashboardService.getCompetitorSnapshot(selectedEntity?.id),
    enabled: isAuthenticated && !!selectedEntity?.id && !clusterMode,
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
          genreTrends: await analyticsService.getTrendingGenre(today),
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

  // Combine entities arrays for display
  const entities = entityType === 'movie' ? movieEntities : celebrityEntities;
  const entitiesLoading = entityType === 'movie' ? moviesLoading : celebritiesLoading;

  // Derived state: hasLoadedEntities
  const hasLoadedEntities = entities.length > 0 && !entitiesLoading;
  const isLoadingEntities = entitiesLoading && !hasLoadedEntities;
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
      // Try id field first, then entityId, then look up by name
      const competitorIds = competitiveData
        .slice(1) // Skip the main entity (first item)
        .map(c => {
          // Try different possible ID field names
          if (c.id !== undefined) return c.id;
          if (c.entityId !== undefined) return c.entityId;
          // If no ID found, return undefined (will be filtered out)
          return undefined;
        })
        .filter(id => id !== undefined && id !== null);
      
      // Combine existing and new competitor IDs (avoid duplicates)
      const allCompetitorIds = new Set([...competitorIds, ...newCompetitorIds]);
      const updatedCompetitorIds = Array.from(allCompetitorIds);
      
      // Make a SINGLE API call with all competitor IDs
      await entityService.updateCompetitors(entityType, selectedEntity.id, updatedCompetitorIds);
      
      // Invalidate the competitive snapshot query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['competitive-snapshot', selectedEntity?.id, entityType] });
    } catch (error) {
      console.error('Error adding competitors:', error);
    }
  }, [queryClient, entityType, selectedEntity?.id, competitiveData]);

  // Handle clearing movie entity
  const handleClearMovie = useCallback(() => {
    setSelectedMovieEntity(null);
    setClearErrorBorder(null);
  }, []);

  // Handle clearing celebrity entity
  const handleClearCelebrity = useCallback(() => {
    setSelectedCelebrityEntity(null);
    setClearErrorBorder(null);
  }, []);

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Left Navbar */}
      <div className="w-64">
        <LeftNavbar activeTab={activeView} onTabChange={setActiveView} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Entity Selectors */}
        <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">PR Command Center</h1>
            <div className="h-6 w-px bg-border" />
            
            {/* Movie Entity Selector */}
            <div className={`flex items-center gap-2 ${clearErrorBorder === 'movie' ? 'border-2 border-red-500 rounded px-2 py-1' : ''}`}>
              <EntitySelector
                selectedEntity={selectedMovieEntity}
                onEntityChange={setSelectedMovieEntity}
                entities={movieEntities}
                entityType="movie"
              />
              {selectedMovieEntity && (
                <button
                  onClick={handleClearMovie}
                  className="p-1 hover:bg-red-600 hover:text-white rounded transition-colors"
                  title="Clear movie selection"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            <div className="h-6 w-px bg-border" />
            
            {/* Celebrity Entity Selector */}
            <div className={`flex items-center gap-2 ${clearErrorBorder === 'celebrity' ? 'border-2 border-red-500 rounded px-2 py-1' : ''}`}>
              <EntitySelector
                selectedEntity={selectedCelebrityEntity}
                onEntityChange={setSelectedCelebrityEntity}
                entities={celebrityEntities}
                entityType="celebrity"
              />
              {selectedCelebrityEntity && (
                <button
                  onClick={handleClearCelebrity}
                  className="p-1 hover:bg-red-600 hover:text-white rounded transition-colors"
                  title="Clear celebrity selection"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            <div className="h-6 w-px bg-border" />
          </div>

          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <button
                onClick={() => setLoginOpen(true)}
                className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors"
              >
                Login
              </button>
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
        {isAuthenticated && hasLoadedEntities && !selectedEntity && !isLoadingEntities && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-5xl font-bold text-foreground mb-4">Welcome to Project Aura</h2>
              <p className="text-muted-foreground">Select a movie/celebrity to show statistics</p>
            </div>
          </div>
        )}

        {/* Loading state for data after entity is selected */}
        {isLoading && selectedEntity && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          </div>
        )}

        {/* Views Router */}
        {isAuthenticated && !isLoading && selectedEntity && (
          <>
            {activeView === 'dashboard' && (
              <DashboardView
                selectedEntity={selectedEntity}
                entityType={entityType}
                competitiveData={competitiveData}
                entities={entities}
                onAddCompetitor={handleAddCompetitor}
                mentions={filteredMentions}
                platformData={platformData}
                stats={metricsData}
                sentimentData={sentimentTrend}
                sentimentTrendRaw={sentimentTrendRaw}
                clusterMode={clusterMode}
                dateRange={dateRange}
                setDateRange={setDateRange}
                onMentionSelect={setSelectedMention}
                onRefresh={refetchSentimentTrend}
              />
            )}
            {activeView === 'analytics' && (
              <AnalyticsView
                selectedEntity={selectedEntity}
                entityType={entityType}
                mentions={filteredMentions}
                stats={metricsData}
                sentimentData={sentimentTrend}
                platformData={platformData}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            )}
            {activeView === 'ai-analytics' && (
              <AIAnalyticsView
                selectedEntity={selectedEntity}
                entityType={entityType}
                analyticsData={analyticsData}
              />
            )}
            {activeView === 'crisis-center' && (
              <CrisisFocusView
                selectedEntity={selectedEntity}
                entityType={entityType}
                mentions={filteredMentions}
                onMentionSelect={setSelectedMention}
              />
            )}
            {activeView === 'crisis-management' && (
              <CrisisManagementCenter
                selectedEntity={selectedEntity}
                entityType={entityType}
                mentions={filteredMentions}
              />
            )}
            {activeView === 'negative-analysis' && (
              <NegativeCommentSummary
                selectedEntity={selectedEntity}
                entityType={entityType}
                mentions={filteredMentions}
              />
            )}
            {activeView === 'metrics' && (
              <EnhancedMetricsDashboard
                selectedEntity={selectedEntity}
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

      {/* Login Modal */}
      <LoginModal 
        open={loginOpen} 
        onOpenChange={setLoginOpen}
        onLoginSuccess={() => {
          // Set authenticated state
          setIsAuthenticated(true);
          
          // Invalidate all queries to trigger fresh fetches with JWT token
          setTimeout(() => {
            handleFetchData();
          }, 100); // Small delay to ensure localStorage is synced
        }}
      />
    </div>
  );
}
