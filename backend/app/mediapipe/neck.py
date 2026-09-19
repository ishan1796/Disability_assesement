from typing import Dict, Any, Tuple
from .angle_calculator import calculate_vertical_angle, calculate_angle_2d

class NeckAnalyzer:
    """
    MediaPipe landmark analyzer for Neck (Cervical Spine).
    Indices:
    0: Nose, 7: Left Ear, 8: Right Ear
    11: Left Shoulder, 12: Right Shoulder
    """

    @staticmethod
    def calculate_neck_angles(landmarks: Dict[int, Tuple[float, float, float]], side: str = "both") -> Dict[str, float]:
        nose = landmarks.get(0)
        l_ear = landmarks.get(7)
        r_ear = landmarks.get(8)
        l_shoulder = landmarks.get(11)
        r_shoulder = landmarks.get(12)

        if not (nose and l_shoulder and r_shoulder):
            return {"flexion": 0.0, "rotation": 0.0}

        mid_shoulder = ((l_shoulder[0] + r_shoulder[0]) / 2, (l_shoulder[1] + r_shoulder[1]) / 2)

        # Neck forward flexion (inclination of nose relative to mid-shoulder vertical)
        flexion_angle = calculate_vertical_angle(mid_shoulder, nose)

        # Head rotation: asymmetry in ear position relative to shoulders
        rotation_angle = 0.0
        if l_ear and r_ear:
            ear_dist = abs(l_ear[0] - r_ear[0])
            shoulder_width = abs(l_shoulder[0] - r_shoulder[0])
            if shoulder_width > 0:
                rotation_ratio = ear_dist / shoulder_width
                rotation_angle = min(80.0, max(0.0, (1.0 - rotation_ratio) * 100.0))

        return {
            "flexion": round(flexion_angle, 1),
            "rotation": round(rotation_angle, 1)
        }

    @staticmethod
    def get_severity(flexion_angle: float) -> str:
        if flexion_angle < 15:
            return "Severe"
        elif flexion_angle < 25:
            return "Moderate"
        elif flexion_angle < 35:
            return "Mild"
        return "Normal"
