// Post-release lifecycle stages carry jargon-y distribution-window names; this
// spells them out for use as hover tooltips. THEATRICAL_WINDOW isn't just
// "release date" - it's the in-theaters run, from day 1 through roughly day
// 17-45 post-release (see AuraService CheckpointStageCatalog).
export const STAGE_LABEL_TOOLTIP = {
  THEATRICAL_WINDOW: 'Showing in theaters (roughly the first 1–6 weeks after release)',
  PVOD_WINDOW: 'Available to rent or buy online, before it reaches a streaming subscription',
  SVOD_WINDOW: 'Now included with a streaming subscription, like Netflix or Prime Video',
  LINEAR_TV_AVOD: 'Airing on regular TV and free, ad-supported streaming apps',
};
