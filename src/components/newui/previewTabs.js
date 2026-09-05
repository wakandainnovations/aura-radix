// Demo-ready nav sections and sub-tabs. In demo mode (the default — what a
// customer sees) only these are shown; everything else is still being built.
// An admin can flip on full access (see usePreviewTabsToggle) to see the
// whole app while building/testing.
//
// Competitor Intelligence and War Room are also hidden here (rather than
// just having their sub-tabs restricted) because they depend on backend
// changes that aren't ready yet — full access is currently the only way to
// reach them, i.e. they're admin-only for now.
//
// Sections not listed in DEMO_VISIBLE_SUBTABS (Command Center, AI Producer)
// show all of their content in demo mode — there's nothing to restrict.
export const DEMO_HIDDEN_NAV_KEYS = ['campaign-planner', 'competitor-intelligence', 'war-room'];

export const DEMO_VISIBLE_SUBTABS = {
  'my-movie': ['Performance'],
  'audience-intelligence': ['Influencers'],
};

// Given every tab a section defines and whether the viewer has full access,
// returns the tabs that should actually be shown.
export function visibleTabsFor(sectionKey, allTabs, fullAccess) {
  const allowed = DEMO_VISIBLE_SUBTABS[sectionKey];
  if (fullAccess || !allowed) return allTabs;
  return allTabs.filter((tab) => allowed.includes(tab));
}
