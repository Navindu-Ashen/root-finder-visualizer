from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from secant import secant_method
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SecantInput(BaseModel):
    function: str
    x0: float
    x1: float
    tolerance: float = 1e-6
    max_iterations: int = 100


@app.post("/api/secant")
def run_secant(data: SecantInput):
    try:
        # Create a safe namespace with mathematical functions
        math_namespace = {
            "x": None,  # Will be set dynamically
            "np": np,
            # Basic math
            "abs": abs,
            "pow": pow,
            "sqrt": np.sqrt,
            # Trigonometric functions
            "sin": np.sin,
            "cos": np.cos,
            "tan": np.tan,
            "asin": np.arcsin,
            "acos": np.arccos,
            "atan": np.arctan,
            "sinh": np.sinh,
            "cosh": np.cosh,
            "tanh": np.tanh,
            "asinh": np.arcsinh,
            "acosh": np.arccosh,
            "atanh": np.arctanh,
            # Exponential and logarithmic functions
            "exp": np.exp,
            "log": np.log,
            "log10": np.log10,
            "log2": np.log2,
            # Constants
            "pi": np.pi,
            "e": np.e,
        }

        f = lambda x: eval(data.function, {**math_namespace, "x": x})
        result, iterations, error, iteration_data = secant_method(
            f, data.x0, data.x1, data.tolerance, data.max_iterations
        )

        # Handle multiple roots or single root
        if isinstance(result, list):
            return {
                "roots": result,
                "root": result[0] if result else None,  # For backward compatibility
                "multiple_roots": len(result) > 1,
                "num_roots": len(result),
                "iterations": iterations,
                "error": error,
                "data": iteration_data,
                "success": len(result) > 0,
            }
        else:
            return {
                "root": result,
                "roots": [result] if result is not None else [],
                "multiple_roots": False,
                "num_roots": 1 if result is not None else 0,
                "iterations": iterations,
                "error": error,
                "data": iteration_data,
                "success": result is not None,
            }
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/functions")
def get_available_functions():
    """Return list of available mathematical functions"""
    return {
        "basic": ["abs", "pow", "sqrt"],
        "trigonometric": [
            "sin",
            "cos",
            "tan",
            "asin",
            "acos",
            "atan",
            "sinh",
            "cosh",
            "tanh",
            "asinh",
            "acosh",
            "atanh",
        ],
        "exponential_logarithmic": ["exp", "log", "log10", "log2"],
        "constants": ["pi", "e"],
        "examples": [
            "x**2 - 4",
            "sin(x) - 0.5",
            "exp(x) - 2",
            "log(x) - 1",
            "x**3 - 2*x - 5",
            "cos(x) - x",
            "tan(x) - x",
        ],
    }
