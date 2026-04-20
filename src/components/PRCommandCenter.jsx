import React, { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useQuery } from '@tanstack/react-query';
import LeftNavbar from './navigation/LeftNavbar';
import EntitySelector from './navigation/EntitySelector';
import PlatformMultiSelect from './navigation/PlatformMultiSelect';
import SentimentFilter from './navigation/SentimentFilter';
import TimeRangeFilter from './navigation/TimeRangeFilter';
import ReplyStatusFilter from './navigation/ReplyStatusFilter';
import DashboardView from './dashboard/DashboardView';
import AnalyticsView from './analytics/AnalyticsView';
import AIAnalyticsView from './analytics/AIAnalyticsView';
import CrisisFocusView from './feed/CrisisFocusView';
import CrisisPlanGenerator from './crisis/CrisisPlanGenerator';
import NegativeCommentSummary from './crisis/NegativeCommentSummary';
import EnhancedMetricsDashboard from './metrics/EnhancedMetricsDashboard';
import CommandPalette from './navigation/CommandPalette';
import LoginModal from './auth/LoginModal';
import { generateMentions, generateMetricsData, generateCompetitiveData, movies, celebrities } from '../dummydata';

export default function PRCommandCenter() {
  const [selectedMention, setSelectedMention] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'analytics', 'crisis-center', 'negative-analysis'
  const [entityType, setEntityType] = useState('movie'); // 'movie' or 'celebrity'
  const [selectedEntity, setSelectedEntity] = useState(null); // No default selection
  const [selectedPlatforms, setSelectedPlatforms] = useState([]); // Empty = all platforms
  const [selectedSentiments, setSelectedSentiments] = useState([]); // Empty = all sentiments
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h'); // Default to 24 hours
  const [selectedStatuses, setSelectedStatuses] = useState([]); // Empty = all statuses
  const [commandOpen, setCommandOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('60m'); // '60m', '24h', '7d', '30d', '6m', '1y'
  const [competitors, setCompetitors] = useState([]); // Competitors state lifted to parent
  const [dateRange, setDateRange] = useState('7days'); // Analytics date range

  // Simulated real-time data fetching based on selected entity
  const { data: mentions = [], refetch: refetchMentions } = useQuery({
    queryKey: ['mentions', selectedEntity?.id],
    queryFn: () => generateMentions(100, selectedEntity?.id),
    refetchInterval: 300000, // Refetch every 5 minutes
    enabled: !!selectedEntity?.id,
  });

  const { data: metricsData = [] } = useQuery({
    queryKey: ['metrics', selectedEntity?.id, timeRange],
    queryFn: () => generateMetricsData(timeRange),
    refetchInterval: 300000, // Refetch every 5 minutes
    enabled: !!selectedEntity?.id,
  });

  const { data: competitiveData = [] } = useQuery({
    queryKey: ['competitive'],
    queryFn: generateCompetitiveData,
    refetchInterval: 300000, // Refetch every 5 minutes
    enabled: !!selectedEntity?.id,
  });

  // Get current entities list based on type
  const currentEntities = entityType === 'celebrity' ? celebrities : movies;

  // Filter mentions by platform, sentiment, and status
  let filteredMentions = mentions;
  
  // Platform filter
  if (selectedPlatforms.length > 0) {
    filteredMentions = filteredMentions.filter(m => selectedPlatforms.includes(m.platform));
  }
  
  // Sentiment filter
  if (selectedSentiments.length > 0) {
    filteredMentions = filteredMentions.filter(m => selectedSentiments.includes(m.aiSentiment));
  }
  
  // Status filter (simulated - in real app would come from backend)
  if (selectedStatuses.length > 0) {
    filteredMentions = filteredMentions.filter(m => {
      // Simulate reply status based on threat score
      const status = m.aiThreatScore > 70 ? 'pending' : 
                     m.aiThreatScore > 40 ? 'replied' : 'no-reply';
      return selectedStatuses.includes(status);
    });
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const anomalyCount = mentions.filter(m => m.isAnomaly).length;

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Left Navbar */}
      <div className="w-64">
        <LeftNavbar activeTab={activeView} onTabChange={setActiveView} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
      {/* Header with Entity Selector */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">PR Command Center</h1>
          <div className="h-6 w-px bg-border" />
          <EntitySelector
            selectedEntity={selectedEntity}
            onEntityChange={setSelectedEntity}
            entities={currentEntities}
            entityType={entityType}
          />
          <div className="h-6 w-px bg-border" />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEntityType('movie')}
            className={`px-4 py-2 h-10 text-sm font-medium rounded-lg transition-colors ${
              entityType === 'movie'
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-muted-foreground hover:text-foreground'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => {
              setEntityType('celebrity');
              setSelectedEntity(null);
            }}
            className={`px-4 py-2 h-10 text-sm font-medium rounded-lg transition-colors ${
              entityType === 'celebrity'
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-muted-foreground hover:text-foreground'
            }`}
          >
            Celebrities
          </button>
          <div className="h-6 w-px bg-border" />
          <button
            onClick={() => setLoginOpen(true)}
            className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors"
          >
            Login
          </button>
        </div>
      </div>

      {/* Dashboard View */}
      {activeView === 'dashboard' && !selectedEntity && (
        <div className="h-full flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-foreground">Select an entity to view the dashboard</p>
            <p className="text-sm text-muted-foreground">Choose a movie or celebrity using the selectors above</p>
          </div>
        </div>
      )}

      {activeView === 'dashboard' && selectedEntity && (
        <DashboardView 
          selectedEntity={selectedEntity}
          entityType={entityType}
          competitiveData={competitiveData}
          mentions={filteredMentions}
          competitors={competitors}
          setCompetitors={setCompetitors}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      )}

      {/* Sentiment Analysis View */}
      {/* AI Analytics View */}
      {activeView === 'ai-analytics' && !selectedEntity && (
        <div className="h-full flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-foreground">Select an entity to view analytics</p>
            <p className="text-sm text-muted-foreground">Choose a movie or celebrity using the selectors above</p>
          </div>
        </div>
      )}

      {activeView === 'ai-analytics' && selectedEntity && (
        <AIAnalyticsView 
          selectedEntity={selectedEntity}
          entityType={entityType}
        />
      )}

      {/* Trending Genre Analysis View */}
      {activeView === 'trending-genre' && !selectedEntity && (
        <div className="h-full flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-foreground">Select an entity to view analysis</p>
            <p className="text-sm text-muted-foreground">Choose a movie or celebrity using the selectors above</p>
          </div>
        </div>
      )}

      {activeView === 'trending-genre' && selectedEntity && (
        <AnalyticsView 
          mentions={filteredMentions}
          metricsData={metricsData}
          selectedEntity={selectedEntity}
          entityType={entityType}
        />
      )}

      {/* Historical Data Analysis View */}
      {activeView === 'historical-data' && !selectedEntity && (
        <div className="h-full flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-foreground">Select an entity to view historical data</p>
            <p className="text-sm text-muted-foreground">Choose a movie or celebrity using the selectors above</p>
          </div>
        </div>
      )}

      {activeView === 'historical-data' && selectedEntity && (
        <AnalyticsView 
          mentions={filteredMentions}
          metricsData={metricsData}
          selectedEntity={selectedEntity}
          entityType={entityType}
        />
      )}

      {/* Crisis Management Center View */}
      {activeView === 'crisis-center' && !selectedEntity && (
        <div className="h-full flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-foreground">Select an entity to view crisis center</p>
            <p className="text-sm text-muted-foreground">Choose a movie or celebrity using the selectors above</p>
          </div>
        </div>
      )}

      {activeView === 'crisis-center' && selectedEntity && (
        <CrisisPlanGenerator selectedEntity={selectedEntity} mentions={filteredMentions} />
      )}

      {/* Negative Sentiment Analysis View */}
      {activeView === 'negative-analysis' && !selectedEntity && (
        <div className="h-full flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-foreground">Select an entity to view analysis</p>
            <p className="text-sm text-muted-foreground">Choose a movie or celebrity using the selectors above</p>
          </div>
        </div>
      )}

      {activeView === 'negative-analysis' && selectedEntity && (
        <NegativeCommentSummary mentions={filteredMentions} selectedEntity={selectedEntity} />
      )}

      {/* Metrics Dashboard View */}
      {activeView === 'metrics' && !selectedEntity && (
        <div className="h-full flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-foreground">Select an entity to view metrics</p>
            <p className="text-sm text-muted-foreground">Choose a movie or celebrity using the selectors above</p>
          </div>
        </div>
      )}

      {activeView === 'metrics' && selectedEntity && (
        <EnhancedMetricsDashboard 
          mentions={filteredMentions}
          metricsData={metricsData}
          anomalyCount={anomalyCount}
          selectedEntity={selectedEntity}
          competitiveData={competitiveData}
        />
      )}

      {/* Legacy crisis view - kept for backwards compatibility */}
      {activeView === 'crisis' && !selectedEntity && (
        <div className="h-full flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-foreground">Select an entity to view crisis management</p>
            <p className="text-sm text-muted-foreground">Choose a movie or celebrity using the selectors above</p>
          </div>
        </div>
      )}

      {activeView === 'crisis' && selectedEntity && (
        <PanelGroup direction="horizontal" className="flex-1">
          <Panel defaultSize={35} minSize={30} maxSize={45}>
            <CrisisPlanGenerator selectedEntity={selectedEntity} mentions={filteredMentions} />
          </Panel>

          <PanelResizeHandle className="w-px bg-border hover:bg-primary/50 transition-colors" />

          <Panel defaultSize={35} minSize={30} maxSize={45}>
            <NegativeCommentSummary mentions={filteredMentions} selectedEntity={selectedEntity} />
          </Panel>

          <PanelResizeHandle className="w-px bg-border hover:bg-primary/50 transition-colors" />
        </PanelGroup>
      )}

      {/* Command Palette */}
      <CommandPalette 
        open={commandOpen}
        onOpenChange={setCommandOpen}
        mentions={mentions}
        onSelectMention={(mention) => {
          setSelectedMention(mention);
          setCommandOpen(false);
        }}
        onRefresh={refetchMentions}
      />

      {/* Login Modal */}
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      </div>
    </div>
  );
}
