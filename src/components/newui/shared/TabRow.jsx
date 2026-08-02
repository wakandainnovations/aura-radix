// Generic underline tab row shared by every section header.
export default function TabRow({ tabs, activeTab, onTabChange, size = 'md' }) {
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <div className="flex items-center gap-6 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange?.(tab)}
          className={`relative pb-3 font-medium transition-colors whitespace-nowrap ${textSize} ${
            tab === activeTab ? 'text-blue-400' : 'text-white/45 hover:text-white/70'
          }`}
        >
          {tab}
          {tab === activeTab && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-blue-500 rounded-full" />}
        </button>
      ))}
    </div>
  );
}
