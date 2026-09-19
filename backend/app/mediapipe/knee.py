from typing import Dict, Any, Tuple
from .angle_calculator import calculate_angle_2d

class KneeAnalyzer:
    """
    MediaPipe landmark analyzer for Knee joint.
    Indices:
    23: Left Hip, 24: Right Hip
    25: Left Knee, 26: Right Knee
    27: Left Ankle, 28: Right Ankle
    """

    @staticmethod
    def calculate_knee_angles(landmarks: Dict[int, Tuple[float, float, float]], side: str = "right") -> Dict[str, float]:
        if side.lower() == "left":
            hip = landmarks.get(23)
            knee = landmarks.get(25)
            ankle = landmarks.get(27)
        else:
            hip = landmarks.get(24)
            knee = landmarks.get(26)
            ankle = landmarks.get(28)

        if not (hip and knee and ankle):
            return {"flexion": 0.0}

        angle = calculate_angle_2d(hip, knee, ankle)
        flexion_angle = 180.0 - angle if angle > 0 else 0.0

        return {"flexion": round(flexion_angle, 1)}

    @staticmethod
    def get_severity(flexion_angle: float) -> str:
        if flexion_angle < 75:
            return "Severe"
        elif flexion_angle < 100:
            return "Moderate"
        elif flexion_angle < 125:
            return "Mild"
        return "Normal"
