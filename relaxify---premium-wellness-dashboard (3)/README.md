
# 🌿 Relaxify: Your AI Wellness Companion

Welcome to **Relaxify**! This is a smart health application that uses your computer's camera to track your movements and help you do exercises that fix neck and shoulder pain. Think of it as having a digital yoga instructor right on your screen.

---

## 🛠️ Step 0: What You Need (Requirements)

Before we start, make sure you have these two things on your computer:
1. **Node.js**: This is the engine that runs the code. 
   - Go to [nodejs.org](https://nodejs.org/).
   - Download the version that says **"LTS"** (it stands for Long Term Support, which means it's the most stable).
   - Install it just like a normal game or app.
2. **A Web Browser**: Google Chrome or Microsoft Edge works best for the camera tracking.

---

## 🚀 Step-by-Step Guide to Run the App

Follow these steps exactly, and you'll have the app running in less than 2 minutes!

### Step 1: Unzip the Project
- Find the `.zip` file you received.
- Right-click it and choose **"Extract All"** (Windows) or double-click it (Mac).
- Remember where you saved this folder (for example, on your Desktop).

### Step 2: Open the "Command Center" (Terminal)
Computers have a secret way to talk to them using text commands.
- **On Windows**: Press the `Start` button, type **"cmd"**, and press Enter.
- **On Mac**: Press `Command + Space`, type **"Terminal"**, and press Enter.

### Step 3: Navigate to the Folder
You need to tell the terminal which folder to look at. Type `cd` (which means "change directory"), press space, and then drag the project folder from your desktop directly into the terminal window. It will look something like this:
```bash
cd C:\Users\YourName\Desktop\relaxify-project
```
Press **Enter**.

### Step 4: Turn on the App
Now, we tell the computer to start the "Vite" server (the thing that hosts the app). Type this command exactly and press **Enter**:
```bash
npx vite
```
*Note: If it asks you "Need to install the following packages: vite?", type `y` and press Enter.*

### Step 5: Open the Link
After a few seconds, you will see some text in the terminal that says:
`➜  Local:   http://localhost:5173/`
- Hold `Ctrl` (Windows) or `Command` (Mac) and click that link.
- Or, just open Chrome and type `localhost:5173` in the address bar.

---

## 🧘 How to Use the App
1. When the dashboard opens, click **"Start Training"** on any exercise.
2. **Camera Permission**: A pop-up will appear in the top-left corner of your browser asking to use your camera. Click **"Allow"**.
3. **Positioning**: Make sure you are sitting in a well-lit room. Step back so the camera can see your head and shoulders clearly.
4. **Follow the Feedback**: The app will tell you "Calibrating." Stay still for a second, then follow the instructions on the screen!

---

## ❓ Troubleshooting (If things go wrong)
- **"Camera not found"**: Make sure no other apps (like Zoom or Teams) are using your camera at the same time.
- **"Command not found"**: This means Node.js wasn't installed correctly. Try restarting your computer after installing Node.js.
- **"Port 5173 in use"**: This just means you have the app running twice. You can ignore it or close the other terminal window.

---
*Created with ❤️ to help you stay healthy while studying!*
