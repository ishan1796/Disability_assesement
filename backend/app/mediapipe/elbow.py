from typing import Dict, Any, Tuple
from .angle_calculator import calculate_angle_2d

class ElbowAnalyzer:
    """
    MediaPipe landmark analyzer for Elbow joint (Flexion).
    Indices:
    11: Left Shoulder, 12: Right Shoulder
    13: Left Elbow, 14: Right Elbow
    15: Left Wrist, 16: Right Wrist
    """

    @staticmethod
    def calculate_elbow_angles(landmarks: Dict[int, Tuple[float, float, float]], side: str = "right") -> Dict[str, float]:
        if side.lower() == "left":
            shoulder = landmarks.get(11)
            elbow = landmarks.get(13)
            wrist = landmarks.get(15)
        else:
            shoulder = landmarks.get(12)
            elbow = landmarks.get(14)
            wrist = landmarks.get(16)

        if not (shoulder and elbow and wrist):
            return {"flexion": 0.0}

        # Angle at elbow vertex
        angle = calculate_angle_2d(shoulder, elbow, wrist)
        # Measured arm bending angle
        flexion_angle = 180.0 - angle if angle > 0 else 0.0

        return {"flexion": round(flexion_angle, 1)}

    @staticmethod
    def get_severity(flexion_angle: float) -> str:
        if flexion_angle < 70:
            return "Severe"
        elif flexion_angle < 100:
            return "Moderate"
        elif flexion_angle < 130:
            return "Mild"
        return "Normal"
