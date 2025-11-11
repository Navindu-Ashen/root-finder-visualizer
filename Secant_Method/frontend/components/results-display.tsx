"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Target } from "lucide-react";

interface SecantResult {
  root: number;
  roots: number[];
  multiple_roots: boolean;
  iterations: number;
  error: number;
  data: Array<{ x2: number }>;
}

interface ResultsDisplayProps {
  result: SecantResult;
  tolerance: number;
  maxIterations: number;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  result,
  tolerance,
  // maxIterations,
}) => {
  const converged = result.error <= tolerance;
  // const convergenceRate = result.iterations / maxIterations;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {converged ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-orange-500" />
          )}
          {result.multiple_roots && result.roots.length > 1
            ? `Primary Root (${result.roots.length} total found)`
            : "Calculation Results"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Root Value */}
          <div className="bg-primary/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Root Found
              </span>
            </div>
            <div className="text-2xl font-bold font-mono">
              {result.root.toFixed(8)}
            </div>
          </div>

          {/* Iterations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Iterations
              </span>
            </div>
            <div className="text-2xl font-bold">{result.iterations}</div>
          </div>

          {/* Final Error */}
          {/*<div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Final Error
              </span>
            </div>
            <div className="text-2xl font-bold font-mono">
              {result.error.toExponential(2)}
            </div>
          </div>*/}

          {/* Convergence Status */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Status
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Badge
                variant={converged ? "default" : "destructive"}
                className="w-fit"
              >
                {converged ? "Converged" : "Not Converged"}
              </Badge>
              <div className="text-xs text-muted-foreground">
                Target: {tolerance.toExponential(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {/*<div>
              <span className="font-medium">Convergence Rate:</span>{" "}
              <span className="font-mono">
                {(convergenceRate * 100).toFixed(1)}%
              </span>
            </div>*/}
            <div>
              <span className="font-medium">Precision:</span>{" "}
              <span className="font-mono">
                {Math.abs(Math.log10(result.error)).toFixed(0)} decimal places
              </span>
            </div>
            <div>
              <span className="font-medium">Method:</span> Secant Method
            </div>
            <div>
              <span className="font-medium">Function Evaluations:</span>{" "}
              <span className="font-mono">{result.iterations + 1}</span>
            </div>
          </div>
        </div>

        {/* Warning if not converged */}
        {!converged && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-orange-800 dark:text-orange-200">
                  Solution may not have converged
                </div>
                <div className="text-orange-700 dark:text-orange-300 mt-1">
                  Consider adjusting the tolerance, maximum iterations, or
                  initial values for better convergence.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;
