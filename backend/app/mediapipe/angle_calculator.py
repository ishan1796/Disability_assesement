import numpy as np
from typing import Tuple, List, Dict

def calculate_angle_3d(p1: Tuple[float, float, float], p2: Tuple[float, float, float], p3: Tuple[float, float, float]) -> float:
    """
    Calculates 3D interior angle (in degrees) at vertex p2 formed by points p1-p2-p3.
    p1, p2, p3 are (x, y, z) coordinates.
    """
    a = np.array(p1)
    b = np.array(p2)
    c = np.array(p3)

    ba = a - b
    bc = c - b

    norm_ba = np.linalg.norm(ba)
    norm_bc = np.linalg.norm(bc)

    if norm_ba == 0 or norm_bc == 0:
        return 0.0

    cosine_angle = np.dot(ba, bc) / (norm_ba * norm_bc)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)

    angle = np.arccos(cosine_angle)
    return float(np.degrees(angle))

def calculate_angle_2d(p1: Tuple[float, float], p2: Tuple[float, float], p3: Tuple[float, float]) -> float:
    """
    Calculates 2D interior angle (in degrees) at vertex p2.
    """
    a = np.array(p1[:2])
    b = np.array(p2[:2])
    c = np.array(p3[:2])

    ba = a - b
    bc = c - b

    norm_ba = np.linalg.norm(ba)
    norm_bc = np.linalg.norm(bc)

    if norm_ba == 0 or norm_bc == 0:
        return 0.0

    cosine_angle = np.dot(ba, bc) / (norm_ba * norm_bc)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)

    angle = np.arccos(cosine_angle)
    return float(np.degrees(angle))

def calculate_vertical_angle(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
    """
    Calculates angle of line (p1 -> p2) relative to the vertical downward axis (0, 1).
    Useful for trunk/spine inclination or limb flexion relative to body axis.
    """
    v = np.array([p2[0] - p1[0], p2[1] - p1[1]])
    vertical = np.array([0, 1])

    norm_v = np.linalg.norm(v)
    if norm_v == 0:
        return 0.0

    cosine_angle = np.dot(v, vertical) / norm_v
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)

    return float(np.degrees(np.arccos(cosine_angle)))
