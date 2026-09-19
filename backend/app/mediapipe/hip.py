from typing import Dict, Any, Tuple
from .angle_calculator import calculate_angle_2d

class HipAnalyzer:
    """
    MediaPipe landmark analyzer for Hip joint.
    Indices:
    11: Left Shoulder, 12: Right Shoulder
    23: Left Hip, 24: Right Hip
    25: Left Knee, 26: Right Knee
    """

    @staticmethod
    def calculate_hip_angles(landmarks: Dict[int, Tuple[float, float, float]], side: str = "right") -> Dict[str, float]:
        if side.lower() == "left":
            shoulder = landmarks.get(11)
            hip = landmarks.get(23)
            knee = landmarks.get(25)
        else:
            shoulder = landmarks.get(12)
            hip = landmarks.get(24)
            knee = landmarks.get(26)

        if not (shoulder and hip and knee):
            return {"flexion": 0.0}

        angle = calculate_angle_2d(shoulder, hip, knee)
        flexion_angle = 180.0 - angle if angle > 0 else 0.0

        return {"flexion": round(flexion_angle, 1)}

    @staticmethod
    def get_severity(flexion_angle: float) -> str:
        if flexion_angle < 60:
            return "Severe"
        elif flexion_angle < 85:
            return "Moderate"
        elif flexion_angle < 110:
            return "Mild"
        return "Normal"
