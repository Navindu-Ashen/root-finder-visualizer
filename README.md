# Secant Method Root Finding Application

A modern web application that implements the Secant Method for finding roots of mathematical functions. The application consists of a Python FastAPI backend that performs the mathematical calculations and a Next.js React frontend that provides an intuitive user interface.

## Overview

The Secant Method is a numerical algorithm for finding roots (zeros) of a function. Unlike the Newton-Raphson method, it doesn't require the derivative of the function, making it more versatile for complex functions. This application can find single or multiple roots depending on the function and starting points provided.

## Features

- **Interactive Web Interface**: User-friendly frontend built with Next.js and React
- **Multiple Root Detection**: Automatically searches for and finds multiple roots when they exist
- **Comprehensive Function Support**: Supports a wide range of mathematical functions including:
  - Basic arithmetic operations
  - Trigonometric functions (sin, cos, tan, etc.)
  - Hyperbolic functions (sinh, cosh, tanh, etc.)
  - Exponential and logarithmic functions
  - Mathematical constants (π, e)
- **Iteration Visualization**: View step-by-step iteration data
- **Error Handling**: Robust error handling for invalid inputs and mathematical errors
- **Customizable Parameters**: Adjustable tolerance and maximum iterations

## 🏗️ Project Structure

```
dev/
├── backend/               # Python FastAPI backend
│   ├── main.py           # FastAPI application and API endpoints
│   ├── secant.py         # Secant method implementation
│   └── requirements.txt  # Python dependencies
├── frontend/             # Next.js React frontend
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/              # Utility libraries
│   ├── public/           # Static assets
│   └── package.json      # Node.js dependencies
└── README.md            # This file
```

## Prerequisites

### Backend Requirements
- Python 3.8 or higher
- pip (Python package installer)

### Frontend Requirements
- Node.js 18 or higher
- npm or yarn package manager

## Installation

### 1. Backend Setup

#### Navigate to the backend directory:
```bash
cd backend
```

#### Create a virtual environment (recommended):
```bash
python -m venv .venv
```

#### Activate the virtual environment:
- **Windows:**
  ```bash
  .venv\Scripts\activate
  ```
- **macOS/Linux:**
  ```bash
  source .venv/bin/activate
  ```

#### Install Python dependencies:
```bash
pip install -r requirements.txt
```

### 2. Frontend Setup

#### Navigate to the frontend directory:
```bash
cd ../frontend
```

#### Install Node.js dependencies:
```bash
npm install
```

## Running the Application

### 1. Start the Backend Server

From the `backend` directory:
```bash
uvicorn main:app --reload
```

The backend API will be available at: `http://127.0.0.1:8000`

### 2. Start the Frontend Development Server

From the `frontend` directory:
```bash
npm run dev
```

The frontend application will be available at: `http://localhost:3000`

## Usage

1. **Open the Application**: Navigate to `http://localhost:3000` in your web browser

2. **Enter Function**: Input a mathematical function using `x` as the variable
   - Examples: `x**2 - 4`, `sin(x) - 0.5`, `exp(x) - 2`

3. **Set Initial Points**: Provide two starting points (x₀ and x₁) for the algorithm

4. **Configure Parameters** (optional):
   - **Tolerance**: Convergence criteria (default: 1e-6)
   - **Max Iterations**: Maximum number of iterations (default: 100)

5. **Calculate**: Click the calculate button to find the roots

6. **View Results**: The application will display:
   - Found root(s)
   - Number of iterations
   - Convergence error
   - Step-by-step iteration data

## Supported Mathematical Functions

### Basic Functions
- `abs(x)` - Absolute value
- `pow(x, n)` - Power function
- `sqrt(x)` - Square root

### Trigonometric Functions
- `sin(x)`, `cos(x)`, `tan(x)`
- `asin(x)`, `acos(x)`, `atan(x)`

### Hyperbolic Functions
- `sinh(x)`, `cosh(x)`, `tanh(x)`
- `asinh(x)`, `acosh(x)`, `atanh(x)`

### Exponential and Logarithmic
- `exp(x)` - Exponential function
- `log(x)` - Natural logarithm
- `log10(x)` - Base-10 logarithm
- `log2(x)` - Base-2 logarithm

### Constants
- `pi` - π (3.14159...)
- `e` - Euler's number (2.71828...)

## API Endpoints

### POST `/api/secant`
Find roots using the Secant Method.

**Request Body:**
```json
{
  "function": "x**2 - 4",
  "x0": 1.0,
  "x1": 3.0,
  "tolerance": 1e-6,
  "max_iterations": 100
}
```

**Response:**
```json
{
  "root": 2.0,
  "roots": [2.0],
  "multiple_roots": false,
  "num_roots": 1,
  "iterations": 5,
  "error": 1e-7,
  "data": [...],
  "success": true
}
```

### GET `/api/functions`
Get available mathematical functions and examples.

## Configuration

### Backend Configuration
The backend runs on http://127.0.0.1:8000 by default. To change this, modify the `uvicorn` command:
```bash
uvicorn main:app --reload
```

### Frontend Configuration
The frontend runs on port 3000 by default. Next.js will automatically find an available port if 3000 is occupied.

## Example Functions to Try

1. **Quadratic**: `x**2 - 4` (roots at x = ±2)
2. **Trigonometric**: `sin(x)` (roots at multiples of π)
3. **Exponential**: `exp(x) - 2` (root at x = ln(2))
4. **Polynomial**: `x**3 - 2*x - 5` (one real root)
5. **Transcendental**: `cos(x) - x` (one root ≈ 0.739)

## Troubleshooting

### Common Issues

1. **Backend not starting**: Ensure all dependencies are installed and virtual environment is activated
2. **Frontend build errors**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. **CORS errors**: Ensure backend is running and CORS middleware is properly configured
4. **Function parsing errors**: Check function syntax and use supported mathematical operations

### Error Messages
- **"Function values at starting points are not finite"**: Choose different starting points
- **"No roots found"**: Try different starting points or check function syntax
- **"Division by zero"**: The algorithm encountered a mathematical singularity

---

Developed as final coursework for Computational Theory module by Group B.
