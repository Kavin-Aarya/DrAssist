import React, { useState, useRef, useEffect } from "react";
import { 
  ClipboardDocumentIcon, TrashIcon, MicrophoneIcon, 
  StopIcon, CheckCircleIcon, ArrowRightIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function VoiceCapture({ setAiData, aiData, setSelectedPatientGlobal }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [volume, setVolume] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const maxVolumeRef = useRef(0);

  // Patient search with debounce
  // Patient search with debounce
  useEffect(() => {
    const fetchPatients = async () => {
      if (searchQuery.length < 2) { 
        setSearchResults([]); 
        setShowDropdown(false); 
        return; 
      }
      try {
        const res = await fetch(`http://localhost:5001/user/search-patients?q=${encodeURIComponent(searchQuery)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add the Authorization header to pass the JWT check
            "Authorization": `Bearer ${localStorage.getItem("token")}` 
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setShowDropdown(true);
        } else {
          console.error("Failed to fetch patients, Status:", res.status);
        }
      } catch (err) { 
        console.error("Search error", err); 
      }
    };
    
    const timer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest("#patient-search-wrap")) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Sync selected patient up to App so Templates can access it
  useEffect(() => {
    if (setSelectedPatientGlobal) setSelectedPatientGlobal(selectedPatient);
  }, [selectedPatient]);

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
      ctx.strokeStyle = "#3f8b8c";
      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      const average = dataArray.reduce((a, b) => a + Math.abs(b - 128), 0) / bufferLength;
      const currentVol = average * 2;
      setVolume(currentVol);
      if (currentVol > maxVolumeRef.current) maxVolumeRef.current = currentVol;
    };
    draw();
  };

  const startRecording = async () => {
    setTranscript(""); setAiData(null);
    audioChunksRef.current = []; maxVolumeRef.current = 0;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 48000 } });
      streamRef.current = stream;
      setupVisualizer(stream);
      const options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) options.mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(options.mimeType)) options.mimeType = 'audio/ogg;codecs=opus';
      if (!MediaRecorder.isTypeSupported(options.mimeType)) options.mimeType = '';
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorderRef.current.onstop = async () => {
        const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await sendAudioToBackend(audioBlob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
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
    if (maxVolumeRef.current < 3) {
      setTranscript("No speech detected. Please speak closer to the microphone and try again.");
      return;
    }
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "clinical_audio.webm");
    try {
      const response = await fetch("http://127.0.0.1:3001/api/process-voice", { method: "POST", body: formData });
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || `Server error: ${response.status}`); }
      const data = await response.json();
      setTranscript(`TRANSCRIPT:\n${data.transcript}\n\nEXTRACTED DATA:\n${JSON.stringify(data.bill, null, 2)}`);
      setAiData(data.bill);
    } catch (error) {
      console.error("Backend error:", error);
      setTranscript(`Error: ${error.message}\n\nPlease ensure:\n1. Python server is running (python llmfile.py)\n2. All dependencies are installed\n3. Ollama is running with mistral model`);
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="flex flex-col h-full p-7 gap-5 font-[Outfit,sans-serif] box-border">

      {/* Header */}
      <div className="flex justify-between items-end flex-shrink-0">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1e1a14] leading-tight m-0 tracking-[-0.02em]">Voice Capture</h1>
          <p className="text-[13px] text-[#9a8a78] mt-1 font-medium tracking-[0.02em]">Clinical AI Transcription Engine</p>
        </div>
        <div className="flex items-center gap-2.5">
          {aiData && (
            <button onClick={() => navigate("/templates")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#3f8b8c] to-[#2d6667] text-white border-none rounded-xl text-[13px] font-semibold cursor-pointer shadow-[0_3px_14px_rgba(63,139,140,0.28)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(63,139,140,0.36)]">
              Next: Select Template <ArrowRightIcon className="w-[15px] h-[15px] animate-bounce" />
            </button>
          )}
          <button onClick={() => { setTranscript(""); setAiData(null); setSelectedPatient(null); setSearchQuery(""); }}
            className="p-2.5 bg-white/62 border border-[rgba(200,185,165,0.5)] rounded-xl cursor-pointer text-[#a09080] flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:border-[rgba(226,75,74,0.35)] hover:text-[#a32d2d] hover:bg-[rgba(252,235,235,0.7)]">
            <TrashIcon className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-5 flex-1 min-h-0">

        {/* Left panel */}
        <div className="w-[300px] flex-shrink-0 flex flex-col items-center p-8 rounded-3xl bg-white/58 border border-white/88 backdrop-blur-[28px] shadow-[0_6px_36px_rgba(80,60,30,0.07),0_0_0_0.5px_rgba(200,185,165,0.25),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className={`text-[10px] font-bold tracking-[0.14em] uppercase px-3.5 py-1.5 rounded-full mb-8 border transition-all duration-300 ${isRecording ? 'bg-red-500/10 border-red-500/25 text-red-700' : 'bg-[rgba(200,185,165,0.2)] border-[rgba(200,185,165,0.4)] text-[#9a8a78]'}`}>
            {isRecording ? "● Recording Live" : "System Ready"}
          </div>

          <div className="relative flex items-center justify-center mb-7">
            {isRecording && <div className="absolute w-[120px] h-[120px] rounded-full bg-red-500/18 animate-pulse" style={{ transform: `scale(${1 + volume / 45})`, transition: "transform 80ms" }} />}
            {!isRecording && <div className="absolute w-[110px] h-[110px] rounded-full bg-[#3f8b8c]/8 border border-[#3f8b8c]/15" />}
            <button onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-[84px] h-[84px] rounded-full border-none flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-[1.06] active:scale-95 ${isRecording ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-[0_6px_24px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]' : 'bg-gradient-to-br from-[#3f8b8c] to-[#2d6667] shadow-[0_6px_24px_rgba(63,139,140,0.32),inset_0_1px_0_rgba(255,255,255,0.2)]'}`}>
              {isRecording ? <StopIcon className="w-[34px] h-[34px] text-white" /> : <MicrophoneIcon className="w-[34px] h-[34px] text-white" />}
            </button>
          </div>

          <div className={`w-full rounded-[14px] overflow-hidden mb-4 border transition-all duration-300 py-0.5 ${isRecording ? 'bg-gradient-to-br from-[#3a8485] to-[#2d6667] border-white/15' : 'bg-[rgba(240,235,228,0.6)] border-[rgba(200,185,165,0.4)]'}`}>
            <canvas ref={canvasRef} width={300} height={64} className="w-full h-16 block" />
          </div>

          <p className={`text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors duration-200 ${isProcessing ? 'text-[#3f8b8c]' : isRecording ? 'text-red-600' : 'text-[#b0a090]'}`}>
            {isProcessing ? "AI Analyzing Speech…" : isRecording ? "Recording…" : "Click to Start"}
          </p>

          {/* Selected patient badge */}
          {selectedPatient && (
            <div className="mt-4 w-full px-3 py-2.5 bg-[rgba(63,139,140,0.08)] border border-[rgba(63,139,140,0.22)] rounded-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#3f8b8c] mb-0.5">Patient Selected</p>
              <p className="text-[13px] font-semibold text-[#1e1a14] truncate">{selectedPatient.name}</p>
              <p className="text-[11px] text-[#9a8a78] font-mono">{selectedPatient.phone}</p>
            </div>
          )}

          <div className="mt-auto pt-6 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase text-[#b0a090]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            HIPAA Compliant
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col rounded-3xl bg-white/58 border border-white/88 backdrop-blur-[28px] shadow-[0_6px_36px_rgba(80,60,30,0.07),0_0_0_0.5px_rgba(200,185,165,0.25),inset_0_1px_0_rgba(255,255,255,0.9)] min-h-0">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(200,185,165,0.25)] bg-[rgba(248,244,238,0.45)] flex-shrink-0 rounded-t-3xl">
            <div className="flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]' : isProcessing ? 'bg-[#3f8b8c] shadow-[0_0_6px_rgba(63,139,140,0.5)]' : transcript ? 'bg-green-500' : 'bg-[rgba(160,144,128,0.4)]'}`} />
              <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#9a8a78]">Medical Documentation</span>
            </div>
            {transcript && (
              <button onClick={() => { navigator.clipboard.writeText(transcript); alert("Copied to clipboard"); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#3f8b8c] bg-none border-none cursor-pointer transition-colors duration-200 hover:text-[#2d6667]">
                <ClipboardDocumentIcon className="w-3.5 h-3.5" /> Copy Report
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-7 flex flex-col">
            {isProcessing ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 rounded-full border-[3px] border-[#3f8b8c]/20 border-t-[#3f8b8c] animate-spin" />
                <p className="text-sm font-semibold text-[#3f8b8c]">Generating Report…</p>
                <p className="text-xs text-[#b0a090]">AI is analyzing your speech</p>
              </div>
            ) : transcript ? (
              <div className="animate-[fadeUp_0.4s_ease_both]">
                <div className="bg-[rgba(248,244,238,0.6)] border border-[rgba(200,185,165,0.4)] rounded-2xl px-7 py-6 font-mono text-[13px] text-[#2c2416] leading-[1.8] whitespace-pre-wrap backdrop-blur-sm">{transcript}</div>
                <div className="flex items-center gap-1.5 mt-3.5 text-xs font-semibold text-[#2d7071]">
                  <CheckCircleIcon className="w-[15px] h-[15px]" /> AI Analysis Complete
                </div>
              </div>
            ) : (
              /* Patient search */
              <div className="flex-1 flex flex-col items-center justify-start pt-12 gap-6 w-full max-w-md mx-auto">
                <div className="text-center">
                  <p className="text-[15px] font-semibold text-[#7a6e5e]">Select Patient</p>
                  <p className="text-xs text-[#b0a090] mt-1">Search by name or phone number</p>
                </div>
                <div id="patient-search-wrap" className="relative w-full">
                  <div className="relative">
                    <input type="text"
                      className="w-full bg-white/68 border border-[rgba(200,185,165,0.5)] rounded-xl py-3 pl-11 pr-4 text-[13.5px] font-[Outfit,sans-serif] text-[#1e1a14] outline-none transition-all duration-200 placeholder-[#c0b0a0] focus:border-[#3f8b8c] focus:shadow-[0_0_0_3px_rgba(63,139,140,0.11)] focus:bg-white/88"
                      placeholder={selectedPatient ? `${selectedPatient.name} (${selectedPatient.phone})` : "Search patient by name or phone…"}
                      value={selectedPatient ? "" : searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); if (selectedPatient) setSelectedPatient(null); }}
                      onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#b0a090]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                    {selectedPatient && (
                      <button onClick={() => { setSelectedPatient(null); setSearchQuery(""); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#3f8b8c] hover:text-[#2d6667] transition-colors">Clear</button>
                    )}
                  </div>
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 border border-[rgba(200,185,165,0.5)] rounded-xl shadow-[0_8px_32px_rgba(80,60,30,0.12)] overflow-hidden backdrop-blur-xl">
                      {searchResults.map((p) => (
                        <div key={p.phone}
                          onMouseDown={(e) => { e.preventDefault(); setSelectedPatient(p); setShowDropdown(false); setSearchQuery(""); }}
                          className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(200,185,165,0.2)] last:border-none cursor-pointer transition-colors duration-150 hover:bg-[rgba(63,139,140,0.06)]">
                          <div className="w-8 h-8 rounded-[8px] bg-[rgba(63,139,140,0.1)] flex items-center justify-center text-[12px] font-bold text-[#2d7071] flex-shrink-0">
                            {p.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-[#1e1a14]">{p.name}</p>
                            <p className="text-[11px] text-[#a09080] font-mono">{p.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {showDropdown && searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 border border-[rgba(200,185,165,0.4)] rounded-xl px-4 py-3 text-[13px] text-[#b0a090] backdrop-blur-xl shadow-[0_8px_32px_rgba(80,60,30,0.08)]">
                      No patients found for "{searchQuery}"
                    </div>
                  )}
                </div>
                {selectedPatient && (
                  <div className="w-full flex items-center gap-3 px-4 py-3 bg-[rgba(63,139,140,0.07)] border border-[rgba(63,139,140,0.22)] rounded-xl">
                    <div className="w-9 h-9 rounded-[10px] bg-[rgba(63,139,140,0.12)] flex items-center justify-center text-[14px] font-bold text-[#2d7071] flex-shrink-0">
                      {selectedPatient.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1e1a14] truncate">{selectedPatient.name}</p>
                      <p className="text-[11px] text-[#9a8a78] font-mono">{selectedPatient.phone}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#2d7071]">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                      Ready to record
                    </div>
                  </div>
                )}
                {!selectedPatient && (
                  <p className="text-xs text-[#c0b0a0] text-center">Select a patient to link the recording, then press the microphone</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-6 py-3 flex-shrink-0 bg-gradient-to-r from-[#3a8485] to-[#2d6667] rounded-b-3xl">
            <span className="text-[9.5px] font-bold tracking-[0.25em] uppercase text-white/75">Security: HIPAA Compliant Processing</span>
            <span className="text-[9.5px] font-semibold text-white/50">v1.0.5</span>
          </div>
        </div>
      </div>
    </div>
  );
}