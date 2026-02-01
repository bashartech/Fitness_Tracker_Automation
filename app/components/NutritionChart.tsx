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

interface NutritionChartProps {
  data: any[];
}

export default function NutritionChart({ data }: NutritionChartProps) {
  const chartData = {
    labels: data.map(item => item._id),
    datasets: [
      {
        label: 'Calories',
        data: data.map(item => item.totalCalories),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Protein (g)',
        data: data.map(item => item.totalProtein),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Carbs (g)',
        data: data.map(item => item.totalCarbs),
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
      },
      {
        label: 'Fats (g)',
        data: data.map(item => item.totalFats),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
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
        text: 'Nutrition Intake Per Day',
      },
    },
  };

  return <Bar options={options} data={chartData} />;
}