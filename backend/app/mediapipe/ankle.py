from typing import Dict, Any, Tuple
from .angle_calculator import calculate_angle_2d

class AnkleAnalyzer:
    """
    MediaPipe landmark analyzer for Ankle joint.
    Indices:
    25: Left Knee, 26: Right Knee
    27: Left Ankle, 28: Right Ankle
    31: Left Foot Index, 32: Right Foot Index
    """

    @staticmethod
    def calculate_ankle_angles(landmarks: Dict[int, Tuple[float, float, float]], side: str = "right") -> Dict[str, float]:
        if side.lower() == "left":
            knee = landmarks.get(25)
            ankle = landmarks.get(27)
            foot = landmarks.get(31)
        else:
            knee = landmarks.get(26)
            ankle = landmarks.get(28)
            foot = landmarks.get(32)

        if not (knee and ankle and foot):
            return {"dorsiflexion": 0.0, "plantar_flexion": 0.0}

        angle = calculate_angle_2d(knee, ankle, foot)
        # Neutral ankle foot angle is 90 degrees
        dorsiflexion = max(0.0, angle - 90.0)
        plantar_flexion = max(0.0, 90.0 - angle)

        return {
            "dorsiflexion": round(dorsiflexion, 1),
            "plantar_flexion": round(plantar_flexion, 1)
        }

    @staticmethod
    def get_severity(dorsiflexion: float) -> str:
        if dorsiflexion < 5:
            return "Severe"
        elif dorsiflexion < 10:
            return "Moderate"
        elif dorsiflexion < 15:
            return "Mild"
        return "Normal"
