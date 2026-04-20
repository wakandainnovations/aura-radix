# Refactor Quick Reference
## Component-by-Component Migration Guide

### PHASE 1: Radix UI Component Library (Priority: CRITICAL)

#### Select Components (HIGH DUPLICATION)

**Current Implementation Issues:**
- `EntitySelector.jsx` - 75 lines, manual Radix Select with custom styling
- `SentimentFilter.jsx` - 60 lines, nearly identical Select pattern
- `PlatformMultiSelect.jsx` - 85 lines, duplicate multi-select logic
- `ReplyStatusFilter.jsx` - 70 lines, same pattern repeated
- `TimeRangeFilter.jsx` - 90 lines, clock icon variant of Select

**After Refactor:** 
4 components → 1 reusable `Select` + 1 `MultiSelect` + props variants

**Migration Path:**
```jsx
// BEFORE: EntitySelector.jsx - 75 lines
import * as Select from '@radix-ui/react-select';
export default function EntitySelector({ selectedEntity, onEntityChange, entities, entityType }) {
  return (
    <Select.Root value={selectedEntity?.id || ''} onValueChange={...}>
      <Select.Trigger className="inline-flex items-center...">
        // ... custom trigger styles
      </Select.Trigger>
      <Select.Portal>
        <Select.Content>
          // ... custom content styles
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

// AFTER: Use centralized Radix Select
import { Select } from '@/components/radix/Select';

function EntitySelector({ selectedEntity, onEntityChange, entities }) {
  return (
    <Select
      value={selectedEntity?.id}
      onValueChange={(id) => {
        const entity = entities.find(e => e.id === id);
        onEntityChange(entity);
      }}
      options={entities.map(e => ({ label: e.name, value: e.id }))}
      placeholder="Select entity..."
      icon={Film}  // Optional: pass icon
    />
  );
}
```

**Saves:** 240+ lines (3-4 files merged into 1 utility)

---

#### Dialog/Modal Components (MEDIUM DUPLICATION)

**Current Implementation Issues:**
- `LoginModal.jsx` - Custom Dialog with form styling
- `AIReplyGenerator.jsx` - Dialog with copy button pattern
- `SimplifiedReplyGenerator.jsx` - Nearly identical to AIReplyGenerator
- `ThreadGenealogy.jsx` - Dialog with custom header/content

**After Refactor:**
4 components → 1 `Dialog` wrapper + content variants

**Pattern to Extract:**
```jsx
// src/components/radix/Dialog/Dialog.jsx
export const Dialog = ({ open, onOpenChange, title, description, children }) => (
  <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
      <DialogPrimitive.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ...">
        <div className="flex items-start justify-between mb-4">
          <div>
            <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
            {description && <DialogPrimitive.Description>{description}</DialogPrimitive.Description>}
          </div>
          <DialogPrimitive.Close className="p-1 hover:bg-accent rounded">
            <X className="w-4 h-4" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

// Usage in LoginModal
<Dialog open={open} onOpenChange={onOpenChange} title="Sign In">
  <LoginForm onSuccess={handleSuccess} />
</Dialog>
```

**Saves:** 180+ lines (4 files → 1 wrapper)

---

#### Tabs Components (EASY WIN)

**Current Issues:**
- `TabbedInspector.jsx` - 180+ lines with inline Radix Tabs
- `CrisisFocusView.jsx` - 150+ lines with inline Tabs

**Migration:**
```jsx
// Extract to: src/components/radix/Tabs
export const Tabs = ({ value, onValueChange, tabs, children }) => (
  <TabsPrimitive.Root value={value} onValueChange={onValueChange}>
    <TabsPrimitive.List className="border-b border-border">
      {tabs.map(tab => (
        <TabsPrimitive.Trigger key={tab.id} value={tab.id}>
          {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
          {tab.label}
        </TabsPrimitive.Trigger>
      ))}
    </TabsPrimitive.List>
    {children}
  </TabsPrimitive.Root>
);

// Usage: Cleaner component
const TabbedInspector = ({ mention }) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  return (
    <Tabs 
      value={selectedTab} 
      onValueChange={setSelectedTab}
      tabs={INSPECTOR_TABS}
    >
      <TabPrimitive.Content value="overview">
        <OverviewPanel />
      </TabPrimitive.Content>
      // ... other tabs
    </Tabs>
  );
};
```

**Saves:** 100+ lines across 2 files

---

