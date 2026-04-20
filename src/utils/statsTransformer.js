import { TrendingUp, Zap, Smile, BarChart3 } from "lucide-react";

/**
 * Transform API stats response to StatCard format
 * @param {Object} statsResponse - Response from dashboardService.getStats()
 * @returns {Array} Array of stat objects formatted for StatsGrid
 */
export function transformStatsToCards(statsResponse) {
  if (!statsResponse) return [];

  const {
    totalMentions = 0,
    overallSentiment = 0,
    positiveRatio = 0,
    netSentimentScore = 0,
    positiveSentiment = 0,
    negativeSentiment = 0,
    neutralSentiment = 0,
  } = statsResponse;


  let finalOverallSentiment = overallSentiment;
  let finalPositiveRatio = positiveRatio;
  let finalNetSentimentScore = netSentimentScore;

    // Use overallSentiment value provided by backend (already normalized to 0-100)
    finalOverallSentiment = overallSentiment;
    
    // Positive ratio is the positive sentiment fraction (will be multiplied by 100 for display)
    finalPositiveRatio = positiveSentiment;
    
    // Net sentiment score is provided directly from backend
    finalNetSentimentScore = netSentimentScore;


  return [
    {
      icon: BarChart3,
      label: "Total Mentions",
      value: totalMentions.toLocaleString(),
      color: "blue",
      tooltip: "Total number of mentions across all platforms",
    },
    {
      icon: Smile,
      label: "Overall Sentiment",
      value: `${Math.max(0, Math.min(100, finalOverallSentiment)).toFixed(1)}%`,
      color: "green",
      tooltip: "Overall sentiment score across all mentions",
    },
    {
      icon: TrendingUp,
      label: "Positive Ratio",
      value: `${(finalPositiveRatio * 100).toFixed(1)}%`,
      color: "purple",
      tooltip:
        "Percentage of positive comments from total mentions. Higher is better.",
    },
    {
      icon: Zap,
      label: "Net Sentiment Score",
      value: finalNetSentimentScore.toFixed(2),
      color:
        finalNetSentimentScore > 0
          ? "green"
          : finalNetSentimentScore < 0
            ? "red"
            : "orange",
      tooltip:
        "Net sentiment score indicates the difference between positive and negative sentiment. Higher is better.",
    },
  ];
}

/**
 * Transform raw mentions data to analytics stats
 * Used as fallback when API response is not available
 * @param {Array} mentions - Array of mention objects
 * @returns {Object} Stats object with calculated metrics
 */
export function calculateStatsFromMentions(mentions) {
  if (!mentions || mentions.length === 0) {
    return {
      totalMentions: 0,
      overallSentiment: 0,
      positiveRatio: 0,
      netSentimentScore: 0,
    };
  }

  const totalMentions = mentions.length;
  const positive = mentions.filter((m) => m.aiSentiment === "positive").length;
  const negative = mentions.filter((m) => m.aiSentiment === "negative").length;
  const neutral = mentions.filter((m) => m.aiSentiment === "neutral").length;

  const positiveRatio = totalMentions > 0 ? positive / totalMentions : 0;
  const negativeRatio = totalMentions > 0 ? negative / totalMentions : 0;

  // Overall sentiment: positive - negative (normalized to 0-100)
  const overallSentiment = (positiveRatio - negativeRatio) * 50 + 50;

  // Net sentiment score: positive count - negative count
  const netSentimentScore = positive - negative;

  return {
    totalMentions,
    overallSentiment: Math.max(0, Math.min(100, overallSentiment)),
    positiveRatio,
    netSentimentScore,
  };
}
