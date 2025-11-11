from math import isinf, isnan
from typing import List

import sympy as sp
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sympy import diff, lambdify, symbols

app = FastAPI(title="Newton-Raphson Method API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class EquationRequest(BaseModel):
    equation: str
    initial_guess: float
    tolerance: float = 1e-6
    max_iterations: int = 100
    search_range: float = 10.0  # Range to search for multiple roots
    num_search_points: int = 20  # Number of initial points to try


class IterationData(BaseModel):
    iteration: int
    x_value: float
    f_x: float
    f_prime_x: float
    error: float


class NewtonRaphsonResponse(BaseModel):
    root: float | None
    roots: List[
        float
    ]  # List of root values (typically single root, but structured as list)
    converged: bool
    total_error: float
    final_error: float  # Kept for backward compatibility
    iterations_count: int
    iterations_data: List[IterationData]
    message: str


class EvaluateRequest(BaseModel):
    equation: str
    x_values: List[float]


class EvaluatePoint(BaseModel):
    x: float
    y: float


class EvaluateResponse(BaseModel):
    points: List[EvaluatePoint]
    success: bool
    message: str


class NewtonRaphsonSolver:
    def __init__(self):
        self.x = symbols("x")

    def parse_equation(self, equation_str: str):
        """Parse string equation into sympy expression"""
        try:
            # Replace common mathematical functions for sympy compatibility
            equation_str = equation_str.replace("^", "**")  # Power operator

            # Parse the expression
            expr = sp.sympify(equation_str)
            return expr
        except Exception as e:
            raise ValueError(f"Invalid equation format: {str(e)}")

    def solve_single(
        self,
        f,
        f_prime,
        x0: float,
        tolerance: float = 1e-6,
        max_iterations: int = 100,
    ):
        """Solve equation using Newton-Raphson method from a single initial guess"""

        iterations_data = []
        x_current = float(x0)

        for i in range(max_iterations):
            try:
                # Calculate function values
                f_x = float(f(x_current))
                f_prime_x = float(f_prime(x_current))

                # Check if derivative is zero
                if abs(f_prime_x) < 1e-15:
                    return None, iterations_data, "Derivative is zero"

                # Calculate next approximation
                x_next = x_current - f_x / f_prime_x
                error = abs(x_next - x_current)

                # Store iteration data
                iterations_data.append(
                    {
                        "iteration": i + 1,
                        "x_value": x_current,
                        "f_x": f_x,
                        "f_prime_x": f_prime_x,
                        "error": error,
                    }
                )

                # Check for convergence
                if error < tolerance:
                    return x_next, iterations_data, "converged"

                x_current = x_next

            except (OverflowError, ValueError, ZeroDivisionError) as e:
                return None, iterations_data, f"Numerical error: {str(e)}"

        # Maximum iterations reached
        return None, iterations_data, "Max iterations reached"

    def is_duplicate_root(
        self, root: float, existing_roots: List[float], tolerance: float = 1e-4
    ):
        """Check if a root is a duplicate of an existing root"""
        for existing_root in existing_roots:
            if abs(root - existing_root) < tolerance:
                return True
        return False

    def solve(
        self,
        equation_str: str,
        x0: float,
        tolerance: float = 1e-6,
        max_iterations: int = 100,
        search_range: float = 10.0,
        num_search_points: int = 20,
    ):
        """Solve equation using Newton-Raphson method, searching for multiple roots"""

        # Parse the equation
        f_expr = self.parse_equation(equation_str)

        # Calculate derivative
        f_prime_expr = diff(f_expr, self.x)

        # Convert to numerical functions
        f = lambdify(self.x, f_expr, modules=["numpy"])
        f_prime = lambdify(self.x, f_prime_expr, modules=["numpy"])

        # Generate search points around the initial guess
        start_point = x0 - search_range / 2
        end_point = x0 + search_range / 2
        step = search_range / (num_search_points - 1) if num_search_points > 1 else 0

        search_points = [start_point + i * step for i in range(num_search_points)]

        # Also include the exact initial guess
        if x0 not in search_points:
            search_points.append(x0)

        all_roots = []
        all_iterations_data = []
        converged_count = 0

        # Try to find roots from each search point
        for initial_point in search_points:
            root, iterations_data, status = self.solve_single(
                f, f_prime, initial_point, tolerance, max_iterations
            )

            if root is not None and status == "converged":
                # Verify it's actually a root (f(root) ≈ 0)
                try:
                    f_root = abs(float(f(root)))
                    if f_root < tolerance * 10:  # Relaxed tolerance for verification
                        if not self.is_duplicate_root(root, all_roots, tolerance * 10):
                            all_roots.append(root)
                            converged_count += 1
                            # Store iterations data for the first occurrence from initial guess
                            if abs(initial_point - x0) < tolerance:
                                all_iterations_data = iterations_data
                except:
                    pass

        # If no iterations data stored yet, use data from the initial guess
        if not all_iterations_data and search_points:
            root, iterations_data, status = self.solve_single(
                f, f_prime, x0, tolerance, max_iterations
            )
            all_iterations_data = iterations_data

        # Sort roots for consistent output
        all_roots.sort()

        # Determine primary root (closest to initial guess)
        primary_root = None
        if all_roots:
            primary_root = min(all_roots, key=lambda r: abs(r - x0))

        # Calculate final error
        final_error = 0.0
        if primary_root is not None:
            try:
                final_error = abs(float(f(primary_root)))
            except:
                final_error = float("inf")

        # Build response
        if len(all_roots) > 0:
            message = f"Found {len(all_roots)} root(s) in the search range."
            converged = True
        else:
            message = "No roots found in the search range. Try adjusting initial guess or search range."
            converged = False
            all_roots = []

        return {
            "root": primary_root,
            "roots": all_roots,
            "converged": converged,
            "total_error": final_error,
            "final_error": final_error,
            "iterations_count": len(all_iterations_data),
            "iterations_data": all_iterations_data,
            "message": message,
        }


# Initialize solver
solver = NewtonRaphsonSolver()


@app.get("/")
async def root():
    return {
        "message": "Newton-Raphson Method API",
        "endpoints": {
            "/solve": "POST - Solve equation using Newton-Raphson method",
            "/evaluate": "POST - Evaluate function at multiple x values",
            "/health": "GET - Health check",
        },
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/solve", response_model=NewtonRaphsonResponse)
async def solve_equation(request: EquationRequest):
    """
    Solve a non-linear equation using Newton-Raphson method.

    Returns:
    - root: Single root value (primary result)
    - roots: List of root values found
    - converged: Whether the method successfully converged
    - total_error: Final total error of the solution
    - iterations_count: Number of iterations performed
    - iterations_data: Detailed data for each iteration including:
        * iteration number
        * x_value at that iteration
        * f(x) value
        * f'(x) derivative value
        * error at that iteration
    - message: Status message

    Supported functions:
    - Basic operations: +, -, *, /, ** (power)
    - Trigonometric: sin(x), cos(x), tan(x), sec(x), csc(x), cot(x)
    - Inverse trigonometric: asin(x), acos(x), atan(x)
    - Hyperbolic: sinh(x), cosh(x), tanh(x)
    - Exponential: exp(x), log(x), ln(x)
    - Square root: sqrt(x)
    - Absolute: Abs(x)

    Example equations:
    - "x**2 - 4" (quadratic)
    - "exp(x) - 2" (exponential)
    - "sin(x) - 0.5" (trigonometric)
    - "log(x) - 1" (logarithmic)
    """

    try:
        result = solver.solve(
            request.equation,
            request.initial_guess,
            request.tolerance,
            request.max_iterations,
            request.search_range,
            request.num_search_points,
        )

        return NewtonRaphsonResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_function(request: EvaluateRequest):
    """
    Evaluate a mathematical function at multiple x values for plotting.

    This endpoint is useful for generating function graphs.
    """
    try:
        # Parse the equation
        f_expr = solver.parse_equation(request.equation)

        # Convert to numerical function
        f = lambdify(solver.x, f_expr, modules=["numpy"])

        points = []
        failed_points = 0

        for x_val in request.x_values:
            try:
                y_val = float(f(x_val))
                # Check if result is valid
                if not (isnan(y_val) or isinf(y_val)):
                    points.append({"x": x_val, "y": y_val})
                else:
                    failed_points += 1
            except (OverflowError, ValueError, ZeroDivisionError):
                failed_points += 1
                continue

        if len(points) == 0:
            return EvaluateResponse(
                points=[],
                success=False,
                message="Could not evaluate function at any of the provided points",
            )

        message = f"Successfully evaluated {len(points)} points"
        if failed_points > 0:
            message += f" ({failed_points} points failed)"

        return EvaluateResponse(points=points, success=True, message=message)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