### PHASE 2: Custom Hook Extraction

#### Analytics Logic (CRITICAL - HIGH DUPLICATION)

**Files with duplicate logic:**
1. `DashboardView.jsx` - lines 67-200 (134 lines)
2. `AnalyticsView.jsx` - lines 32-165 (133 lines)
3. `EnhancedMetricsDashboard.jsx` - Similar calculations

**Extraction:**
```javascript
// src/hooks/useAnalyticsCalculations.js
const DEFAULT_ANALYTICS = {
  totalMentions: 0,
  positive: 0, negative: 0, neutral: 0,
  highThreat: 0,
  avgEngagement: 0,
  timeBuckets: [],
  topNarratives: [],
  sentimentData: [],
  platformData: []
};

export const useAnalyticsCalculations = (mentions = [], selectedRange = {}) => {
  return useMemo(() => {
    if (!mentions?.length) return DEFAULT_ANALYTICS;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (selectedRange.days || 7));
    
    const filteredMentions = mentions.filter(m => 
      m?.timestamp >= cutoffDate
    );

    // All the shared logic here...
    const totalMentions = filteredMentions.length;
    const positive = filteredMentions.filter(m => m.aiSentiment === 'positive').length;
    const negative = filteredMentions.filter(m => m.aiSentiment === 'negative').length;
    const neutral = filteredMentions.filter(m => m.aiSentiment === 'neutral').length;
    const highThreat = filteredMentions.filter(m => m.aiThreatScore >= 70).length;

    // ... timeBuckets, platformData calculations

    return {
      totalMentions,
      positive,
      negative,
      neutral,
      highThreat,
      // ...
    };
  }, [mentions, selectedRange.days]);
};

// Usage in DashboardView
const analytics = useAnalyticsCalculations(mentions, selectedRange);

// Usage in AnalyticsView - SAME HOOK!
const analytics = useAnalyticsCalculations(safeMentions, selectedRange);
```

**Saves:** 250+ lines of duplicate code, 1 source of truth

#### Chart Data Transformation Hooks (MEDIUM EFFORT)

**Extract to:**
```javascript
// src/hooks/useChartData.js
export const usePlatformChartData = (mentions) => { ... };
export const useSentimentTrendData = (rawData, entities) => { ... };
export const useCompetitiveChartData = (competitiveData) => { ... };
```

**Savings:** 80+ lines eliminated across chart components

---

#### Query Hooks (EASY STANDARDIZATION)

**Create:** `src/hooks/queries/`

Currently in PRCommandCenter.api.jsx:
- 6 `useQuery` calls (lines ~80-140)
- Repetitive queryKey, queryFn patterns
- Configuration scattered

**Extract to:**
```javascript
// src/hooks/queries/useEntitiesQuery.js
export const useEntitiesQuery = (type = 'movie', options = {}) => {
  const { isAuthenticated = true } = options;
  return useQuery({
    queryKey: ['entities', type],
    queryFn: () => entityService.getAll(type),
    enabled: isAuthenticated,
    staleTime: QUERY_STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
};

// src/hooks/queries/useMentionsQuery.js
export const useMentionsQuery = (entityIds = [], timerange, options = {}) => {
  return useQuery({
    queryKey: ['mentions', entityIds.join(','), timerange],
    queryFn: () => dashboardService.getClusterMentions(entityIds),
    enabled: !!entityIds.length && options.isAuthenticated,
    staleTime: QUERY_STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
};

// Usage in PRCommandCenter is now:
const { data: movies } = useEntitiesQuery('movie', { isAuthenticated });
const { data: mentions } = useMentionsQuery(entityIds, timeRange, { isAuthenticated });
```

**Savings:** Reduces PRCommandCenter.api.jsx by ~50 lines, enables reuse

---

### PHASE 3: Form Components Standardization

**Current Issues:**
- `FormInput.jsx` - Good foundation, can enhance with Radix
- `LoginModal.jsx` - Manual form handling
- Various components with inline form elements

**Create:** `src/components/forms/index.js`

```jsx
// src/components/forms/FormField.jsx
export const FormField = ({ 
  label, 
  error, 
  helpText, 
  required = false, 
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

// src/components/forms/TextInput.jsx
export const TextInput = React.forwardRef(
  ({ label, error, helpText, required, ...props }, ref) => (
    <FormField label={label} error={error} helpText={helpText} required={required}>
      <input
        ref={ref}
        className="w-full px-3 py-2 bg-card border border-border rounded-lg ..."
        {...props}
      />
    </FormField>
  )
);

// Usage in LoginModal
<FormField label="Email" required>
  <input type="email" placeholder="you@example.com" />
</FormField>
```

