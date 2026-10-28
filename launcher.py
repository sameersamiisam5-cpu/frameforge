"""
FrameForge — HD Video Frame Extractor
Desktop application launcher using pywebview.
"""

import webview
import os
import sys


def get_base_path():
    """Get the base path for resources, works both in dev and PyInstaller bundle."""
    if getattr(sys, '_MEIPASS', None):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))


def main():
    base = get_base_path()
    html_path = os.path.join(base, 'index.html')

    # Create the desktop window
    window = webview.create_window(
        title='FrameForge — HD Video Frame Extractor',
        url=html_path,
        width=1100,
        height=750,
        min_size=(800, 600),
        resizable=True,
        text_select=False,
        background_color='#0a0a0f',
    )

    # Start the webview (uses Edge WebView2 on Windows)
    webview.start(debug=False)


if __name__ == '__main__':
    main()
