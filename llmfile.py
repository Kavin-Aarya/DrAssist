import os
import torch
import librosa
import soundfile as sf
import ollama
import json
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

app = Flask(__name__)

# FIX 1: explicitly allow the Vite dev server origin and all methods
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=False)

# Load MedASR model
print("Loading Google MedASR model...")
stt_pipe = pipeline(
    "automatic-speech-recognition",
    model="google/MedASR",
    device=0 if torch.cuda.is_available() else -1
)
print("MedASR loaded successfully!")

@app.route('/api/process-voice', methods=['POST', 'OPTIONS'])
def process_voice():
    # FIX 2: handle preflight OPTIONS request explicitly
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response, 200

    if 'audio' not in request.files:
        return jsonify({"error": "No audio file received"}), 400

    audio_file = request.files['audio']
    temp_webm = "temp_audio.webm"
    temp_wav = "clinical_audio.wav"
    
    audio_file.save(temp_webm)

    try:
        print("Loading audio with librosa...")
        audio_input, sr = librosa.load(temp_webm, sr=None)
        
        if sr != 16000:
            print(f"Resampling from {sr}Hz to 16000Hz...")
            audio_input = librosa.resample(audio_input, orig_sr=sr, target_sr=16000)
        
        sf.write(temp_wav, audio_input, 16000)
        print(f"Audio converted. Shape: {audio_input.shape}, SR: 16000Hz")

        print("Transcribing with MedASR...")
        stt_result = stt_pipe(audio_input, chunk_length_s=30, stride_length_s=5)
        transcript = stt_result["text"]
        print(f"Transcript: {transcript}")

        print("Extracting JSON with Mistral...")
        sys_prompt = (
            "You are a clinical scribe. Extract medical data into a JSON object. "
            "Required Keys: 'patient_name', 'diagnosis', 'medications', 'advice'. "
            "For medications array, each item must have: 'medication', 'dosage', 'timing', 'duration'. "
            "Strictly follow the exact template which is given to you. "
            "If any detail is missing, set value as '- ( )'. Return ONLY raw JSON, no markdown."
        )

        llm_response = ollama.chat(
            model='mistral:7b-instruct-v0.3-q8_0',
            format='json',
            messages=[
                {'role': 'system', 'content': sys_prompt},
                {'role': 'user', 'content': f"Extract from this: {transcript}"}
            ]
        )

        raw_content = llm_response['message']['content']
        try:
            bill_data = json.loads(raw_content)
        except Exception as e:
            print(f"JSON parse error: {e}")
            bill_data = {"error": "Failed to parse JSON", "raw": raw_content}

        if os.path.exists(temp_webm): os.remove(temp_webm)
        if os.path.exists(temp_wav):  os.remove(temp_wav)

        return jsonify({"transcript": transcript, "bill": bill_data})

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        if os.path.exists(temp_webm): os.remove(temp_webm)
        if os.path.exists(temp_wav):  os.remove(temp_wav)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # FIX 3: use_reloader=False prevents double-loading the model and port conflicts
    app.run(host='0.0.0.0', port=3001, debug=True, use_reloader=False)