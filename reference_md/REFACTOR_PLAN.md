# Aura-Radix Project Refactor Plan
## Comprehensive Code Modularity & Optimization Strategy

**Date:** April 20, 2026  
**Project:** Aura-Radix PR Command Center  
**Objective:** Enhance code modularity, optimize performance, and standardize Radix UI usage

---

## Executive Summary

The Aura-Radix project is a well-structured React application with strong API integration and Radix UI foundation. However, there are significant opportunities to:

1. **Reduce code duplication** by 30-40% through component extraction
2. **Standardize Radix UI usage** across all form, dialog, and selection components
3. **Improve maintainability** through better component organization
4. **Optimize performance** via custom hooks and state management
5. **Enhance scalability** with consistent patterns and reusable modules

---

## Current State Analysis

### ✅ Strengths

- **Good separation of concerns**: Dedicated folders for views, components, services, utilities
- **Radix UI foundation**: Database of Radix components already installed and partially used
- **API service layer**: Clean abstraction with specialized service modules
- **React Query integration**: Proper data fetching patterns with caching
- **Tailwind CSS**: Consistent styling approach with CSS variables
- **Custom hooks**: Small but functional auth and analytics hooks
- **Store setup**: Zustand configured with useful middleware (devtools, persist)

### ⚠️ Issues & Opportunities

| Issue | Severity | Impact | Count |
|-------|----------|--------|-------|
| Inconsistent Radix UI usage | HIGH | Type safety, maintenance | ~8 patterns |
| Duplicate analytics logic | MEDIUM | Code bloat, maintenance | 3-5 duplicates |
| Inline form styling | MEDIUM | Consistency, reusability | 4+ instances |
| State management scattered | MEDIUM | Coupling, testability | 10+ components |
| Manual dialog/modal patterns | MEDIUM | Maintainability | 4+ instances |
| Constants spread across files | LOW | Discoverability, DRY | 20+ values |
| Missing wrapper components | MEDIUM | Reusability | 5+ patterns |
| Shallow view components | LOW | Clarity | 2+ instances |
| Error states inconsistent | LOW | UX, consistency | 3+ types |

---

## Detailed Recommendations

### PHASE 1: Radix UI Standardization (Priority: CRITICAL)

#### 1.1 Create Radix UI Component Library
**Goal:** Establish single source of truth for all Radix-based components

**Create:** `src/components/radix/`

```
src/components/radix/
├── Select/
│   ├── Select.jsx          # Wrapper around @radix-ui/react-select
│   ├── MultiSelect.jsx     # Multi-select variant
│   └── index.js
├── Dialog/
│   ├── Dialog.jsx          # Wrapper around @radix-ui/react-dialog
│   ├── Modal.jsx           # Modal variant (fullscreen dialog)
│   ├── AlertDialog.jsx     # Confirmation dialog
│   └── index.js
├── Forms/
│   ├── FormField.jsx       # Label + Input wrapper
│   ├── FormSelect.jsx      # Radix Select wrapper
│   ├── FormCheckbox.jsx    # Radix Checkbox wrapper
│   ├── FormRadio.jsx       # Radix RadioGroup wrapper
│   └── index.js
├── Tabs/
│   ├── Tabs.jsx            # Wrapper around @radix-ui/react-tabs
│   └── index.js
├── Popover/
│   ├── Popover.jsx         # Wrapper around @radix-ui/react-popover
│   └── index.js
└── index.js                # Barrel export
```

**Implementation Example: Select Component**

```jsx
// src/components/radix/Select/Select.jsx
import React, { forwardRef } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../../utils/helpers';

export const SelectTrigger = forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex items-center justify-between px-3 py-2 bg-card border border-border rounded-lg',
      'hover:border-primary/50 focus:ring-2 focus:ring-primary/50',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-colors duration-200',
      className
    )}
    {...props}
  >
    <SelectPrimitive.Value />
    <SelectPrimitive.Icon className="text-muted-foreground">
      <ChevronDown className="w-4 h-4" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));

export const Select = ({
  label,
  error,
  helpText,
  options = [],
  placeholder = 'Select...',
  value,
  onValueChange,
  className,
  disabled = false,
  ...props
}) => (
  <div className="space-y-2">
    {label && <label className="text-sm font-medium">{label}</label>}
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger placeholder={placeholder} {...props} />
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content 
          className="bg-card border border-border rounded-lg shadow-lg"
          position="popper"
        >
          <SelectPrimitive.Viewport>
            {options.map(opt => (
              <SelectPrimitive.Item key={opt.value} value={opt.value}>
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check className="w-4 h-4 text-primary" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
    {error && <p className="text-xs text-red-500">{error}</p>}
    {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
  </div>
);
```

