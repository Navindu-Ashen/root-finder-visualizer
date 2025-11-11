import numpy as np


def secant_method_single(f, x0, x1, tol=1e-6, max_iter=100):
    """Find a single root using secant method"""
    iteration_data = []

    for i in range(max_iter):
        try:
            f_x0 = f(x0)
            f_x1 = f(x1)

            # Check for invalid function values
            if not (np.isfinite(f_x0) and np.isfinite(f_x1)):
                return None, i, None, iteration_data

            if abs(f_x1 - f_x0) < 1e-15:  # Avoid division by zero
                return None, i, None, iteration_data

            x2 = x1 - f_x1 * (x1 - x0) / (f_x1 - f_x0)

            # Check if new x2 is valid
            if not np.isfinite(x2):
                return None, i, None, iteration_data

            error = abs(x2 - x1)
            iteration_data.append(
                {"iteration": i + 1, "x0": x0, "x1": x1, "x2": x2, "error": error}
            )

            if error < tol:
                return x2, i + 1, error, iteration_data

            x0, x1 = x1, x2
        except Exception:
            # If any mathematical error occurs, return current state
            return None, i, None, iteration_data

    return x2, max_iter, error, iteration_data


def is_duplicate_root(root, existing_roots, tolerance=1e-3):
    """Check if a root is already in the list of existing roots"""
    if root is None:
        return True
    for existing_root in existing_roots:
        if abs(root - existing_root) < tolerance:
            return True
    return False


def is_valid_root(f, root, tolerance=1e-6, x0=None, x1=None, max_distance=None):
    """Verify that the root is actually a root by checking f(root) ≈ 0 and distance from starting points"""
    if root is None:
        return False
    try:
        # Check if function value is close to zero
        f_value = f(root)
        if not (np.isfinite(f_value) and abs(f_value) < tolerance):
            return False

        # Check distance from starting points if provided
        if x0 is not None and x1 is not None and max_distance is not None:
            center = (x0 + x1) / 2
            search_radius = max(abs(x0 - x1), 1)
            # For small starting ranges, allow broader search for trig functions
            if search_radius < 2:
                search_radius = max(search_radius * 3, 2)
            allowed_distance = max_distance * search_radius
            if abs(root - center) > allowed_distance:
                return False

        return True
    except Exception:
        return False


def secant_method(f, x0, x1, tol=1e-6, max_iter=100):
    """Find multiple roots using secant method with different starting points"""
    all_roots = []
    all_iteration_data = []

    # Calculate reasonable search bounds based on starting points
    max_distance_factor = 8

    # Try the original starting points first
    try:
        # Check if function values are valid at starting points
        f_x0 = f(x0)
        f_x1 = f(x1)
        if not (np.isfinite(f_x0) and np.isfinite(f_x1)):
            raise ValueError("Function values at starting points are not finite")

        root, iterations, error, iteration_data = secant_method_single(
            f, x0, x1, tol, max_iter
        )
        # Validate that the found root is actually a root and within reasonable distance
        if (
            root is not None
            and is_valid_root(f, root, tol, x0, x1, max_distance_factor)
            and not is_duplicate_root(root, all_roots)
        ):
            all_roots.append(root)
            all_iteration_data.extend(iteration_data)
    except Exception:
        pass

    # Generate systematic starting point pairs to search for more roots
    # Use a more comprehensive search range for polynomials
    base_range = max(abs(x0), abs(x1), 3)
    search_range = min(base_range * 3, 15)

    # Create more systematic intervals to catch all roots
    num_intervals = 12
    start_points = np.linspace(-search_range, search_range, num_intervals)

    # Also add some focused points around the original starting points
    original_center = (x0 + x1) / 2
    local_range = abs(x1 - x0) * 2
    local_points = np.linspace(
        original_center - local_range, original_center + local_range, 6
    )
    start_points = np.concatenate([start_points, local_points])
    start_points = np.unique(start_points)  # Remove duplicates

    for i in range(len(start_points) - 1):
        # Allow finding up to 4 roots for polynomials (covers most practical cases)
        if len(all_roots) >= 4:
            break

        for j in range(
            i + 1, min(i + 3, len(start_points))
        ):  # More combinations but still limited
            x0_new = start_points[i]
            x1_new = start_points[j]

            # Skip if points are too close to each other
            if abs(x0_new - x1_new) < 0.05:
                continue

            # Skip if we've already tried very similar starting points
            too_similar = False
            for existing_root in all_roots:
                if (
                    abs(x0_new - existing_root) < 0.1
                    and abs(x1_new - existing_root) < 0.1
                ):
                    too_similar = True
                    break
            if too_similar:
                continue

            try:
                # Check if function values exist at these points
                f_x0 = f(x0_new)
                f_x1 = f(x1_new)
                if not (np.isfinite(f_x0) and np.isfinite(f_x1)):
                    continue

                root, iterations, error, iteration_data = secant_method_single(
                    f, x0_new, x1_new, tol, max_iter
                )
                # Validate that the found root is actually a root and within reasonable distance
                if (
                    root is not None
                    and is_valid_root(f, root, tol, x0, x1, max_distance_factor)
                    and not is_duplicate_root(root, all_roots)
                ):
                    all_roots.append(root)
                    # Add iteration data for the first few roots found
                    if len(all_roots) <= 3:
                        all_iteration_data.extend(iteration_data)
            except Exception:
                continue

    # Sort roots for consistent output
    if all_roots:
        all_roots.sort()

    # If multiple roots found, return all of them
    if len(all_roots) > 1:
        return all_roots, len(all_iteration_data), None, all_iteration_data
    elif len(all_roots) == 1:
        # If only one root found, return it in the original format
        return all_roots[0], len(all_iteration_data), error, all_iteration_data
    else:
        # No roots found
        return None, 0, None, []
