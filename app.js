/* =============================================
   FrameForge — HD Video Frame Extractor
   Core Application Logic
   ============================================= */

(function () {
    'use strict';

    // ─── State ───────────────────────────────
    const state = {
        videoFile: null,
        videoDuration: 0,
        videoWidth: 0,
        videoHeight: 0,
        fps: 5,
        format: 'png',       // 'png' or 'jpg'
        quality: 1.0,         // JPEG quality (0-1)
        frames: [],           // Array of { blob, url, name }
        isExtracting: false,
        cancelled: false,
    };

    // ─── DOM References ──────────────────────
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const dom = {
        // Sections
        uploadSection: $('#uploadSection'),
        settingsSection: $('#settingsSection'),
        progressSection: $('#progressSection'),
        resultsSection: $('#resultsSection'),

        // Upload
        dropzone: $('#dropzone'),
        fileInput: $('#fileInput'),
        videoPreview: $('#videoPreview'),
        videoPlayer: $('#videoPlayer'),
        videoInfo: $('#videoInfo'),
        removeVideoBtn: $('#removeVideoBtn'),

        // Settings
        btnPng: $('#btnPng'),
        btnJpg: $('#btnJpg'),
        fpsSlider: $('#fpsSlider'),
        fpsValue: $('#fpsValue'),
        frameEstimate: $('#frameEstimate'),
        qualityGroup: $('#qualityGroup'),
        qualitySlider: $('#qualitySlider'),
        qualityValue: $('#qualityValue'),
        convertBtn: $('#convertBtn'),

        // Progress
        progressBar: $('#progressBar'),
        progressPercent: $('#progressPercent'),
        progressCount: $('#progressCount'),
        progressStatus: $('#progressStatus'),
        framePreviewGrid: $('#framePreviewGrid'),
        cancelBtn: $('#cancelBtn'),

        // Results
        resultsStats: $('#resultsStats'),
        resultsPreview: $('#resultsPreview'),
        downloadBtn: $('#downloadBtn'),
        downloadSize: $('#downloadSize'),
        startOverBtn: $('#startOverBtn'),
    };

    // ─── Background Particles ────────────────
    function initParticles() {
        const container = $('#bgParticles');
        const colors = ['#a78bfa', '#06b6d4', '#f472b6', '#34d399'];

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const size = Math.random() * 4 + 2;
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.background = color;
            particle.style.boxShadow = `0 0 ${size * 3}px ${color}`;
            particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
            particle.style.animationDelay = (Math.random() * 10) + 's';
            container.appendChild(particle);
        }
    }

    // ─── Utilities ───────────────────────────
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
        return (bytes / 1073741824).toFixed(2) + ' GB';
    }

    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function showSection(section) {
        section.classList.remove('hidden');
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function hideSection(section) {
        section.classList.add('hidden');
    }

    // ─── File Upload Handling ────────────────
    function initUpload() {
        const dropzone = dom.dropzone;

        // Click to browse
        dropzone.addEventListener('click', () => dom.fileInput.click());

        // File selected
        dom.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });

        // Drag events
        ['dragenter', 'dragover'].forEach(evt => {
            dropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(evt => {
            dropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('dragover');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('video/')) {
                handleFile(files[0]);
            }
        });

        // Remove video
        dom.removeVideoBtn.addEventListener('click', () => {
            resetAll();
        });
    }

    function handleFile(file) {
        if (!file.type.startsWith('video/')) {
            alert('Please upload a valid video file.');
            return;
        }

        state.videoFile = file;

        // Create object URL and load video
        const url = URL.createObjectURL(file);
        dom.videoPlayer.src = url;

        dom.videoPlayer.addEventListener('loadedmetadata', function onMeta() {
            dom.videoPlayer.removeEventListener('loadedmetadata', onMeta);

            state.videoDuration = dom.videoPlayer.duration;
            state.videoWidth = dom.videoPlayer.videoWidth;
            state.videoHeight = dom.videoPlayer.videoHeight;

            // Build info chips
            dom.videoInfo.innerHTML = `
                <div class="info-chip">
                    <span class="chip-label">Name</span>
                    <span class="chip-value">${file.name}</span>
                </div>
                <div class="info-chip">
                    <span class="chip-label">Size</span>
                    <span class="chip-value">${formatFileSize(file.size)}</span>
                </div>
                <div class="info-chip">
                    <span class="chip-label">Duration</span>
                    <span class="chip-value">${formatDuration(state.videoDuration)}</span>
                </div>
                <div class="info-chip">
                    <span class="chip-label">Resolution</span>
                    <span class="chip-value">${state.videoWidth} × ${state.videoHeight}</span>
                </div>
            `;

            // Show preview, hide dropzone
            dom.dropzone.classList.add('hidden');
            dom.videoPreview.classList.remove('hidden');

            // Show settings
            updateFrameEstimate();
            showSection(dom.settingsSection);
        });
    }

    // ─── Settings ────────────────────────────
    function initSettings() {
        // Format toggle
        dom.btnPng.addEventListener('click', () => {
            state.format = 'png';
            dom.btnPng.classList.add('active');
            dom.btnJpg.classList.remove('active');
            dom.qualityGroup.classList.add('hidden');
        });

        dom.btnJpg.addEventListener('click', () => {
            state.format = 'jpg';
            dom.btnJpg.classList.add('active');
            dom.btnPng.classList.remove('active');
            dom.qualityGroup.classList.remove('hidden');
        });

        // FPS slider
        dom.fpsSlider.addEventListener('input', (e) => {
            state.fps = parseInt(e.target.value);
            dom.fpsValue.textContent = state.fps;
            updatePresetButtons();
            updateFrameEstimate();
        });

        // FPS presets
        $$('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const fps = parseInt(btn.dataset.fps);
                state.fps = fps;
                dom.fpsSlider.value = fps;
                dom.fpsValue.textContent = fps;
                updatePresetButtons();
                updateFrameEstimate();
            });
        });

        // Quality slider
        dom.qualitySlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            state.quality = val / 100;
            dom.qualityValue.textContent = val;
        });

        // Convert button
        dom.convertBtn.addEventListener('click', startExtraction);
    }

    function updatePresetButtons() {
        $$('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.fps) === state.fps);
        });
    }

    function updateFrameEstimate() {
        if (state.videoDuration > 0) {
            const totalFrames = Math.floor(state.videoDuration * state.fps);
            dom.frameEstimate.textContent = `Estimated frames: ~${totalFrames.toLocaleString()}`;
        }
    }

    // ─── Frame Extraction ────────────────────
    async function startExtraction() {
        if (state.isExtracting) return;
        state.isExtracting = true;
        state.cancelled = false;
        state.frames = [];

        // Show progress, hide settings
        hideSection(dom.settingsSection);
        showSection(dom.progressSection);

        dom.progressBar.style.width = '0%';
        dom.progressPercent.textContent = '0%';
        dom.framePreviewGrid.innerHTML = '';
        dom.progressStatus.textContent = 'Preparing video for extraction...';

        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.src = URL.createObjectURL(state.videoFile);

        await new Promise((resolve) => {
            video.addEventListener('loadeddata', resolve, { once: true });
        });

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const interval = 1 / state.fps;
        const totalFrames = Math.floor(state.videoDuration * state.fps);
        const mimeType = state.format === 'png' ? 'image/png' : 'image/jpeg';
        const ext = state.format === 'png' ? 'png' : 'jpg';
        const quality = state.format === 'jpg' ? state.quality : undefined;

        dom.progressCount.textContent = `0 / ${totalFrames} frames`;

        for (let i = 0; i < totalFrames; i++) {
            if (state.cancelled) {
                dom.progressStatus.textContent = 'Cancelled.';
                state.isExtracting = false;
                return;
            }

            const time = i * interval;

            // Seek to time
            video.currentTime = time;
            await new Promise((resolve) => {
                video.addEventListener('seeked', resolve, { once: true });
            });

            // Draw frame to canvas at full resolution
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to blob
            const blob = await new Promise((resolve) => {
                canvas.toBlob(resolve, mimeType, quality);
            });

            const frameNum = String(i + 1).padStart(String(totalFrames).length, '0');
            const name = `frame_${frameNum}.${ext}`;
            const url = URL.createObjectURL(blob);

            state.frames.push({ blob, url, name });

            // Update progress
            const percent = Math.round(((i + 1) / totalFrames) * 100);
            dom.progressBar.style.width = percent + '%';
            dom.progressPercent.textContent = percent + '%';
            dom.progressCount.textContent = `${i + 1} / ${totalFrames} frames`;
            dom.progressStatus.textContent = `Extracting frame ${i + 1} of ${totalFrames}...`;

            // Show thumbnail for every Nth frame (keep grid manageable)
            const thumbInterval = Math.max(1, Math.floor(totalFrames / 30));
            if (i % thumbInterval === 0) {
                const thumbDiv = document.createElement('div');
                thumbDiv.classList.add('frame-thumb');
                const img = document.createElement('img');
                img.src = url;
                img.alt = name;
                img.loading = 'lazy';
                thumbDiv.appendChild(img);
                dom.framePreviewGrid.appendChild(thumbDiv);
            }
        }

        // Cleanup
        URL.revokeObjectURL(video.src);
        state.isExtracting = false;

        showResults();
    }

    // ─── Results ─────────────────────────────
    function showResults() {
        hideSection(dom.progressSection);
        showSection(dom.resultsSection);

        const totalSize = state.frames.reduce((sum, f) => sum + f.blob.size, 0);
        const avgSize = state.frames.length > 0 ? totalSize / state.frames.length : 0;

        dom.resultsStats.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${state.frames.length.toLocaleString()}</div>
                <div class="stat-label">Total Frames</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${state.videoWidth}×${state.videoHeight}</div>
                <div class="stat-label">Resolution</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${state.format.toUpperCase()}</div>
                <div class="stat-label">Format</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatFileSize(totalSize)}</div>
                <div class="stat-label">Total Size</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatFileSize(avgSize)}</div>
                <div class="stat-label">Avg Frame Size</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${state.fps}</div>
                <div class="stat-label">FPS Extracted</div>
            </div>
        `;

        // Preview grid (show all frames)
        dom.resultsPreview.innerHTML = '';

        for (let i = 0; i < state.frames.length; i++) {
            const frame = state.frames[i];
            const div = document.createElement('div');
            div.classList.add('result-thumb');
            div.innerHTML = `
                <img src="${frame.url}" alt="${frame.name}" loading="lazy">
                <div class="thumb-label">${frame.name}</div>
            `;
            dom.resultsPreview.appendChild(div);
        }

        dom.downloadSize.textContent = `(~${formatFileSize(totalSize)})`;
    }

    // ─── Download ZIP ────────────────────────
    async function downloadZip() {
        dom.downloadBtn.disabled = true;
        dom.downloadBtn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" class="spin">
                <circle cx="11" cy="11" r="9" stroke="currentColor" stroke-width="2" stroke-dasharray="40 20" stroke-linecap="round"/>
            </svg>
            Creating ZIP...
        `;

        try {
            const zip = new JSZip();
            const folderName = (state.videoFile.name.replace(/\.[^.]+$/, '') || 'frames') + '_frames';
            const folder = zip.folder(folderName);

            for (const frame of state.frames) {
                folder.file(frame.name, frame.blob);
            }

            const content = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            }, (metadata) => {
                const pct = Math.round(metadata.percent);
                dom.downloadBtn.innerHTML = `
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" class="spin">
                        <circle cx="11" cy="11" r="9" stroke="currentColor" stroke-width="2" stroke-dasharray="40 20" stroke-linecap="round"/>
                    </svg>
                    Compressing... ${pct}%
                `;
            });

            saveAs(content, folderName + '.zip');
        } catch (err) {
            console.error('ZIP creation failed:', err);
            alert('Failed to create ZIP file. Please try again.');
        }

        dom.downloadBtn.disabled = false;
        dom.downloadBtn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 3V15M11 15L6 10M11 15L16 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 17V19H19V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Download ZIP
            <span class="download-size">${dom.downloadSize.textContent}</span>
        `;
    }

    // ─── Cancel & Reset ──────────────────────
    function cancelExtraction() {
        state.cancelled = true;
        state.isExtracting = false;
        hideSection(dom.progressSection);
        showSection(dom.settingsSection);
    }

    function resetAll() {
        // Revoke all frame URLs
        state.frames.forEach(f => URL.revokeObjectURL(f.url));

        // Reset state
        state.videoFile = null;
        state.videoDuration = 0;
        state.videoWidth = 0;
        state.videoHeight = 0;
        state.frames = [];
        state.isExtracting = false;
        state.cancelled = false;

        // Reset video
        dom.videoPlayer.src = '';
        dom.videoPreview.classList.add('hidden');
        dom.dropzone.classList.remove('hidden');
        dom.fileInput.value = '';

        // Hide sections
        hideSection(dom.settingsSection);
        hideSection(dom.progressSection);
        hideSection(dom.resultsSection);

        // Reset progress
        dom.progressBar.style.width = '0%';
        dom.framePreviewGrid.innerHTML = '';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ─── Init ────────────────────────────────
    function init() {
        initParticles();
        initUpload();
        initSettings();

        dom.cancelBtn.addEventListener('click', cancelExtraction);
        dom.downloadBtn.addEventListener('click', downloadZip);
        dom.startOverBtn.addEventListener('click', resetAll);
    }

    // Spin animation for loading state
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }
    `;
    document.head.appendChild(style);

    document.addEventListener('DOMContentLoaded', init);
})();
