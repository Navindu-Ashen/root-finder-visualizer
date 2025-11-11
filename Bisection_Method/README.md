# Bisection Method Calculator

A beautiful, interactive web application for finding roots of mathematical functions using the Bisection Method. Features real-time visualization, convergence analysis, and support for complex mathematical expressions.

![Bisection Method Demo](https://img.shields.io/badge/Python-3.8+-blue.svg)
![FastHTML](https://img.shields.io/badge/FastHTML-Latest-green.svg)

## Quick Start

### Prerequisites

- Python 3.8 or higher
- [uv](https://github.com/astral-sh/uv) package manager (recommended)

### Installation

1. **Clone or download the project**

```bash
cd bisection-method
```

2. **Create and activate a virtual environment**

Using `uv` (recommended):
```bash
uv venv
```

This creates a `.venv` folder in your project directory.

3. **Activate the virtual environment**

**Windows (PowerShell):**
```powershell
.venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
.venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
source .venv/bin/activate
```

4. **Install dependencies**

```bash
uv sync
```

This installs all required packages including:
- `python-fasthtml` - Web framework
- `sympy` - Symbolic mathematics
- `numpy` - Numerical computations

### Running the Application

1. **Start the server**

```bash
python main.py
```

2. **Open your browser**

Navigate to: **http://localhost:5001**

3. **Use the calculator**
   - The form will load with a default example function
   - Click the **"Calculate"** button to run the bisection method
   - View results including root value, convergence chart, and function plot

### Supported mathematical expressions:

**Basic Operations:**
- Addition: `x + 5`
- Subtraction: `x - 3`
- Multiplication: `2*x` or `2x`
- Division: `x/2`
- Powers: `x**2` or `x^2`

**Mathematical Functions:**
- `sin(x)`, `cos(x)`, `tan(x)` - Trigonometric
- `exp(x)` or `e^x` - Exponential
- `log(x)` - Natural logarithm
- `sqrt(x)` - Square root
- `abs(x)` - Absolute value

**Constants:**
- `pi` - π (3.14159...)
- `e` - Euler's number (2.71828...)


