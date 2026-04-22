# Sentiment Graphs - Data Structure & Usage

## Backend Data Structure

The sentiment endpoint from the backend should return data in the following format:

### Single Entity Request
```javascript
GET /api/sentiment-trend?entityId=123&dateRange=DAY

Response:
{
  entities: [
    {
      id: "entity-123",
      name: "Movie Title",
      sentiments: [
        {
          date: "2024-04-22",
          positive: { total: 45 },
          negative: { total: 12 },
          neutral: { total: 8 }
        },
        {
          date: "2024-04-23",
          positive: { total: 52 },
          negative: { total: 15 },
          neutral: { total: 10 }
        }
        // ... more dates
      ]
    }
  ]
}
```

### Cluster Mode Request (Multiple Entities)
```javascript
GET /api/sentiment-trend?entityIds=123,456,789&dateRange=WEEK

Response:
{
  entities: [
    {
      id: "entity-123",
      name: "Movie A",
      sentiments: [
        {
          date: "2024-W17",
          positive: { total: 300 },
          negative: { total: 80 },
          neutral: { total: 60 }
        },
        // ... more weeks
      ]
    },
    {
      id: "entity-456",
      name: "Movie B",
      sentiments: [...]
    }
    // ... more entities (up to 5)
  ]
}
```

## New Components

### 1. `SentimentTrendGraph` (Individual Graph)
Renders a single sentiment type graph with `.total` values.

**Props:**
- `data`: Array of sentiment data points with `.total` attribute
- `sentiment`: 'positive' | 'negative' | 'neutral'
- `clusterMode`: boolean - renders multiple lines per entity
- `clusterEntities`: Array of entity objects (for cluster mode)
- `onRefresh`: Function to refresh data
- `title`: Optional custom title

**Usage:**
```jsx
<SentimentTrendGraph
  data={sentimentGraphs.positive}
  sentiment="positive"
  clusterMode={clusterMode}
  clusterEntities={selectedEntities}
  onRefresh={refetchSentimentTrend}
/>
```

### 2. `SentimentGraphsGrid` (All 3 Graphs)
Renders all 3 sentiment graphs in a responsive grid with summary stats.

**Props:**
- `sentimentGraphs`: Object with `{ positive, neutral, negative }` arrays
- `clusterMode`: boolean
- `clusterEntities`: Array of entity objects
- `onRefresh`: Function to refresh data

**Usage:**
```jsx
<SentimentGraphsGrid
  sentimentGraphs={sentimentGraphs}
  clusterMode={clusterMode}
  clusterEntities={selectedEntities}
  onRefresh={refetchSentimentTrend}
/>
```

## Data Transformation

The `PRCommandCenter.api.jsx` automatically transforms the backend data:

```javascript
// Input from backend (with .total)
{
  date: "2024-04-22",
  positive: { total: 45 },
  negative: { total: 12 },
  neutral: { total: 8 }
}

// Transformed for charts (backward compatible)
{
  date: "2024-04-22",
  value: 45,
  total: 45,  // New attribute
  entity: "Entity Name" // (cluster mode only)
}
```

## Backward Compatibility

The transformation handles both old and new data formats:
```javascript
const positiveTotal = item.positive?.total ?? item.positive ?? 0;
```

This allows gradual migration from old format to new format.

## Features

✅ Individual sentiment type tracking
✅ Cluster mode comparison (up to 5 entities)
✅ `.total` attribute support for aggregated daily/weekly/monthly stats
✅ Summary statistics (Total, Average, Peak)
✅ Responsive grid layout
✅ Refresh functionality
✅ Color-coded by sentiment type

## Integration

Replace `OverlaySentimentComparison` with `SentimentGraphsGrid` in dashboard/analytics views:

```jsx
// Old
<OverlaySentimentComparison clusterData={sentimentTrendRaw} />

// New
<SentimentGraphsGrid 
  sentimentGraphs={sentimentGraphs}
  clusterMode={clusterMode}
  clusterEntities={selectedEntities}
  onRefresh={refetchSentimentTrend}
/>
```
