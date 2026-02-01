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
CORS(app)

# Load MedASR model
print("Loading Google MedASR model...")
stt_pipe = pipeline(
    "automatic-speech-recognition",
    model="google/MedASR",
    device=0 if torch.cuda.is_available() else -1
)
print("MedASR loaded successfully!")

@app.route('/api/process-voice', methods=['POST'])
def process_voice():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file received"}), 400

    audio_file = request.files['audio']
    temp_webm = "temp_audio.webm"
    temp_wav = "clinical_audio.wav"
    
    # Save the uploaded file
    audio_file.save(temp_webm)

    try:
        # A. LOAD & CONVERT AUDIO
        print("Loading audio with librosa...")
        # Load audio (librosa handles various formats)
        audio_input, sr = librosa.load(temp_webm, sr=None)
        
        # Resample to 16kHz (required for MedASR)
        if sr != 16000:
            print(f"Resampling from {sr}Hz to 16000Hz...")
            audio_input = librosa.resample(audio_input, orig_sr=sr, target_sr=16000)
        
        # Save as proper WAV file
        sf.write(temp_wav, audio_input, 16000)
        print(f"Audio converted successfully. Shape: {audio_input.shape}, Sample rate: 16000Hz")

        # B. TRANSCRIBE
        print("Transcribing with MedASR...")
        stt_result = stt_pipe(audio_input, chunk_length_s=30, stride_length_s=5)
        transcript = stt_result["text"]
        print(f"Transcript: {transcript}")

        # C. EXTRACT DATA
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

        # D. PARSE JSON STRING TO OBJECT
        raw_content = llm_response['message']['content']
        try:
            bill_data = json.loads(raw_content)
        except Exception as e:
            print(f"JSON parse error: {e}")
            bill_data = {"error": "Failed to parse JSON", "raw": raw_content}

        # Cleanup temp files
        if os.path.exists(temp_webm):
            os.remove(temp_webm)
        if os.path.exists(temp_wav):
            os.remove(temp_wav)

        return jsonify({
            "transcript": transcript,
            "bill": bill_data
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Cleanup on error
        if os.path.exists(temp_webm):
            os.remove(temp_webm)
        if os.path.exists(temp_wav):
            os.remove(temp_wav)
            
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)