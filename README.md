# DrAssist | AI-Powered Clinical Documentation System

## Project Overview

### What the Project Aims to Achieve
Doctors spend too much time typing on computers instead of talking to patients. DrAssist fixes this problem. It connects modern AI (Artificial Intelligence) tools with the paper forms doctors use every day. It helps doctors create prescriptions and medical letters automatically, so they can focus on caring for people.

### Project Goals

- **Accuracy:** Put text in the exact right spot on the paper (down to the millimeter) so it prints perfectly.
- **Privacy:** Keep all patient information safe on the doctor's own computer. Nothing is sent to the internet.
- **Ease of Use:** Make a system where doctors can drag and drop boxes on the screen to design their own forms without needing a programmer.

### Key Features
- **Instant Voice-to-Document Conversion:** Transform spoken input into polished, professional medical prescriptions through a seamless end-to-end workflow.
- **Precision Voice Capture:** Advanced audio intake technology ensures every word is recorded clearly and accurately — reducing errors and rework.
- **Drag-and-Drop Editor:** A simple tool to move text boxes around on a digital version of the doctor's letterhead.
- **AI - powered solution:** A smart AI tool that helps doctors automate medical paperwork and focus more on patients.
- **Instant PDF:** Creates a printable PDF file immediately in the browser.

---

## Getting Started

### 1. Prerequisites
Before you start, make sure you have these free tools installed on your computer:
- **Node.js:** (Version 18 or newer) - This runs the website code.
- **npm:** (Version 9 or newer) - This installs the helper tools.
- **Python:** (Version 3.10 or newer) - This is only needed if you want to download the AI models to your computer.
- **Ollama** - Download and install Ollama to run the medical AI models locally on your computer.

### 2. Setup Instructions
To get the project files onto your computer, follow these steps:

1.  **Download the Code:**
    Open your terminal (command line) and type the following command to download the repository:
    ```bash
    git clone [https://github.com/Kavin-Aarya/DrAssist.git](https://github.com/Kavin-Aarya/DrAssist.git)
    ```

2.  **Go into the Folder:**
    Move into the project directory so you can start working:
    ```bash
    cd DrAssist
    ```

### 3. Installation
Now that you have the files, install the necessary software and start the app:

1. **Install packages:**
   Install the packages needed for this software by typing this:
   ```bash
   npm install react react-dom react-router-dom fabric jspdf html2canvas react-to-print @headlessui/react @heroicons/react vite tailwindcss @tailwindcss/vite eslint @eslint/js @vitejs/plugin-react globals @types/react @types/react-dom eslint-plugin-react-hooks eslint-plugin-react-refresh
   ```
   ```bash
   pip install torch transformers huggingface_hub flask flask-cors python-dotenv librosa soundfile ollama
   ```

2.  **Download Mistral 7B model:**
     First, you must ensure the model is downloaded on your machine. Open your terminal and run:
    ```bash
    ollama pull mistral:7b-instruct-v0.3-q8_0
    ```

3.  **Set up the Keys:**
    Create a .env file with this line:
    ```
    HF_TOKEN="Your_hugging_face_access_token"
    ```
       
4.  **Download medASR:**
    Run the File by typing:
    ```bash
    python3 medasrdownload.py
    ```
    Now, Google medASR model will be downloaded.


5. **Run the python server**
   Start the python server using this command:
   ```bash
   python3 llmfile.py
   ```
   
6. **Start the Frontend Website**
   Run the software using this command:
   ```bash
   npm run dev
   ``` 

## Demo video
[Watch the video by clicking this Link](https://youtu.be/WYXLv61rIO0)