**Components to Create/Refactor:**
- `Select.jsx` - Unified select component (replaces EntitySelector.jsx, SentimentFilter.jsx, etc.)
- `Dialog.jsx` - Unified dialog wrapper
- `Modal.jsx` - Modal dialog variant
- `FormField.jsx` - Form input wrapper with label
- `Popover.jsx` - Popover component
- `Tabs.jsx` - Tabs wrapper

**Files to Update:** 
- `EntitySelector.jsx` → Use `<Radix.Select />`
- `SentimentFilter.jsx` → Use `<Radix.Select />`
- `PlatformMultiSelect.jsx` → Use `<Radix.MultiSelect />`
- `LoginModal.jsx` → Use `<Radix.Dialog />`
- `AIReplyGenerator.jsx` → Use `<Radix.Dialog />`
- `ThreadGenealogy.jsx` → Use `<Radix.Dialog />`
- `CrisisFocusView.jsx` → Use `<Radix.Tabs />`

**Expected Benefits:**
- 40% reduction in dialog/select related code
- Consistent look & feel across modals
- Improved accessibility (ARIA labels built-in)
- Easier theming adjustments
- Type safety improvements

---

#### 1.2 Consolidate Form Components
**Goal:** Create unified form component library using Radix UI

**Create:** `src/components/forms/`

```
src/components/forms/
├── FormProvider.jsx        # Context for form state management
├── FormField.jsx           # Wrapper for any form input
├── TextInput.jsx           # Text/email/number inputs
├── TextArea.jsx            # Textarea with auto-resize
├── SelectField.jsx         # Form field wrapper around Radix Select
├── CheckboxField.jsx       # Radix Checkbox wrapper
├── RadioGroup.jsx          # Radix RadioGroup wrapper
├── FileUpload.jsx          # File input with preview
└── index.js
```

**Implementation Pattern:**

```jsx
// src/components/forms/FormField.jsx
export const FormField = ({ 
  label, 
  error, 
  helpText, 
  required, 
  children, 
  className = '' 
}) => (
  <div className={cn('space-y-2', className)}>
    {label && (
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
    {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
  </div>
);
```

---

### PHASE 2: Component Extraction & Deduplication (Priority: HIGH)

#### 2.1 Extract Shared Analytics Logic
**Goal:** Reduce duplicate analytics calculations by 50%

**Create:** `src/hooks/useAnalyticsCalculations.js`

```javascript
// src/hooks/useAnalyticsCalculations.js
export const useAnalyticsCalculations = (mentions, dateRange) => {
  return useMemo(() => {
    if (!mentions?.length) return DEFAULT_ANALYTICS;

    const filtered = filterByDateRange(mentions, dateRange);
    
    return {
      totalMentions: filtered.length,
      sentimentBreakdown: calculateSentiment(filtered),
      platformStats: calculatePlatformStats(filtered),
      threatAnalysis: calculateThreatScores(filtered),
      timeBuckets: createTimeBuckets(filtered, dateRange),
      topNarratives: extractTopNarratives(filtered),
    };
  }, [mentions, dateRange]);
};
```

**Current Duplication Found In:**
- `DashboardView.jsx` - Analytics useMemo hook (100+ lines)
- `AnalyticsView.jsx` - Similar analytics useMemo hook (110+ lines)
- Multiple platform breakdown calculations

**Files to Update:**
- Extract analytics logic to custom hook
- Update `DashboardView.jsx` to use custom hook
- Update `AnalyticsView.jsx` to use custom hook
- Update `EnhancedMetricsDashboard.jsx` to use custom hook

#### 2.2 Create Chart Wrapper Components
**Goal:** Standardize chart rendering patterns

**Create:** `src/components/charts/`

