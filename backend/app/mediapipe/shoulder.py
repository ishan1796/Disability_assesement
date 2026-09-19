from typing import Dict, Any, Tuple
from .angle_calculator import calculate_angle_2d, calculate_vertical_angle

class ShoulderAnalyzer:
    """
    MediaPipe landmark analyzer for Shoulder joint (Flexion & Abduction).
    Landmark Indices (MediaPipe Pose):
    11: Left Shoulder, 12: Right Shoulder
    13: Left Elbow, 14: Right Elbow
    23: Left Hip, 24: Right Hip
    """

    @staticmethod
    def calculate_shoulder_angles(landmarks: Dict[int, Tuple[float, float, float]], side: str = "right") -> Dict[str, float]:
        side_lower = side.lower()
        if side_lower == "left":
            shoulder = landmarks.get(11)
            elbow = landmarks.get(13)
            hip = landmarks.get(23)
        else:
            shoulder = landmarks.get(12)
            elbow = landmarks.get(14)
            hip = landmarks.get(24)

        if not (shoulder and elbow and hip):
            return {"flexion": 0.0, "abduction": 0.0}

        # Flexion: Angle at shoulder formed by Hip - Shoulder - Elbow
        flexion_angle = calculate_angle_2d(hip, shoulder, elbow)

        # Abduction: Arm elevation outward
        abduction_angle = calculate_vertical_angle(shoulder, elbow)

        return {
            "flexion": round(flexion_angle, 1),
            "abduction": round(abduction_angle, 1)
        }

    @staticmethod
    def get_severity(flexion_angle: float, abduction_angle: float) -> str:
        if flexion_angle < 60 or abduction_angle < 40:
            return "Severe"
        elif flexion_angle < 120 or abduction_angle < 110:
            return "Moderate"
        elif flexion_angle < 160 or abduction_angle < 159:
            return "Mild"
        return "Normal"
