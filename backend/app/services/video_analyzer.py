import cv2
import numpy as np
import tempfile
import os
import urllib.request
import mediapipe as mp
from typing import Dict, Any, List, Tuple
from ..mediapipe.angle_calculator import calculate_angle_2d, calculate_vertical_angle

class VideoAnalyzer:
    """
    OpenCV + MediaPipe Native PoseLandmarker Analysis Engine for MP4/MOV recorded videos.
    Processes video frame-by-frame to extract peak joint ROM angles and Gait Pattern metrics.
    """

    VISIBILITY_THRESHOLD = 0.50

    @staticmethod
    def get_model_path() -> str:
        """Ensures MediaPipe PoseLandmarker model file exists locally."""
        model_dir = os.path.join(os.path.dirname(__file__), "..", "mediapipe")
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(model_dir, "pose_landmarker_lite.task")

        if not os.path.exists(model_path):
            url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"
            urllib.request.urlretrieve(url, model_path)

        return model_path

    @staticmethod
    def is_point_valid(pt) -> bool:
        if pt is None:
            return False
        vis = getattr(pt, 'visibility', 1.0)
        return vis is None or vis >= VideoAnalyzer.VISIBILITY_THRESHOLD

    @staticmethod
    def analyze_video_file(video_bytes: bytes, selected_joint: str, body_side: str) -> Dict[str, Any]:
        # Save video bytes to temporary file for OpenCV
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
            tmp_file.write(video_bytes)
            tmp_path = tmp_file.name

        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            os.remove(tmp_path)
            raise ValueError("Failed to open uploaded MP4 video file.")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        duration_sec = round(total_frames / (fps or 1.0), 1)

        # Initialize MediaPipe Pose Landmarker (Native Tasks API)
        model_path = VideoAnalyzer.get_model_path()

        from mediapipe.tasks.python import vision
        base_options = mp.tasks.BaseOptions(model_asset_path=model_path)
        options = vision.PoseLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.IMAGE,
            min_pose_detection_confidence=0.50,
            min_pose_presence_confidence=0.50,
            min_tracking_confidence=0.50
        )
        landmarker = vision.PoseLandmarker.create_from_options(options)

        frame_count = 0
        valid_frames = 0

        flexion_angles = []
        abduction_angles = []
        confidence_scores = []

        left_knee_flexions = []
        right_knee_flexions = []

        target_joint = selected_joint.lower()
        is_left = body_side.lower() == 'left'

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1
            # Subsample frames if video is long (> 600 frames) to maintain fast performance
            if total_frames > 600 and frame_count % 2 != 0:
                continue

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

            detection_result = landmarker.detect(mp_image)

            if not detection_result.pose_landmarks or len(detection_result.pose_landmarks) == 0:
                continue

            landmarks = detection_result.pose_landmarks[0]

            l_shoulder, r_shoulder = landmarks[11], landmarks[12]
            l_elbow, r_elbow = landmarks[13], landmarks[14]
            l_wrist, r_wrist = landmarks[15], landmarks[16]
            l_hip, r_hip = landmarks[23], landmarks[24]
            l_knee, r_knee = landmarks[25], landmarks[26]
            l_ankle, r_ankle = landmarks[27], landmarks[28]

            shoulder = l_shoulder if is_left else r_shoulder
            elbow = l_elbow if is_left else r_elbow
            wrist = l_wrist if is_left else r_wrist
            hip = l_hip if is_left else r_hip
            knee = l_knee if is_left else r_knee
            ankle = l_ankle if is_left else r_ankle

            pts = [shoulder, elbow, wrist, hip, knee, ankle]
            valid_pts = [p for p in pts if VideoAnalyzer.is_point_valid(p)]
            if not valid_pts:
                continue

            avg_conf = sum([getattr(p, 'visibility', 0.8) or 0.8 for p in valid_pts]) / len(valid_pts)
            confidence_scores.append(avg_conf)

            cur_flexion = 0.0
            cur_abduction = 0.0

            if target_joint == 'shoulder':
                if VideoAnalyzer.is_point_valid(shoulder) and VideoAnalyzer.is_point_valid(elbow) and VideoAnalyzer.is_point_valid(hip):
                    v_torso = (hip.x - shoulder.x, hip.y - shoulder.y)
                    v_arm = (elbow.x - shoulder.x, elbow.y - shoulder.y)
                    mag_t = np.hypot(*v_torso)
                    mag_a = np.hypot(*v_arm)
                    if mag_t > 0 and mag_a > 0:
                        dot = v_torso[0]*v_arm[0] + v_torso[1]*v_arm[1]
                        cos = np.clip(dot / (mag_t * mag_a), -1.0, 1.0)
                        cur_flexion = float(np.degrees(np.arccos(cos)))
                        cur_abduction = cur_flexion
                        valid_frames += 1

            elif target_joint == 'elbow':
                if VideoAnalyzer.is_point_valid(shoulder) and VideoAnalyzer.is_point_valid(elbow) and VideoAnalyzer.is_point_valid(wrist):
                    ang = calculate_angle_2d((shoulder.x, shoulder.y), (elbow.x, elbow.y), (wrist.x, wrist.y))
                    cur_flexion = max(0.0, 180.0 - ang)
                    valid_frames += 1

            elif target_joint == 'knee':
                if VideoAnalyzer.is_point_valid(hip) and VideoAnalyzer.is_point_valid(knee) and VideoAnalyzer.is_point_valid(ankle):
                    ang = calculate_angle_2d((hip.x, hip.y), (knee.x, knee.y), (ankle.x, ankle.y))
                    cur_flexion = max(0.0, 180.0 - ang)
                    valid_frames += 1

            elif target_joint == 'hip':
                if VideoAnalyzer.is_point_valid(shoulder) and VideoAnalyzer.is_point_valid(hip) and VideoAnalyzer.is_point_valid(knee):
                    ang = calculate_angle_2d((shoulder.x, shoulder.y), (hip.x, hip.y), (knee.x, knee.y))
                    cur_flexion = max(0.0, 180.0 - ang)
                    valid_frames += 1

            elif target_joint == 'spine':
                if VideoAnalyzer.is_point_valid(l_shoulder) and VideoAnalyzer.is_point_valid(r_shoulder) and VideoAnalyzer.is_point_valid(l_hip) and VideoAnalyzer.is_point_valid(r_hip):
                    mid_shoulder = ((l_shoulder.x + r_shoulder.x) / 2, (l_shoulder.y + r_shoulder.y) / 2)
                    mid_hip = ((l_hip.x + r_hip.x) / 2, (l_hip.y + r_hip.y) / 2)
                    v_trunk = (mid_shoulder[0] - mid_hip[0], mid_shoulder[1] - mid_hip[1])
                    mag = np.hypot(*v_trunk)
                    if mag > 0:
                        dot = -v_trunk[1]
                        cos = np.clip(dot / mag, -1.0, 1.0)
                        cur_flexion = min(90.0, float(np.degrees(np.arccos(cos))))
                        valid_frames += 1

            else:
                if VideoAnalyzer.is_point_valid(shoulder) and VideoAnalyzer.is_point_valid(elbow) and VideoAnalyzer.is_point_valid(hip):
                    ang = calculate_angle_2d((hip.x, hip.y), (shoulder.x, shoulder.y), (elbow.x, elbow.y))
                    cur_flexion = float(ang)
                    valid_frames += 1

            if cur_flexion > 0:
                flexion_angles.append(cur_flexion)
            if cur_abduction > 0:
                abduction_angles.append(cur_abduction)

            # Gait pattern knee tracking
            if VideoAnalyzer.is_point_valid(l_hip) and VideoAnalyzer.is_point_valid(l_knee) and VideoAnalyzer.is_point_valid(l_ankle):
                lk_ang = calculate_angle_2d((l_hip.x, l_hip.y), (l_knee.x, l_knee.y), (l_ankle.x, l_ankle.y))
                left_knee_flexions.append(max(0.0, 180.0 - lk_ang))

            if VideoAnalyzer.is_point_valid(r_hip) and VideoAnalyzer.is_point_valid(r_knee) and VideoAnalyzer.is_point_valid(r_ankle):
                rk_ang = calculate_angle_2d((r_hip.x, r_hip.y), (r_knee.x, r_knee.y), (r_ankle.x, r_ankle.y))
                right_knee_flexions.append(max(0.0, 180.0 - rk_ang))

        cap.release()
        landmarker.close()
        os.remove(tmp_path)

        if not flexion_angles:
            return {
                "success": False,
                "error": f"Could not detect clear body landmarks for {body_side} {selected_joint} in uploaded video. Please ensure patient's full body and target limb are visible.",
                "total_frames": frame_count,
                "duration_seconds": duration_sec
            }

        peak_flexion = round(float(np.percentile(flexion_angles, 95)), 1)
        peak_abduction = round(float(np.percentile(abduction_angles, 95)), 1) if abduction_angles else peak_flexion
        mean_confidence = round(float(np.mean(confidence_scores) * 100), 1) if confidence_scores else 80.0

        gait_analysis = None
        if left_knee_flexions and right_knee_flexions:
            max_l_knee = np.max(left_knee_flexions)
            max_r_knee = np.max(right_knee_flexions)
            min_knee = min(max_l_knee, max_r_knee)
            max_knee = max(max_l_knee, max_r_knee)

            symmetry_ratio = round(float(min_knee / (max_knee or 1.0)) * 100, 1)

            if symmetry_ratio >= 85:
                gait_type = "Normal Symmetrical Gait"
                gait_desc = "Symmetrical stride and knee flexion balance observed during gait phases."
            elif symmetry_ratio >= 65:
                gait_type = "Mild Antalgic / Asymmetrical Gait"
                gait_desc = "Asymmetrical stride length with mild reduction in knee swing flexion on affected side."
            else:
                gait_type = "Severe Limping / Restricted Stride Gait"
                gait_desc = "Significant asymmetry between left and right limb motion indicating antalgic gait or joint pain."

            gait_analysis = {
                "left_peak_knee_flexion": round(float(max_l_knee), 1),
                "right_peak_knee_flexion": round(float(max_r_knee), 1),
                "gait_symmetry_ratio": symmetry_ratio,
                "gait_pattern_type": gait_type,
                "gait_description": gait_desc
            }

        return {
            "success": True,
            "selected_joint": selected_joint,
            "body_side": body_side,
            "peak_flexion": peak_flexion,
            "peak_abduction": peak_abduction,
            "mean_confidence": mean_confidence,
            "total_frames": frame_count,
            "analyzed_frames": valid_frames,
            "duration_seconds": duration_sec,
            "gait_analysis": gait_analysis
        }
