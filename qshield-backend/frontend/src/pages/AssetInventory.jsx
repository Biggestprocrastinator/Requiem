import AssetGraph from '../components/AssetGraph';

export default function AssetInventory({ scanData, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-secondary mb-4">autorenew</span>
        <h3 className="font-bold text-lg text-on-surface">Scanning Infrastructure...</h3>
        <p className="text-sm text-on-surface-variant mt-2">Running PQC Risk Assessment and CBOM Generation</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container text-on-error-container p-4 flex items-center gap-3 rounded-lg shadow-sm border border-error/20">
        <span className="material-symbols-outlined text-error">error</span>
        <div className="flex-1">
            <h4 className="font-bold text-sm">Scan Failed</h4>
            <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (!scanData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] opacity-50">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4" style={{ fontVariationSettings: "'wght' 200" }}>manage_search</span>
        <h3 className="font-bold text-lg text-on-surface">No Active Scan Data</h3>
        <p className="text-sm text-on-surface-variant mt-2">Enter a domain in the top search bar to initiate a scan.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-[calc(100vh-8rem)]">
      <section className="rounded-lg shadow-2xl shadow-[#1d1b19]/10 border border-outline-variant/30 flex flex-col overflow-hidden bg-surface flex-1 w-full">
        <div className="p-1 h-full min-h-[600px] relative w-full">
          <AssetGraph scanData={scanData} />
        </div>
      </section>
    </div>
  );
}
