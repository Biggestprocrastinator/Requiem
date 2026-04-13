export default function Recommendations({ insights }) {
  if (!insights || !insights.length) return null;

  const recommendations = insights
    .slice(0, 4)
    .map((insight) => {
      const text = insight.replace('All assets ', '');
      return text.endsWith('.') ? text : `${text}.`;
    });

  return (
    <section
      className="col-span-12 md:col-span-6 backdrop-blur rounded-3xl p-4 shadow-lg border border-[#e5dfd3]"
      style={{ background: 'linear-gradient(135deg, #fdfbf6 0%, #f8f4ec 100%)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-sm text-on-surface tracking-wide">Recommended Actions</h4>
          <p className="text-[11px] text-on-surface-variant">Based on the latest telemetry</p>
        </div>
        <span className="text-xs font-bold text-secondary uppercase tracking-[0.25em]">Action</span>
      </div>
      <ul className="space-y-2">
        {recommendations.map((rec, index) => (
          <li key={index} className="flex gap-2 text-[11px] text-on-surface leading-tight">
            <span className="text-secondary">✓</span>
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