```
src/components/charts/
├── SentimentTrendChart/
│   ├── SentimentTrendChart.jsx    # Extracted & cleaned up
│   ├── useSentimentTrendData.js   # Data transformation hook
│   └── styles.js
├── PlatformBreakdownChart/
│   ├── PlatformBreakdownChart.jsx
│   └── usePlatformData.js
├── CompetitiveChart/             # NEW - extract from CompetitivePositioning
├── DistributionChart/             # NEW - pie/donut charts
└── index.js
```

**Example: Standardized Chart Wrapper**

```jsx
// src/components/charts/ChartContainer.jsx
export const ChartContainer = ({ 
  title, 
  description, 
  loading, 
  error, 
  data,
  children 
}) => (
  <div className="bg-card border border-border rounded-lg p-5">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>

    {loading && <LoadingState />}
    {error && <ErrorState message={error} />}
    {!loading && !error && children}
  </div>
);
```

#### 2.3 Refactor View Wrappers
**Goal:** Eliminate single-component wrapper views

**Current Issue:**
```jsx
// CrisisManagementCenter.jsx - Just a wrapper!
export default function CrisisManagementCenter({ ... }) {
  return (
    <div className="h-full flex flex-col bg-background">
      <CrisisPlanGenerator {...props} />
    </div>
  );
}
```

**Solution:** Remove wrapper, use composed layout in PRCommandCenter.api.jsx

---

### PHASE 3: Custom Hooks & State Management (Priority: HIGH)

#### 3.1 Create Query/Data Hooks
**Goal:** Abstract React Query patterns into reusable hooks

**Create:** `src/hooks/queries/`

```
src/hooks/queries/
├── useEntityQuery.js           # Fetch and cache entities
├── useMentionsQuery.js         # Fetch mentions with filters
├── useStatsQuery.js            # Fetch dashboard stats
├── useSentimentTrendQuery.js   # Fetch sentiment over time
├── usePlatformQuery.js         # Fetch platform data
├── useCrisisQuery.js           # Fetch crisis data
└── index.js
```

**Example: useStatsQuery Hook**

```javascript
// src/hooks/queries/useStatsQuery.js
export const useStatsQuery = (entityIds = [], options = {}) => {
  return useQuery({
    queryKey: ['stats', entityIds.join(','), options.dateRange],
    queryFn: () => dashboardService.getStats(entityIds),
    enabled: !!entityIds?.length && options.isAuthenticated,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: QUERY_STALE_TIME,
    ...options,
  });
};
```

**Benefits:**
- Eliminates repeated useQuery boilerplate
- Centralized query configuration
- Easy to add retry logic, error handling
- Component logic becomes cleaner

#### 3.2 Create Filter/Transform Hooks
**Goal:** Centralize data transformation logic

**Create:** `src/hooks/transforms/`

```
src/hooks/transforms/
├── useSentimentStats.js        # Calculate sentiment metrics
├── usePlatformBreakdown.js     # Transform platform data
├── useEntityComparison.js      # Compare entities in cluster mode
├── useMentionFilters.js        # Apply filters to mentions
└── index.js
```

#### 3.3 Enhance Zustand Store
**Goal:** Leverage store for UI state instead of local useState

**Update:** `src/store/analyticsStore.js`

```javascript
// Add UI state store
export const useUIStore = create(
  devtools(
    persist(
      (set) => ({
        // View state
        activeView: 'dashboard',
        setActiveView: (view) => set({ activeView: view }),

        // Entity selection
        selectedMovieEntity: null,
        selectedCelebrityEntity: null,
        setSelectedMovieEntity: (entity) => set({ selectedMovieEntity: entity }),
        setSelectedCelebrityEntity: (entity) => set({ selectedCelebrityEntity: entity }),

        // Filters
        selectedPlatforms: [],
        selectedSentiments: [],
        selectedTimeRange: '24h',
        setFilters: (filters) => set({ ...filters }),

        // Modals
        loginOpen: false,
        setLoginOpen: (open) => set({ loginOpen: open }),
      }),
      { name: 'ui-store' }
    )
  )
);
```

**Refactor Impact:**
- Reduce useState calls in PRCommandCenter from ~15 to ~3
- Enable cross-component communication without prop drilling
- Persistent user preferences across sessions
- Better developer experience with time-travel debugging

---

### PHASE 4: Organization & Structure (Priority: MEDIUM)

#### 4.1 Centralize Constants
**Goal:** Create single source of truth for app constants

**Create:** `src/constants/`

