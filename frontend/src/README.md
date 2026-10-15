# 🚀 AI Vision Studio (Enterprise-Grade Object Detection, XAI & Visual Search)

An advanced, full-stack AI Vision Platform featuring object detection, explainable AI (Grad-CAM XAI), visual similarity search, and real-time webcam processing.

---

## 🛠️ Tech Stack
* **Frontend:** React (Vite), Modern CSS UI, Responsive Dark/Light Theme Dashboard
* **Backend:** Python FastAPI, OpenCV, PyTorch / YOLOv8, Pillow (PIL), NumPy
* **Core Models:** YOLOv8 (Object Detection), CLIP / Custom Embeddings (Visual Search)

---

## ✨ Key Features
1. **Image Recognition & Object Detection:** Detects objects with bounding boxes and confidence scores.
2. **Explainable AI (Grad-CAM):** Interactive heatmap visualization to interpret model decisions.
3. **AI Visual Search:** Upload an image to find visually similar products/items.
4. **Live Webcam Feed:** Real-time stream processing for instant AI predictions.
5. **Report Export & Analytics:** Download analysis history and scan reports in **CSV** or **JSON** formats.
6. **Theme Customization:** Seamless toggle between Light and Dark modes.

---

## ⚙️ Getting Started & Installation

### 1. Backend Setup
Navigate to the backend directory, install dependencies, and run the FastAPI server:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000