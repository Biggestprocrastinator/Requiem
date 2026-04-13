import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#334155",
        font: { size: 10, weight: 600 }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: "#475569",
        font: { size: 11, weight: 500 },
        padding: 2
      },
      grid: {
        display: false
      }
    },
    y: {
      ticks: {
        color: "#475569",
        font: { size: 11, weight: 500 },
        padding: 2
      },
      grid: {
        color: "rgba(181, 10, 46, 0.06)"
      }
    }
  }
};

const ChartCard = ({ title, children }) => (
  <div className="rounded-2xl border border-[#e5dfd3] shadow-lg p-3 h-[260px] flex flex-col overflow-hidden" style={{ background: 'linear-gradient(135deg, #fdfbf6 0%, #f8f4ec 100%)' }}>
    <h3 className="text-sm font-semibold text-[#721c24] mb-2 truncate tracking-wide leading-tight">{title}</h3>
    <div className="flex-1 min-h-0">{children}</div>
  </div>
);

const buildPieData = (data) => {
  if (!data?.inventory) return null;
  const domains = data.inventory.domains || [];
  const uniqueIPs = new Set(data.inventory.ip_addresses || []).size;
  const web = domains.length;
  const api = domains.filter((domain) => domain?.toLowerCase().includes("api")).length;
  const server = uniqueIPs;
  return {
    labels: ["Web", "API", "Server"],
    datasets: [
      {
        label: "Asset Count",
        data: [web, api, server],
        backgroundColor: ["#3b82f6", "#10b981", "#FABC0A"],
        borderColor: ["#2563eb", "#059669", "#D49D00"],
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  };
};

const buildBarData = (data) => {
  const cbom = data?.cbom || [];
  const riskCount = { low: 0, medium: 0, high: 0 };
  cbom.forEach((item) => {
    const r = (item.risk_level || "").toLowerCase();
    if (riskCount[r] !== undefined) {
      riskCount[r]++;
    }
  });
  return {
    labels: ["Low", "Medium", "High"],
    datasets: [
      {
        label: "Asset Count",
        data: [riskCount.low, riskCount.medium, riskCount.high],
        backgroundColor: ["rgba(34,197,94,0.8)", "rgba(234,179,8,0.8)", "rgba(239,68,68,0.8)"],
        borderColor: ["#16a34a", "#ca8a04", "#dc2626"],
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: ["#22c55e", "#eab308", "#ef4444"]
      }
    ]
  };
};

export function AssetDistributionCard({ data }) {
  const pieData = buildPieData(data);
  if (!pieData) return null;
  return (
    <ChartCard title="Asset Distribution">
      <div className="h-full">
        <Pie data={pieData} options={chartOptions} />
      </div>
    </ChartCard>
  );
}

export function RiskDistributionCard({ data }) {
  const barData = buildBarData(data);
  return (
    <ChartCard title="Risk Distribution">
      <div className="h-full">
        <Bar data={barData} options={chartOptions} />
      </div>
    </ChartCard>
  );
}

export default function Charts({ data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
      <AssetDistributionCard data={data} />
      <RiskDistributionCard data={data} />
    </div>
  );
}
