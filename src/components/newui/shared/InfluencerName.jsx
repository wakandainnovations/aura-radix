// Renders an influencer's name as a link to their platform profile when one
// is available (top-spreaders rows carry `profileUrl`), otherwise as plain
// text - mirrors the classic UI's AuthorName in SpreaderAnalysisView.jsx.
export default function InfluencerName({ name, url, className = 'text-white/85' }) {
  if (!url) return <span className={`${className} truncate`}>{name}</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} truncate hover:underline hover:text-white`}
    >
      {name}
    </a>
  );
}
