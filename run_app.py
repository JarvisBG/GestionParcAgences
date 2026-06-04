import sys
import os
import threading
import time
import uvicorn
import webview

if getattr(sys, 'frozen', False):
    BASE_DIR = sys._MEIPASS
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

sys.path.insert(0, BASE_DIR)

from backend.main import app

def start_server():
    # 1. On change le port à 8123 pour éviter tout conflit avec d'anciens tests
    # 2. On remet log_level="info" pour voir que tout va bien
    uvicorn.run(app, host="127.0.0.1", port=8123, log_level="info")

if __name__ == '__main__':
    server_thread = threading.Thread(target=start_server)
    server_thread.daemon = True
    server_thread.start()

    time.sleep(2)

    # On pointe bien la fenêtre vers le nouveau port 8123
    window = webview.create_window(
        'ParcManager - Gestion Multi-Agences', 
        url='http://127.0.0.1:8123', 
        width=1280, 
        height=800,
        min_size=(1024, 768)
    )
    
    webview.start()