**Refactor LoginModal:**
```jsx
// BEFORE: 120+ lines with inline form markup
// AFTER: 60-70 lines using form components
import { TextInput, SubmitButton } from '@/components/forms';

export const LoginModal = ({ open, onOpenChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Sign In">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <TextInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <SubmitButton>Sign In</SubmitButton>
      </form>
    </Dialog>
  );
};
```

**Savings:** 50+ lines per form component

---

### PHASE 4: Utility Reorganization

**Current Structure:**
```
src/utils/
├── helpers.js (170 lines - too many concerns)
├── statsTransformer.js
├── filterMentions.js
```

**New Structure:**
```
src/utils/
├── formatting/
│   ├── timestamp.js        (import from helpers.js)
│   ├── currency.js
│   ├── threat.js
│   └── sentiment.js
├── calculations/
│   ├── sentiment.js
│   ├── engagement.js
│   ├── threat.js
│   └── analytics.js
├── transformers/
│   ├── stats.js            (move statsTransformer.js)
│   ├── mentions.js         (move filterMentions.js)
│   └── charter.js          (NEW: chart data transforms)
├── helpers.js              (Keep ONLY: cn util)
└── index.js                (Barrel export all)
```

**Code Refactoring:**

```javascript
// BEFORE: src/utils/helpers.js (170 lines)
export function formatTimestamp(date) { }
export function formatCurrency(value) { }
export function getThreatColor(score) { }
export function getThreatBg(score) { }
export function getSentimentColor(sentiment) { }
export function getSentimentBg(sentiment) { }
export function generateAIReply(mention, replyType) { }
export const cn = () => { }

// AFTER: Organized by domain
// src/utils/formatting/timestamp.js
export function formatTimestamp(date) { }

// src/utils/formatting/currency.js
export function formatCurrency(value) { }

// src/utils/formatting/threat.js
export function getThreatColor(score) { }
export function getThreatBg(score) { }

// src/utils/formatting/sentiment.js
export function getSentimentColor(sentiment) { }
export function getSentimentBg(sentiment) { }

// src/utils/generators/aiReply.js (NEW - extract lengthy function)
export function generateAIReply(mention, replyType) { }

// src/utils/helpers.js (SIMPLIFIED)
export const cn = () => { }

// Usage everywhere becomes more explicit
import { formatTimestamp, formatCurrency } from '@/utils/formatting';
import { getThreatColor, getThreatBg } from '@/utils/formatting/threat';
import { getSentimentColor } from '@/utils/formatting/sentiment';

// OR use barrel export
import { formatTimestamp, formatCurrency, getThreatColor } from '@/utils';
```

**Savings:** Improved code organization, single responsibility

---

### PHASE 5: Constants Centralization

**Current Issues:**
- `REFETCH_INTERVAL = 300000` in PRCommandCenter.api.jsx
- `QUERY_STALE_TIME = 1000 * 60 * 5` in PRCommandCenter.api.jsx
- Time ranges defined in multiple components
- Threat levels scattered

**Create:** `src/constants/`

```javascript
// src/constants/query.js
export const REFETCH_INTERVAL = 300000; // 5 minutes
export const ANALYTICS_REFETCH_INTERVAL = 600000; // 10 minutes
export const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 minutes

// src/constants/time.js
export const TIME_RANGES = {
  DAY: { value: 'DAY', label: 'Daily', days: 7, apiParam: 'DAY' },
  WEEK: { value: 'WEEK', label: 'Weekly', days: 14, apiParam: 'WEEK' },
  MONTH: { value: 'MONTH', label: 'Monthly', days: 28, apiParam: 'MONTH' },
};

export const THREATS = {
  CRITICAL: { min: 80, label: 'Critical', color: 'text-threat-critical' },
  HIGH: { min: 60, label: 'High', color: 'text-threat-high' },
  MEDIUM: { min: 40, label: 'Medium', color: 'text-threat-medium' },
  LOW: { min: 0, label: 'Low', color: 'text-threat-low' },
};

// src/constants/sentiment.js
export const SENTIMENTS = {
  POSITIVE: { value: 'positive', label: 'Positive', color: '#22c55e' },
  NEUTRAL: { value: 'neutral', label: 'Neutral', color: '#a78bfa' },
  NEGATIVE: { value: 'negative', label: 'Negative', color: '#ef4444' },
  SARCASTIC: { value: 'sarcastic', label: 'Sarcastic', color: '#eab308' },
};

// src/constants/views.js
export const VIEWS = {
  DASHBOARD: 'dashboard',
  ANALYTICS: 'analytics',
  AI_ANALYTICS: 'ai-analytics',
  CRISIS_CENTER: 'crisis-center',
  // ...
};

// src/constants/index.js (Barrel export)
export * from './query';
export * from './time';
export * from './threat';
export * from './sentiment';
export * from './views';
export * from './api';

// Usage everywhere:
import { REFETCH_INTERVAL, TIME_RANGES, THREAT_LEVELS } from '@/constants';
```

