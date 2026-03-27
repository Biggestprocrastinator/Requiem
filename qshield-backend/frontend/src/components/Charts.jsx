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
        color: "#f8fafc",
        font: { size: 10 }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: "#f8fafc",
        font: { size: 11 },
        padding: 2
      },
      grid: {
        display: false
      }
    },
    y: {
      ticks: {
        color: "#f8fafc",
        font: { size: 11 },
        padding: 2
      },
      grid: {
        color: "rgba(248, 250, 252, 0.1)"
      }
    }
  }
};

const ChartCard = ({ title, children }) => (
  <div className="bg-gray-900 rounded-2xl border border-white/10 shadow-xl p-3 h-[260px] flex flex-col overflow-hidden">
    <h3 className="text-sm font-medium text-white mb-2 truncate tracking-wide leading-tight">{title}</h3>
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
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
        borderWidth: 0
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
        backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
        borderWidth: 0
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
