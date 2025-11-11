import { cn } from "@/lib/utils";

interface NumberDisplayProps {
  value: number;
  precision?: number;
  format?: "decimal" | "scientific" | "auto";
  className?: string;
}

export function NumberDisplay({
  value,
  precision = 6,
  format = "auto",
  className,
}: NumberDisplayProps) {
  const formatNumber = (num: number) => {
    if (isNaN(num) || !isFinite(num)) {
      return "Invalid";
    }

    switch (format) {
      case "scientific":
        return num.toExponential(precision);
      case "decimal":
        return num.toFixed(precision);
      case "auto":
        // Use scientific notation for very small or very large numbers
        if (Math.abs(num) < 0.001 || Math.abs(num) > 1000000) {
          return num.toExponential(precision);
        }
        return num.toPrecision(precision + 1);
      default:
        return num.toString();
    }
  };

  return (
    <span className={cn("font-mono text-sm", className)}>
      {formatNumber(value)}
    </span>
  );
}