---

### PHASE 6: Component Wrapper Removal (EASY WINS)

**Shallow Wrappers to Remove/Simplify:**

1. **CrisisManagementCenter.jsx** (~20 lines)
   - Just wraps CrisisPlanGenerator
   - Remove and use CrisisPlanGenerator directly in PRCommandCenter

2. **Redundant view containers**
   - Extract common view layout to `ViewContainer.jsx`
   - Use as wrapper instead of duplicating

**Migration:**
```jsx
// BEFORE: CrisisManagementCenter.jsx (wrapper)
export default function CrisisManagementCenter({ selectedEntity, mentions }) {
  return (
    <div className="h-full flex flex-col bg-background">
      <CrisisPlanGenerator {...props} />
    </div>
  );
}

// AFTER: Just use in PRCommandCenter.api.jsx
{activeView === 'crisis-management' && selectedEntity && (
  <ViewContainer title="Crisis Management">
    <CrisisPlanGenerator {...props} />
  </ViewContainer>
)}
```

**Savings:** 2-3 files, cleaner hierarchy

---

## Quick Win Priority List

### Easy (1-2 hours each)
- [x] Extract form constants
- [ ] Create centralized constants folder
- [ ] Simplify shallow wrapper components
- [ ] Organize utilities by domain

### Medium (3-5 hours each)
- [ ] Create Radix Select wrapper
- [ ] Extract analytics calculations hook
- [ ] Create form component library
- [ ] Extract query hooks

### Hard (5-10 hours each)
- [ ] Create Radix Dialog wrapper & migrate 4 modals
- [ ] Full Radix UI component library
- [ ] Zustand store enhancement
- [ ] Complete utility reorganization

---

## Testing Strategy

### Coverage Before → After

| Category | Before | After | Priority |
|----------|--------|-------|----------|
| Components | 40% | 70% | HIGH |
| Hooks | 30% | 80% | CRITICAL |
| Utils | 20% | 90% | CRITICAL |
| Integration | 50% | 75% | MEDIUM |

### New Test Files to Create

```
src/__tests__/
├── hooks/
│   ├── queries/
│   │   ├── useEntitiesQuery.test.js
│   │   ├── useMentionsQuery.test.js
│   │   └── useStatsQuery.test.js
│   ├── useAnalyticsCalculations.test.js
│   ├── useSentimentStats.test.js
│   └── usePlatformBreakdown.test.js
├── components/
│   ├── radix/
│   │   ├── Select.test.js
│   │   ├── Dialog.test.js
│   │   └── Tabs.test.js
│   ├── forms/
│   │   ├── FormField.test.js
│   │   ├── TextInput.test.js
│   │   └── SelectField.test.js
│   └── layouts/
│       └── ViewContainer.test.js
└── utils/
    ├── formatting.test.js
    └── calculations.test.js
```

---

## Rollout Plan

### Branch Strategy
```
main (production)
├── develop (staging)
│   ├── feature/radix-select-wrapper
│   ├── feature/analytics-hooks
│   ├── feature/form-components
│   └── feature/utils-reorganization
```

### PR Review Checklist
- [ ] No breaking API changes
- [ ] Tests pass & coverage maintained
- [ ] Performance benchmarks show improvement
- [ ] PropTypes/TypeScript validation
- [ ] Storybook stories updated
- [ ] Documentation updated

### Rollback Plan
- Keep old components in place during migration
- Use feature flags for gradual rollout
- Maintain backwards compatibility layer

---

**Document Version:** 1.0  
**Last Updated:** April 20, 2026
