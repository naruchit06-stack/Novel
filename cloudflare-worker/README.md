# Cloudinary Usage Proxy (Cloudflare Worker)

ตัวกลางอ่าน **ยอดใช้จริง** จาก Cloudinary Admin API ให้หน้า `admin.html`
(ต้องมีเพราะ `api_secret` ห้ามอยู่ในโค้ดฝั่งเว็บ)

## สิ่งที่ต้องเตรียม

1. บัญชี Cloudflare (ฟรี) — https://dash.cloudflare.com
2. จาก Cloudinary Dashboard → **Settings → API Keys** เอา 3 ค่า:
   - Cloud name (`dmr6ln5hy`)
   - API Key
   - API Secret

## วิธี deploy (ไม่ต้องติดตั้ง Node)

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Worker**
2. ตั้งชื่อ เช่น `gh-usage` → **Deploy**
3. กด **Edit code** → ลบโค้ดตัวอย่างทั้งหมด → วางเนื้อหาไฟล์ `worker.js` นี้ → **Deploy**
4. ไปที่ **Settings → Variables and Secrets** เพิ่ม (ชนิด **Secret** ทุกตัว):
   | Name | Value |
   |---|---|
   | `CLOUDINARY_CLOUD_NAME` | `dmr6ln5hy` |
   | `CLOUDINARY_API_KEY` | (API Key) |
   | `CLOUDINARY_API_SECRET` | (API Secret) |
   | `ALLOW_ORIGINS` | `http://localhost:8099` (คั่นด้วย comma ถ้ามีหลายโดเมน) |
5. กด **Deploy** อีกครั้ง
6. ทดสอบเปิด `https://gh-usage.<บัญชี>.workers.dev/usage` → ต้องได้ JSON มี `storage`, `bandwidth`, `credits`
7. เปิด `admin.html` → การ์ด "พื้นที่จัดเก็บไฟล์" → กด **ตั้งค่าการเชื่อมต่อ Cloudinary** → วาง URL จากข้อ 6 → **บันทึก**

## หมายเหตุ

- Worker แคชผลไว้ 5 นาที (กันยิง Cloudinary ถี่เกินโควตา API) — ปุ่มสแกนใหม่ในหน้าแอดมินส่ง `?refresh=1` เพื่อบังคับดึงใหม่
- หลอด % ใช้ `storage.usage / storage.limit` ของบัญชีจริง (limit ที่ API คืนมา = พื้นที่ตามแพลน)
- ถ้า Worker ยังไม่ deploy / URL ผิด หน้าแอดมินจะกลับไปแสดง **ค่าประมาณ** จากไฟล์ในระบบ พร้อมบอกสาเหตุ
- โดเมนที่เรียกได้ถูกจำกัดด้วย `ALLOW_ORIGINS` (กันเว็บอื่นในเบราว์เซอร์ดึงยอดไปใช้)

---

# Worker `novel-audio` — เก็บไฟล์เสียงตอน premium บน R2

Worker แยกอีกตัว (ไฟล์ `novel-audio-worker.js`) ทำหน้าที่เก็บไฟล์เสียงของ **ตอนที่ล็อกเฉพาะสมาชิก** ไว้บน Cloudflare R2 และออก signed URL อายุสั้นให้ผู้เล่น — ไฟล์ต้นฉบับไม่ถูกเปิดเป็น public

- URL ที่ deploy แล้ว: `https://novel-audio.hollymons4654.workers.dev`
- binding: `AUDIO` → R2 bucket `novel-audio`

## Endpoint

| Method | Path | ต้องมี token | ทำงาน |
|---|---|---|---|
| GET | `/health` | ไม่ต้อง | `{ok, bucket, project}` — ใช้เช็กว่า Worker + binding พร้อม |
| GET | `/whoami` | Firebase ID token | `{uid, email, isAdmin, isMember, memberUntil}` |
| POST | `/sign` body `{"key":"audio/..."}` | Firebase ID token | คืน `{url, expiresAt, memberUntil, isAdmin}` — เฉพาะแอดมินหรือสมาชิกที่ `users.memberUntil` ยังไม่หมดอายุ; ไม่มีสิทธิ์ → `403 {"error":"MEMBERS_ONLY"}` |
| POST | `/upload?key=audio/...` body = ไฟล์ไบนารี | Firebase ID token (แอดมินเท่านั้น) | เขียนทับ object ใน R2; จำกัด 120 MB ต่อไฟล์; คืน `{ok, key, size}` |
| GET | `/audio?k=<key>&exp=<unix>&sig=<hmac>` | ไม่ต้อง (ใช้ลายเซ็นใน URL) | สตรีมไฟล์ รองรับ `Range` (206) — เอา URL นี้ใส่ `<audio src>` ได้ตรง ๆ |

