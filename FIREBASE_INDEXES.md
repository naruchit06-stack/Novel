# Composite index ที่ต้องสร้าง (Firebase Console → Firestore → Indexes)

สร้างที่ Console: Firestore Database → แท็บ **Indexes** → **Create index** (หรือ deploy `firestore.indexes.json` ที่แนบท้ายไฟล์นี้)
ทุกแถวเป็น **composite index** ที่ query ในโค้ดต้องใช้จริง — ถ้าไม่สร้าง หน้าที่เกี่ยวข้องจะขึ้น error `failed-precondition` และรายการว่าง

| # | Collection / Collection group | ฟิลด์ที่ where (ตามลำดับ) | ฟิลด์ที่ orderBy | ทิศทาง | ใช้ที่ | query ในโค้ด |
|---|---|---|---|---|---|---|
| 1 | `paymentRequests` | `status` == `pending` | `createdAt` | ASC / **DESC** | admin.html — การ์ด "รายการรออนุมัติ" | `where('status','==','pending') + orderBy('createdAt','desc') + limit(50)` |
| 2 | `paymentRequests` | `status` == `approved` | `createdAt` | ASC / **DESC** | admin.html — การ์ด "อนุมัติผิด? ย้อนกลับ" | `where('status','==','approved') + orderBy('createdAt','desc') + limit(20)` |
| 3 | `supportTickets` | `uid` == (uid ผู้ใช้) | `updatedAt` | ASC / **DESC** | support.html — "เรื่องของฉัน" | `where('uid','==',uid) + orderBy('updatedAt','desc') + limit(20)` |
| 4 | `supportTickets` | `status` == `closed` / `open` | `updatedAt` | ASC / **DESC** | admin.html — ตัวกรองสถานะในแท็บแจ้งปัญหา | `where('status','==',v) + orderBy('updatedAt','desc') + limit(30)` |
| 5 | `supportTickets` | `unreadForAdmin` == `true` | `updatedAt` | ASC / **DESC** | admin.html — ตัวกรอง "ยังไม่ตอบ" | `where('unreadForAdmin','==',true) + orderBy('updatedAt','desc') + limit(30)` |
| 6 | `novels/{novelId}/episodes` (collection group `episodes`) | `premium` == `false` | `order` | ASC / ASC | app.js — ผู้ใช้ทั่วไปที่ยังไม่เป็นสมาชิก | `where('premium','==',false) + orderBy('order','asc') + limit(50)` + `startAfter` |

## ไม่ต้องสร้าง composite index (ใช้ single-field index อัตโนมัติของ Firestore)

| Collection | query | เหตุผล |
|---|---|---|
| `novels` | `orderBy('createdAt','desc') + limit(24/200)` | เรียงฟิลด์เดียว |
| `novels/{id}/episodes` | `orderBy('order','asc') + limit(30/50/300)` | เรียงฟิลด์เดียว (+ `startAfter`) |
| `novels/{id}/episodes` | `orderBy(documentId()) + limit(200)` | ใช้ document id (มีในตัว) — ใช้ใน migration |
| `novels/{id}/episodes` | `where('order','==',N)` | เท่ากับฟิลด์เดียว |
| `users` | `where('memberUntil','>',now) + orderBy('memberUntil','asc')` | ช่วงและเรียงฟิลด์เดียวกัน |
| `users` | `orderBy('lastLogin','desc') + limit(25)` | เรียงฟิลด์เดียว |
| `users` | `where('email' >= 'a') + where('email' <= 'a\uf8ff')` | prefix ช่วงฟิลด์เดียว |
| `users` | `where('displayName' >= 'ก') + where('displayName' <= 'ก\uf8ff')` | prefix ช่วงฟิลด์เดียว |
| `users` | `where('memberUntil','>',now)` (นับด้วย `getCountFromServer`) | ฟิลด์เดียว (count aggregate ไม่ต้องมี index เพิ่ม) |
| `paymentRequests` | `where('status','==','pending')` (นับด้วย `getCountFromServer`) | ฟิลด์เดียว |
| `supportTickets` | `orderBy('updatedAt','desc') + limit(30)` | เรียงฟิลด์เดียว |
| `supportTickets` | `where('unreadForAdmin','==',true)` / `where('status','==','open')` (นับ) | ฟิลด์เดียว |
| `supportTickets/{id}/messages` | `orderBy('createdAt','desc') + limit(50)` (+ `startAfter`) | เรียงฟิลด์เดียว |
| `membershipLog` | `orderBy('at','desc') + limit(20)` | เรียงฟิลด์เดียว |

## หมายเหตุการใช้งาน

- index ข้อ 1–5 ต้อง **DESC** ที่ฟิลด์ orderBy เพราะทุก query เรียงจากใหม่ → เก่า
- index ข้อ 6 อยู่บน **collection group** `episodes` (สร้างผ่าน Console ต้องเลือก Collection group = `episodes`) ถ้าไม่สร้าง ผู้ใช้ที่ยังไม่เป็นสมาชิกจะเปิดรายการตอนไม่ได้ แต่สมาชิก/แอดมินยังเปิดได้ (query คนละแบบ)
- หลังสร้าง index ใหม่ Firestore ใช้เวลาสร้าง 1–5 นาที ระหว่างนั้น query อาจยัง error
- `firestore.indexes.json` ด้านล่าง deploy ได้ด้วย `firebase deploy --only firestore:indexes`

```json
{
  "indexes": [
    { "collectionGroup": "paymentRequests", "queryScope": "COLLECTION",
      "fields": [ { "fieldPath": "status", "order": "ASCENDING" },
                  { "fieldPath": "createdAt", "order": "DESCENDING" } ] },
    { "collectionGroup": "supportTickets", "queryScope": "COLLECTION",
      "fields": [ { "fieldPath": "uid", "order": "ASCENDING" },
                  { "fieldPath": "updatedAt", "order": "DESCENDING" } ] },
    { "collectionGroup": "supportTickets", "queryScope": "COLLECTION",
      "fields": [ { "fieldPath": "status", "order": "ASCENDING" },
                  { "fieldPath": "updatedAt", "order": "DESCENDING" } ] },
    { "collectionGroup": "supportTickets", "queryScope": "COLLECTION",
      "fields": [ { "fieldPath": "unreadForAdmin", "order": "ASCENDING" },
                  { "fieldPath": "updatedAt", "order": "DESCENDING" } ] },
    { "collectionGroup": "episodes", "queryScope": "COLLECTION",
      "fields": [ { "fieldPath": "premium", "order": "ASCENDING" },
                  { "fieldPath": "order", "order": "ASCENDING" } ] }
  ],
  "fieldOverrides": []
}
```
