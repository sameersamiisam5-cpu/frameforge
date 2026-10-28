# FrameForge
### High-Performance In-Browser HD/4K Video Frame Extractor

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-0f766e?style=for-the-badge&logo=github)](https://sameersamiisam5-cpu.github.io/frameforge/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gray.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas%202D-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

> **Zero server uploads. 100% client-side privacy.** Extract pixel-perfect frames from any local video file directly within your web browser or as a native desktop application.

---

## Overview

FrameForge provides an in-browser utility for visual engineers, 3D artists, machine learning researchers, and video editors to extract uncompressed frame sequences from video footage without relying on heavy command-line installations or uploading footage to remote cloud servers.

By utilizing native browser `HTMLMediaElement` seeking, hardware-accelerated `CanvasRenderingContext2D` buffers, and in-memory `JSZip` compression, FrameForge delivers high-throughput frame extraction directly on the client machine.

---

## Features

- **100% Client-Side Privacy:** Video files never leave your machine. Zero backend API calls or external network transport.
- **Full Native Resolution:** Retains original video resolution up to 4K / UHD.
- **Custom FPS Sampling:** Extract at arbitrary frame rates (1 to 60 FPS) with instantaneous frame count estimates.
- **Format Options:** Export as lossless PNG or compressed JPEG with fine-grained quality adjustment.
- **Real-Time Visual Pipeline:** Live extraction progress monitoring with throttled thumbnail generation to avoid DOM flooding.
- **Client-Side ZIP Packaging:** In-memory ZIP packaging and file streaming via JSZip and FileSaver.js.
- **Dual Runtime Support:** Operates in modern desktop/mobile web browsers or as a native Windows desktop app via PyWebView.
- **Modern Interface:** Minimalist dark-mode aesthetic with ambient background animation, responsive layout, and drag-and-drop ingestion.

---

## Live Demo

Experience FrameForge directly in your browser:  
[sameersamiisam5-cpu.github.io/frameforge](https://sameersamiisam5-cpu.github.io/frameforge/)

---

## Architecture & Pipeline

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

1. **Deterministic Frame Seeking:** Executes an `async/await` loop awaiting the browser's native `seeked` event to ensure the video rendering pipeline has updated the surface buffer before sampling.
2. **Memory Safety:** Automatically provisions and revokes blob URLs (`URL.revokeObjectURL`) to maintain a minimal memory footprint during dense extractions.
3. **Decoupled UI Rendering:** Throttles visual thumbnail insertion to keep the main thread responsive during 60 FPS runs over long videos.

---

## Desktop Launcher (Optional)

FrameForge includes an optional desktop wrapper powered by `pywebview` and Microsoft Edge WebView2:

### Prerequisites
- Python 3.9+
- `pip install pywebview`

### Launch
```bash
python launcher.py
```
Or run `FrameForge.bat` / `FrameForge.vbs` on Windows for a borderless desktop window.

---

## Project Structure

```
├── index.html         # Semantic structure & UI layout
├── styles.css         # Modern styling, glassmorphism & responsive CSS
├── app.js             # Core extraction pipeline, canvas processing, state management
├── jszip.min.js       # Fast client-side ZIP archiving
├── FileSaver.min.js   # Browser blob download utility
├── launcher.py        # Optional native desktop application wrapper (PyWebView)
├── FrameForge.bat     # Windows batch launcher
├── FrameForge.vbs     # Silent background launcher
└── README.md          # Technical documentation
```

---

## Author

**Sameer Khan**
- Portfolio: [sami-portfolio-sigma.vercel.app](https://sami-portfolio-sigma.vercel.app/)
- GitHub: [@sameersamiisam5-cpu](https://github.com/sameersamiisam5-cpu)

---

## License

This project is licensed under the [MIT License](LICENSE).
