import type { MinMaxPriceForMonth } from '@/pages/products/[id]';
import { Chart as ChartJS, CategoryScale, LineController, LineElement, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';


ChartJS.register(CategoryScale, LineController, LineElement, ...registerables);



export default function PriceChart({ minMaxPriceForMonth }: { minMaxPriceForMonth: MinMaxPriceForMonth}) {

  /* chart.js */
  const chartData = {
    labels: minMaxPriceForMonth.map((data) => data.date),
    datasets: [
      {
        label: "최저 가격",
        data: minMaxPriceForMonth.map((data) => data.minPrice < Infinity ? data.minPrice : null),
        fill: 1,
      },
      {
        label: "최고 가격",
        data: minMaxPriceForMonth.map((data) => data.maxPrice > 0 ? data.maxPrice : null),
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        min: 0
      }
    },
    interaction: {
      mode: 'index' as 'index',
      intersect: false
    },
    responsive: true,
  };



  return (
    <Line
      data={chartData}
      options={chartOptions}
      style={{ width: "100%", maxHeight: "20rem" }}
    />
  )
}