# FrameForge 🎬⚡
### High-Performance In-Browser HD/4K Video Frame Extractor

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://sameersamiisam5-cpu.github.io/frameforge/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas%202D-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

> **Zero server uploads. 100% client-side privacy.** Extract pixel-perfect frames from any local video file directly within your web browser or as a native desktop application.

---

## 🌟 Overview

**FrameForge** solves a common bottleneck for visual engineers, 3D artists, machine learning researchers, and video editors: extracting crisp, uncompressed frame sequences from video footage without having to spin up heavy command-line tools like FFmpeg or uploading sensitive footage to cloud servers.

By utilizing native browser `HTMLMediaElement` seeking, hardware-accelerated `CanvasRenderingContext2D` buffers, and in-memory `JSZip` compression, FrameForge delivers blazing-fast frame extraction directly on the client machine.

---

## ✨ Features

- 🔒 **100% Private & Client-Side:** Your videos never leave your machine. Zero backend API calls or server processing.
- 🎯 **Full Native Resolution:** Retains original video resolution up to 4K / UHD.
- ⏱️ **Flexible FPS Control:** Extract at custom frame rates (1 to 60 FPS) with instant extraction estimates.
- 🖼️ **Format Options:** Export as lossless **PNG** or compressed **JPEG** with fine-grained quality adjustment.
- ⚡ **Live Extraction Preview:** Real-time visual progress monitoring with dynamic thumbnail generation.
- 📦 **Instant ZIP Packaging:** Multi-threaded client-side ZIP packaging with file size diagnostics via `JSZip` and `FileSaver.js`.
- 🖥️ **Dual Form Factor:** Run seamlessly in any modern web browser or run natively on Windows via the included PyWebView desktop launcher.
- 🎨 **Modern Cyber-Glass UI:** Sleek dark-mode aesthetic with ambient particle canvas animations, responsive layout, and intuitive drag-and-drop.

---

## 🚀 Live Demo

Experience FrameForge instantly in your browser:
**[https://sameersamiisam5-cpu.github.io/frameforge/](https://sameersamiisam5-cpu.github.io/frameforge/)**

---

## 🛠️ Architecture & Under the Hood

```
[ Local Video File (MP4/WebM/MOV) ]
                │
                ▼ (URL.createObjectURL)
      [ <video> Decoder Element ]
                │
                ▼ (Asynchronous Seek & 'seeked' Event Loop)
   [ Off-DOM HTML5 Canvas 2D Buffer ]
                │
                ▼ (canvas.toBlob at Native Dimensions)
       [ Image Blobs (PNG/JPG) ]
                │
                ▼
   [ JSZip In-Memory Stream ] ──► [ Browser FileSaver ZIP Download ]
```

1. **Deterministic Frame Seeking:** Uses an `async/await` loop listening to the browser's native `seeked` event to ensure the video rendering pipeline has updated the surface buffer before sampling.
2. **Memory Safety:** Automatically creates and revokes blob URLs (`URL.revokeObjectURL`) to maintain a lean memory footprint during long extractions.
3. **Decoupled UI Rendering:** Throttles visual thumbnail rendering to prevent DOM flooding during dense extractions (e.g. 60 FPS over several minutes).

---

## 💻 Desktop Launcher (Optional)

FrameForge includes an optional desktop wrapper powered by `pywebview` and Microsoft Edge WebView2:

### Prerequisites
- Python 3.9+
- `pip install pywebview`

### Launch
```bash
python launcher.py
```
Or double-click `FrameForge.bat` / `FrameForge.vbs` on Windows for a borderless desktop app experience.

---

## 📁 Project Structure

```
├── index.html         # Semantic structure & UI layout
├── styles.css         # Modern dark-mode styling, glassmorphism & responsive CSS
├── app.js             # Core extraction pipeline, canvas processing, state management
├── jszip.min.js       # Fast client-side ZIP archiving
├── FileSaver.min.js   # Browser blob download utility
├── launcher.py        # Optional native desktop application wrapper (PyWebView)
├── FrameForge.bat     # Windows batch launcher
├── FrameForge.vbs     # Silent background launcher
└── README.md          # Technical documentation
```

---

## 👤 Author

**Sameer Khan**
- Portfolio: [glass-archive.vercel.app](https://glass-archive.vercel.app)
- GitHub: [@sameersamiisam5-cpu](https://github.com/sameersamiisam5-cpu)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
