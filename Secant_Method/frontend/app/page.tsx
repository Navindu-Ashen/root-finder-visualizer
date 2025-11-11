"use client";

import { useState } from "react";
import axios from "axios";
import * as math from "mathjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, Settings, TrendingUp, Zap } from "lucide-react";
import SecantChart from "@/components/secant-chart";
import ResultsDisplay from "@/components/results-display";

interface SecantResult {
  root: number;
  roots: number[];
  multiple_roots: boolean;
  iterations: number;
  error: number;
  data: Array<{ x2: number }>;
}

export default function Home() {
  const [formData, setFormData] = useState({
    function: "x**3 - 5*x + 3",
    x0: 0,
    x1: 1,
    tolerance: 0.000001,
    max_iterations: 100,
  });

  const [result, setResult] = useState<SecantResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateExpression = (expression: string): string | null => {
    // Check for missing multiplication signs
    // Pattern: number/variable/function followed by letter/function without operator
    const patterns = [
      /\d+[a-zA-Z]/, // number followed by letter (e.g., "3x")
      /\)[a-zA-Z]/, // closing parenthesis followed by letter (e.g., ")x")
      /[a-zA-Z]\(/, // letter followed by opening parenthesis without known functions
      /\d+\(/, // number followed by opening parenthesis (e.g., "2(")
    ];

    // Known functions that are allowed before parentheses
    const knownFunctions = [
      "sin",
      "cos",
      "tan",
      "exp",
      "log",
      "ln",
      "sqrt",
      "abs",
    ];

    // Remove known functions from the expression for validation
    let cleanExpression = expression;
    knownFunctions.forEach((func) => {
      cleanExpression = cleanExpression.replace(
        new RegExp(func + "\\(", "g"),
        "",
      );
    });

    for (const pattern of patterns) {
      if (pattern.test(cleanExpression)) {
        return "Missing multiplication sign detected. Please use '*' for multiplication (e.g., '3*x' instead of '3x').";
      }
    }

    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "function" ? value : parseFloat(value) || value,
    }));
    // Clear previous results when inputs change
    setResult(null);
    setError(null);
  };

  const sampleFunctions = [
    { func: "x**3 - 5*x + 3", description: "Cubic polynomial" },
    { func: "x**2 - 4", description: "Simple quadratic" },
    { func: "x**3 - 6*x**2 + 11*x - 6", description: "Cubic polynomial" },
    { func: "exp(x) - 3*x**2", description: "Exponential function" },
    { func: "x**3 - 2*x - 5", description: "Another cubic" },
    { func: "cos(x) - x", description: "Transcendental equation" },
  ];

  const useSampleFunction = (func: string) => {
    setFormData((prev) => ({
      ...prev,
      function: func,
    }));
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate the expression first
    const validationError = validateExpression(formData.function);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/secant",
        formData,
      );
      setResult(res.data);
    } catch (err) {
      setError("Failed to calculate. Please check your inputs and try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      function: "x**3 - 5*x + 3",
      x0: 0,
      x1: 1,
      tolerance: 0.000001,
      max_iterations: 100,
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-black">
              Secant Method Visualizer
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find numerical roots of functions using the secant method with
            real-time visualization and detailed analysis.
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              Fast Convergence
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Real-time Charts
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Settings className="h-3 w-3" />
              Customizable
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
                <CardDescription>
                  Configure the function and parameters for the secant method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="function">Function f(x)</Label>
                    <Input
                      id="function"
                      name="function"
                      value={formData.function}
                      onChange={handleChange}
                      placeholder="e.g., x**3 - 5*x + 3"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use ** for exponents (e.g., x**2 for x²)
                    </p>

                    {/* Sample Functions */}
                    <div className="mt-3 space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Sample Functions:
                      </Label>
                      <div className="grid grid-cols-1 gap-1">
                        {sampleFunctions.map((sample, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => useSampleFunction(sample.func)}
                            className="text-left p-2 text-xs bg-muted/50 hover:bg-muted rounded border transition-colors"
                          >
                            <div className="font-mono text-foreground">
                              {sample.func}
                            </div>
                            <div className="text-muted-foreground">
                              {sample.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="x0">Initial Point x₀</Label>
                      <Input
                        id="x0"
                        name="x0"
                        type="number"
                        step="any"
                        value={formData.x0}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="x1">Initial Point x₁</Label>
                      <Input
                        id="x1"
                        name="x1"
                        type="number"
                        step="any"
                        value={formData.x1}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_iterations">Maximum Iterations</Label>
                    <Input
                      id="max_iterations"
                      name="max_iterations"
                      type="number"
                      value={formData.max_iterations}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Computing...
                        </>
                      ) : (
                        <>
                          <Calculator className="h-4 w-4 mr-2" />
                          Calculate
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={isLoading}
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            {result ? (
              <>
                {/* Multiple Roots Display */}
                {result.multiple_roots && result.roots.length > 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Multiple Roots Found
                      </CardTitle>
                      <CardDescription>
                        The function has {result.roots.length} roots in the
                        searched domain
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {result.roots.map((root, index) => (
                          <div
                            key={index}
                            className="p-4 border rounded-lg bg-muted/50"
                          >
                            <div className="text-sm font-medium text-muted-foreground">
                              Root {index + 1}
                            </div>
                            <div className="text-2xl font-bold font-mono">
                              {root.toFixed(8)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              f({root.toFixed(4)}) ≈{" "}
                              {(() => {
                                try {
                                  const mathFunc = formData.function.replace(
                                    /\*\*/g,
                                    "^",
                                  );
                                  return math
                                    .evaluate(mathFunc, { x: root })
                                    .toFixed(8);
                                } catch {
                                  return "0";
                                }
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <ResultsDisplay
                  result={result}
                  tolerance={formData.tolerance}
                  maxIterations={formData.max_iterations}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Function Visualization
                    </CardTitle>
                    <CardDescription>
                      Interactive plot showing the function curve and iteration
                      convergence
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SecantChart
                      data={result.data}
                      func={formData.function}
                      tolerance={formData.tolerance}
                      finalRoot={result.root}
                      allRoots={result.roots}
                    />
                  </CardContent>
                </Card>

                {/* Iteration Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Iteration History</CardTitle>
                    <CardDescription>
                      Step-by-step convergence to the root
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Iteration</th>
                            <th className="text-left p-2">x₂</th>
                            <th className="text-left p-2">f(x₂)</th>
                            <th className="text-left p-2">|Error|</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.data.map((point, index) => {
                            const fx = (() => {
                              try {
                                const mathFunc = formData.function.replace(
                                  /\*\*/g,
                                  "^",
                                );
                                return math.evaluate(mathFunc, { x: point.x2 });
                              } catch {
                                return 0;
                              }
                            })();

                            return (
                              <tr
                                key={index}
                                className="border-b hover:bg-muted/50"
                              >
                                <td className="p-2 font-mono">{index + 1}</td>
                                <td className="p-2 font-mono">
                                  {point.x2.toFixed(8)}
                                </td>
                                <td className="p-2 font-mono">
                                  {fx.toFixed(8)}
                                </td>
                                <td className="p-2 font-mono">
                                  {Math.abs(fx).toExponential(3)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center">
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Calculator className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Ready to Calculate
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Configure your function and parameters in the form, then
                    click Calculate to see the secant method in action.
                  </p>
                  <Button
                    type="button"
                    disabled={isLoading}
                    className="flex-1 mt-4"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Computing...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            The secant method is a numerical root-finding algorithm that uses a
            succession of roots of secant lines to approximate a root of a
            function.
          </p>
          <p className="mt-4">By group B</p>
        </div>
      </div>
    </div>
  );
}
