import { useLocation } from 'react-router-dom';


const filterLabels = {
  high: 'High Risk',
  expiring: 'Expiring Soon',
  web: 'Web Apps',
  api: 'APIs',
  server: 'Servers'
};

const typeFilters = new Set(['web', 'api', 'server']);

const getExpiryDaysFromAsset = (asset) => {
  const days = asset?.certificate?.expiry_days;
  if (typeof days === 'number') {
    return days;
  }
  const expiryDate = asset?.certificate?.expiry_date;
  if (expiryDate) {
    const parsed = Date.parse(expiryDate);
    if (!Number.isNaN(parsed)) {
      const delta = Math.floor((parsed - Date.now()) / (1000 * 60 * 60 * 24));
      return delta;
    }
  }
  return null;
};

const isExpiringAsset = (asset) => {
  const expiryDays = getExpiryDaysFromAsset(asset);
  return typeof expiryDays === 'number' && expiryDays >= 0 && expiryDays < 30;
};

export default function Assets({ scanData, isLoading, error }) {
  const location = useLocation();
  const activeFilter = location.state?.filter;
  const normalizedFilter = activeFilter?.toLowerCase();

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

  const counts = scanData.counts || {};
  const sourceAssets = Array.isArray(scanData.cbom) && scanData.cbom.length ? scanData.cbom : scanData.assets || [];
  const assets = sourceAssets.map((asset) => ({
    ...asset,
    type: asset?.type || 'server',
    services: asset?.services || [],
  }));

  console.log('Assets:', assets);
  console.log('Filter:', activeFilter);

  const filteredAssets = normalizedFilter
    ? typeFilters.has(normalizedFilter)
      ? assets.filter((asset) => (asset.type || 'server').toLowerCase() === normalizedFilter)
      : normalizedFilter === 'high'
        ? assets.filter((asset) => (asset.risk_level || '').toLowerCase() === 'high')
        : normalizedFilter === 'expiring'
          ? assets.filter(isExpiringAsset)
          : assets
    : assets;

  const activeFilterLabel = normalizedFilter ? filterLabels[normalizedFilter] : '';

  const renderServiceBadges = (services) => {
    if (!services || !services.length) {
      return <span className="text-[11px] text-on-surface-variant">No services detected</span>;
    }

    return services.map((service, index) => {
      const label = service.product || service.service || 'Unknown service';
      const versionSuffix = service.version ? ` ${service.version}` : '';
      const base = service.outdated
        ? 'bg-red-100 text-red-800 border border-red-200'
        : 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      return (
        <span
          key={`${service.port || 'port'}-${index}`}
          className={`px-2 py-1 text-[11px] font-semibold rounded-full inline-flex items-center gap-1 ${base}`}
        >
          <span>{`${label}${versionSuffix}`}</span>
          {service.outdated && <span className="text-[10px]">⚠</span>}
        </span>
      );
    });
  };

  return (
    <div className="grid grid-cols-12 gap-8 auto-rows-min">
      {/* Asset Inventory Table */}
      <section className="col-span-12 glass-card rounded-lg p-8 shadow-2xl shadow-[#1d1b19]/5">
        <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
          <div>
            <h3 className="font-headline text-2xl font-extrabold text-on-surface tracking-tight">Asset Discovery</h3>
            <p className="text-on-surface-variant text-sm mt-1">Found {counts?.domains || 0} domains and {counts?.ips || 0} unique IPs.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilterLabel && (
              <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Filtered: {activeFilterLabel}
              </span>
            )}
            <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Inventory</span>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-xl border border-outline-variant/30 mt-4">
          <table className="min-w-full divide-y divide-outline-variant/30">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60">Domain</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60">IP Address</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60">Services</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 bg-surface">
              {filteredAssets && filteredAssets.length > 0 ? (
                filteredAssets.map((asset, i) => (
                  <tr key={asset.domain || i} className="hover:bg-surface-variant/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-secondary">language</span>
                        {asset.domain || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant/50">router</span>
                        {asset.ip || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">
                      <div className="flex flex-wrap gap-2">{renderServiceBadges(asset.services)}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-sm font-medium text-on-surface-variant">No assets found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>


    </div>
  );
}
