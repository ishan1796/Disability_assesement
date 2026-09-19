import React, { useState, useRef } from 'react';
import { Upload, FileVideo, CheckCircle2, AlertCircle, Loader2, Activity, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function VideoUploader({
  selectedJoint,
  bodySide,
  onPrev,
  onNext,
  recordedMaxAngles,
  setRecordedMaxAngles
}) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.name.match(/\.(mp4|mov|webm|avi)$/i)) {
      setErrorMessage("Please upload an MP4, MOV, or WEBM video file.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("File size exceeds 50 MB limit. Please trim or compress video.");
      return;
    }

    setSelectedFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
    setAnalysisResult(null);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("selected_joint", selectedJoint);
    formData.append("body_side", bodySide);

    try {
      const response = await fetch('/api/v1/assessment/analyze-video', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Video analysis failed.");
      }

      setAnalysisResult(data);
      setRecordedMaxAngles({
        flexion: data.peak_flexion || 0,
        abduction: data.peak_abduction || data.peak_flexion || 0
      });
    } catch (err) {
      console.error("Video analysis error:", err);
      setErrorMessage(err.message || "Failed to analyze video. Ensure landmarks are visible.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
        isLight
          ? 'bg-white border-slate-200 shadow-2xs'
          : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div>
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            <FileVideo className={`w-5 h-5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
            MP4 Video Motion Analysis: <span className="capitalize text-blue-600 dark:text-blue-400">{bodySide} {selectedJoint}</span>
          </h3>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Upload recorded movement or gait walking video (5 to 60 seconds duration, ≤50 MB) for server OpenCV pose processing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload & Video Preview Box */}
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 min-h-[260px] ${
              isLight
                ? 'border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50/80 shadow-2xs'
                : 'border-slate-700 hover:border-blue-500/80 bg-slate-900/60 hover:bg-slate-900/90'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/mov,video/webm"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />

            <Upload className={`w-10 h-10 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
            <div>
              <p className={`font-bold text-sm ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                {selectedFile ? selectedFile.name : 'Click or Drag & Drop MP4 Video File'}
              </p>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Supported: MP4, MOV, WEBM (5–60 seconds duration, Max 50 MB)
              </p>
            </div>
          </div>

          {videoPreviewUrl && (
            <div className={`rounded-2xl border overflow-hidden shadow-md ${isLight ? 'border-slate-200 bg-black' : 'border-slate-800 bg-black'}`}>
              <video
                src={videoPreviewUrl}
                controls
                className="w-full h-56 object-contain"
              />
            </div>
          )}

          {selectedFile && !analysisResult && (
            <button
              onClick={handleUploadAndAnalyze}
              disabled={isAnalyzing}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Video Frames with MediaPipe...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Analyze Video Motion & Extract Peak ROM</span>
                </>
              )}
            </button>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/80 dark:border-rose-500/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Analysis Results Display */}
        <div className="space-y-4">
          {!analysisResult ? (
            <div className={`h-full border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2 ${
              isLight
                ? 'bg-white border-slate-200 text-slate-500 shadow-2xs'
                : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
            }`}>
              <FileVideo className={`w-12 h-12 ${isLight ? 'text-slate-400' : 'text-slate-600'}`} />
              <p className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>No Video Analyzed Yet</p>
              <p className="text-xs max-w-xs">
                Upload an MP4 video (5 to 60 seconds) of the patient performing {bodySide} {selectedJoint} movement or gait walk to extract peak angles.
              </p>
            </div>
          ) : (
            <div className={`p-6 rounded-2xl border space-y-4 transition-all ${
              isLight
                ? 'bg-white border-slate-200 shadow-2xs'
                : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <h4 className={`font-bold text-sm flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Video Analysis Complete
                </h4>
                <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {analysisResult.analyzed_frames} / {analysisResult.total_frames} Frames ({analysisResult.duration_seconds}s)
                </span>
              </div>

              {/* Peak Extracted Angles */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl border text-center space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}>
                  <span className={`text-xs block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Extracted Peak Flexion</span>
                  <span className={`text-2xl font-extrabold font-mono ${isLight ? 'text-blue-700' : 'text-cyan-400'}`}>
                    {analysisResult.peak_flexion}°
                  </span>
                </div>

                <div className={`p-4 rounded-xl border text-center space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}>
                  <span className={`text-xs block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Tracking Confidence</span>
                  <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    {analysisResult.mean_confidence}%
                  </span>
                </div>
              </div>

              {/* Gait Pattern Analysis */}
              {analysisResult.gait_analysis && (
                <div className={`p-4 rounded-xl border space-y-2 text-xs ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
                }`}>
                  <span className={`font-bold block text-xs uppercase tracking-wider ${isLight ? 'text-blue-700' : 'text-cyan-400'}`}>
                    Gait Pattern Analysis Results
                  </span>
                  <div className={`flex justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <span>Gait Classification:</span>
                    <strong className={isLight ? 'text-slate-900' : 'text-white'}>{analysisResult.gait_analysis.gait_pattern_type}</strong>
                  </div>
                  <div className={`flex justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <span>Step Symmetry Ratio:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{analysisResult.gait_analysis.gait_symmetry_ratio}%</strong>
                  </div>
                  <div className={`flex justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <span>Left vs Right Knee Bend:</span>
                    <strong className="font-mono">{analysisResult.gait_analysis.left_peak_knee_flexion}° / {analysisResult.gait_analysis.right_peak_knee_flexion}°</strong>
                  </div>
                  <p className={`text-[11px] pt-1 border-t ${isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'}`}>
                    {analysisResult.gait_analysis.gait_description}
                  </p>
                </div>
              )}

              <div className={`p-3 rounded-xl border text-xs font-medium ${
                isLight ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-blue-950/40 border-blue-500/20 text-cyan-300'
              }`}>
                ✓ Extracted peak angle ({analysisResult.peak_flexion}°) saved to session for Gazette rule evaluation.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onPrev}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium text-xs transition ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={onNext}
          disabled={!analysisResult}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
        >
          <span>Save & Proceed to Questionnaire</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
