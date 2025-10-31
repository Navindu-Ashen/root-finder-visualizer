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
