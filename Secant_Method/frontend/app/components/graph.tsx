import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import * as math from "mathjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface IterationData {
  x2: number;
}

interface GraphProps {
  data: IterationData[];
  func: string;
}

function Graph({ data, func }: GraphProps) {
  if (!data) return null;

  const f = (x: number) => {
    try {
      // Replace ** with ^ for mathjs compatibility
      const mathFunc = func.replace(/\*\*/g, "^");
      return math.evaluate(mathFunc, { x });
    } catch (error) {
      console.error("Error evaluating function:", error);
      return 0; // Return 0 for invalid expressions
    }
  };

  const xValues = Array.from({ length: 100 }, (_, i) => -5 + i * 0.1);
  const yValues = xValues.map((x) => {
    try {
      return f(x);
    } catch {
      return 0;
    }
  });

  const iterPoints = data.map((d: IterationData) => {
    try {
      return {
        x: d.x2,
        y: f(d.x2),
      };
    } catch {
      return {
        x: d.x2,
        y: 0,
      };
    }
  });

  const chartData = {
    datasets: [
      {
        label: "f(x)",
        data: xValues.map((x, i) => ({ x, y: yValues[i] })),
        borderColor: "blue",
        backgroundColor: "blue",
        fill: false,
        pointRadius: 1,
      },
      {
        label: "Iterations",
        data: iterPoints,
        borderColor: "red",
        backgroundColor: "red",
        showLine: false,
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: "linear" as const,
        position: "bottom" as const,
      },
      y: {
        type: "linear" as const,
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

export default Graph;
