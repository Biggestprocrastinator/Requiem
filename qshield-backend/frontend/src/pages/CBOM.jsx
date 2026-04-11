import { useState } from 'react';

export default function CBOM({ scanData, isLoading, error }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-secondary mb-4">autorenew</span>
        <h3 className="font-bold text-lg text-on-surface">Generating CBOM...</h3>
        <p className="text-sm text-on-surface-variant mt-2">Inventorying cryptographic assets and primitives.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container text-on-error-container p-4 flex items-center gap-3 rounded-lg shadow-sm border border-error/20">
        <span className="material-symbols-outlined text-error">error</span>
        <div className="flex-1">
          <h4 className="font-bold text-sm">Failed to Load CBOM</h4>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (!scanData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] opacity-50">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4" style={{ fontVariationSettings: "'wght' 200" }}>inventory</span>
        <h3 className="font-bold text-lg text-on-surface">No Data Available</h3>
        <p className="text-sm text-on-surface-variant mt-2">Run a scan to generate the Cryptographic Bill of Materials.</p>
      </div>
    );
  }

  const assets = Array.isArray(scanData.cbom) && scanData.cbom.length > 0 ? scanData.cbom : scanData.assets || [];
  
  const filteredAssets = assets.filter(asset => 
    (asset.domain || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.ip || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.crypto_algorithm || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pqcReady = assets.filter(a => a.pqc_supported || (a.crypto_algorithm && a.crypto_algorithm.toLowerCase().includes('kyber'))).length;
  const legacy = assets.filter(a => a.crypto_algorithm && (a.crypto_algorithm.includes('RSA-1024') || a.crypto_algorithm.includes('SHA-1'))).length;
  const standard = assets.length - pqcReady - legacy;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#81001d] to-[#a51c30] rounded-2xl p-6 shadow-xl border border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-3">
              <span className="material-symbols-outlined">inventory</span>
              Cryptographic Bill of Materials
            </h1>
            <p className="text-white/70 text-sm mt-1">Full inventory of cryptographic primitives, algorithms, and protocols across your infrastructure.</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-center">
              <div className="text-xs text-white/60 uppercase font-bold tracking-tighter">Total Assets</div>
              <div className="text-xl font-bold text-white">{assets.length}</div>
            </div>
            <div className="bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30 text-center">
              <div className="text-xs text-green-300 uppercase font-bold tracking-tighter">PQC Ready</div>
              <div className="text-xl font-bold text-green-400">{pqcReady}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
          <input 
            type="text" 
            placeholder="Search components, algorithms..." 
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <button className="px-4 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-surface-variant transition-colors">
             <span className="material-symbols-outlined text-sm">download</span>
             Export CBOM (JSON)
           </button>
           <button className="px-4 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-surface-variant transition-colors">
             <span className="material-symbols-outlined text-sm">ios_share</span>
             Share
           </button>
        </div>
      </div>

      {/* CBOM Table */}
      <div className="glass-card rounded-2xl border border-outline-variant/30 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant/30">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70">Component / Asset</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70">Algorithm</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70">Protocol</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70">Compliance</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredAssets.length > 0 ? filteredAssets.map((asset, i) => (
                <tr key={i} className="hover:bg-surface-variant/10 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-sm text-on-surface">{asset.domain || 'Unknown Asset'}</div>
                      <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">{asset.ip || '---'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-sm">lock</span>
                      <span className="text-sm font-medium">{asset.crypto_algorithm || asset.tls_cipher || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono bg-surface-container px-2 py-1 rounded border border-outline-variant/20">
                      {asset.tls_version || 'TLS 1.2'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">FIPS 140-3</span>
                        {asset.pqc_supported && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">NIST PQC</span>}
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${
                         (asset.crypto_algorithm && (asset.crypto_algorithm.includes('SHA-1') || asset.crypto_algorithm.includes('RSA-1024'))) ? 'bg-error animate-pulse' : 
                         asset.pqc_supported ? 'bg-green-500' : 'bg-secondary'
                       }`}></span>
                       <span className="text-xs font-bold uppercase tracking-wider">
                         { (asset.crypto_algorithm && (asset.crypto_algorithm.includes('SHA-1') || asset.crypto_algorithm.includes('RSA-1024'))) ? 'Vulnerable' : 
                          asset.pqc_supported ? 'Quantum-Safe' : 'Compliant' }
                       </span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant italic">
                    No components matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
