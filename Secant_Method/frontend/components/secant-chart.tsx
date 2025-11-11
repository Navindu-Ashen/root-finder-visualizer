"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import * as math from "mathjs";

interface SecantChartProps {
  data: Array<{ x2: number }>;
  func: string;
  tolerance: number;
  finalRoot: number;
  allRoots?: number[];
}

interface IterationData {
  x: number;
  y: number;
  iteration: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload?: IterationData;
  }>;
  label?: string | number;
}

// Custom tooltip for the function line
const FunctionTooltip: React.FC<TooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="text-sm">
          <span className="font-medium">x:</span> {Number(label).toFixed(4)}
        </p>
        <p className="text-sm">
          <span className="font-medium">f(x):</span>{" "}
          {Number(payload[0].value).toFixed(4)}
        </p>
      </div>
    );
  }
  return null;
};

const SecantChart: React.FC<SecantChartProps> = ({
  data,
  func,
  finalRoot,
  allRoots = [finalRoot],
}) => {
  // Generate function curve data
  const functionData = useMemo(() => {
    const points = [];
    // const xValues = data.map((d) => d.x2);

    // Center around roots with zoom
    const rootCenter =
      allRoots.length > 0
        ? allRoots.reduce((sum, root) => sum + root, 0) / allRoots.length
        : 0;

    const zoomRange = 4; // Zoom range around roots
    const minX = rootCenter - zoomRange;
    const maxX = rootCenter + zoomRange;

    const yValues = [];
    for (let x = minX; x <= maxX; x += (maxX - minX) / 200) {
      try {
        const mathFunc = func.replace(/\*\*/g, "^");
        const y = math.evaluate(mathFunc, { x });
        if (isFinite(y) && Math.abs(y) < 1000) {
          points.push({ x, y });
          yValues.push(y);
        }
      } catch {
        // Skip invalid points
      }
    }
    return { points, yValues, rootCenter };
  }, []);

  return (
    <div className="space-y-6">
      {/* Function Plot */}
      <div>
        <h4 className="text-sm font-medium mb-3">Function: f(x) = {func}</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={functionData.points}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="x"
                type="number"
                scale="linear"
                domain={(() => {
                  const rootCenter = functionData.rootCenter;
                  const zoomRange = 4;
                  return [rootCenter - zoomRange, rootCenter + zoomRange];
                })()}
                tickFormatter={(value) => Number(value).toFixed(2)}
              />
              <YAxis
                type="number"
                domain={(() => {
                  // Center Y-axis around y=0 (where roots occur) with zoom
                  const yZoomRange = 10; // Zoomed range around y=0
                  return [-yZoomRange, yZoomRange];
                })()}
                tickFormatter={(value) => Number(value).toFixed(2)}
              />
              <Tooltip content={<FunctionTooltip />} />
              <ReferenceLine
                y={0}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="2 2"
              />
              <ReferenceLine y={0} stroke="#000000" strokeDasharray="2 2" />
              <ReferenceLine x={0} stroke="#000000" strokeDasharray="2 2" />
              {allRoots.map((root, index) => (
                <ReferenceLine
                  key={index}
                  x={root}
                  stroke={
                    index === 0
                      ? "hsl(var(--destructive))"
                      : "hsl(var(--primary))"
                  }
                  strokeDasharray="5 5"
                  label={{
                    value: allRoots.length > 1 ? `Root ${index + 1}` : "Root",
                    position: "top",
                  }}
                />
              ))}
              <Line
                type="monotone"
                dataKey="y"
                stroke="#000000"
                strokeWidth={2}
                dot={false}
                name="f(x)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Convergence Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="font-medium text-muted-foreground">
            {allRoots.length > 1 ? "Primary Root" : "Final Root"}
          </div>
          <div className="text-lg font-mono">{finalRoot.toFixed(8)}</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="font-medium text-muted-foreground">Total Roots</div>
          <div className="text-lg font-mono">{allRoots.length}</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="font-medium text-muted-foreground">Iterations</div>
          <div className="text-lg font-mono">{data.length}</div>
        </div>
      </div>
    </div>
  );
};

export default SecantChart;
