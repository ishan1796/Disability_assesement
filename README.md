# AI-Assisted Orthopaedic Disability Assessment System

An objective, explainable, and production-ready clinical system for evaluating orthopaedic locomotor disability percentages using **Markerless Computer Vision (OpenCV & MediaPipe)** and a **Deterministic Rule-Based AI Engine** strictly adhering to the **Gazette of India RPwD Act 2016 (Notification S.O. 1338(E))**.

---

## 🌟 Key Features

* **Deterministic & Explainable AI (No Black-Box ML):**
  * Every disability determination is 100% explainable, transparent, and legally auditable using statutory IF-THEN rules.
  * Strictly implements the official **Gazette Combining Formula**:
    $$a + \frac{b(90 - a)}{90}$$
  * Enforces statutory single-joint PPI caps (Shoulder 20%, Elbow 20%, Wrist 10%, Hand 40%, Hip 35%, Knee 35%, Spine 30%).

* **Computer Vision Goniometry & 3D Pose Tracking:**
  * Real-time 33-point body landmark detection via MediaPipe Pose with visibility validation ($>0.55$) and 5-frame moving average noise filtering.
  * Real-time **MediaPipe Hands 21-point tracking** specifically for Upper Limb **Hand Component** evaluation—measuring finger flexion angles, prehension, and fist closure percentage ($0\% - 100\%$).
  * Fullscreen camera mode with non-intrusive floating HUD.

* **Dual Motion Input Modality:**
  * **📹 Live Camera WebCam Stream:** Real-time goniometric tracking and angle locking.
  * **📁 MP4 Video Upload Analysis:** Ingests recorded videos (5 to 60 seconds duration, $\le 50$ MB) with automated **Gait Symmetry & Limp Detection**.

* **Automated Clinical Documentation:**
  * Generates and downloads structured, tamper-evident **ReportLab PDF Disability Assessment Reports**.
  * Downloadable **RPwD Act 2016 Functional Impact Questionnaires Database PDF**.

* **Formal Academic / Clinical Research UI:**
  * Default **Formal Light Mode** designed for clinical research and medical boards, with seamless **Dark Mode** toggle.
  * Interactive joint range-of-motion gauges, rule execution audit trees, and full patient registry archive with deletion management.

---

## 🏗️ System Architecture

```
[ LAYER 1: DATA ACQUISITION ]
  ├── Live Camera Feed (Webcam Stream)
  ├── Recorded MP4 Video Upload (5–60s)
  └── Patient Demographic & Functional Questionnaire
          │
          ▼
[ LAYER 2: COMPUTER VISION & GONIOMETRIC ENGINE ]
  ├── MediaPipe 3D Pose (33 Landmarks) & MediaPipe Hands (21 Landmarks)
  ├── OpenCV Frame-by-Frame Video Processing
  ├── 5-Frame Moving Average Noise Filter
  └── Gait Stride Symmetry & Antalgic Limp Analyzer
          │
          ▼
[ LAYER 3: EXPLAINABLE AI (XAI) RULE ENGINE ]
  ├── Gazette of India RPwD Act 2016 Rule Base
  ├── ROM Loss Severity Classifier (Mild / Moderate / Severe)
  ├── Statutory Combining Math: a + [b*(90-a)/90]
  └── Dominant Right Limb (+10%) & Pain Scale (+3% to +9%) Additions
          │
          ▼
[ LAYER 4: APPLICATION BACKEND & PERSISTENCE ]
  ├── FastAPI Asynchronous REST API
  ├── SQLite / PostgreSQL Database
  └── ReportLab PDF Clinical Certificate Generator
          │
          ▼
[ LAYER 5: CLIENT PRESENTATION LAYER (UI) ]
  ├── React 18 + Vite + TailwindCSS
  ├── Formal Research Light/Dark Clinical Dashboard
  ├── Live ROM Gauges & Fullscreen Viewport
  └── Transparent Rule Execution Audit Tree
```

---

## 💻 Tech Stack

### Frontend
* **React 18** & **Vite**
* **TailwindCSS** (Formal Research Light / Dark UI)
* **Framer Motion** & **Lucide React Icons**
* **MediaPipe Pose & MediaPipe Hands** (Browser-side WebGL acceleration)
* **Axios**

### Backend
* **FastAPI** (Python 3.13)
* **OpenCV** (`opencv-contrib-python`)
* **MediaPipe Tasks** (Server-side video processing)
* **NumPy**
* **ReportLab** (PDF Report & Certificate Generation)
* **SQLAlchemy** (SQLite / PostgreSQL ready)
* **Pydantic v2**

---

## 🚀 Getting Started

### 1. Prerequisites
* Python 3.10+
* Node.js 18+

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python run.py
# Server runs on http://127.0.0.1:8000 (Swagger docs at /docs)
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Application runs on http://127.0.0.1:5173
```

---

## 📜 Regulatory Standards & Medical Compliance
* **RPwD Act 2016 Notification S.O. 1338(E)**: Ministry of Social Justice and Empowerment (Department of Empowerment of Persons with Disabilities - Divyangjan), Government of India.
* **AAOS (American Academy of Orthopaedic Surgeons)**: Physiological baseline Range of Motion (ROM) norms.

---

## 📄 License
This project is licensed under the MIT License.
