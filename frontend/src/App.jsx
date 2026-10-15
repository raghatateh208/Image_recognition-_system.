import React, { useState, useRef } from 'react';
import { Camera, Video, Upload, Activity, ShieldAlert, Cpu, Search, FileText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('detection');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Text Visual Search State
  const [textQuery, setTextQuery] = useState('');

  // Webcam States
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [webcamActive, setWebcamActive] = useState(false);

  const startWebcam = async () => {
    setWebcamActive(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Webcam access error:", err);
      setError("Could not access webcam. Please check permissions.");
      setWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  };

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Webcam stream is still loading. Please wait a moment and try again.");
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError("Failed to capture image frame from canvas.");
        return;
      }

      const formData = new FormData();
      formData.append('file', blob, 'webcam_capture.jpg');
      
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/video-detection', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError("Failed to connect to backend. Make sure Uvicorn is running (`uvicorn main:app --reload`).");
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg');
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);
    setError(null);
    try {
      let endpoint = 'http://127.0.0.1:8000/api/recognition';
      if (activeTab === 'search') endpoint = 'http://127.0.0.1:8000/api/advanced-visual-search';
      if (activeTab === 'ocr') endpoint = 'http://127.0.0.1:8000/api/ocr-caption';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to fetch from backend');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Failed to connect to backend. Make sure Uvicorn is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextSearch = async () => {
    if (!textQuery) return;
    const formData = new FormData();
    formData.append('query_text', textQuery);

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/text-visual-search', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Text search failed');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Failed to execute text visual search.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <Cpu className="w-8 h-8 text-indigo-500" />
          <h1 className="text-lg font-bold tracking-wide">AI Vision Studio</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('detection'); stopWebcam(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'detection' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <Camera className="w-5 h-5" /> Object Detection
          </button>
          <button 
            onClick={() => { setActiveTab('webcam'); startWebcam(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'webcam' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <Video className="w-5 h-5" /> Live Webcam
          </button>
          <button 
            onClick={() => { setActiveTab('search'); stopWebcam(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'search' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <Search className="w-5 h-5" /> Visual Search
          </button>
          <button 
            onClick={() => { setActiveTab('ocr'); stopWebcam(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'ocr' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <FileText className="w-5 h-5" /> OCR & Caption
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur">
          <h2 className="text-xl font-semibold capitalize">
            {activeTab === 'webcam' ? 'Live Webcam Detection' : activeTab === 'search' ? 'Visual Search Workspace' : `${activeTab} Workspace`}
          </h2>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">System Online</span>
        </header>

        <main className="p-8 flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-3">
              <ShieldAlert className="w-5 h-5" /> {error}
            </div>
          )}

          {activeTab === 'webcam' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center">
                <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video border border-slate-700 flex items-center justify-center mb-4">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={captureAndDetect}
                    disabled={loading || !webcamActive}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-medium rounded-lg transition"
                  >
                    {loading ? 'Analyzing Frame...' : 'Capture & Analyze Frame'}
                  </button>
                  <button 
                    onClick={stopWebcam}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 font-medium rounded-lg transition"
                  >
                    Stop
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" /> Live Stream Analytics
                </h3>
                <div className="flex-1 bg-slate-950 rounded-lg p-4 border border-slate-800 overflow-y-auto">
                  {result ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-indigo-400 uppercase">Frame Source: {result.filename}</span>
                          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">Active</span>
                        </div>
                        {result.fps && <p className="text-sm text-indigo-400 font-medium">Performance: {result.fps} FPS ({result.latency_ms} ms)</p>}
                      </div>

                      {result.detected_objects && result.detected_objects.length > 0 && (
                        <div>
                          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Detected Objects ({result.detected_objects.length})</h5>
                          <div className="space-y-2">
                            {result.detected_objects.map((obj, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-sm">
                                <span className="font-medium text-slate-200 capitalize flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span> {obj.label}
                                </span>
                                <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-semibold">
                                  {Math.round(obj.confidence * 100)}% Confidence
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                      <p>Click "Capture & Analyze Frame" to test live camera feed.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'search' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Cross-Modal Text Search Box */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Cross-Modal Text Search</h3>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={textQuery}
                      onChange={(e) => setTextQuery(e.target.value)}
                      placeholder="e.g., 'blue handbag' or 'running car'..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button 
                      onClick={handleTextSearch}
                      disabled={loading || !textQuery}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-medium rounded-lg transition"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Image Upload Search Box */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center border-dashed border-2 border-slate-700 hover:border-indigo-500 transition">
                  <Upload className="w-10 h-10 text-slate-500 mb-3" />
                  <input 
                    type="file" 
                    onChange={(e) => setSelectedFile(e.target.files[0])} 
                    className="mb-3 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                  {selectedFile && <p className="text-sm text-emerald-400 font-medium">Selected: {selectedFile.name}</p>}
                  <button 
                    onClick={handleRunAnalysis}
                    disabled={loading || !selectedFile}
                    className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-medium rounded-lg transition text-sm"
                  >
                    {loading ? 'Searching Vectors...' : 'Run Visual Similarity Search'}
                  </button>
                </div>
              </div>

              {/* Search Results */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" /> Search Results
                </h3>
                <div className="flex-1 bg-slate-950 rounded-lg p-4 border border-slate-800 overflow-y-auto">
                  {result ? (
                    <div className="space-y-4">
                      {result.query && (
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm">
                          <span className="text-indigo-400 font-semibold">Query Text: </span> "{result.query}"
                        </div>
                      )}
                      {result.matches && result.matches.length > 0 && (
                        <div>
                          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Matching Vectors</h5>
                          <div className="space-y-2">
                            {result.matches.map((m, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-sm">
                                <span className="font-medium text-slate-200">{m.title}</span>
                                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
                                  Score: {m.similarity || m.index_dist}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 text-center">
                      <p>Query by entering text or uploading an image above.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center border-dashed border-2 border-slate-700 hover:border-indigo-500 transition">
                <Upload className="w-12 h-12 text-slate-500 mb-4" />
                <input 
                  type="file" 
                  onChange={(e) => setSelectedFile(e.target.files[0])} 
                  className="mb-4 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
                {selectedFile && <p className="text-sm text-emerald-400 font-medium">Selected: {selectedFile.name}</p>}
                <button 
                  onClick={handleRunAnalysis}
                  disabled={loading || !selectedFile}
                  className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-medium rounded-lg transition"
                >
                  {loading ? 'Processing AI Pipeline...' : 'Run Vision Analysis'}
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" /> Analysis Results
                </h3>
                <div className="flex-1 bg-slate-950 rounded-lg p-4 border border-slate-800 overflow-y-auto">
                  {result ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">File: {result.filename || "Data processed"}</span>
                          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">Success</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-100">{result.label || result.ocr_text || "AI Processing Complete"}</h4>
                        {result.confidence && <p className="text-sm text-emerald-400 mt-1 font-medium">Confidence Score: {result.confidence}</p>}
                      </div>

                      {result.detected_objects && result.detected_objects.length > 0 && (
                        <div>
                          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Detected Objects ({result.detected_objects.length})</h5>
                          <div className="space-y-2">
                            {result.detected_objects.map((obj, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-sm">
                                <span className="font-medium text-slate-200 capitalize flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span> {obj.label}
                                </span>
                                <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-semibold">
                                  {Math.round(obj.confidence * 100)}% Confidence
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                      <p>Awaiting inference output...</p>
                      <p className="text-xs mt-1">Upload an image to view analytics.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}