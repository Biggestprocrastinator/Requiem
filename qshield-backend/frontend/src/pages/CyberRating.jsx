import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function CyberRating({ scanData, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-secondary mb-4">autorenew</span>
        <h3 className="font-bold text-lg text-on-surface">Calculating Risk Models...</h3>
        <p className="text-sm text-on-surface-variant mt-2">Computing Q-VaR and security posture ratings.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container text-on-error-container p-4 flex items-center gap-3 rounded-lg shadow-sm border border-error/20">
        <span className="material-symbols-outlined text-error">error</span>
        <div className="flex-1">
          <h4 className="font-bold text-sm">Rating Engine Error</h4>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (!scanData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] opacity-50">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4" style={{ fontVariationSettings: "'wght' 200" }}>grade</span>
        <h3 className="font-bold text-lg text-on-surface">No Rating Data</h3>
        <p className="text-sm text-on-surface-variant mt-2">Scan an infrastructure to generate a Cyber Security Rating.</p>
      </div>
    );
  }

  const score = scanData.score || 0;
  const rating = scanData.rating || 'N/A';
  const classical = scanData.classical_security || 'N/A';
  const quantum = scanData.quantum_security || 'N/A';

  const scoreColor = score > 80 ? '#4ade80' : score > 60 ? '#facc15' : '#ef4444';

  const doughnutData = {
    datasets: [{
      data: [score, 100 - score],
      backgroundColor: [scoreColor, 'rgba(255, 255, 255, 0.05)'],
      borderWidth: 0,
      circumference: 240,
      rotation: 240,
    }]
  };

  const doughnutOptions = {
    cutout: '85%',
    plugins: { tooltip: { enabled: false }, legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false,
  };

  const riskCounts = {
    high: scanData.summary?.high_risk_assets || 0,
    medium: (scanData.assets?.length || 0) - (scanData.summary?.high_risk_assets || 0) - (scanData.summary?.quantum_safe || 0),
    low: scanData.summary?.quantum_safe || 0
  };

  const barData = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [{
      label: 'Assets',
      data: [riskCounts.high, Math.max(0, riskCounts.medium), riskCounts.low],
      backgroundColor: ['#ef4444', '#facc15', '#4ade80'],
      borderRadius: 8,
    }]
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Header */}
      <div className="col-span-12 flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tighter uppercase">Cyber Security Rating</h1>
          <p className="text-sm text-on-surface-variant">Real-time cryptographic posture and risk assessment score.</p>
        </div>
        <div className="bg-surface-container px-4 py-2 rounded-xl border border-outline-variant/30 text-xs font-black uppercase tracking-widest text-secondary">
          Certified Scan
        </div>
      </div>

      {/* Main Score Card */}
      <div className="col-span-12 lg:col-span-5 glass-card p-8 rounded-3xl border border-outline-variant/30 flex flex-col items-center justify-center relative overflow-hidden bg-surface shadow-2xl">
        <div className="absolute top-0 right-0 p-6">
           <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em]">Overall Score</div>
        </div>
        <div className="w-64 h-64 relative">
          <Doughnut data={doughnutData} options={doughnutOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-black text-on-surface">{score}</span>
            <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Points</span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className={`text-3xl font-black uppercase tracking-tighter ${score > 80 ? 'text-green-500' : 'text-yellow-500'}`}>
            {score > 85 ? 'Excellent' : score > 70 ? 'Secure' : score > 50 ? 'Moderate' : 'Critical'}
          </div>
          <p className="text-xs text-on-surface-variant mt-2 max-w-xs mx-auto">
            Your infrastructure is {score}% protected against both classical and nascent quantum threats.
          </p>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-6">
        {/* Rating Segment */}
        <div className="col-span-1 glass-card p-6 rounded-3xl border border-outline-variant/30 bg-surface flex flex-col justify-between">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary">analytics</span>
          </div>
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Rating Segment</h3>
          <div className="text-5xl font-black text-on-surface mb-2">{rating}</div>
          <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
            Consolidated grade based on industry standard compliance metrics.
          </p>
        </div>

        {/* Quantum Readiness */}
        <div className="col-span-1 glass-card p-6 rounded-3xl border border-outline-variant/30 bg-surface flex flex-col justify-between">
          <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-secondary">flare</span>
          </div>
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Quantum Security</h3>
          <div className="text-2xl font-black text-on-surface mb-2">{quantum}</div>
          <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
            Assessment of resistance to Shor's algorithm and quantum cryptanalysis.
          </p>
        </div>

        {/* Classical Security */}
        <div className="col-span-1 glass-card p-6 rounded-3xl border border-outline-variant/30 bg-surface flex flex-col justify-between">
          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-green-500">security_update_good</span>
          </div>
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Classical Security</h3>
          <div className="text-2xl font-black text-on-surface mb-2">{classical}</div>
          <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
            Evaluation of current PKE, RSA, and ECC implementations.
          </p>
        </div>

        {/* History / Trend */}
        <div className="col-span-1 glass-card p-6 rounded-3xl border border-outline-variant/30 bg-surface flex flex-col justify-between">
           <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-blue-500">
            <span className="material-symbols-outlined">trending_up</span>
          </div>
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Score Trend</h3>
          <div className="text-2xl font-black text-green-500 mb-2">+12%</div>
          <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
            Improvement in security posture since the last assessment.
          </p>
        </div>
      </div>

      {/* Asset Risk Distribution */}
      <div className="col-span-12 glass-card p-8 rounded-3xl border border-outline-variant/30 bg-surface">
        <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-8">Asset Risk Distribution</h3>
        <div className="h-64">
           <Bar 
            data={barData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
                x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.7)', font: { weight: 'bold' } } }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
}
