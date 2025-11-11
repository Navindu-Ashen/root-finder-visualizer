from fasthtml.common import *
import sympy as sp
import numpy as np
from typing import Callable, Tuple, List, Dict
import json

app, rt = fast_app(
    hdrs=(
        Script(src="https://cdn.tailwindcss.com"),
        Script(src="https://cdn.jsdelivr.net/npm/chart.js"),
    )
)


def bisection_method(
    f: Callable[[float], float],
    a: float,
    b: float,
    tolerance: float = 1e-6,
    max_iterations: int = 100,
) -> Tuple[float, int, float, List[Dict]]:
    if f(a) * f(b) >= 0:
        raise ValueError("Function must have opposite signs at endpoints")

    iteration = 0
    history = []
    a_current, b_current = a, b

    while iteration < max_iterations:
        c = (a_current + b_current) / 2
        fc = f(c)
        error = abs(b_current - a_current)

        history.append(
            {
                "iteration": iteration + 1,
                "c": c,
                "f(c)": fc,
                "error": error,
            }
        )

        if abs(fc) < tolerance or error < tolerance:
            return c, iteration + 1, error, history

        if f(a_current) * fc < 0:
            b_current = c
        else:
            a_current = c

        iteration += 1

    c = (a_current + b_current) / 2
    error = abs(b_current - a_current)
    return c, max_iterations, error, history


def parse_function(func_str: str) -> Callable[[float], float]:
    x = sp.symbols("x")
    func_str = func_str.replace("^", "**")
    import re

    func_str = re.sub(r"\be\b", "E", func_str)
    f_symbolic = sp.sympify(func_str)
    return sp.lambdify(x, f_symbolic, "numpy")


