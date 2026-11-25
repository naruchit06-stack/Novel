# บรีฟงาน (รอบ 5): รองรับข้อมูลเยอะ — ผู้ใช้หลายพัน, นิยายหลายสิบเรื่อง, ตอนหลายร้อยต่อเรื่อง

## บริบท
โปรเจกต์ `C:\Ai\work-novel` (static site + Firebase modular v10.12.0, Firestore)
โครงข้อมูล: `novels/{id}`, `novels/{id}/episodes/{id}` (ฟิลด์ `order, title, audioUrl, audioKey, premium, duration`), `users/{uid}` (`memberUntil`), `paymentRequests`, `supportTickets` (+ messages), `membershipLog`, `settings/membership`
เป้าหมาย: ตอนนี้โค้ดโหลดข้อมูลก้อนใหญ่ทั้งก้อน (getDocs ทั้ง collection / โหลดทุกตอนของทุกเรื่อง) — ต้องเปลี่ยนให้รองรับข้อมูลมาก ๆ โดยไม่หน่วงและไม่กิน read quota เกินจำเป็น

## กติกากลาง (ทำทุกจุด)
- **ห้ามโหลด collection ทั้งก้อน** ถ้าไม่จำเป็น — ใช้ `orderBy` + `limit` + `startAfter` (pagination) หรือ `getCountFromServer` (นับแบบ aggregate, ถูกกว่าและเร็วกว่ามาก)
- หน้ารายการที่ผู้ใช้เห็น: แบ่งหน้า/โหลดเพิ่ม (infinite scroll หรือปุ่ม "โหลดเพิ่ม") ครั้งละ 20-30 รายการ
- ทุก query ต้องมี index ที่ถูกต้อง — ถ้าต้องสร้าง composite index ให้เขียนรายการ index ที่ต้องสร้างไว้ในรายงาน (ชื่อ collection + ฟิลด์ + ลำดับ) เพื่อให้แอดมินสร้างใน Console
- หลีกเลี่ยง `onSnapshot` บน collection ใหญ่ — ใช้ snapshot เฉพาะรายการที่กำลังดู (เช่น เอกสารเดียว/ข้อความในเรื่องเดียว) และใช้ polling/`getDocs` สำหรับรายการสรุป

## งานที่ต้องทำ

### 1) `admin.html` — แผงสมาชิกและผู้ฟัง
- ป้ายสถิติ (รออนุมัติ / สมาชิก / ผู้ฟัง) ให้ใช้ `getCountFromServer` กับ query ที่กรองด้วยเงื่อนไข (เช่น `where('memberUntil','>',now)` / `<` ) แทนการโหลด users ทั้งหมดมาบวกเลข
- การ์ด "ผู้ฟังที่ยังไม่เป็นสมาชิก" และ "จัดการสมาชิก": ใช้ pagination ครั้งละ 25 รายการ + ปุ่ม "โหลดเพิ่ม" + ช่องค้นหา (ค้นจาก field `email`/`name` แบบ prefix ด้วย `>=`/`<=` คู่กัน) และแสดงข้อความเมื่อไม่มีผล
- `paymentRequests` คิวรออนุมัติ: `where('status','==','pending')` + `orderBy('createdAt','desc')` + `limit(50)` + ปุ่มโหลดเพิ่ม (ห้าม onSnapshot ทั้ง collection)
- การ์ด "อนุมัติผิด ย้อนกลับ": `where('status','==','approved')` + `orderBy` + `limit(20)`
- ปุ่ม **"ตั้งค่า premium ให้ตอนเก่า" (migrate)**: ต้องไม่วิ่งทีเดียวทั้งฐาน — ทำเป็นชุด (batch) ครั้งละ 200 เอกสาร ต่อเนื่องจนจบ พร้อมแถบความคืบหน้า "ทำแล้ว X / ทั้งหมด Y" และปุ่มหยุดกลางทางได้ ใช้ `getCountFromServer` นับจำนวนตอนทั้งหมดต่อเรื่อง
- การ์ด "ล็อกตอนสำหรับสมาชิก": เมื่อเลือกนิยาย ให้โหลดตอนทีละ 30 รายการ (เรียง `order`) + ปุ่มโหลดเพิ่ม + ช่องค้นหาเลขตอน (ห้ามโหลดทุกตอนพร้อมกัน)

