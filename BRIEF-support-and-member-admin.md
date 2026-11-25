# บรีฟงาน (รอบ 4): หน้าแจ้งปัญหา (ผู้ใช้ ↔ แอดมิน) + หน้าจัดการสมาชิก/ถอนสิทธิ์

## บริบท
โปรเจกต์ `C:\Ai\work-novel` — static site + Firebase modular v10.12.0 (project `login-24acc`)
มีอยู่แล้ว: ระบบสมาชิก (`settings/membership`, `episodes.premium`, `paymentRequests`, `users.memberUntil`), หน้า `member.html`, หลังบ้าน `admin.html` (แผง "สมาชิกและการชำระเงิน" มี: ตั้งค่า / ล็อกตอน / รออนุมัติ / ผู้ฟัง), header เมนูสร้างใน `app.js`
สไตล์: พื้นเข้ม + แอ็กเซนต์แดง/ทอง, ฟอนต์ Sarabun/Chakra Petch, ใช้ `style.css` เดิม, ข้อความ UI ภาษาไทย

## งานที่ 1 — หน้า "แจ้งปัญหา" สำหรับผู้ใช้ (`support.html`)
- หน้าใหม่ `support.html` โครงเดียวกับ `member.html` (header/footer เดิม, Firebase config เดิม, รองรับ base path `/Novel/` และ `/`)
- ผู้ใช้ที่ล็อกอินแล้ว:
  - ฟอร์ม: หัวข้อ (≤120 ตัวอักษร), รายละเอียด (≤2000), ปุ่ม "ส่งเรื่อง"
  - สร้างเอกสาร `supportTickets/{autoId}`: `{ uid, name, email, subject, status:'open', createdAt, updatedAt, lastMessageBy:'user', lastMessageText, unreadForAdmin:true, unreadForUser:false }`
  - เขียนข้อความแรกใน subcollection `supportTickets/{id}/messages/{autoId}`: `{ from:'user', text, createdAt, authorName }`
  - แสดงรายการ "เรื่องของฉัน" (เฉพาะของตัวเอง) เรียงใหม่→เก่า พร้อมสถานะ "รอตอบ" / "ตอบแล้ว" และจำนวนข้อความ
  - กดเปิดเรื่อง → เห็นบทสนทนาแบบ realtime (`onSnapshot` ที่ messages เรียงตาม createdAt) + ช่องพิมพ์ตอบกลับได้ (เขียน message `from:'user'` + อัปเดต ticket `updatedAt, lastMessageBy:'user', lastMessageText, unreadForAdmin:true`)
  - เมื่อเปิดดูเรื่อง ให้เคลียร์ `unreadForUser:false`
- ถ้ายังไม่ล็อกอิน → กล่อง "ต้องเข้าสู่ระบบก่อน" + ปุ่มไป `login.html`

## งานที่ 2 — แท็บ "แจ้งปัญหา" ในหลังบ้าน (`admin.html`)
- เพิ่มแท็บ/แผงใหม่ **"แจ้งปัญหา"** ในหน้าแอดมิน (ใช้แพตเทิร์นเดิมของแท็บ "สมาชิก")
- ซ้าย: รายการเรื่องทั้งหมด (`onSnapshot` เรียง `updatedAt` ใหม่→เก่า) แสดงชื่อผู้ใช้/หัวข้อ/เวลาล่าสุด/สถานะ + ป้ายจำนวนเรื่องที่ `unreadForAdmin == true`
- ขวา: บทสนทนาของเรื่องที่เลือก (realtime) + ช่องพิมพ์ตอบ → เขียน `messages` ด้วย `from:'admin'`, `authorName`, แล้วอัปเดต ticket: `updatedAt, lastMessageBy:'admin', lastMessageText, unreadForAdmin:false, unreadForUser:true, status:'open'`
- ปุ่ม **"ปิดเรื่อง"** → `status:'closed'` และ **"เปิดใหม่"** → `status:'open'`
- ป้าย/ตัวเลขบนหัวแผง: จำนวนเรื่องที่ยังไม่ตอบ (`unreadForAdmin == true`)
- toast เด้งเมื่อมีเรื่องใหม่ (เทียบจำนวนเดิมในหน่วยความจำ)

