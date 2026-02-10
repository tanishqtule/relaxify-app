# 🌿 Relaxify: Enterprise-Grade Wellness SaaS

Relaxify is a high-performance wellness companion that uses computer vision and Google Gemini AI to transform your workspace into a health-conscious sanctuary.

---

## 🚀 Seamless Setup Instructions (For Friends & Collaborators)

If you have received this project as a ZIP file, follow these steps to get it running perfectly on your machine.

### 1. Prerequisites
Before starting, ensure you have the following installed:
*   **Node.js (LTS Version):** [Download here](https://nodejs.org/). This provides the `npm` command needed to run the app.
*   **Modern Web Browser:** Google Chrome or Microsoft Edge are recommended for optimal MediaPipe (Computer Vision) performance.

### 2. Preparation
1.  **Unzip the file:** Extract the `relaxify-wellness.zip` content into a dedicated folder on your desktop.
2.  **Open Terminal:** Open your terminal or command prompt (CMD) and navigate to that folder:
    ```bash
    cd path/to/extracted/folder
    ```

### 3. Environment Configuration (Crucial)
The app uses Google's **Gemini 2.5/3.0** models for the AI Voice Coach, Ergo Scan, and Zen Art generation. 
1.  Create a file named `.env` in the root directory.
2.  Add your Google AI API Key:
    ```env
    VITE_API_KEY=your_api_key_here
    ```
    *(Note: If the execution environment handles keys automatically, skip this. If running locally via Vite, the key is usually passed via process environment).*

### 4. Installation & Launch
Run the following commands in order:
```bash
# Install all required libraries
npm install

# Start the development server
npm run dev
```
Once it says `Local: http://localhost:5173`, hold **Ctrl** and click the link to open Relaxify in your browser.

---

## 💎 Key Features to Try

### 🦒 AI-Powered Movement Flows
*   **Neck Tilt & Head Rotation:** Uses your camera to track your range of motion.
*   **Seamless Voice Coach:** The AI will literally talk to you, giving real-time feedback like "Tilted left. Great stretch!" 
*   **Detection Logic:** Optimized to avoid overlapping speech and accurately count reps only when form is correct.

### 🧘 Zen Mode & Art Generation
*   Complete an exercise to unlock **Zen Art**. Relaxify uses Gemini to generate a unique, high-resolution minimalist wallpaper as a reward for your session.

### 🖥️ AI Ergo Auditor
*   Navigate to **AI Ergo Scan**. 
*   Show Gemini your workspace (monitor, chair, desk). It will analyze your posture and environment to give you professional ergonomic tips.

### 💬 Proactive Wellness Guide
*   The AI Chatbot isn't just a window—it watches your "Idle" time. If you sit still for too long, it will pop up and suggest a stretch.

---

## 🛠 Troubleshooting
*   **Camera Not Working:** Ensure you "Allow" camera permissions in the browser pop-up.
*   **AI Not Responding:** Double-check that your API Key is valid and that you have an active internet connection.
*   **Speech Overlap:** We have implemented an **Audio Queue System** in `VoiceCoach.ts`. If speech stalls, simply refresh the page to reset the browser's `AudioContext`.

---

## 🔒 Privacy Note
All biometric tracking (MediaPipe Pose and FaceMesh) is processed **locally on your device**. No video or skeletal data is ever sent to a server. Only still frames of your workspace are sent to Gemini for the Ergo Scan when you explicitly click "Scan."