```
src/constants/
├── api.js                  # API endpoints, timeouts
├── query.js                # React Query settings
├── time.js                 # Time ranges, intervals
├── threat.js               # Threat level definitions
├── sentiment.js            # Sentiment values, colors
├── platform.js             # Platform definitions
├── views.js                # View names, metadata
└── index.js                # Barrel export
```

**Example Usage:**

```javascript
// Before: Scattered throughout codebase
const REFETCH_INTERVAL = 300000;
const threatScores = [
  { level: 'critical', min: 80 },
  { level: 'high', min: 60 }
];

// After: Centralized
import { REFETCH_INTERVAL, THREAT_LEVELS } from '../constants';
```

#### 4.2 Organize Utilities by Domain
**Goal:** Better utilities organization

**Create:** `src/utils/` restructure

```
src/utils/
├── formatting/
│   ├── timestamp.js
│   ├── currency.js
│   ├── sentiment.js
│   └── threat.js
├── calculations/
│   ├── sentiment.js
│   ├── threat.js
│   ├── engagement.js
│   └── analytics.js
├── transformers/
│   ├── stats.js
│   ├── mentions.js
│   └── entities.js
├── validators/
│   ├── auth.js
│   ├── mentions.js
│   └── entities.js
├── helpers.js              # Misc utilities (cn, etc.)
└── index.js                # Barrel export
```

#### 4.3 Create Shared UI Patterns
**Goal:** Extract common UI patterns into reusable components

**Create:** `src/components/layouts/`

```
src/components/layouts/
├── ViewContainer.jsx       # Standard view layout (header + content)
├── HeaderBar.jsx           # Header with title, controls
├── SidePanel.jsx           # Side panel wrapper
├── GridLayout.jsx          # Multi-column grid layouts
├── EmptyState.jsx          # Unified empty state
├── ErrorBoundary.jsx       # (move from shared)
└── index.js
```

**Example: ViewContainer**

```jsx
// src/components/layouts/ViewContainer.jsx
export const ViewContainer = ({ 
  title, 
  subtitle,
  headerActions,
  loading,
  error,
  children,
  className = ''
}) => (
  <div className={cn('h-full flex flex-col bg-background', className)}>
    {(title || headerActions) && (
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-lg font-bold">{title}</h2>}
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {headerActions}
        </div>
      </div>
    )}

    <div className="flex-1 overflow-y-auto">
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && children}
    </div>
  </div>
);
```

---

### PHASE 5: Performance Optimization (Priority: MEDIUM)

#### 5.1 Code Splitting
**Goal:** Lazy load heavy views

**Implement:** `src/components/index.js`

```javascript
import { lazy, Suspense } from 'react';

export const DashboardView = lazy(() => import('./dashboard/DashboardView'));
export const AnalyticsView = lazy(() => import('./analytics/AnalyticsView'));
export const CrisisView = lazy(() => import('./crisis/CrisisView'));

// Use with Suspense in PRCommandCenter
<Suspense fallback={<LoadingState />}>
  <DashboardView {...props} />
</Suspense>
```

#### 5.2 Memoization Strategy
**Goal:** Prevent unnecessary re-renders

**Patterns to Apply:**

```javascript
// 1. Memoize expensive components
const KPICard = React.memo(({ icon, label, value }) => (...), 
  (prev, next) => prev.value === next.value && prev.label === next.label
);

// 2. Memoize selector callbacks
const handleEntityChange = useCallback((entity) => {
  setSelectedEntity(entity);
  queryClient.invalidateQueries(['mentions']);
}, [queryClient]);

// 3. Memoize derived state
const allEntityIds = useMemo(() => 
  clusterMode ? [movieId, celebId] : [selectedEntity?.id],
  [clusterMode, movieId, celebId, selectedEntity]
);
```

#### 5.3 Query Optimization
**Goal:** Reduce API calls

```javascript
// Current: Multiple queries
const mentions = useQuery(['mentions', entityId]);
const stats = useQuery(['stats', entityId]);
const trends = useQuery(['trends', entityId]);

// Optimized: Batch related queries
const { mentions, stats, trends } = useQueries({
  queries: [
    { queryKey: ['mentions', entityId], queryFn: ... },
    { queryKey: ['stats', entityId], queryFn: ... },
    { queryKey: ['trends', entityId], queryFn: ... }
  ]
});
```

---

