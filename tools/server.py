# Server di prova che imita Vercel: cleanUrls, rewrites, redirects (vercel.json) e pagina 404.
# Uso: python3 -I tools/server.py .   (dalla cartella del sito)  ->  http://127.0.0.1:8765
import http.server, json, os, re, sys, urllib.parse
ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
CFG = json.load(open(os.path.join(ROOT, "vercel.json")))
pat = lambda src: re.compile("^" + re.sub(r":\w+\*?", r"([^/]+)", src) + "$")
REW = [(pat(r["source"]), r["destination"]) for r in CFG.get("rewrites", [])]
RED = [(pat(r["source"]), r["destination"]) for r in CFG.get("redirects", []) if "missing" not in r and "has" not in r]
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def log_message(self, *a): pass
    def find(self, path):
        f = os.path.join(ROOT, path.lstrip("/"))
        if os.path.isdir(f) and os.path.exists(os.path.join(f, "index.html")): return path.rstrip("/") + "/index.html"
        if os.path.isfile(f): return path
        if os.path.isfile(f + ".html"): return path + ".html"
        return None
    def resolve(self, path):
        # come Vercel: prima i file veri, poi le regole di riscrittura
        if path != "/" and path.endswith("/"): path = path[:-1]
        hit = self.find(path)
        if hit: return hit
        for rx, dest in REW:
            if rx.match(path): return self.find(dest)
        return None
    def do_GET(self):
        u = urllib.parse.urlsplit(self.path)
        for rx, dest in RED:
            if rx.match(u.path):
                self.send_response(308); self.send_header("Location", dest); self.end_headers(); return
        if u.path.endswith(".html") and u.path != "/index.html":
            self.send_response(308); self.send_header("Location", u.path[:-5] + (("?" + u.query) if u.query else "")); self.end_headers(); return
        r = self.resolve(u.path)
        if r is None:
            self.send_response(404); self.send_header("Content-Type", "text/html; charset=utf-8"); self.end_headers()
            self.wfile.write(open(os.path.join(ROOT, "404.html"), "rb").read()); return
        self.path = r + (("?" + u.query) if u.query else ""); return super().do_GET()
http.server.ThreadingHTTPServer(("127.0.0.1", 8765), H).serve_forever()