## งานที่ 3 — หน้าจัดการสมาชิก + ถอนสิทธิ์ (`admin.html`)
เพิ่มการ์ดใหม่ในแผง "สมาชิกและการชำระเงิน" ชื่อ **"จัดการสมาชิก"**
- ตารางสมาชิกที่ยัง active (`memberUntil` เป็น timestamp และ > now) เรียงวันหมดอายุใกล้สุดก่อน แสดง: ชื่อ / อีเมล / UID (ย่อ) / หมดอายุ / เหลือกี่วัน
- ปุ่มต่อคน:
  - **"ถอนสิทธิ์"** → ตั้ง `memberUntil: null` + เขียนเอกสาร log ที่ collection ใหม่ `membershipLog`: `{ uid, action:'revoke', by: adminUid, at, note }`
  - **"คืนสิทธิ์"** (แสดงเมื่อเพิ่งถอน หรืออยู่ในการ์ด "ถอนแล้วล่าสุด") → ตั้ง `memberUntil` = now + จำนวนวันที่กรอก (default จาก `settings/membership.memberDays`) + log `{ action:'grant' }`
  - **"ปรับวัน"** → ใส่จำนวนวัน แล้วตั้ง `memberUntil` เป็น now + n วัน (ใช้กรณีอนุมัติผิดจำนวน) + log `{ action:'adjust' }`
- การ์ดย่อย **"อนุมัติผิด? ย้อนกลับ"**: แสดง `paymentRequests` ที่ `status == 'approved'` ล่าสุด 10 รายการ พร้อมปุ่ม **"เปลี่ยนเป็นปฏิเสธ"** → `status:'rejected'` (ไม่แตะ memberUntil ให้แอดมินกดถอนสิทธิ์เอง) + ปุ่มลิงก์ไปยังแถวสมาชิกคนนั้น
- ค้นหาชื่อ/อีเมลในตารางสมาชิกได้

## Firestore Rules ที่ต้องเพิ่ม (`firestore.rules`)
- `supportTickets/{id}`:
  - create: `isSignedIn() && request.resource.data.uid == request.auth.uid && status == 'open'`
  - read: `isAdmin() || (isSignedIn() && resource.data.uid == request.auth.uid)`
  - update: เจ้าของแก้ได้เฉพาะ `unreadForUser, updatedAt, lastMessageBy, lastMessageText, status(เฉพาะ open→closed)`; แอดมินแก้ได้ทุกฟิลด์
  - delete: แอดมินเท่านั้น
  - `supportTickets/{id}/messages/{mid}`: create ให้เฉพาะ `from` ตรงกับบทบาท (`'user'` เมื่อ uid ตรงเจ้าของ, `'admin'` เมื่อ isAdmin), read = แอดมินหรือเจ้าของ, update/delete = แอดมิน
- `membershipLog/{id}`: create/read เฉพาะ `isAdmin()`
- คงกฎเดิมทั้งหมด ห้ามเปิดช่องให้ผู้ใช้แก้ `memberUntil` เอง

## งานที่ 4 — เมนู + cache
- `app.js`: เพิ่มเมนู **"แจ้งปัญหา"** ใน header (เดสก์ท็อป + มือถือ) ชี้ไป `support.html`
- `member.html` / `support.html` ต้องไฮไลต์เมนูตัวเอง
- `sw.js`: เพิ่ม `support.html` ใน static assets และ bump `CACHE_NAME` เป็น `niyay-v6`

## ข้อบังคับ
- **ห้ามใส่คอมเมนต์อธิบายงานในโค้ดที่เพิ่มใหม่**
- ห้ามเพิ่ม dependency/CDN ใหม่, ห้าม commit/push
- ข้อความ UI ภาษาไทย สุภาพ
- รองรับ base path ทั้ง `/Novel/` (GitHub Pages) และ `/` (workers.dev)
- ต้องมี cleanup listener (`unsubscribe`) เมื่อสลับเรื่อง/เปลี่ยนหน้า เพื่อไม่ให้ onSnapshot ซ้อนกัน

## สิ่งที่ต้องส่งมอบ
1. ไฟล์ที่สร้าง/แก้ + สรุป
2. ผลทดสอบไวยากรณ์จริงทุกไฟล์ (inline scripts ใน HTML ทุกหน้า + `node --input-type=module --check app.js`)
3. เนื้อหา `firestore.rules` ที่เพิ่ม (เฉพาะส่วนใหม่) พร้อมบอกว่าแทรกตรงไหน
4. ผลเปิด `support.html` ด้วย local server (บอกว่าโหลดได้ ไม่มี console error)
5. checklist: ส่งเรื่องได้ / แอดมินเห็น badge + ตอบได้ / ผู้ใช้เห็นคำตอบ realtime / ถอนสิทธิ์แล้วผู้ใช้ฟังตอนล็อกไม่ได้ / คืนสิทธิ์แล้วฟังได้

## เกณฑ์ผ่าน
- ผู้ใช้ส่งเรื่อง → แอดมินเห็นทันที → ตอบ → ผู้ใช้เห็นคำตอบโดยไม่ต้องรีเฟรช
- แอดมินถอนสิทธิ์สมาชิกที่อนุมัติผิด → ผู้ใช้กลับไปโดนล็อกตอน premium ทันที
- ไม่มีจุดใดให้ผู้ใช้ธรรมดาแก้ `memberUntil` หรืออ่าน ticket ของคนอื่นได้