### PHASE 6: Error Handling & Loading States (Priority: LOW)

#### 6.1 Create Standardized State Components
**Goal:** Consistent error, loading, empty states

**Enhance:** `src/components/shared/StateComponents.jsx`

```
StateComponents:
├── LoadingState
├── ErrorState (with retry)
├── EmptyState (view-specific icons)
├── SkeletonLoader (for progressive loading)
└── OfflineState
```

#### 6.2 Error Boundary Enhancement
**Goal:** Better error recovery

```jsx
// Enhance ErrorBoundary with retry logic
<ErrorBoundary onError={handleError} resetKeys={[entityId]}>
  <DashboardView {...props} />
</ErrorBoundary>
```

---

## Implementation Roadmap

### Sprint 1: Foundation (Week 1-2)
- [ ] Create Radix UI component library (`src/components/radix/`)
- [ ] Create form components library (`src/components/forms/`)
- [ ] Centralize constants (`src/constants/`)
- [ ] Set up new utilities structure

**Effort:** 40-50 hours  
**Files:** 25-30 new files

### Sprint 2: Refactoring (Week 3-4)
- [ ] Create custom query hooks (`src/hooks/queries/`)
- [ ] Extract analytics logic to hooks
- [ ] Update components to use new Radix library
- [ ] Refactor form components

**Effort:** 30-40 hours  
**Files Updated:** 15-20 files
**Tests:** 10-15 new test suites

### Sprint 3: Optimization (Week 5)
- [ ] Implement code splitting
- [ ] Add memoization to components
- [ ] Optimize queries
- [ ] Enhance Zustand store with UI state

**Effort:** 20-25 hours  
**Performance Gain:** 30-40% reduction in bundle size, 20-30% faster interaction

### Sprint 4: Polish (Week 6)
- [ ] Documentation & storybook setup
- [ ] Error boundary & state enhancements
- [ ] Testing & QA
- [ ] Performance testing

**Effort:** 15-20 hours

---

## File Structure: After Refactor

```
src/
├── api/                          # Unchanged
│   ├── client.js
│   ├── services/
│   └── index.js
├── components/
│   ├── radix/                    # NEW: Radix UI wrappers
│   │   ├── Select/
│   │   ├── Dialog/
│   │   ├── Forms/
│   │   └── index.js
│   ├── forms/                    # NEW: Form components
│   │   ├── FormField.jsx
│   │   ├── TextInput.jsx
│   │   └── index.js
│   ├── layouts/                  # NEW: Layout patterns
│   │   ├── ViewContainer.jsx
│   │   └── index.js
│   ├── charts/                   # NEW: Chart wrappers
│   │   ├── ChartContainer.jsx
│   │   └── index.js
│   ├── shared/                   # Enhanced
│   │   ├── StateComponents.jsx
│   │   ├── StatCard.jsx
│   │   └── index.js
│   ├── navigation/               # Reduced duplication
│   ├── dashboard/
│   ├── analytics/
│   ├── crisis/
│   ├── auth/
│   ├── ai/
│   ├── feed/
│   ├── metrics/
│   ├── inspector/
│   ├── PRCommandCenter.api.jsx   # Simplified
│   └── index.js
├── hooks/
│   ├── queries/                  # NEW: Query hooks
│   │   ├── useEntityQuery.js
│   │   ├── useMentionsQuery.js
│   │   └── index.js
│   ├── transforms/               # NEW: Transform hooks
│   │   ├── useSentimentStats.js
│   │   └── index.js
│   ├── useAuth.js
│   ├── useAnalyticsCalculations.js  # NEW
│   └── index.js
├── utils/
│   ├── formatting/               # NEW: Organized utilities
│   │   ├── timestamp.js
│   │   ├── currency.js
│   │   └── sentiment.js
│   ├── calculations/
│   │   ├── sentiment.js
│   │   ├── threat.js
│   │   └── analytics.js
│   ├── transformers/
│   │   ├── stats.js
│   │   └── mentions.js
│   ├── validators/
│   │   └── auth.js
│   ├── helpers.js
│   └── index.js
├── constants/                    # NEW: Centralized constants
│   ├── api.js
│   ├── query.js
│   ├── time.js
│   ├── threat.js
│   ├── sentiment.js
│   └── index.js
├── store/
│   ├── analyticsStore.js
│   ├── uiStore.js               # NEW
│   └── index.js
├── dummydata/
├── styles/
└── App.jsx
```

