import * as Tooltip from '@radix-ui/react-tooltip';

// Native `title` tooltips have no visual affordance (no underline/cursor cue)
// and need a ~1s hover to appear, so people never discover they're there.
// This renders a real, immediately-visible tooltip instead.
export default function InfoTooltip({ content, children }) {
  if (!content) return children;

  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={6}
            className="z-50 max-w-[220px] rounded-md border border-white/10 bg-neutral-900 px-2.5 py-1.5 text-[11px] leading-snug text-white/90 shadow-lg"
          >
            {content}
            <Tooltip.Arrow className="fill-neutral-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
