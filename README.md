# Numerical Methods for Root Finding

A collection of interactive web applications implementing numerical methods to calculate and visualize root points of non-linear equations.

## Overview

This repository contains implementations of three fundamental numerical methods for finding roots of non-linear equations:

- **Bisection Method** - A bracketing method that repeatedly bisects an interval and selects a subinterval where a root exists
- **Newton-Raphson Method** - An iterative method using tangent lines to approximate roots with quadratic convergence
- **Secant Method** - Similar to Newton-Raphson but uses secant lines instead of tangent lines, eliminating the need for derivative calculations

Each method includes a web-based interface for visualization and interactive exploration of the root-finding process.

## Project Structure

```
Codebase/
├── Bisection_Method/
│   └── main.py
├── NewtonRaphson_Method/
│   ├── backend/
│   └── frontend/
└── Secant_Method/
    ├── backend/
    └── frontend/
```

## Methods Description

### Bisection Method

The Bisection Method is a simple and reliable root-finding algorithm that works by:
1. Starting with an interval [a, b] where f(a) and f(b) have opposite signs
2. Computing the midpoint c = (a + b) / 2
3. Replacing either a or b with c based on the sign of f(c)
4. Repeating until convergence

**Advantages:**
- Always converges for continuous functions
- Simple to implement and understand
- Guaranteed to find a root if one exists in the interval

**Disadvantages:**
- Slower convergence compared to other methods
- Requires an initial interval where the function changes sign

### Newton-Raphson Method

The Newton-Raphson Method uses the derivative of the function to find successively better approximations:
1. Start with an initial guess x₀
2. Compute x_{n+1} = x_n - f(x_n) / f'(x_n)
3. Repeat until convergence

**Advantages:**
- Fast convergence (quadratic near the root)
- Requires only one initial guess

**Disadvantages:**
- Requires the derivative of the function
- May not converge if the initial guess is poor
- Can fail if the derivative is zero

### Secant Method

The Secant Method approximates the derivative using finite differences:
1. Start with two initial guesses x₀ and x₁
2. Compute x_{n+1} = x_n - f(x_n) * (x_n - x_{n-1}) / (f(x_n) - f(x_{n-1}))
3. Repeat until convergence

**Advantages:**
- Does not require derivative calculation
- Faster than bisection method
- Suitable for functions where derivatives are difficult to compute

**Disadvantages:**
- May not converge for poor initial guesses
- Slightly slower convergence than Newton-Raphson

## Technologies Used

- **Python** - Core implementation language
- **FastAPI / FastHTML** - Backend framework for web applications
- **Chart.js** - Visualization of numerical results
- **Tailwind CSS** - Styling for web interfaces
- **SymPy** - Symbolic mathematics for function parsing
- **NumPy** - Numerical computations

## Getting Started

### Prerequisites

- Python 3.8 or higher
- pip or uv package manager

### Installation

Each method has its own directory with separate installation instructions. Navigate to the specific method directory and follow the setup instructions in its respective README file.

#### General Steps:

1. Clone the repository
```bash
git clone <repository-url>
cd Codebase
```

2. Navigate to the desired method directory
```bash
cd Bisection_Method
# or
cd NewtonRaphson_Method
# or
cd Secant_Method
```

3. Install dependencies
```bash
pip install -r requirements.txt
# or if using uv
uv sync
```

4. Run the application
```bash
python main.py
```

## Usage

Each application provides a web interface where you can:

1. Input a mathematical function (e.g., x^3 - x - 2)
2. Set initial parameters (interval or starting points)
3. Configure tolerance and maximum iterations
4. Visualize the iterative process
5. View the calculated root and convergence data

## Features

- Interactive web-based interface
- Real-time visualization of the root-finding process
- Step-by-step iteration tracking
- Convergence analysis
- Support for various mathematical functions
- Error handling and validation
- Responsive design

## Applications

These numerical methods are widely used in:

- Engineering calculations
- Scientific computing
- Optimization problems
- Equation solving in physics and mathematics
- Computer graphics and simulations
- Financial modeling
