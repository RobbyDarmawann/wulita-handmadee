"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrasi modul Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

export default function AdminChart({ labels, data }: { labels: string[], data: number[] }) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#451a03', // amber-950
        padding: 12,
        titleFont: { size: 13, family: "'Inter', sans-serif" },
        bodyFont: { size: 14, weight: 'bold' as const, family: "'Inter', sans-serif" },
        callbacks: {
          label: function(context: any) {
            return 'Rp ' + new Intl.NumberFormat('id-ID').format(context.raw);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#F3F4F6' },
        border: { display: false },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 11 },
          color: '#9CA3AF',
          callback: function(value: any) {
            if(value >= 1000000) return 'Rp ' + (value/1000000) + ' Jt';
            if(value >= 1000) return 'Rp ' + (value/1000) + 'k';
            return 'Rp ' + value;
          }
        }
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 11 },
          color: '#9CA3AF'
        }
      }
    }
  };

  const chartData = {
    labels,
    datasets: [
      {
        fill: true,
        data,
        borderColor: '#D97706', // amber-600
        backgroundColor: 'rgba(217, 119, 6, 0.1)', // Transparan amber
        borderWidth: 3,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#D97706',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4 // Membuat kurva melengkung mulus
      }
    ]
  };

  return <Line options={chartOptions} data={chartData} />;
}