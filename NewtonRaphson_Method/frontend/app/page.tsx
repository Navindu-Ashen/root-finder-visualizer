"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Calculator,
  TrendingDown,
  IterationCcw,
  AlertCircle,
  CheckCircle2,
  Target,
} from "lucide-react";

interface IterationData {
  iteration: number;
  x_value: number;
  f_x: number;
  f_prime_x: number;
  error: number;
}

interface NewtonRaphsonResponse {
  root: number;
  roots: number[];
  converged: boolean;
  total_error: number;
  final_error: number;
  iterations_count: number;
  iterations_data: IterationData[];
  message: string;
}

interface EquationRequest {
  equation: string;
  initial_guess: number;
}

export default function NewtonRaphsonCalculator() {
  const [equation, setEquation] = useState("x**2 - 4");
  const [initialGuess, setInitialGuess] = useState("1.0");
  const [result, setResult] = useState<NewtonRaphsonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example equations list
  const exampleEquations = [
    {
      equation: "x**3 - 6*x**2 + 11*x - 6",
      initialGuess: "2.0",
      display: "x³ - 6x² + 11x - 6 = 0",
      description: "Cubic equation",
    },
    {
      equation: "exp(x) - 3*x**2",
      initialGuess: "1.5",
      display: "eˣ - 3x² = 0",
      description: "Exponential equation",
    },
    {
      equation: "cos(x) - x",
      initialGuess: "0.5",
      display: "cos(x) - x = 0",
      description: "Transcendental equation",
    },
    {
      equation: "x**2 - 4",
      initialGuess: "1.0",
      display: "x² - 4 = 0",
      description: "Quadratic equation",
    },
    {
      equation: "sin(x) - x/2",
      initialGuess: "2.0",
      display: "sin(x) - x/2 = 0",
      description: "Trigonometric equation",
    },
    {
      equation: "x**3 - x - 1",
      initialGuess: "1.5",
      display: "x³ - x - 1 = 0",
      description: "Cubic polynomial",
    },
  ];

  const [functionData, setFunctionData] = useState<
    Array<{ x: number; y: number }>
  >([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const requestData: EquationRequest = {
        equation: equation.trim(),
        initial_guess: parseFloat(initialGuess),
      };

      const response = await fetch("http://localhost:8000/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to solve equation");
      }

      const data: NewtonRaphsonResponse = await response.json();
      setResult(data);

      // Generate function graph data centered on root
      generateFunctionGraph(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const generateFunctionGraph = async (resultData: NewtonRaphsonResponse) => {
    if (!resultData) return;

    // Center the graph around the root point
    const root = resultData.root;
    const range = 8; // Range to show around root

    const start = root - range;
    const end = root + range;
    const numPoints = 300;
    const step = (end - start) / numPoints;

    try {
      // Generate x values for evaluation centered on root
      const xValuesToEvaluate = [];
      for (let i = 0; i <= numPoints; i++) {
        const x = start + i * step;
        xValuesToEvaluate.push(x);
      }

      // Call the evaluate endpoint
      const response = await fetch("http://localhost:8000/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          equation: equation.trim(),
          x_values: xValuesToEvaluate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate function");
      }

      const data = await response.json();

      if (data.success && data.points.length > 0) {
        setFunctionData(data.points);
      } else {
        console.error("No valid points returned from evaluation");
      }
    } catch (error) {
      console.error("Error generating function graph:", error);
    }
  };

  const prepareIterationPoints = () => {
    if (!result || result.iterations_data.length === 0) return [];

    return result.iterations_data.map((iteration) => ({
      x: iteration.x_value,
      y: iteration.f_x,
      iteration: iteration.iteration,
    }));
  };

  const iterationPoints = prepareIterationPoints();

  return (
    <div className="min-h-screen  bg-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center mb-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Newton-Raphson Method Calculator
            </h1>
          </div>
          <p className="text-center text-gray-600 text-md">
            Find and Visualize roots of equations using the Newton-Raphson
            numerical method
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Input Section */}
        <section>
          <Card className="shadow-md border-gray-200 bg-white p-0 rounded-md">
            <CardHeader className="border-b bg-gray-50 rounded-t-xl ">
              <CardTitle className="text-gray-800 flex items-center pt-6">
                Input Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="equation"
                      className="text-gray-700 font-medium flex items-center gap-2"
                    >
                      Equation f(x) = 0
                    </Label>
                    <Input
                      id="equation"
                      value={equation}
                      onChange={(e) => setEquation(e.target.value)}
                      placeholder="e.g., x**2 - 4"
                      className="font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Supported: +, -, *, /, **, sin(x), cos(x), tan(x), exp(x),
                      log(x), sqrt(x)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="initial-guess"
                      className="text-gray-700 font-medium"
                    >
                      Initial Guess (x₀)
                    </Label>
                    <Input
                      id="initial-guess"
                      type="number"
                      step="any"
                      value={initialGuess}
                      onChange={(e) => setInitialGuess(e.target.value)}
                      placeholder="1.0"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Starting point for the algorithm
                    </p>
                  </div>
                </div>

                {/* Example Equations Section */}
                <div className="space-y-3 pt-2">
                  <Label className="text-gray-700 font-medium">
                    Example Equations (Click to use)
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {exampleEquations.map((example, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setEquation(example.equation);
                          setInitialGuess(example.initialGuess);
                        }}
                        className="p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                      >
                        <div className="font-mono text-sm text-gray-800 group-hover:text-blue-700">
                          {example.display}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {example.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gray-800 hover:bg-gray-900 rounded-md  text-white px-12 py-3 text-md shadow-md hover:shadow-md transition-all"
                  >
                    {loading ? (
                      <>
                        <IterationCcw className="w-5 h-5 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-5 h-5 mr-2" />
                        Calculate Root
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold">Error: </span>
                      <span>{error}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Results Section */}
        {result && (
          <>
            {/* Summary Metrics */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center gap-2">
                Results Summary
              </h2>
              <div className="flex gap-8">
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-gray-200 bg-white shadow-md  rounded-md">
                    <CardContent className="text-center">
                      <div className="flex items-center justify-center mb-3 gap-2">
                        {result.converged ? (
                          <CheckCircle2 className="w-5 h-5 text-green-700" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                        )}
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Status
                        </h3>
                      </div>
                      <Badge
                        className={
                          result.converged
                            ? "bg-green-600 text-white px-4 py-1 text-sm"
                            : "bg-orange-500 text-white px-4 py-1 text-sm"
                        }
                      >
                        {result.converged ? "Converged" : "Not Converged"}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 bg-white shadow-md  rounded-md">
                    <CardContent className="text-center">
                      <div className="flex items-center justify-center mb-3 gap-2">
                        <Target className="w-5 h-5 text-blue-400" />
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Root Value
                        </h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 font-mono break-all">
                        {result.root.toFixed(10)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 bg-white shadow-md  rounded-md">
                    <CardContent className="text-center">
                      <div className="flex items-center justify-center mb-3 gap-2">
                        <TrendingDown className="w-5 h-5 text-gray-600" />
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Final Error
                        </h3>
                      </div>
                      <p className="text-xl font-bold text-gray-900 font-mono">
                        {result.final_error.toExponential(2)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 bg-white shadow-md  rounded-md">
                    <CardContent className="text-center">
                      <div className="flex items-center justify-center mb-3 gap-2">
                        <IterationCcw className="w-5 h-5 text-gray-600" />
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Iterations
                        </h3>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">
                        {result.iterations_count}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* All Roots Found */}
            {result.roots && result.roots.length > 0 && (
              <section className="w-full">
                <Card className="border-gray-200 bg-white shadow-md  rounded-md">
                  <CardHeader className="border-b border-gray-200 pt-3 bg-white">
                    <CardTitle className="text-gray-800 flex items-center gap-2">
                      All Root Points Found
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-4">
                      {result.roots.map((root, index) => (
                        <div
                          key={index}
                          className="bg-white border rounded-lg px-6 py-4"
                        >
                          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                            Root {index + 1}
                          </span>
                          <p className="mt-1 text-xl font-bold text-gray-900 font-mono">
                            {root.toFixed(10)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Visualization Section */}
            {functionData.length > 0 && (
              <section className="">
                <Card className="border-gray-200 bg-white shadow-md rounded-md">
                  <CardHeader className="border-b border-gray-200 bg-white">
                    <CardTitle className="text-gray-800">
                      Function Visualization
                    </CardTitle>
                    <p className="text-sm text-gray-600 font-mono">
                      f(x) = {equation}
                    </p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-white rounded-lg">
                      <ResponsiveContainer width="100%" height={500}>
                        <LineChart data={functionData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                          />
                          <XAxis
                            dataKey="x"
                            label={{
                              value: "x",
                              position: "insideBottom",
                              offset: -5,
                              style: {
                                fill: "#374151",
                                fontSize: 14,
                                fontWeight: "600",
                              },
                            }}
                            stroke="#9ca3af"
                            tick={{ fill: "#6b7280" }}
                            type="number"
                            domain={["dataMin", "dataMax"]}
                          />
                          <YAxis
                            label={{
                              value: "f(x)",
                              angle: -90,
                              position: "insideLeft",
                              style: {
                                fill: "#374151",
                                fontSize: 14,
                                fontWeight: "600",
                              },
                            }}
                            stroke="#9ca3af"
                            tick={{ fill: "#6b7280" }}
                            domain={["auto", "auto"]}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #d1d5db",
                              borderRadius: "6px",
                              padding: "8px",
                            }}
                            labelStyle={{ color: "#111827", fontWeight: "600" }}
                            formatter={(
                              value: number | string,
                              name: string,
                            ) => {
                              if (name === "y") {
                                return [
                                  typeof value === "number"
                                    ? value.toFixed(6)
                                    : value,
                                  "f(x)",
                                ];
                              }
                              return [value, name];
                            }}
                          />
                          <Legend
                            wrapperStyle={{ color: "#6b7280" }}
                            formatter={(value) => {
                              if (value === "y") return "f(x)";
                              return value;
                            }}
                          />
                          {/* X-axis (y = 0 line) */}
                          <ReferenceLine
                            y={0}
                            stroke="#E5E7EB"
                            strokeWidth={2}
                            label={{
                              value: "y = 0",
                              position: "right",
                              style: { fill: "#E5E7EB", fontWeight: "600" },
                            }}
                          />
                          {/* Y-axis (x = 0 line) */}
                          <ReferenceLine
                            x={0}
                            stroke="#E5E7EB"
                            strokeWidth={2}
                            label={{
                              value: "x = 0",
                              position: "top",
                              style: { fill: "#E5E7EB", fontWeight: "600" },
                            }}
                          />
                          {/* Root point vertical line */}
                          {result && result.root && (
                            <ReferenceLine
                              x={result.root}
                              stroke="#2563eb"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              label={{
                                value: `Root: x = ${result.root.toFixed(6)}`,
                                position: "top",
                                style: {
                                  fill: "#2563eb",
                                  fontWeight: "600",
                                  fontSize: 12,
                                },
                              }}
                            />
                          )}
                          {/* Function line */}
                          <Line
                            type="monotone"
                            dataKey="y"
                            stroke="#111827"
                            strokeWidth={3}
                            name="y"
                            dot={false}
                            isAnimationActive={true}
                          />
                          {/* Mark iteration points on the curve */}
                          {iterationPoints.map((point, idx) => (
                            <ReferenceLine
                              key={`iter-${idx}`}
                              x={point.x}
                              stroke="#e5e7eb"
                              strokeWidth={0.5}
                              strokeDasharray="2 2"
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-6 p-5 bg-gray-100 rounded-md border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        Graph Legend
                      </h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>
                          <strong className="text-gray-900">
                            Black curve:
                          </strong>{" "}
                          Your function f(x) = {equation}
                        </p>
                        <p>
                          <strong className="text-gray-900">
                            Gray dashed line:
                          </strong>{" "}
                          y = 0 (x-axis, where roots exist)
                        </p>
                        <p>
                          <strong className="text-gray-900">
                            Blue dashed line:
                          </strong>{" "}
                          Root location at x ≈ {result?.root.toFixed(6)}
                        </p>
                        <p>
                          <strong className="text-gray-900">
                            Light gray lines:
                          </strong>{" "}
                          Iteration points showing convergence path
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Iteration Details Section */}
            <section>
              <Card className="border-gray-200 bg-white shadow-md">
                <CardHeader className="border-b border-gray-200 bg-white">
                  <CardTitle className="text-gray-800">
                    Iteration Details
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Tracking convergence through {result.iterations_count}{" "}
                    iterations
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-300">
                          <th className="text-left p-4 font-semibold text-gray-800 uppercase text-sm">
                            Iteration
                          </th>
                          <th className="text-left p-4 font-semibold text-gray-800 uppercase text-sm">
                            x value
                          </th>
                          <th className="text-left p-4 font-semibold text-gray-800 uppercase text-sm">
                            f(x)
                          </th>
                          <th className="text-left p-4 font-semibold text-gray-800 uppercase text-sm">
                            f&apos;(x)
                          </th>
                          <th className="text-left p-4 font-semibold text-gray-800 uppercase text-sm">
                            Error
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.iterations_data.map((iteration, index) => (
                          <tr
                            key={index}
                            className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                              index === result.iterations_data.length - 1
                                ? "bg-blue-50 font-semibold"
                                : ""
                            }`}
                          >
                            <td className="p-4 font-mono text-gray-900">
                              {iteration.iteration}
                            </td>
                            <td className="p-4 font-mono text-gray-900 text-sm">
                              {iteration.x_value.toFixed(10)}
                            </td>
                            <td className="p-4 font-mono text-gray-900 text-sm">
                              {iteration.f_x.toFixed(10)}
                            </td>
                            <td className="p-4 font-mono text-gray-900 text-sm">
                              {iteration.f_prime_x.toFixed(10)}
                            </td>
                            <td className="p-4 font-mono text-gray-900 text-sm">
                              {iteration.error.toExponential(3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.iterations_data.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900">
                        <strong>Final iteration highlighted:</strong> The last
                        row shows the final values where convergence was
                        achieved.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
