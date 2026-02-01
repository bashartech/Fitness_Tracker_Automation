'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WorkoutChartProps {
  data: any[];
}

export default function WorkoutChart({ data }: WorkoutChartProps) {
  const chartData = {
    labels: data.map(item => item._id),
    datasets: [
      {
        label: 'Workouts Per Day',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Workouts Per Day',
      },
    },
  };

  return <Bar options={options} data={chartData} />;
}