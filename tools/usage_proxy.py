"""
The Golden Hoard — Cloudinary usage proxy (รันในเครื่อง)
========================================================
อ่านยอดใช้จริงจาก Cloudinary Admin API ให้หน้า admin.html
ใช้เมื่อยังไม่ deploy Cloudflare Worker (หรือใช้ทดสอบก่อน)

วิธีใช้
------
1) ใส่กุญแจ 2 ทาง เลือกทางใดทางหนึ่ง
   ก) ตัวแปรสภาพแวดล้อม (แนะนำ)
        setx CLOUDINARY_CLOUD_NAME "dmr6ln5hy"
        setx CLOUDINARY_API_KEY    "...."
        setx CLOUDINARY_API_SECRET "...."
        (ปิด/เปิด terminal ใหม่หลัง setx)
   ข) ไฟล์ cloudinary.json ข้าง ๆ ไฟล์นี้
        { "cloud_name": "dmr6ln5hy", "api_key": "...", "api_secret": "..." }
      * ไฟล์นี้ห้าม commit / ห้ามอัปโหลดขึ้นเว็บ

2) รัน
        python tools/usage_proxy.py
   แล้วเปิด  http://127.0.0.1:8100/usage

หน้า admin.html จะลองเรียกที่อยู่นี้เองอัตโนมัติถ้ายังไม่ได้ตั้ง URL ของ Worker
"""

import base64
import json
import os
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

PORT = int(os.environ.get("USAGE_PORT", "8100"))
CACHE_SECONDS = 300
ALLOWED_ORIGINS = {
    "http://localhost:8099",
    "http://127.0.0.1:8099",
}

HERE = os.path.dirname(os.path.abspath(__file__))
CRED_FILE = os.path.join(HERE, "cloudinary.json")

_cache = {"at": 0.0, "body": None}
_lock = threading.Lock()


def load_credentials():
    cloud = os.environ.get("CLOUDINARY_CLOUD_NAME", "").strip()
    key = os.environ.get("CLOUDINARY_API_KEY", "").strip()
    secret = os.environ.get("CLOUDINARY_API_SECRET", "").strip()

    url = os.environ.get("CLOUDINARY_URL", "").strip()
    if url.startswith("cloudinary://") and not (cloud and key and secret):
        # cloudinary://<key>:<secret>@<cloud>
        try:
            body = url[len("cloudinary://"):]
            creds, _, cloud_part = body.rpartition("@")
            k, _, s = creds.partition(":")
            key = key or k
            secret = secret or s
            cloud = cloud or cloud_part
        except Exception:
            pass

    if not (cloud and key and secret) and os.path.exists(CRED_FILE):
        try:
            with open(CRED_FILE, "r", encoding="utf-8") as f:
                d = json.load(f)
            cloud = cloud or str(d.get("cloud_name", "")).strip()
            key = key or str(d.get("api_key", "")).strip()
            secret = secret or str(d.get("api_secret", "")).strip()
        except Exception as e:
            print("[warn] อ่าน cloudinary.json ไม่ได้:", e)

    return cloud, key, secret


def fetch_usage():
    cloud, key, secret = load_credentials()
    missing = [n for n, v in (("CLOUDINARY_CLOUD_NAME", cloud),
                              ("CLOUDINARY_API_KEY", key),
                              ("CLOUDINARY_API_SECRET", secret)) if not v]
    if missing:
        return 500, {"error": "missing_config", "missing": missing,
                     "hint": "ตั้ง env หรือสร้างไฟล์ tools/cloudinary.json"}

    token = base64.b64encode(f"{key}:{secret}".encode("utf-8")).decode("ascii")
    req = urllib.request.Request(
        f"https://api.cloudinary.com/v1_1/{cloud}/usage",
        headers={"Authorization": "Basic " + token, "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = ""
        try:
            detail = e.read().decode("utf-8", "replace")[:300]
        except Exception:
            pass
        return 502, {"error": "cloudinary_error", "status": e.code, "detail": detail}
    except Exception as e:
        return 502, {"error": "upstream_unreachable", "detail": str(e)[:200]}

    data["fetched_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    return 200, data


class Handler(BaseHTTPRequestHandler):
    server_version = "GHAUsage/1.0"

    def _cors(self):
        origin = self.headers.get("Origin", "")
        headers = {
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
            "Vary": "Origin",
        }
        if origin in ALLOWED_ORIGINS:
            headers["Access-Control-Allow-Origin"] = origin
        return headers

    def _send(self, status, payload, extra=None):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        headers = self._cors()
        if extra:
            headers.update(extra)
        headers["Content-Type"] = "application/json; charset=utf-8"
        headers["Content-Length"] = str(len(body))
        headers["Cache-Control"] = "no-store"
        for k, v in headers.items():
            self.send_header(k, v)
        self.end_headers()
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in self._cors().items():
            self.send_header(k, v)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path not in ("/usage", "/"):
            self._send(404, {"error": "not_found", "hint": "GET /usage"})
            return

        force = parse_qs(parsed.query).get("refresh", ["0"])[0] == "1"
        with _lock:
            fresh = (time.time() - _cache["at"]) < CACHE_SECONDS
            if not force and fresh and _cache["body"] is not None:
                status, payload = 200, _cache["body"]
                cached = True
            else:
                status, payload = fetch_usage()
                cached = False
                if status == 200:
                    _cache["body"] = payload
                    _cache["at"] = time.time()

        extra = {"X-Cache": "HIT" if cached else "MISS"}
        self._send(status, payload, extra)

    def log_message(self, fmt, *args):
        # เขียน log แบบเรียบง่าย ไม่พ่น stack
        print("[%s] %s" % (time.strftime("%H:%M:%S"), fmt % args))


def main():
    cloud, key, secret = load_credentials()
    if cloud and key and secret:
        print(f"[ok] พบข้อมูลบัญชี Cloudinary: {cloud}")
    else:
        print("[!] ยังไม่มี api_key/api_secret — /usage จะตอบ 500 missing_config")
        print("    ตั้ง env หรือสร้างไฟล์:", CRED_FILE)
    print(f"[..] เปิด http://127.0.0.1:{PORT}/usage  (Ctrl+C เพื่อหยุด)")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()