`key` ต้องอยู่ในรูป `audio/<slug>/ep<order>-<ชื่อไฟล์>.mp3` เท่านั้น (อักษร `A-Za-z0-9._-/`) นอกนั้นได้ `400 BAD_KEY`

## env ที่ต้องมี

| Name | ชนิด | ตัวอย่าง |
|---|---|---|
| `FIREBASE_PROJECT_ID` | Variable | `login-24acc` |
| `ALLOW_ORIGINS` | Variable | `https://novel.hollymons4654.workers.dev` (คั่นด้วย comma; โดเมน `*.workers.dev` / `*.pages.dev` ผ่านอัตโนมัติ) |
| `TOKEN_SECRET` | Secret (ไม่บังคับ) | ถ้าไม่ตั้ง Worker จะ derive คีย์ HMAC จาก `FIREBASE_PROJECT_ID` — ตั้งเองจะปลอดภัยกว่าและเปลี่ยนแล้ว URL เก่าใช้ไม่ได้ทันที |
| `AUDIO` | R2 binding | bucket `novel-audio` |

## วิธี deploy ผ่านหน้าเว็บ

1. Cloudflare Dashboard → **R2** → **Create bucket** ชื่อ `novel-audio` (ไม่ต้องเปิด public access)
2. **Workers & Pages** → **Create** → **Worker** → ตั้งชื่อ `novel-audio` → **Deploy**
3. **Edit code** → ลบโค้ดตัวอย่าง → วางเนื้อหา `novel-audio-worker.js` → **Deploy**
4. **Settings → Bindings** → เพิ่ม **R2 bucket** → Variable name `AUDIO` → bucket `novel-audio`
5. **Settings → Variables and Secrets** → เพิ่ม `FIREBASE_PROJECT_ID` = `login-24acc`, `ALLOW_ORIGINS` = โดเมนเว็บจริง
6. ถ้าจะล็อกคีย์เอง เพิ่ม **Secret** `TOKEN_SECRET` เป็นค่าสุ่มยาว ๆ
7. ทดสอบ `GET https://novel-audio.<บัญชี>.workers.dev/health` ต้องได้ `{"ok":true,"bucket":true,"project":"login-24acc"}`

## ฝั่งเว็บทำงานอย่างไร

- `admin.html`: ติ๊ก "ตอนนี้ล็อกเฉพาะสมาชิก (premium)" แล้วอัปไฟล์ → อัปขึ้น R2 ผ่าน `POST /upload` → เก็บ `premium:true`, `audioKey`, `audioUrl:null`; ไม่ติ๊ก = Cloudinary เดิม + `audioUrl`
- `app.js` / `novel.html`: ก่อนเล่นตอน premium เรียก `POST /sign` → ได้ URL อายุ 10 นาที → ตั้ง `audio.src`
- ผู้เล่นไม่ได้เก็บ signed URL ลง Firestore หรือ `localStorage`/`sessionStorage` (เก็บในหน่วยความจำของแท็บเท่านั้น)

## ข้อจำกัด

- signed URL มีอายุ **10 นาที** — เล่นยาวกว่านั้นตัวเล่นขอ URL ใหม่แล้วเล่นต่อจาก `currentTime` เดิม (ถ้าคลิปยาวมากและเน็ตหลุดพร้อมกันอาจต้องกดเล่นซ้ำ)
- `/sign` ตรวจสิทธิ์จาก `users.memberUntil` ที่ Firestore ทุกครั้ง — แม้ปิดสวิตช์ `settings/membership` (เปิดทุกตอนให้ทุกคน) ผู้ที่ไม่ใช่สมาชิกก็ยังขอ signed URL ไม่ได้
- Worker **ยังไม่มี endpoint ลบไฟล์** — ลบตอนในแอดมินแล้ว object ใน R2 ยังอยู่ ต้องไปลบที่ Cloudflare Dashboard → R2 → `novel-audio`
- ไฟล์เดียวจำกัด 120 MB และไม่มี endpoint list/ตรวจขนาดรวมของ bucket
- ฝั่งเว็บอัปโหลดผ่าน XHR ตรงจากเบราว์เซอร์ (ไม่มี multipart) ถ้าเน็ตหลุดกลางทางต้องอัปใหม่ทั้งไฟล์
- ต้องตั้ง `ALLOW_ORIGINS` ให้ตรงโดเมนที่ใช้จริง ไม่งั้นเบราว์เซอร์จะบล็อก CORS (localhost ต้องเพิ่มเองตอนพัฒนา)

