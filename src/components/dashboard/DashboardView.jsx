import React, { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { celebrityAnalytics, movies } from "../../dummydata";
import { transformStatsToCards, calculateStatsFromMentions } from "../../utils/statsTransformer";
import { formatCurrency } from "../../utils/helpers";
import CelebrityAnalytics from "./CelebrityAnalytics";
import CompetitivePositioning from "./CompetitivePositioning";
import SocialMediaFeed from "./SocialMediaFeed";
import KPICardsSection from "../analytics/KPICardsSection";
import SentimentTrendChart from "../analytics/SentimentTrendChart";
import OverlaySentimentComparison from "../analytics/OverlaySentimentComparison";
import SentimentDistributionChart from "../analytics/SentimentDistributionChart";
import SentimentGraphsGrid from "../analytics/SentimentGraphsGrid";
import PlatformBreakdownChart from "../analytics/PlatformBreakdownChart";
import TimeRangeSelector from "../navigation/TimeRangeSelector";

/**
 * DashboardView Component
 * Main analytics dashboard for displaying entity metrics, sentiment analysis, and social media insights.
 * Supports both celebrity and movie entities with dynamic date range filtering.
 * 
 * @param {Object} selectedEntity - The currently selected entity (celebrity or movie)
 * @param {string} entityType - Type of entity: 'celebrity' or 'movie'
 * @param {Object} competitiveData - Competitive positioning data for the entity
 * @param {Array} entities - List of available entities for adding competitors
 * @param {Function} onAddCompetitor - Callback when adding a new competitor
 * @param {Array} mentions - Array of social media mentions/posts
 * @param {Object} platformData - Platform-specific sentiment breakdown (platform -> {POSITIVE, NEGATIVE, NEUTRAL})
 * @param {Object} stats - Pre-calculated statistics for KPI cards
 * @param {Array} sentimentData - Sentiment trend data over time
 * @param {string} dateRange - Current date range filter value ('DAY', 'WEEK', 'MONTH')
 * @param {Function} setDateRange - Setter for date range filter
 * @param {Function} onMentionSelect - Callback when a mention is selected
 * @param {Function} onRefresh - Callback to refresh data
 */
export default function DashboardView({
  selectedEntity,
  entityType,
  competitiveData,
  entities,
  onAddCompetitor,
  mentions,
  platformData,
  stats,
  sentimentData,
  sentimentGraphs = { positive: [], total: [], negative: [] },
  sentimentTrendRaw,
  clusterMode,
  clusterEntities = [],
  dateRange,
  setDateRange,
  onMentionSelect,
  onRefresh,
}) {
  // Determine if we're showing celebrity or movie data
  const isCelebrity = entityType === "celebrity";

  // Date range filtering options for sentiment analysis
  // Each option defines: display label, day span for filtering, and API parameter
  const dateRangeOptions = [
    { value: "DAY", label: "Daily", days: 7, apiParam: "DAY" },
    { value: "WEEK", label: "Weekly", days: 14, apiParam: "WEEK" },
    { value: "MONTH", label: "Monthly", days: 28, apiParam: "MONTH" },
  ];

  const selectedRange =
    dateRangeOptions.find((opt) => opt.value === dateRange) ||
    dateRangeOptions[0];

  // Calculate key analytics metrics from mentions data
  // Includes sentiment breakdown, threat assessment, engagement calculations, and time-series data
  // Memoized to prevent recalculation on every render
  const analytics = useMemo(() => {
    if (!mentions || mentions.length === 0) {
      return {
        totalMentions: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
        highThreat: 0,
        avgEngagement: 0,
        timeBuckets: [],
        topNarratives: [],
        sentimentData: [],
        platformData: [],
      };
    }

    // Filter mentions based on selected date range to show only recent relevant data
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - selectedRange.days);
    const filteredMentions = mentions.filter((m) => m.timestamp >= cutoffDate);

    const totalMentions = filteredMentions.length;
    const positive = filteredMentions.filter(
      (m) => m.aiSentiment === "positive",
    ).length;
    const negative = filteredMentions.filter(
      (m) => m.aiSentiment === "negative",
    ).length;
    const neutral = filteredMentions.filter(
      (m) => m.aiSentiment === "neutral",
    ).length;
    const highThreat = filteredMentions.filter(
      (m) => m.aiThreatScore >= 70,
    ).length;

    // Calculate engagement
    const totalEngagement = filteredMentions.reduce(
      (sum, m) =>
        sum + (m.engagement?.likes || 0) + (m.engagement?.comments || 0),
      0,
    );
    const avgEngagement =
      totalMentions > 0 ? Math.round(totalEngagement / totalMentions) : 0;

    // Aggregate mention counts by platform for distribution analysis
    const platformStats = filteredMentions.reduce((acc, m) => {
      acc[m.platform] = (acc[m.platform] || 0) + 1;
      return acc;
    }, {});

    // Create time-series sentiment data with dynamic bucket sizing
    // Buckets are adjusted based on date range: 7 days = 7 buckets (daily), etc.
    // This provides appropriate granularity for the selected time period
    const now = Date.now();
    const bucketCount =
      selectedRange.days <= 7
        ? 7
        : selectedRange.days <= 14
          ? 14
          : selectedRange.days <= 28
            ? 28
            : Math.ceil(selectedRange.days / 2);
    const bucketSizeMs =
      (selectedRange.days * 24 * 60 * 60 * 1000) / bucketCount;

    // Build time-series data by grouping mentions into temporal buckets
    // Each bucket contains sentiment counts and percentages for that time period
    const timeBuckets = Array.from({ length: bucketCount }, (_, i) => {
      const bucketEnd = now - i * bucketSizeMs;
      const bucketStart = bucketEnd - bucketSizeMs;

      const bucketMentions = filteredMentions.filter((m) => {
        const time = new Date(m.timestamp).getTime();
        return time >= bucketStart && time < bucketEnd;
      });

      // Format time label based on date range for appropriate granularity
      let timeLabel;
      if (selectedRange.days <= 7) {
        // Daily view: show day of week abbreviation
        timeLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
          new Date(bucketEnd).getDay()
        ];
      } else if (selectedRange.days <= 14) {
        // Weekly view: show month and day
        timeLabel = new Date(bucketEnd).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      } else {
        // Monthly view: show month and day
        timeLabel = new Date(bucketEnd).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }

      // Count mentions by sentiment classification for this time bucket
      const positiveCount = bucketMentions.filter(
        (m) => m.aiSentiment === "positive",
      ).length;
      const neutralCount = bucketMentions.filter(
        (m) => m.aiSentiment === "neutral",
      ).length;
      const negativeCount = bucketMentions.filter(
        (m) => m.aiSentiment === "negative",
      ).length;
      const total = bucketMentions.length;

      // Calculate sentiment percentages to show proportional representation
      const positiveVal =
        total > 0 ? Math.round((positiveCount / total) * 100) : 0;
      const neutralVal =
        total > 0 ? Math.round((neutralCount / total) * 100) : 0;
      const negativeVal =
        total > 0 ? Math.round((negativeCount / total) * 100) : 0;

      const fullDate = new Date(bucketEnd).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const bucketEndDateUTC = new Date(bucketEnd);
      bucketEndDateUTC.setUTCHours(0, 0, 0, 0);
      const bucketDateMs = bucketEndDateUTC.getTime();

      return {
        time: timeLabel,
        positive: positiveVal,
        neutral: neutralVal,
        negative: negativeVal,
        total,
        fullDate,
        bucketDateMs,
      };
    }).reverse();

    // Prepare sentiment distribution data for pie/donut chart visualization
    const sentimentData = [
      {
        name: "Positive",
        value: positive,
        color: "#22c55e",
        percentage:
          totalMentions > 0 ? ((positive / totalMentions) * 100).toFixed(1) : 0,
      },
      {
        name: "Neutral",
        value: neutral,
        color: "#eab308",
        percentage:
          totalMentions > 0 ? ((neutral / totalMentions) * 100).toFixed(1) : 0,
      },
      {
        name: "Negative",
        value: negative,
        color: "#ef4444",
        percentage:
          totalMentions > 0 ? ((negative / totalMentions) * 100).toFixed(1) : 0,
      },
    ];

    // Prepare platform distribution data for bar chart visualization
    const platformData = [
      {
        platform: "Reddit",
        count: platformStats.reddit || 0,
        color: "#FF4500",
      },
      {
        platform: "Instagram",
        count: platformStats.youtube || 0,
        color: "#E1306C",
      },
      { platform: "X", count: platformStats.twitter || 0, color: "#000000" },
    ];

    return {
      totalMentions,
      positive,
      negative,
      neutral,
      highThreat,
      avgEngagement,
      timeBuckets,
      sentimentData,
      platformData,
    };
  }, [mentions, selectedRange, selectedEntity?.id]);

  // Calculate overall sentiment score to provide a single aggregate metric
  // Score ranges from 0-100 with labels: Positive (70+), Mixed (40-69), Negative (<40)
  const sentimentScore = useMemo(() => {
    if (analytics.totalMentions === 0)
      return { score: 50, label: "Neutral", color: "#eab308" };

    const score = Math.round(
      (analytics.positive * 100 + analytics.neutral * 50) /
        analytics.totalMentions,
    );

    if (score >= 70) return { score, label: "Positive", color: "#22c55e" };
    if (score >= 40) return { score, label: "Mixed", color: "#eab308" };
    return { score, label: "Negative", color: "#ef4444" };
  }, [analytics]);

  // Get celebrity analytics for selected entity (celebrities)
  const celebrityData =
    isCelebrity && selectedEntity?.id && celebrityAnalytics[selectedEntity.id]
      ? celebrityAnalytics[selectedEntity.id]
      : {
          socialReach: 25000000,
          brandValue: 2000000000,
          endorsementScore: 80,
          fanEngagement: 75,
          trend: "neutral",
          recentProjects: [
            { title: "Upcoming Film", status: "Development", buzz: 75 },
          ],
          metrics: [
            { name: "Social Media Influence", score: 75, impact: "neutral" },
            { name: "Brand Power", score: 80, impact: "positive" },
            { name: "Fan Loyalty", score: 78, impact: "positive" },
            { name: "Box Office Track Record", score: 75, impact: "neutral" },
            { name: "Controversy Risk", score: 30, impact: "neutral" },
          ],
        };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary rounded-lg">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered</span>
          </div>
        </div>

        {/* Date Range Selector for Sentiment Analysis */}
        <TimeRangeSelector
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedEntity={selectedEntity}
          entityType={entityType}
        />

        {/* KPI Cards */}
        <KPICardsSection analytics={transformStatsToCards(stats) || transformStatsToCards(calculateStatsFromMentions(mentions))} />

        {/* Sentiment Graphs Grid - NEW: 3 Individual Graphs (Positive, Neutral, Negative) */}
        {/* Shows each sentiment type separately with .total attribute support */}
        <SentimentGraphsGrid
          sentimentGraphs={sentimentGraphs}
          clusterMode={clusterMode}
          clusterEntities={clusterEntities}
          onRefresh={onRefresh}
        />

        {/* 
          Sentiment Distribution Chart (Disabled)
          Commented out as the SentimentTrendChart provides sufficient sentiment visualization.
          Can be re-enabled if pie chart comparison view is needed alongside trend data.
        */}
        {/* <SentimentDistributionChart sentimentData={analytics.sentimentData} /> */}


        {/* Analytics Grid - 2 Column Layout */}
        {/* Left: Competitive positioning analysis | Right: Platform sentiment breakdown */}
        <div className="grid grid-cols-2 gap-6">
          {/* Competitive Positioning Chart - Compares entity performance vs competitors */}
          <CompetitivePositioning 
            competitiveData={competitiveData} 
            entities={entities}
            onAddCompetitor={onAddCompetitor}
          />
          {/* Platform Breakdown Chart - Stacked bar chart showing sentiment distribution per platform */}
          <PlatformBreakdownChart platformData={platformData} />
        </div>

        {/* Social Media Feed - Full Width */}
        {/* Displays recent mentions and posts from all platforms for selected entity */}
        <SocialMediaFeed mentions={mentions} selectedEntity={selectedEntity} />

        {/* Celebrity-Specific Analytics - Only rendered for celebrity entities */}
        {/* Includes social reach, brand value, fan engagement, and controversy metrics */}
        {isCelebrity && <CelebrityAnalytics celebrityData={celebrityData} formatCurrency={formatCurrency} />}
      </div>
    </div>
  );
}
