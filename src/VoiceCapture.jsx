import React, { useState, useRef, useEffect } from "react";
import { 
  ClipboardDocumentIcon, 
  TrashIcon, 
  MicrophoneIcon, 
  StopIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function VoiceCapture({ setAiData, aiData }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [volume, setVolume] = useState(0);
  const navigate = useNavigate();
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const maxVolumeRef = useRef(0);

  // --- AUDIO VISUALIZER LOGIC ---
  const setupVisualizer = (stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    
    analyserRef.current.fftSize = 256;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      animationRef.current = requestAnimationFrame(draw);

      analyserRef.current.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "#f9fafb"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      ctx.strokeStyle = "#14b8a6"; 
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      const average = dataArray.reduce((a, b) => a + Math.abs(b - 128), 0) / bufferLength;
      const currentVol = average * 2;
      setVolume(currentVol);

      if (currentVol > maxVolumeRef.current) {
        maxVolumeRef.current = currentVol;
      }
    };

    draw();
  };

  const startRecording = async () => {
    setTranscript("");
    setAiData(null); 
    audioChunksRef.current = [];
    maxVolumeRef.current = 0;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000
        } 
      });
      streamRef.current = stream;
      setupVisualizer(stream);

      // Use audio/webm for better compatibility
      const options = { mimeType: 'audio/webm;codecs=opus' };
      
      // Fallback if webm not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/ogg;codecs=opus';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = '';
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log(`Audio blob created: ${audioBlob.size} bytes, type: ${mimeType}`);
        await sendAudioToBackend(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      console.log("Recording started with format:", options.mimeType || 'default');
    } catch (err) {
      console.error("Microphone error:", err);
      alert("Microphone access is required. Please allow microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      cancelAnimationFrame(animationRef.current);
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
      setVolume(0);
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    console.log("Max volume during recording:", maxVolumeRef.current);
    
    if (maxVolumeRef.current < 3) { 
        setTranscript("No speech detected. Please speak closer to the microphone and try again.");
        return;
    }
    
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "clinical_audio.webm");

    try {
      console.log("Sending audio to backend...");
      const response = await fetch("http://127.0.0.1:5001/api/process-voice", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received response:", data);
      
      setTranscript(`TRANSCRIPT:\n${data.transcript}\n\nEXTRACTED DATA:\n${JSON.stringify(data.bill, null, 2)}`);
      setAiData(data.bill);
    } catch (error) {
      console.error("Backend error:", error);
      setTranscript(`Error: ${error.message}\n\nPlease ensure:\n1. Python server is running (python llmfile.py)\n2. All dependencies are installed\n3. Ollama is running with mistral model`);
    } finally {
      setIsProcessing(false);
    }
  };
  

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">VOICE CAPTURE</h1>
          <p className="text-gray-500 text-sm font-medium">Clinical AI Transcription Engine</p>
        </div>
        <div className="flex items-center gap-4">
          {aiData && ( 
            <button 
              onClick={() => navigate('/templates')}
              className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all animate-bounce shadow-lg"
            >
              NEXT: SELECT TEMPLATE <ArrowRightIcon className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => {setTranscript(""); setAiData(null);}} className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-400 shadow-sm">
            <TrashIcon className="w-5 h-5"/>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="w-full lg:w-80 flex flex-col items-center p-8 bg-white rounded-[2rem] shadow-sm border border-gray-200">
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-8 ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
            {isRecording ? "Recording Live" : "System Ready"}
          </span>

          <div className="relative flex items-center justify-center mb-8">
            <div 
              style={{ transform: `scale(${1 + volume / 50})`, opacity: isRecording ? 0.3 : 0 }} 
              className="absolute w-32 h-32 bg-teal-400 rounded-full transition-transform duration-75"
            />
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${
                isRecording ? "bg-red-500 hover:bg-red-600" : "bg-[#3f8b8c] hover:bg-[#327172]"
              }`}
            >
              {isRecording ? <StopIcon className="w-10 h-10 text-white fill-current" /> : <MicrophoneIcon className="w-10 h-10 text-white" />}
            </button>
          </div>

          <canvas ref={canvasRef} width="300" height="80" className="w-full h-16 rounded-lg bg-gray-50 mb-6" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
            {isProcessing ? "AI analyzing speech..." : isRecording ? "Recording..." : "Click to Start"}
          </p>
        </div>

        <div className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full" />
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest">Medical Documentation</h3>
            </div>
            {transcript && (
              <button onClick={() => { navigator.clipboard.writeText(transcript); alert("Copied to clipboard"); }} className="text-xs font-bold text-[#3f8b8c] hover:underline">
                COPY REPORT
              </button>
            )}
          </div>

          <div className="flex-1 p-8 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-800 font-bold">Generating Report...</p>
              </div>
            ) : transcript ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm font-mono text-sm text-gray-800 leading-relaxed whitespace-pre-wrap ring-8 ring-gray-50">
                  {transcript}
                </div>
                <div className="mt-4 flex items-center gap-2 text-teal-600 font-bold text-xs">
                  <CheckCircleIcon className="w-4 h-4" /> AI Analysis Complete
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-20">
                <MicrophoneIcon className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-500">Awaiting audio input...</p>
              </div>
            )}
          </div>

          <div className="px-6 py-3 bg-[#3f8b8c] text-white flex justify-between items-center">
            <span className="text-[9px] font-bold tracking-[0.3em] uppercase">Security: HIPAA Compliant Processing</span>
            <span className="text-[9px] font-bold">v1.0.5</span>
          </div>
        </div>
      </div>
    </div>
  );
}