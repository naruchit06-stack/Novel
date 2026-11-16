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
