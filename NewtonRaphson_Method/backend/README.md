# Newton-Raphson Method API

A FastAPI-based web service for solving non-linear equations using the Newton-Raphson iterative method.

## Features

- Solve various types of non-linear equations
- Support for exponential, trigonometric, logarithmic, and polynomial functions
- Detailed iteration data including values and errors
- Configurable tolerance and maximum iterations
- RESTful API with JSON responses
- Comprehensive test suite included

## Installation

This project uses UV package manager. Make sure you have UV installed, then:

```bash
# Install dependencies
uv sync

# Run the API server
uv run python main.py
```

The API will be available at `http://localhost:8000`

## Quick Start

### 1. Start the API Server
```bash
uv run python main.py
```

The API will be available at `http://localhost:8000`

### 2. Run Example Usage Script
In a separate terminal, run the example script to see the API in action:
```bash
uv run python example_usage.py
```

This will demonstrate how to:
- Send equations to the API
- Receive root values
- Access iteration counts and data
- Retrieve total error values

### 3. Run Tests
Verify everything is working correctly:
```bash
uv run python test_api.py
```

## API Endpoints

### POST /solve

Solve a non-linear equation using Newton-Raphson method.

**Request Body:**
```json
{
  "equation": "x**2 - 4",
  "initial_guess": 1.0,
  "tolerance": 1e-6,
  "max_iterations": 100
}
```

**Response:**
```json
{
  "root": 2.0,
  "roots": [2.0],
  "converged": true,
  "total_error": 5.96e-08,
  "final_error": 5.96e-08,
  "iterations_count": 4,
  "iterations_data": [
    {
      "iteration": 1,
      "x_value": 1.0,
      "f_x": -3.0,
      "f_prime_x": 2.0,
      "error": 1.5
    },
    {
      "iteration": 2,
      "x_value": 2.5,
      "f_x": 2.25,
      "f_prime_x": 5.0,
      "error": 0.45
    },
    {
      "iteration": 3,
      "x_value": 2.05,
      "f_x": 0.2025,
      "f_prime_x": 4.1,
      "error": 0.04939
    },
    {
      "iteration": 4,
      "x_value": 2.0006097,
      "f_x": 0.00244,
      "f_prime_x": 4.0012,
      "error": 5.96e-08
    }
  ],
  "message": "Successfully converged to root."
}
```

### POST /evaluate

Evaluate a mathematical function at multiple x values for plotting.

**Request Body:**
```json
{
  "equation": "x**2 - 4",
  "x_values": [-3, -2, -1, 0, 1, 2, 3]
}
```

### GET /

Root endpoint with API information.

### GET /health

Health check endpoint.

## Response Fields

The API returns comprehensive data about the Newton-Raphson solution process:

### Main Response Fields
- `root`: The primary calculated root of the equation (single value)
- `roots`: Array of root values found (structured as list for future multi-root support)
- `converged`: Boolean indicating if the method successfully converged to a solution
- `total_error`: The final total error of the solution
- `final_error`: The final error value (kept for backward compatibility)
- `iterations_count`: Total number of iterations performed
- `iterations_data`: Detailed array of data for each iteration
- `message`: Status message describing the result

### Iteration Data Fields
Each entry in `iterations_data` contains:
- `iteration`: The iteration number (1-indexed)
- `x_value`: The x value at this iteration
- `f_x`: The function value f(x) at this iteration
- `f_prime_x`: The derivative value f'(x) at this iteration
- `error`: The error magnitude at this iteration (|x_next - x_current|)

## Supported Mathematical Functions

- **Basic operations**: `+`, `-`, `*`, `/`, `**` (power)
- **Trigonometric**: `sin(x)`, `cos(x)`, `tan(x)`, `sec(x)`, `csc(x)`, `cot(x)`
- **Inverse trigonometric**: `asin(x)`, `acos(x)`, `atan(x)`
- **Hyperbolic**: `sinh(x)`, `cosh(x)`, `tanh(x)`
- **Exponential**: `exp(x)`, `log(x)`, `ln(x)`
- **Square root**: `sqrt(x)`
- **Absolute value**: `Abs(x)`

