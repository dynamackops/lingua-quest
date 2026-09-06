"""Start the local game, then open a browser only after the server binds."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import webbrowser

if __name__ == '__main__':
    root = Path(__file__).resolve().parent
    try:
        server = ThreadingHTTPServer(('127.0.0.1', 8766), partial(SimpleHTTPRequestHandler, directory=str(root)))
    except OSError as exc:
        raise SystemExit(f'Could not start Lingua Quest: {exc}. If it is already running, open http://127.0.0.1:8766')
    print('Lingua Quest: http://127.0.0.1:8766\nKeep this window open. Press Control+C to stop.', flush=True)
    threading.Timer(0.4, lambda: webbrowser.open('http://127.0.0.1:8766')).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