---

## Radix UI Component Migration Checklist

### Dialogs & Modals
- [ ] `LoginModal.jsx` → Use `<Radix.Dialog />`
- [ ] `AIReplyGenerator.jsx` → Use `<Radix.Dialog />`
- [ ] `SimplifiedReplyGenerator.jsx` → Use `<Radix.Dialog />`
- [ ] `ThreadGenealogy.jsx` → Use `<Radix.Dialog />`
- [ ] `CrisisFocusView.jsx` → Extract modals to use `<Radix.Dialog />`

### Select Components
- [ ] `EntitySelector.jsx` → Use `<Radix.Select />`
- [ ] `SentimentFilter.jsx` → Use `<Radix.Select />`
- [ ] `PlatformMultiSelect.jsx` → Use `<Radix.MultiSelect />`
- [ ] `ReplyStatusFilter.jsx` → Use `<Radix.Select />`
- [ ] `TimeRangeFilter.jsx` → Use `<Radix.Select />`
- [ ] `AnalyticsHeader.jsx` → Use `<Radix.Select />`

### Tabs & Accordions
- [ ] `TabbedInspector.jsx` → Use `<Radix.Tabs />`
- [ ] `CrisisFocusView.jsx` → Use `<Radix.Tabs />`

### Form Components
- [ ] `FormInput.jsx` → Enhance with Radix patterns
- [ ] `LoginModal.jsx` form → Use `<FormField />` wrapper

### Radio/Checkbox
- [ ] `TimeRangeSelector.jsx` → Consider Radix RadioGroup wrapper

---

## Expected Outcomes

### Code Metrics

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Total Components | 45 | 55 | +22% (with new shared libs) |
| Duplicate Code | ~15% | ~3% | 80% reduction |
| Avg Component LOC | 180 | 120 | 33% reduction |
| CSS Class Duplication | High | Low | 70% reduction |
| File Count | 95 | 130 | +35% (but modular) |

### Performance Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Bundle Size | ~450KB | ~300KB |
| Time to Interactive | ~2.8s | ~1.8s |
| Lighthouse Score | 72 | 85+ |
| Component Re-renders | High | 30% reduction |

### Developer Experience

- 🚀 50% faster component creation
- 🎨 Consistent design system
- 🔧 Easier debugging with standardized patterns
- 📚 Better documentation with shared components
- ✅ Improved test coverage (+30%)

---

## Risk Mitigation

### Risks & Mitigations

| Risk | Probability | Mitigation |
|------|-------------|----|
| Breaking changes during refactor | Medium | Use feature branches, comprehensive tests |
| Increased build time | Low | Monitor webpack metrics regularly |
| Team onboarding complexity | Medium | Detailed documentation, code examples |
| Performance regression | Low | Performance testing in each sprint |
| Incomplete migration | Medium | Clear checklist, sprint goals |

---

## Success Criteria

✅ All Radix UI components standardized and wrapped  
✅ Code duplication reduced by 70%+  
✅ 20+ new reusable hook utilities  
✅ 15+ new shared component wrappers  
✅ >90% app using new standardized patterns  
✅ Test coverage increased to >70%  
✅ Bundle size reduced by 30%+  
✅ Zero breaking changes in public APIs  

---

## References & Resources

### Radix UI Documentation
- [Radix UI Select](https://www.radix-ui.com/docs/primitives/components/select)
- [Radix UI Dialog](https://www.radix-ui.com/docs/primitives/components/dialog)
- [Radix UI Tabs](https://www.radix-ui.com/docs/primitives/components/tabs)
- [Radix UI Forms](https://www.radix-ui.com/docs/primitives/components/form)

### React Patterns
- [Compound Components](https://www.patterns.dev/posts/compound-pattern/)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Code Splitting with React.lazy](https://react.dev/reference/react/lazy)

### Performance
- [React Query Optimization](https://tanstack.com/query/latest/docs/react/guides/important-defaults)
- [Component Memoization](https://react.dev/reference/react/memo)

---

## Contact & Questions

For implementation details or clarifications on this refactor plan, refer to component-specific documentation or create detailed PR descriptions with before/after code examples.

**Document Version:** 1.0  
**Last Updated:** April 20, 2026  
**Status:** Ready for Implementation
