import { useEffect, useRef, useState, useCallback } from 'react';

export function useMediaPipePose(selectedJoint = 'shoulder', bodySide = 'right', active = false) {
  // 1. ALL HOOK DECLARATIONS AT TOP LEVEL IN FIXED ORDER
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameTimes = useRef([]);
  const angleHistory = useRef({ flexion: [], abduction: [] });
  const detectorRef = useRef(null); // holds Pose or Hands instance
  const cameraRef = useRef(null);

  const [fps, setFps] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [landmarksDetected, setLandmarksDetected] = useState(false);
  const [detectionWarning, setDetectionWarning] = useState('Position yourself in camera view');
  const [measuredAngles, setMeasuredAngles] = useState({ flexion: 0, abduction: 0, fistClosure: 0 });
  const [maxAngles, setMaxAngles] = useState({ flexion: 0, abduction: 0, fistClosure: 0 });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Landmark confidence threshold
  const VISIBILITY_THRESHOLD = 0.55;

  const isPointValid = (pt) => {
    return pt && (pt.visibility === undefined || pt.visibility >= VISIBILITY_THRESHOLD);
  };

  // 5-Frame Moving Average Smoothing Filter
  const smoothAngle = (type, rawVal) => {
    const history = angleHistory.current[type] || [];
    history.push(rawVal);
    if (history.length > 5) history.shift();
    angleHistory.current[type] = history;
    const sum = history.reduce((a, b) => a + b, 0);
    return Math.round(sum / history.length);
  };

  // 2D Angle between three points
  const calculateAngle2D = (p1, p2, p3) => {
    const v1 = [p1.x - p2.x, p1.y - p2.y];
    const v2 = [p3.x - p2.x, p3.y - p2.y];
    const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
    const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
    if (mag1 === 0 || mag2 === 0) return 0;
    const dot = v1[0] * v2[0] + v1[1] * v2[1];
    const cosine = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    return (Math.acos(cosine) * 180) / Math.PI;
  };

  // Shoulder Flexion & Abduction Angle Calculation
  const calculateShoulderAngles = (shoulder, elbow, hip) => {
    if (!isPointValid(shoulder) || !isPointValid(elbow) || !isPointValid(hip)) {
      return { valid: false, flexion: 0, abduction: 0, reason: `Please position your ${bodySide} shoulder, elbow & hip inside camera view` };
    }

    const vTorso = [hip.x - shoulder.x, hip.y - shoulder.y];
    const vArm = [elbow.x - shoulder.x, elbow.y - shoulder.y];

    const magTorso = Math.sqrt(vTorso[0] * vTorso[0] + vTorso[1] * vTorso[1]);
    const magArm = Math.sqrt(vArm[0] * vArm[0] + vArm[1] * vArm[1]);

    if (magTorso === 0 || magArm === 0) {
      return { valid: false, flexion: 0, abduction: 0, reason: 'Invalid landmark distance' };
    }

    const dot = vTorso[0] * vArm[0] + vTorso[1] * vArm[1];
    const cosine = Math.max(-1, Math.min(1, dot / (magTorso * magArm)));
    const angleFromTorso = (Math.acos(cosine) * 180) / Math.PI;

    const flexion = Math.min(180, Math.max(0, Math.round(angleFromTorso)));
    const abduction = flexion;

    return { valid: true, flexion, abduction };
  };

  // Elbow Flexion Angle Calculation
  const calculateElbowAngles = (shoulder, elbow, wrist) => {
    if (!isPointValid(shoulder) || !isPointValid(elbow) || !isPointValid(wrist)) {
      return { valid: false, flexion: 0, reason: `Please position your ${bodySide} shoulder, elbow & wrist inside camera view` };
    }

    const interiorAngle = calculateAngle2D(shoulder, elbow, wrist);
    const flexion = Math.min(145, Math.max(0, Math.round(180 - interiorAngle)));
    return { valid: true, flexion };
  };

  // Knee Flexion Calculation
  const calculateKneeAngles = (hip, knee, ankle) => {
    if (!isPointValid(hip) || !isPointValid(knee) || !isPointValid(ankle)) {
      return { valid: false, flexion: 0, reason: `Please position your ${bodySide} hip, knee & ankle inside camera view` };
    }

    const interiorAngle = calculateAngle2D(hip, knee, ankle);
    const flexion = Math.min(140, Math.max(0, Math.round(180 - interiorAngle)));
    return { valid: true, flexion };
  };

  // Hip Flexion Calculation
  const calculateHipAngles = (shoulder, hip, knee) => {
    if (!isPointValid(shoulder) || !isPointValid(hip) || !isPointValid(knee)) {
      return { valid: false, flexion: 0, reason: `Please position your ${bodySide} hip landmarks inside camera view` };
    }

    const interiorAngle = calculateAngle2D(shoulder, hip, knee);
    const flexion = Math.min(125, Math.max(0, Math.round(180 - interiorAngle)));
    return { valid: true, flexion };
  };

  // Spine Flexion (Trunk Inclination)
  const calculateSpineAngles = (lShoulder, rShoulder, lHip, rHip) => {
    if (!isPointValid(lShoulder) || !isPointValid(rShoulder) || !isPointValid(lHip) || !isPointValid(rHip)) {
      return { valid: false, flexion: 0, reason: 'Please position shoulders and hips in camera view' };
    }

    const midShoulder = { x: (lShoulder.x + rShoulder.x) / 2, y: (lShoulder.y + rShoulder.y) / 2 };
    const midHip = { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2 };

    const vTrunk = [midShoulder.x - midHip.x, midShoulder.y - midHip.y];
    const mag = Math.sqrt(vTrunk[0] * vTrunk[0] + vTrunk[1] * vTrunk[1]);
    if (mag === 0) return { valid: false, flexion: 0 };

    const dot = -vTrunk[1];
    const cosine = Math.max(-1, Math.min(1, dot / mag));
    const flexion = Math.min(90, Math.max(0, Math.round((Math.acos(cosine) * 180) / Math.PI)));

    return { valid: true, flexion };
  };

  // Hand & Finger Flexion + Fist Closure Calculation (MediaPipe Hands 21-Points)
  const calculateHandFistClosure = (handLandmarks) => {
    if (!handLandmarks || handLandmarks.length < 21) {
      return { valid: false, flexion: 0, fistClosure: 0, reason: `Please position your ${bodySide} hand and fingers clearly in front of the camera` };
    }

    const wrist = handLandmarks[0];
    const thumbMcp = handLandmarks[2];
    const thumbTip = handLandmarks[4];
    const indexMcp = handLandmarks[5];
    const indexPip = handLandmarks[6];
    const indexDip = handLandmarks[7];
    const indexTip = handLandmarks[8];
    const middleMcp = handLandmarks[9];
    const middlePip = handLandmarks[10];
    const middleDip = handLandmarks[11];
    const middleTip = handLandmarks[12];
    const ringMcp = handLandmarks[13];
    const ringPip = handLandmarks[14];
    const ringDip = handLandmarks[15];
    const ringTip = handLandmarks[16];
    const pinkyMcp = handLandmarks[17];
    const pinkyPip = handLandmarks[18];
    const pinkyDip = handLandmarks[19];
    const pinkyTip = handLandmarks[20];

    // Reference Palm Scale: Distance between Wrist (0) and Middle Finger MCP (9)
    const palmDist = Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y) || 0.15;

    // Euclidean Distances from Fingertips to Wrist
    const indexTipDist = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
    const middleTipDist = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y);
    const ringTipDist = Math.hypot(ringTip.x - wrist.x, ringTip.y - wrist.y);
    const pinkyTipDist = Math.hypot(pinkyTip.x - wrist.x, pinkyTip.y - wrist.y);

    const avgTipDist = (indexTipDist + middleTipDist + ringTipDist + pinkyTipDist) / 4;
    const normDist = avgTipDist / palmDist; // ~1.8 when flat open hand, ~0.75 when closed fist

    // Calculate individual finger joint flexion angles (MCP-PIP-DIP)
    const indexFlex = Math.max(0, 180 - calculateAngle2D(indexMcp, indexPip, indexDip));
    const middleFlex = Math.max(0, 180 - calculateAngle2D(middleMcp, middlePip, middleDip));
    const ringFlex = Math.max(0, 180 - calculateAngle2D(ringMcp, ringPip, ringDip));
    const pinkyFlex = Math.max(0, 180 - calculateAngle2D(pinkyMcp, pinkyPip, pinkyDip));

    const avgFingerJointFlex = (indexFlex + middleFlex + ringFlex + pinkyFlex) / 4;

    // Fist closure percentage (0% to 100%)
    let fistPct = Math.round(((1.85 - normDist) / 1.1) * 100);
    fistPct = Math.max(0, Math.min(100, fistPct));

    // Finger flexion ROM angle equivalent (0° when open, 90° when tightly closed)
    const fingerFlexionAngle = Math.max(0, Math.min(90, Math.round((fistPct / 100) * 90)));

    return {
      valid: true,
      flexion: fingerFlexionAngle,
      abduction: fistPct,
      fistClosure: fistPct,
      avgJointFlex: Math.round(avgFingerJointFlex)
    };
  };

  // Frame processing for MediaPipe Pose (Body Joints)
  const processPoseLandmarks = useCallback((results) => {
    const now = performance.now();
    frameTimes.current.push(now);
    while (frameTimes.current.length > 0 && frameTimes.current[0] <= now - 1000) {
      frameTimes.current.shift();
    }
    setFps(frameTimes.current.length);

    if (!results.poseLandmarks || !canvasRef.current) {
      setLandmarksDetected(false);
      setDetectionWarning('No body pose detected in frame');
      return;
    }

    const landmarks = results.poseLandmarks;

    // Canvas rendering
    const canvasCtx = canvasRef.current.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const drawConnectors = window.drawConnectors;
    const drawLandmarks = window.drawLandmarks;
    const POSE_CONNECTIONS = window.POSE_CONNECTIONS;

    if (drawConnectors && POSE_CONNECTIONS) {
      drawConnectors(canvasCtx, landmarks, POSE_CONNECTIONS, { color: '#00F0FF', lineWidth: 3 });
    }
    if (drawLandmarks) {
      drawLandmarks(canvasCtx, landmarks, { color: '#38BDF8', fillColor: '#2563EB', radius: 4 });
    }
    canvasCtx.restore();

    // Landmark Extraction
    const isLeft = bodySide.toLowerCase() === 'left';
    const shoulder = isLeft ? landmarks[11] : landmarks[12];
    const elbow = isLeft ? landmarks[13] : landmarks[14];
    const wrist = isLeft ? landmarks[15] : landmarks[16];
    const hip = isLeft ? landmarks[23] : landmarks[24];
    const knee = isLeft ? landmarks[25] : landmarks[26];
    const ankle = isLeft ? landmarks[27] : landmarks[28];

    // Compute Overall Confidence Score
    const targetPoints = [shoulder, elbow, wrist, hip, knee, ankle].filter(Boolean);
    const avgVis = targetPoints.reduce((acc, curr) => acc + (curr.visibility || 0), 0) / (targetPoints.length || 1);
    const confPct = Math.round(avgVis * 100);
    setConfidence(confPct);

    let calcResult = { valid: false, flexion: 0, abduction: 0, reason: 'Target joint not in camera view' };
    const targetJoint = selectedJoint.toLowerCase();

    if (targetJoint === 'shoulder') {
      calcResult = calculateShoulderAngles(shoulder, elbow, hip);
    } else if (targetJoint === 'elbow') {
      calcResult = calculateElbowAngles(shoulder, elbow, wrist);
    } else if (targetJoint === 'knee') {
      calcResult = calculateKneeAngles(hip, knee, ankle);
    } else if (targetJoint === 'hip') {
      calcResult = calculateHipAngles(landmarks[12], hip, knee);
    } else if (targetJoint === 'spine') {
      calcResult = calculateSpineAngles(landmarks[11], landmarks[12], landmarks[23], landmarks[24]);
    } else {
      calcResult = calculateShoulderAngles(shoulder, elbow, hip);
    }

    if (!calcResult.valid) {
      setLandmarksDetected(false);
      setDetectionWarning(calcResult.reason || `Please position your ${bodySide} ${selectedJoint} inside camera view`);
      setMeasuredAngles({ flexion: 0, abduction: 0, fistClosure: 0 });
      return;
    }

    setLandmarksDetected(true);
    setDetectionWarning('');

    const smoothedFlexion = smoothAngle('flexion', calcResult.flexion);
    const smoothedAbduction = smoothAngle('abduction', calcResult.abduction || 0);

    const currentAngles = { flexion: smoothedFlexion, abduction: smoothedAbduction, fistClosure: 0 };
    setMeasuredAngles(currentAngles);

    // Update Session Max Angles ONLY when landmarks are validly detected
    setMaxAngles((prev) => ({
      flexion: Math.max(prev.flexion, smoothedFlexion),
      abduction: Math.max(prev.abduction, smoothedAbduction),
      fistClosure: 0
    }));
  }, [selectedJoint, bodySide]);

  // Frame processing for MediaPipe Hands (Hand / Fingers / Fist Closure)
  const processHandLandmarks = useCallback((results) => {
    const now = performance.now();
    frameTimes.current.push(now);
    while (frameTimes.current.length > 0 && frameTimes.current[0] <= now - 1000) {
      frameTimes.current.shift();
    }
    setFps(frameTimes.current.length);

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0 || !canvasRef.current) {
      setLandmarksDetected(false);
      setDetectionWarning(`Please place your ${bodySide} hand and fingers in front of the camera`);
      return;
    }

    const handLandmarks = results.multiHandLandmarks[0];

    // Canvas rendering for Hand
    const canvasCtx = canvasRef.current.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const drawConnectors = window.drawConnectors;
    const drawLandmarks = window.drawLandmarks;
    const HAND_CONNECTIONS = window.HAND_CONNECTIONS;

    if (drawConnectors && HAND_CONNECTIONS) {
      drawConnectors(canvasCtx, handLandmarks, HAND_CONNECTIONS, { color: '#00F0FF', lineWidth: 3 });
    }
    if (drawLandmarks) {
      drawLandmarks(canvasCtx, handLandmarks, { color: '#38BDF8', fillColor: '#2563EB', radius: 4 });
    }
    canvasCtx.restore();

    setConfidence(92);

    const calcResult = calculateHandFistClosure(handLandmarks);
    if (!calcResult.valid) {
      setLandmarksDetected(false);
      setDetectionWarning(calcResult.reason);
      setMeasuredAngles({ flexion: 0, abduction: 0, fistClosure: 0 });
      return;
    }

    setLandmarksDetected(true);
    setDetectionWarning('');

    const smoothedFlexion = smoothAngle('flexion', calcResult.flexion);
    const smoothedFist = smoothAngle('abduction', calcResult.fistClosure);

    const currentAngles = {
      flexion: smoothedFlexion,
      abduction: smoothedFist,
      fistClosure: smoothedFist
    };
    setMeasuredAngles(currentAngles);

    // Update Session Max Angles
    setMaxAngles((prev) => ({
      flexion: Math.max(prev.flexion, smoothedFlexion),
      abduction: Math.max(prev.abduction, smoothedFist),
      fistClosure: Math.max(prev.fistClosure || 0, smoothedFist)
    }));
  }, [selectedJoint, bodySide]);

  const resetMaxAngles = () => {
    angleHistory.current = { flexion: [], abduction: [] };
    setMaxAngles({ flexion: 0, abduction: 0, fistClosure: 0 });
  };

  useEffect(() => {
    if (!active) {
      if (cameraRef.current) {
        cameraRef.current.stop();
        setIsCameraActive(false);
      }
      return;
    }

    const isHandMode = selectedJoint.toLowerCase() === 'hand';

    if (isHandMode) {
      // Initialize MediaPipe Hands for Hand Component
      const HandsClass = window.Hands;
      const CameraClass = window.Camera;

      if (!HandsClass || !CameraClass) {
        setCameraError("MediaPipe Hands library is loading...");
        return;
      }

      const hands = new HandsClass({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.60,
        minTrackingConfidence: 0.60,
      });

      hands.onResults(processHandLandmarks);
      detectorRef.current = hands;

      if (videoRef.current) {
        const camera = new CameraClass(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && detectorRef.current) {
              await detectorRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });

        camera
          .start()
          .then(() => {
            setIsCameraActive(true);
            setCameraError(null);
          })
          .catch((err) => {
            console.error("Camera error:", err);
            setCameraError("Webcam access denied or camera device not found.");
          });

        cameraRef.current = camera;
      }
    } else {
      // Initialize MediaPipe Pose for Body Joints
      const PoseClass = window.Pose;
      const CameraClass = window.Camera;

      if (!PoseClass || !CameraClass) {
        return;
      }

      const pose = new PoseClass({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65,
      });

      pose.onResults(processPoseLandmarks);
      detectorRef.current = pose;

      if (videoRef.current) {
        const camera = new CameraClass(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && detectorRef.current) {
              await detectorRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });

        camera
          .start()
          .then(() => {
            setIsCameraActive(true);
            setCameraError(null);
          })
          .catch((err) => {
            console.error("Camera error:", err);
            setCameraError("Webcam access denied or camera device not found.");
          });

        cameraRef.current = camera;
      }
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [active, selectedJoint, processPoseLandmarks, processHandLandmarks]);

  return {
    videoRef,
    canvasRef,
    fps,
    confidence,
    landmarksDetected,
    detectionWarning,
    measuredAngles,
    maxAngles,
    resetMaxAngles,
    isCameraActive,
    cameraError,
  };
}
