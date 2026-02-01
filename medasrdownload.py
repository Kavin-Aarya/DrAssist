import os
from huggingface_hub import login
from transformers import AutoModelForCTC, AutoProcessor


login("")

model_id = "google/medasr"
save_path = "./medasr_local"

print("Starting MedASR Download...")

try:
    # Adding trust_remote_code=True is the key for unrecognized classes
    processor = AutoProcessor.from_pretrained(model_id, trust_remote_code=True)
    model = AutoModelForCTC.from_pretrained(model_id, trust_remote_code=True)

    # Save locally
    processor.save_pretrained(save_path)
    model.save_pretrained(save_path)
    
    print(f"✅ Success! MedASR saved to {save_path}")

except Exception as e:
    print(f"Error: {e}")