## Example Equations

1. **Quadratic equation**: `x**2 - 4`
2. **Exponential equation**: `exp(x) - 2`
3. **Trigonometric equation**: `sin(x) - 0.5`
4. **Logarithmic equation**: `log(x) - 1`
5. **Complex equation**: `x**3 - 2*x - 5`
6. **Transcendental equation**: `cos(x) - x`

## Usage Examples

### Using Python (Requests Library)

See `example_usage.py` for detailed examples. Basic usage:

```python
import requests

response = requests.post(
    "http://localhost:8000/solve",
    json={
        "equation": "x**2 - 4",
        "initial_guess": 1.0
    }
)

data = response.json()
print(f"Root: {data['root']}")
print(f"Converged: {data['converged']}")
print(f"Iterations: {data['iterations_count']}")
print(f"Total Error: {data['total_error']}")
```

### Using cURL

#### Example 1: Quadratic Equation
```bash
curl -X POST "http://localhost:8000/solve" \
  -H "Content-Type: application/json" \
  -d '{
    "equation": "x**2 - 4",
    "initial_guess": 1.0
  }'
```

#### Example 2: Exponential Equation
```bash
curl -X POST "http://localhost:8000/solve" \
  -H "Content-Type: application/json" \
  -d '{
    "equation": "exp(x) - 2",
    "initial_guess": 1.0,
    "tolerance": 1e-8
  }'
```

#### Example 3: Trigonometric Equation
```bash
curl -X POST "http://localhost:8000/solve" \
  -H "Content-Type: application/json" \
  -d '{
    "equation": "sin(x) - 0.5",
    "initial_guess": 0.5
  }'
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs` - Interactive API documentation
- **ReDoc**: `http://localhost:8000/redoc` - Alternative documentation view

## Testing

A comprehensive test suite is provided in `test_api.py` to verify all functionality.

### Run Tests

Make sure the API server is running first:
```bash
# Terminal 1: Start the server
uv run python main.py

# Terminal 2: Run tests
uv run python test_api.py
```

Or using pytest:
```bash
uv run pytest test_api.py -v
```

### Test Coverage

The test suite verifies:
- ✅ Root value(s) are correctly calculated
- ✅ Iteration counts are accurate
- ✅ All iteration data is present (x_value, f_x, f_prime_x, error)
- ✅ Total error is computed correctly
- ✅ Response structure contains all required fields
- ✅ Various equation types (quadratic, exponential, trigonometric, logarithmic, cubic)
- ✅ Error handling for invalid equations
- ✅ Health check endpoint
- ✅ Root endpoint

## Error Handling

The API handles various error conditions gracefully:

- **Invalid equation syntax**: Returns 400 status code with error details
- **Zero derivatives**: Returns result with `converged=false` and appropriate message
- **Numerical overflow/underflow**: Returns error message with best approximation
- **Non-convergence**: Returns best approximation after max iterations with `converged=false`

## Development

To run in development mode with auto-reload:

```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Project Structure

```
backend/
├── main.py              # Main API implementation
├── test_api.py          # Comprehensive test suite
├── example_usage.py     # Example usage demonstrations
├── README.md            # This file
├── pyproject.toml       # Project dependencies
└── uv.lock             # Lock file for dependencies
```

## Technical Details

### Newton-Raphson Method

The Newton-Raphson method finds successively better approximations to the roots of a real-valued function using the iterative formula:

```
x_{n+1} = x_n - f(x_n) / f'(x_n)
```

The method continues until:
- The error falls below the tolerance threshold (convergence)
- The maximum number of iterations is reached
- A numerical error occurs (zero derivative, overflow, etc.)