def build_results_html(root, iterations, error, history, func_samples=None):
    history_json = json.dumps(history)
    func_json = json.dumps(func_samples) if func_samples is not None else "null"
    return Div(
        Div(
            Div(
                P("Root", cls="text-sm text-gray-500 mb-1"),
                P(f"{root:.10f}", cls="text-lg font-mono font-semibold text-gray-900"),
            ),
            Div(
                P("Iterations", cls="text-sm text-gray-500 mb-1"),
                P(str(iterations), cls="text-lg font-mono font-semibold text-gray-900"),
            ),
            Div(
                P("Error", cls="text-sm text-gray-500 mb-1"),
                P(f"{error:.2e}", cls="text-lg font-mono font-semibold text-gray-900"),
            ),
            cls="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-md shadow-sm",
        ),
        Div(
            Canvas(id="functionChart", cls="w-full h-64"),
            cls="bg-white p-4 rounded-md shadow-sm mb-6",
        ),
        Div(
            Canvas(id="chart", cls="w-full h-64"),
            cls="bg-white p-4 rounded-md shadow-sm mb-6",
        ),
        Div(
            Table(
                Thead(
                    Tr(
                        Th(
                            "n",
                            cls="px-4 py-2 text-left text-sm font-medium text-gray-700",
                        ),
                        Th(
                            "c",
                            cls="px-4 py-2 text-left text-sm font-medium text-gray-700",
                        ),
                        Th(
                            "f(c)",
                            cls="px-4 py-2 text-left text-sm font-medium text-gray-700",
                        ),
                        Th(
                            "Error",
                            cls="px-4 py-2 text-left text-sm font-medium text-gray-700",
                        ),
                    )
                ),
                Tbody(
                    *[
                        Tr(
                            Td(
                                str(h["iteration"]),
                                cls="px-4 py-2 text-sm font-mono text-gray-600",
                            ),
                            Td(
                                f"{h['c']:.8f}",
                                cls="px-4 py-2 text-sm font-mono text-gray-600",
                            ),
                            Td(
                                f"{h['f(c)']:.2e}",
                                cls="px-4 py-2 text-sm font-mono text-gray-600",
                            ),
                            Td(
                                f"{h['error']:.2e}",
                                cls="px-4 py-2 text-sm font-mono text-gray-600",
                            ),
                        )
                        for h in history
                    ]
                ),
                cls="w-full border border-gray-200",
            ),
            cls="overflow-x-auto bg-white rounded-md shadow-sm",
        ),
        Script(
            f"""
            document.addEventListener('DOMContentLoaded', () => {{
                const history = {history_json};
                const chartElement = document.getElementById('chart');
                if (chartElement) {{
                    const chartCtx = chartElement.getContext('2d');
                    new Chart(chartCtx, {{
                        type: 'line',
                        data: {{
                            labels: history.map(h => h.iteration),
                            datasets: [{{
                                label: 'Error',
                                data: history.map(h => h.error),
                                borderColor: '#1f2937',
                                backgroundColor: 'rgba(31, 41, 55, 0.1)',
                                borderWidth: 2,
                                pointRadius: 3,
                                pointHoverRadius: 5,
                                tension: 0
                            }}]
                        }},
                        options: {{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {{
                                legend: {{ display: false }},
                                title: {{ display: true, text: 'Convergence', font: {{ size: 14, weight: 'normal' }}, color: '#1f2937' }}
                            }},
                            scales: {{
                                y: {{
                                    type: 'logarithmic',
                                    title: {{ display: true, text: 'Error', color: '#1f2937' }},
                                    grid: {{ color: '#e5e7eb' }},
                                    ticks: {{ color: '#1f2937' }}
                                }},
                                x: {{
                                    title: {{ display: true, text: 'Iteration', color: '#1f2937' }},
                                    grid: {{ display: false }},
                                    ticks: {{ color: '#1f2937', padding: 20 }},
                                    padding: {{ left: 20, right: 20 }}
                                }}
                            }}
                        }}
                    }});
                }}
                // function plot with fixed root visualization
                const funcDataObj = {func_json};
                const functionChartEl = document.getElementById('functionChart');
                if (functionChartEl && funcDataObj) {{
                    try {{
                        const funcCtx = functionChartEl.getContext('2d');
                        const funcData = funcDataObj.xs.map((x, i) => ({{ x: x, y: funcDataObj.ys[i] }}));
                        const rootX = {root};
                        new Chart(funcCtx, {{
                            type: 'line',
                            data: {{
                                datasets: [
                                    {{
                                        label: 'f(x)',
                                        data: funcData,
                                        borderColor: '#2563eb',
                                        backgroundColor: 'rgba(37,99,235,0.08)',
                                        borderWidth: 2,
                                        pointRadius: 0,
                                        tension: 0.2,
                                        fill: true
                                    }},
                                    {{
                                        label: 'Root (x ≈ ' + rootX.toFixed(4) + ')',
                                        data: [{{ x: rootX, y: 0 }}],
                                        type: 'scatter',
                                        pointStyle: 'crossRot',
                                        pointRadius: 10,
                                        pointBorderWidth: 3,
                                        pointBackgroundColor: '#ef4444',
                                        pointBorderColor: '#dc2626',
                                        showLine: false
                                    }}
                                ]
                            }},
                            options: {{
                                parsing: false,
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {{
                                    legend: {{ 
                                        position: 'top',
                                        labels: {{
                                            usePointStyle: true,
                                            padding: 15
                                        }}
                                    }},
                                    title: {{
                                        display: true,
                                        text: 'Function Plot with Root',
                                        font: {{ size: 14, weight: 'normal' }},
                                        color: '#1f2937'
                                    }}
                                }},
                                scales: {{
                                    x: {{
                                        type: 'linear',
                                        title: {{ display: true, text: 'x', color: '#1f2937' }},
                                        grid: {{ color: '#e5e7eb' }},
                                        ticks: {{ color: '#1f2937' }}
                                    }},
                                    y: {{
                                        title: {{ display: true, text: 'f(x)', color: '#1f2937' }},
                                        grid: {{ color: '#e5e7eb' }},
                                        ticks: {{ color: '#1f2937' }}
                                    }}
                                }},
                                interaction: {{
                                    intersect: false,
                                    mode: 'nearest'
                                }}
                            }}
                        }});
                    }} catch (e) {{
                        console.error('Could not render function chart', e);
                    }}
                }}
            }});
            """
        ),
        id="results",
        cls="max-w-2xl mx-auto px-4 mt-8",
    )


def error_div(message):
    return Div(
        Div(message, cls="p-4 bg-red-100 text-red-700 rounded-md"),
        id="results",
        cls="max-w-2xl mx-auto px-4 mt-8",
    )


