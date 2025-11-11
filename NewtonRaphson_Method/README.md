# Newton-Raphson Method Solver

A full-stack web application for solving non-linear equations using the Newton-Raphson numerical method. The application features an interactive interface for equation solving, real-time visualization, and detailed iteration tracking.

## Overview

This project implements the Newton-Raphson method for finding roots of mathematical equations. It consists of a FastAPI backend that handles the computational logic and a Next.js frontend that provides an intuitive user interface with charts and iteration data.

## Features

- Solve non-linear equations using the Newton-Raphson iterative method
- Search for multiple roots within a specified range
- Interactive equation input with support for various mathematical functions
- Real-time visualization of function graphs and convergence
- Detailed iteration tracking with error analysis
- Configurable parameters (tolerance, max iterations, search range)
- Responsive web interface built with React and Tailwind CSS

## Project Structure

```
dev/
├── backend/           # FastAPI Python backend
│   ├── main.py       # Main application logic and API endpoints
│   ├── pyproject.toml # Python dependencies
│   └── README.md     # Backend-specific documentation
├── frontend/         # Next.js React frontend
│   ├── app/         # Next.js application pages
│   ├── components/  # React components
│   ├── package.json # Node.js dependencies
│   └── README.md    # Frontend-specific documentation
└── README.md        # This file
```

## Technology Stack

### Backend
- Python 3.14+
- FastAPI - Modern web framework for building APIs
- SymPy - Symbolic mathematics library
- NumPy - Numerical computing library
- Uvicorn - ASGI server
- Pydantic - Data validation

### Frontend
- Next.js 16.0.1 - React framework
- React 19.2.0 - UI library
- TypeScript - Type-safe JavaScript
- Tailwind CSS - Utility-first CSS framework
- Recharts - Charting library
- Radix UI - Accessible component primitives
- Lucide React - Icon library

## Prerequisites

- Python 3.14 or higher
- Node.js (for frontend)
- Bun package manager (or npm/yarn)
- uv (Python package manager)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies using uv:
```bash
uv sync
```

3. Activate the virtual environment:
```bash
source .venv/bin/activate
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
bun install
```

## Running the Application

### Start the Backend

From the backend directory:

```bash
python main.py
```

The API will be available at `http://localhost:8000`

API Documentation (Swagger UI): `http://localhost:8000/docs`

### Start the Frontend

From the frontend directory:

```bash
bun dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### POST /solve

Solve a non-linear equation using the Newton-Raphson method.

**Request Body:**
```json
{
  "equation": "x**2 - 4",
  "initial_guess": 1.0,
  "tolerance": 1e-6,
  "max_iterations": 100,
  "search_range": 10.0,
  "num_search_points": 20
}
```

**Response:**
```json
{
  "root": 2.0,
  "roots": [2.0],
  "converged": true,
  "total_error": 0.0,
  "final_error": 0.0,
  "iterations_count": 5,
  "iterations_data": [...],
  "message": "Found 1 root(s) in the search range."
}
```

### POST /evaluate

Evaluate a mathematical function at multiple x values for plotting.

**Request Body:**
```json
{
  "equation": "x**2 - 4",
  "x_values": [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
}
```

### GET /health

Health check endpoint.

## Supported Mathematical Functions

The solver supports a wide range of mathematical functions:

- Basic operations: `+`, `-`, `*`, `/`, `**` (power)
- Trigonometric: `sin(x)`, `cos(x)`, `tan(x)`, `sec(x)`, `csc(x)`, `cot(x)`
- Inverse trigonometric: `asin(x)`, `acos(x)`, `atan(x)`
- Hyperbolic: `sinh(x)`, `cosh(x)`, `tanh(x)`
- Exponential: `exp(x)`, `log(x)`, `ln(x)`
- Other: `sqrt(x)`, `Abs(x)`

## Example Equations

- Quadratic: `x**2 - 4`
- Cubic: `x**3 - 2*x - 5`
- Exponential: `exp(x) - 2`
- Trigonometric: `sin(x) - 0.5`
- Logarithmic: `log(x) - 1`
- Mixed: `x**2 - cos(x)`

## How It Works

The Newton-Raphson method is an iterative numerical technique for finding roots of equations:

1. Start with an initial guess x₀
2. Calculate the function value f(x) and its derivative f'(x)
3. Update the estimate: x₁ = x₀ - f(x₀)/f'(x₀)
4. Repeat until convergence (when the change between iterations is less than the tolerance)

The application enhances the basic method by:
- Searching multiple initial points to find multiple roots
- Validating convergence and root accuracy
- Providing detailed iteration data for analysis
- Handling edge cases like zero derivatives and overflow errors

## Configuration

### Backend Configuration

Edit the CORS settings in `backend/main.py` to allow different origins:

```python
allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"]
```

### Frontend Configuration

The API base URL can be configured in the frontend code. The default is `http://localhost:8000`.

## Development

### Backend Development

The backend uses FastAPI with automatic API documentation. Access the interactive API docs at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend Development

The frontend uses Next.js with hot module replacement. Changes to the code will automatically reload in the browser.

## Error Handling

The application handles various error cases:
- Invalid equation syntax
- Zero derivatives (division by zero)
- Numerical overflow/underflow
- Maximum iterations exceeded
- No convergence scenarios
