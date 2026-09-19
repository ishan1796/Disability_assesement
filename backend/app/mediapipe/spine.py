from typing import Dict, Any, Tuple
from .angle_calculator import calculate_vertical_angle

class SpineAnalyzer:
    """
    MediaPipe landmark analyzer for Thoracolumbar Spine.
    Indices:
    11: Left Shoulder, 12: Right Shoulder
    23: Left Hip, 24: Right Hip
    25: Left Knee, 26: Right Knee
    """

    @staticmethod
    def calculate_spine_angles(landmarks: Dict[int, Tuple[float, float, float]], side: str = "both") -> Dict[str, float]:
        l_shoulder = landmarks.get(11)
        r_shoulder = landmarks.get(12)
        l_hip = landmarks.get(23)
        r_hip = landmarks.get(24)

        if not (l_shoulder and r_shoulder and l_hip and r_hip):
            return {"flexion": 0.0}

        mid_shoulder = ((l_shoulder[0] + r_shoulder[0]) / 2, (l_shoulder[1] + r_shoulder[1]) / 2)
        mid_hip = ((l_hip[0] + r_hip[0]) / 2, (l_hip[1] + r_hip[1]) / 2)

        # Trunk forward inclination angle
        flexion_angle = calculate_vertical_angle(mid_hip, mid_shoulder)

        return {"flexion": round(flexion_angle, 1)}

    @staticmethod
    def get_severity(flexion_angle: float) -> str:
        if flexion_angle < 30:
            return "Severe"
        elif flexion_angle < 50:
            return "Moderate"
        elif flexion_angle < 75:
            return "Mild"
        return "Normal"