### 2) แท็บ "แจ้งปัญหา" (`admin.html`)
- รายการเรื่อง: `orderBy('updatedAt','desc')` + `limit(30)` + โหลดเพิ่ม + ตัวกรองสถานะ (เปิด/ปิด) + ตัวกรอง "ยังไม่ตอบ" (`where('unreadForAdmin','==',true)`)
- ข้อความในเรื่อง: โหลดล่าสุด 50 ข้อความ (`orderBy('createdAt','desc')` + `limit(50)`) แล้วแสดงจากเก่า→ใหม่ + ปุ่ม "โหลดข้อความเก่า" (`startAfter`)
- badge จำนวนเรื่องที่ยังไม่ตอบ ใช้ `getCountFromServer`

### 3) `support.html`
- "เรื่องของฉัน" ใช้ `where('uid','==',uid)` + `orderBy('updatedAt','desc')` + `limit(20)` + โหลดเพิ่ม
- ข้อความในเรื่อง ใช้ limit 50 + โหลดเก่าเพิ่มได้
- หลีกเลี่ยง onSnapshot บน collection ทั้งก้อน

### 4) `app.js` — รายการนิยาย/ตอนสำหรับผู้ใช้
- หน้าแรก/คลัง/รายการตอน: ใช้ limit (เช่น 24 นิยาย, 50 ตอน) + ปุ่ม "โหลดเพิ่ม"
- ตรวจว่าการโหลดตอนของเรื่องที่มี 500+ ตอนไม่ทำให้หน้าค้าง (ห้าม `getDocs` ทั้ง subcollection)

### 5) `firestore.rules` + index
- ตรวจว่ากฎไม่บล็อก query ที่ใช้ `where` + `orderBy` ร่วมกัน (กฎต้องไม่พึ่ง `resource.data` ที่ทำให้ query ถูกปฏิเสธ — ถ้าจำเป็นให้ปรับกฎให้กรองได้)
- เขียนรายการ **composite index ที่ต้องสร้าง** ลงไฟล์ `FIREBASE_INDEXES.md` ที่ root ของโปรเจกต์ (รูปแบบ: collection group, ฟิลด์ที่ where, ฟิลด์ที่ orderBy, ascending/descending)

### 6) `sw.js`
- bump `CACHE_NAME` เป็น `niyay-v7`

## ข้อบังคับ
- **ห้ามใส่คอมเมนต์อธิบายงานในโค้ดที่เพิ่มใหม่**
- ห้ามเพิ่ม dependency/CDN ใหม่ (ใช้ Firestore SDK ที่มีอยู่ รวม `getCountFromServer`, `startAfter`, `limit`)
- ห้าม commit/push · ข้อความ UI ภาษาไทย · รองรับ base path `/Novel/` และ `/`
- ต้อง unsubscribe listener ทุกตัวเมื่อเปลี่ยนหน้า/สลับรายการ

## สิ่งที่ต้องส่งมอบ
1. ไฟล์ที่แก้ + สรุปต่อไฟล์ (ระบุว่าจุดไหนเปลี่ยนจากโหลดทั้งหมด → pagination/count)
2. ผลทดสอบไวยากรณ์จริง
3. `FIREBASE_INDEXES.md` (รายการ index ที่ต้องสร้าง)
4. ตารางสรุป: แต่ละหน้าส่ง query อะไร (where/orderBy/limit) เพื่อให้ตรวจ read quota ได้
5. checklist: ผู้ใช้ 1,000+ คนหน้าแอดมินยังโหลดเร็ว / นิยาย 50 เรื่อง ตอน 500+ ต่อเรื่อง เปิดหน้าได้ไม่ค้าง / migration ทำงานเป็นชุดและหยุดได้ / ค้นหาและโหลดเพิ่มทำงาน

## เกณฑ์ผ่าน
- ไม่มี query ใดในโค้ดที่โหลด collection ทั้งก้อนโดยไม่มี `limit` (ยกเว้นกรณีระบุเหตุผลในรายงาน)
- หน้าแอดมินเปิดได้ภายในไม่กี่วินาทีแม้มี users หลายพัน (เพราะใช้ count aggregate + limit)
- migration ไม่ค้าง/ไม่ timeout และรายงานความคืบหน้าได้
