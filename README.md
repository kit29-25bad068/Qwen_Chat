# Qwen Chat 🤖🎙️

A modern, responsive, ChatGPT-style web application connected directly to your locally running **Ollama** instance powering the **`qwen2.5:0.5b`** model. Runs 100% locally and privately on your machine with zero external paid AI APIs.

---

## ✨ Features

- **100% Local & Private**: Communicates exclusively with local Ollama (`http://localhost:11434`) using `qwen2.5:0.5b`. No data leaves your machine.
- **🎙️ Voice Input (Speech-to-Text)**: ChatGPT-style microphone button with real-time speech dictation and animated sound wave equalizer directly in the input bar.
- **🔊 Read Aloud (Text-to-Speech)**: One-click voice playback for AI responses using browser Speech Synthesis.
- **⚡ Token-by-Token Streaming**: Smooth, real-time token rendering with a blinking cursor indicator.
- **⏹️ Stop Generation**: Instantly cancel response generation using `AbortController`.
- **💬 Conversation Memory**: Full context across multi-turn chats preserved and sent to Ollama with each turn.
- **📝 Markdown & Code Highlighting**: Rich Markdown rendering with Prism syntax highlighting and a 1-click **Copy Code** button.
- **🗂️ Chat Management**: Create new chats, rename threads, delete conversations, and clear all history. Stored locally via browser `localStorage`.
- **🎨 Modern ChatGPT-Inspired UI**: Clean neutral palette, responsive collapsible sidebar, auto-expanding textarea, and dark/light mode toggle.
- **🚀 Flexible Server Options**: Run via Vite Dev Server or the standalone Node.js production server on port 3000 (or any custom port).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons
- **Markdown & Code**: `react-markdown`, `remark-gfm`, `prismjs`
- **Voice APIs**: Native Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **Backend / Proxy**: Native Node.js HTTP streaming proxy / Vite dev proxy
- **LLM Engine**: [Ollama](https://ollama.com/) running `qwen2.5:0.5b`

---

## 📋 Prerequisites

1. **Ollama** installed on your system.
2. The `qwen2.5:0.5b` model pulled locally:
   ```bash
   ollama run qwen2.5:0.5b
   ```
3. **Node.js** (v18+) and **npm**.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/kit29-25bad068/Qwen_Chat.git
cd Qwen_Chat
```

### 2. Install dependencies
```bash
npm install
```

### 3. Make sure Ollama is running
```bash
ollama list
```
Ensure `qwen2.5:0.5b` appears in the list.

### 4. Start the Application

#### Option A: Production Server (Port 3000)
```bash
npm run build
npm start
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

#### Option B: Development Server (Vite)
```bash
npm run dev
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

#### Option C: Custom Port
```bash
node server.js 8080
```
Then open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 📁 Project Structure

```
qwen-chat/
├── index.html              # HTML root template with fonts
├── package.json            # Project dependencies & scripts
├── vite.config.js          # Vite config & Ollama proxy
├── tailwind.config.js      # Styling & theme configuration
├── postcss.config.js       # PostCSS config
├── server.js               # Standalone production HTTP streaming server
└── src/
    ├── main.jsx            # React root entry
    ├── App.jsx             # Main state orchestrator
    ├── index.css           # Global Tailwind & syntax highlighting styles
    ├── services/
    │   ├── ollama.js       # Ollama chat streaming & connection health checks
    │   └── storage.js      # localStorage CRUD for conversations
    ├── hooks/
    │   └── useSpeechRecognition.js # Speech-to-text hook
    └── components/
        ├── Sidebar.jsx     # Chat history, management & theme toggle
        ├── ChatArea.jsx    # Message stream view & scroll logic
        ├── ChatMessage.jsx # Message bubbles, markdown, copy & read aloud
        ├── WelcomeScreen.jsx # Welcome prompt suggestions
        ├── MessageInput.jsx # Dictation mic, input box, send/stop controls
        └── CodeBlock.jsx   # Prism syntax highlighting & copy code button
```

---

## 📄 License

MIT License. Free to use and modify!
