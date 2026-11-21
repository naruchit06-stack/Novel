"""
Azure Speech — สร้างเสียงนิยายไทย (ไม่ต้องติดตั้ง SDK ใช้แค่ urllib)
====================================================================

เตรียมกุญแจ (เลือกทางใดทางหนึ่ง)
--------------------------------
ก) ตัวแปรสภาพแวดล้อม
     setx AZURE_SPEECH_KEY    "...."
     setx AZURE_SPEECH_REGION "southeastasia"
ข) ไฟล์ tools/azure.json
     { "key": "....", "region": "southeastasia" }
   * ไฟล์นี้อยู่ใน .gitignore แล้ว ห้ามอัปขึ้นเว็บ

ตัวอย่างคำสั่ง
--------------
# ดูเสียงภาษาไทยทั้งหมด
python tools/tts_azure.py --voices

# แปลงทั้งไฟล์เป็น mp3 เดียว
python tools/tts_azure.py --in "Novel\\...\\ตอนที่41-50.txt" --out out\\ep41-50.mp3

# แยกเป็นตอน ๆ ตามบรรทัดที่ขึ้นต้นด้วย "ตอนที่"
python tools/tts_azure.py --in "Novel\\...\\ตอนที่41-50.txt" --chapters --outdir out

# เปลี่ยนเสียง / ความเร็ว
python tools/tts_azure.py --in x.txt --out x.mp3 --voice th-TH-NiwatNeural --rate "-5%"
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
import xml.sax.saxutils as sx

HERE = os.path.dirname(os.path.abspath(__file__))
KEY_FILE = os.path.join(HERE, "azure.json")
LOG_FILE = os.path.join(HERE, "tts_azure_log.txt")

DEFAULT_VOICE = "th-TH-PremwadeeNeural"
OUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3"
MAX_CHUNK = 2800  # ตัวอักษรต่อคำขอ (ปลอดภัยกว่า limit 64KB ของ SSML)

_log_lines = []


def log(msg):
    _log_lines.append(msg)
    try:
        print(msg)
    except Exception:
        pass


def flush_log():
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write("\n".join(_log_lines) + "\n")
    except Exception:
        pass


def load_creds():
    key = os.environ.get("AZURE_SPEECH_KEY", "").strip()
    region = os.environ.get("AZURE_SPEECH_REGION", "").strip().lower()
    if (not key or not region) and os.path.exists(KEY_FILE):
        try:
            with open(KEY_FILE, "r", encoding="utf-8") as f:
                d = json.load(f)
            key = key or str(d.get("key", "")).strip()
            region = region or str(d.get("region", "")).strip().lower()
        except Exception as e:
            log("[warn] อ่าน azure.json ไม่ได้: %s" % e)
    return key, region


def list_voices(key, region):
    url = "https://%s.tts.speech.microsoft.com/cognitiveservices/voices/list" % region
    req = urllib.request.Request(url, headers={
        "Ocp-Apim-Subscription-Key": key,
        "User-Agent": "GoldenHoardTTS/1.0",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        voices = json.loads(r.read().decode("utf-8"))
    thai = [v for v in voices if v.get("Locale", "").lower().startswith("th")]
    return thai


def split_chunks(text, limit=MAX_CHUNK):
    """แบ่งข้อความเป็นก้อนตามประโยค/ขึ้นบรรทัดใหม่ ไม่ให้ยาวเกิน limit"""
    text = text.strip()
    if not text:
        return []
    paras = [p.strip() for p in re.split(r"\n\s*\n|\n", text) if p.strip()]
    chunks, buf = [], ""
    for p in paras:
        if len(p) > limit:
            for sent in re.split(r"(?<=[.!?。])\s+", p):
                if len(buf) + len(sent) + 1 > limit and buf:
                    chunks.append(buf.strip())
                    buf = ""
                while len(sent) > limit:
                    chunks.append(sent[:limit])
                    sent = sent[limit:]
                buf = (buf + " " + sent).strip() if buf else sent
        else:
            if len(buf) + len(p) + 1 > limit and buf:
                chunks.append(buf.strip())
                buf = ""
            buf = (buf + "\n" + p).strip() if buf else p
    if buf:
        chunks.append(buf.strip())
    return chunks


def build_ssml(text, voice, rate):
    body = sx.escape(text)
    return (
        "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='th-TH'>"
        "<voice name='%s'>"
        "<prosody rate='%s'>%s</prosody>"
        "</voice></speak>" % (voice, rate, body)
    )


def synth(text, voice, rate, key, region, retries=4):
    ssml = build_ssml(text, voice, rate).encode("utf-8")
    url = "https://%s.tts.speech.microsoft.com/cognitiveservices/v1" % region
    for attempt in range(1, retries + 1):
        req = urllib.request.Request(url, data=ssml, headers={
            "Ocp-Apim-Subscription-Key": key,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": OUT_FORMAT,
            "User-Agent": "GoldenHoardTTS/1.0",
        })
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            body = ""
            try:
                body = e.read().decode("utf-8", "replace")[:200]
            except Exception:
                pass
            if e.code in (429, 500, 503) and attempt < retries:
                wait = 5 * attempt
                log("    [retry %d/%d] HTTP %d รอ %ds" % (attempt, retries, e.code, wait))
                time.sleep(wait)
                continue
            raise RuntimeError("HTTP %d: %s" % (e.code, body))
    raise RuntimeError("retry หมด")


def synth_long(text, voice, rate, key, region, label=""):
    chunks = split_chunks(text)
    out = bytearray()
    for i, c in enumerate(chunks, 1):
        log("    %s chunk %d/%d (%d ตัวอักษร)" % (label, i, len(chunks), len(c)))
        out += synth(c, voice, rate, key, region)
    return bytes(out)


def split_chapters(text):
    """แยกตามบรรทัดที่ขึ้นต้นด้วย 'ตอนที่' คืน list ของ (ชื่อตอน, เนื้อหา)"""
    lines = text.splitlines()
    chapters, cur_title, cur = [], None, []
    for ln in lines:
        m = re.match(r"^\s*ตอนที่\s*([0-9]+)\s*(.*)$", ln)
        if m:
            if cur_title is not None:
                chapters.append((cur_title, "\n".join(cur)))
            num = int(m.group(1))
            cur_title = "ep%03d" % num
            cur = [ln]
        else:
            cur.append(ln)
    if cur_title is not None:
        chapters.append((cur_title, "\n".join(cur)))
    return chapters


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp")
    ap.add_argument("--out")
    ap.add_argument("--outdir", default="out")
    ap.add_argument("--voice", default=DEFAULT_VOICE)
    ap.add_argument("--rate", default="+0%")
    ap.add_argument("--chapters", action="store_true")
    ap.add_argument("--voices", action="store_true")
    args = ap.parse_args()

    key, region = load_creds()
    if not key or not region:
        log("[!] ยังไม่มี key/region — ตั้ง env หรือสร้างไฟล์ %s" % KEY_FILE)
        flush_log()
        return 2

    try:
        if args.voices:
            for v in list_voices(key, region):
                log("%s | %s | %s" % (v.get("ShortName"), v.get("Gender"), v.get("VoiceType")))
            flush_log()
            return 0

        if not args.inp:
            log("[!] ต้องระบุ --in")
            flush_log()
            return 2

        with open(args.inp, "r", encoding="utf-8") as f:
            text = f.read()

        if args.chapters:
            os.makedirs(args.outdir, exist_ok=True)
            chs = split_chapters(text)
            log("[..] พบ %d ตอน" % len(chs))
            for title, body in chs:
                dest = os.path.join(args.outdir, title + ".mp3")
                if os.path.exists(dest) and os.path.getsize(dest) > 1000:
                    log("[skip] %s มีอยู่แล้ว" % dest)
                    continue
                log("[..] %s" % dest)
                audio = synth_long(body, args.voice, args.rate, key, region, title)
                with open(dest, "wb") as f:
                    f.write(audio)
                log("[ok] %s (%.1f KB)" % (dest, len(audio) / 1024))
        else:
            if not args.out:
                log("[!] ต้องระบุ --out")
                flush_log()
                return 2
            d = os.path.dirname(args.out)
            if d:
                os.makedirs(d, exist_ok=True)
            audio = synth_long(text, args.voice, args.rate, key, region, "file")
            with open(args.out, "wb") as f:
                f.write(audio)
            log("[ok] %s (%.1f KB)" % (args.out, len(audio) / 1024))

        flush_log()
        return 0
    except Exception as e:
        log("[x] ERROR: %s" % e)
        flush_log()
        return 1


if __name__ == "__main__":
    sys.exit(main())
