import { Sparkles } from 'lucide-react';

// Placeholder shell for the redesigned UI. Swap this out once the new
// design (from the screenshot) is implemented — the toggle in App.jsx
// already wires it up behind the admin-only UI mode switch.
export default function NewCommandCenter() {
  return (
    <div className="h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center max-w-md px-6">
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">New UI is on its way</h1>
        <p className="text-muted-foreground">
          This is a placeholder for the redesigned experience. Once the new design is
          implemented, it will render here. Use the button in the corner to switch back
          to the classic UI anytime.
        </p>
      </div>
    </div>
  );
}