def page_content(results=None, form_values=None):
    func_default = "x**3 - 2*x - 5"
    a_default = "2.0"
    b_default = "3.0"
    tolerance_default = "0.000001"
    max_iter_default = "100"

    func_val = (
        form_values.get("func_str")
        if form_values and form_values.get("func_str") is not None
        else func_default
    )
    a_val = (
        form_values.get("a")
        if form_values and form_values.get("a") is not None
        else a_default
    )
    b_val = (
        form_values.get("b")
        if form_values and form_values.get("b") is not None
        else b_default
    )
    tolerance_val = (
        form_values.get("tolerance")
        if form_values and form_values.get("tolerance") is not None
        else tolerance_default
    )
    max_iter_val = (
        form_values.get("max_iter")
        if form_values and form_values.get("max_iter") is not None
        else max_iter_default
    )

    return Html(
        Head(
            Title("Bisection Method"),
            Script(src="https://cdn.tailwindcss.com"),
            Script(src="https://cdn.jsdelivr.net/npm/chart.js"),
        ),
        Body(
            Div(
                # Header
                Div(
                    H1(
                        "Bisection Method",
                        cls="text-2xl font-semibold text-gray-900 text-center mb-6 pt-6",
                    ),
                    P(
                        "Find roots numerically with simplicity",
                        cls="text-gray-500 text-sm text-center mb-8",
                    ),
                    cls="max-w-2xl mx-auto px-4",
                ),
                # Input Form
                Form(
                    Div(
                        Label(
                            "Function f(x)",
                            cls="block text-sm font-medium text-gray-700 mb-1",
                        ),
                        Input(
                            type="text",
                            name="func_str",
                            value=func_val,
                            placeholder="e.g., x**2 - 4",
                            cls="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500",
                        ),
                        cls="mb-4",
                    ),
                    Div(
                        Div(
                            Label(
                                "Left endpoint (a)",
                                cls="block text-sm font-medium text-gray-700 mb-1",
                            ),
                            Input(
                                type="number",
                                name="a",
                                value=a_val,
                                step="0.01",
                                placeholder="e.g., 0.0",
                                cls="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500",
                            ),
                            cls="flex-1",
                        ),
                        Div(
                            Label(
                                "Right endpoint (b)",
                                cls="block text-sm font-medium text-gray-700 mb-1",
                            ),
                            Input(
                                type="number",
                                name="b",
                                value=b_val,
                                step="0.01",
                                placeholder="e.g., 1.0",
                                cls="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500",
                            ),
                            cls="flex-1",
                        ),
                        cls="flex flex-col md:flex-row gap-4 mb-4",
                    ),
                    Div(
                        Div(
                            Label(
                                "Tolerance",
                                cls="block text-sm font-medium text-gray-700 mb-1",
                            ),
                            Input(
                                type="number",
                                name="tolerance",
                                value=tolerance_val,
                                step="0.000001",
                                placeholder="e.g., 0.000001",
                                cls="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500",
                            ),
                            cls="flex-1",
                        ),
                        Div(
                            Label(
                                "Max iterations",
                                cls="block text-sm font-medium text-gray-700 mb-1",
                            ),
                            Input(
                                type="number",
                                name="max_iter",
                                value=max_iter_val,
                                min="1",
                                placeholder="e.g., 100",
                                cls="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500",
                            ),
                            cls="flex-1",
                        ),
                        cls="flex flex-col md:flex-row gap-4 mb-6",
                    ),
                    Button(
                        "Calculate",
                        type="submit",
                        cls="w-full bg-gray-900 text-white py-2 rounded-md font-medium hover:bg-gray-700 transition-colors",
                    ),
                    method="post",
                    cls="max-w-2xl mx-auto px-4",
                ),
                # Results area
                results
                if results
                else Div(id="results", cls="max-w-2xl mx-auto px-4 mt-8"),
                cls="min-h-screen bg-gray-50",
            ),
            Footer(
                Div(
                    P(
                        "© 2025 Group B. All rights reserved.",
                        cls="text-sm text-gray-500 text-center",
                    ),
                    cls="max-w-2xl mx-auto px-4 py-4 border-t border-gray-200",
                ),
                cls="bg-gray-50",
            ),
        ),
    )


@rt("/")
def get():
    return page_content()


@rt("/")
async def post(req):
    form = await req.form()
    func_str = form.get("func_str")
    # Ensure required fields are present and not empty
    if (
        not func_str
        or not form.get("a")
        or not form.get("b")
        or not form.get("tolerance")
        or not form.get("max_iter")
    ):
        return page_content(error_div("Please fill in all fields before calculating."))

    # capture form values to re-populate the form on response
    form_values = {
        "func_str": func_str,
        "a": form.get("a"),
        "b": form.get("b"),
        "tolerance": form.get("tolerance"),
        "max_iter": form.get("max_iter"),
    }

    try:
        a = float(form.get("a"))
        b = float(form.get("b"))
        tolerance = float(form.get("tolerance"))
        max_iter = int(form.get("max_iter"))
    except (ValueError, TypeError):
        return page_content(error_div("Invalid input values"))

    try:
        f = parse_function(func_str)
        fa = f(a)
        fb = f(b)
        if fa * fb >= 0:
            raise ValueError(
                f"Function must have opposite signs at endpoints (f({a}) = {fa:.6f}, f({b}) = {fb:.6f})"
            )
        root, iterations, error, history = bisection_method(
            f, a, b, tolerance, max_iter
        )
        try:
            xs = np.linspace(a - (b - a) * 0.1, b + (b - a) * 0.1, 300)
            ys = []
            for xv in xs:
                try:
                    yv = float(f(xv))
                except Exception:
                    yv = None
                ys.append(yv)
            func_samples = {"xs": xs.tolist(), "ys": ys}
        except Exception:
            func_samples = None

        results = build_results_html(root, iterations, error, history, func_samples)
    except Exception as e:
        results = error_div(str(e))

    return page_content(results, form_values=form_values)


serve()
