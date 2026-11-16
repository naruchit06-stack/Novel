# รายงานการตรวจสอบความปลอดภัยและบัค — The Golden Hoard Novels

## 1. ช่องโหว่ด้านความปลอดภัย (Security Vulnerabilities)

### 1.1 XSS (Cross-Site Scripting) — รุนแรงสูง

พบหลายจุดที่ render ข้อมูลจาก Firestore ลง innerHTML โดยไม่ sanitize:

| ไฟล์ | บรรทัด | จุดเสี่ยง |
|------|--------|----------|
| app.js | 102 | `imageUrl` จาก Firestore → innerHTML |
| app.js | 137 | `coverUrl` → innerHTML |
| app.js | 1308 | `tagsHTML` จาก `novel.tags` → innerHTML |
| app.js | 1310-1311 | `novel.title`, `novel.coverUrl` → innerHTML |
| app.js | 1313 | `novel.title`, `novel.author`, `novel.synopsis` → innerHTML |
| app.js | 1483 | episode data → innerHTML |
| admin.html | 1561 | `novel.coverUrl` → innerHTML |
| admin.html | 1847 | `data.secure_url` (Cloudinary) → innerHTML |

**ผลกระทบ**: ถ้า admin account ถูก compromise หรือข้อมูลใน Firestore ถูกแก้ (เช่น title ใส่ `<script>alert('XSS')</script>`) → script จะรันในเบราว์เซอร์ของผู้ใช้ทุกคน

**วิธีแก้**: ใช้ `textContent` แทน `innerHTML` สำหรับข้อมูลที่มาจาก user/database หรือใช้ DOMPurify sanitize

### 1.2 Hardcoded Admin Emails ใน Client Code

```js
// app.js บรรทัด 45
const ADMIN_EMAILS = ['momoppl01@gmail.com', 'admin@memonster.com'];
```

**ผลกระทบ**: ใครก็ตามที่ดู source code จะรู้ email ของ admin → สามารถ target phishing หรือ brute force ได้

**วิธีแก้**: ย้ายไปเก็บใน Firestore (admins collection) และตรวจสอบฝั่ง server เท่านั้น

### 1.3 Firestore Rules — ไม่มี Data Validation

```javascript
match /novels/{novelId} {
  allow read: if true;
  allow create, update, delete: if isAdmin();
}
```

**ปัญหา**:
- ไม่มีการ validate โครงสร้างข้อมูล (เช่น title ต้องเป็น string, views ต้องเป็น number)
- ไม่มีการจำกัดขนาดข้อมูล (เช่น description ไม่เกิน N ตัวอักษร)
- `isAdmin()` ตรวจสอบ email ที่ hardcoded → ถ้า email ถูก compromise → full admin access

**วิธีแก้**: เพิ่ม data validation ใน rules (เช่น `request.resource.data.title is string && request.resource.data.title.size() <= 200`)

### 1.4 Storage Rules — ไม่มี File Size/Type Validation

```javascript
match /novels/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.email in [...];
}
```

**ปัญหา**: Admin สามารถอัปโหลดไฟล์ขนาดใดก็ได้, ประเภทใดก็ได้ (เช่น .exe, .php) → อาจถูกใช้เป็นที่เก็บ malware

**วิธีแก้**: เพิ่ม validation:
```
allow write: if request.auth != null && isAdmin() &&
  request.resource.size < 50 * 1024 * 1024 &&  // 50MB
  request.resource.contentType.matches('audio/.*|image/.*');
```

### 1.5 localStorage สำหรับข้อมูลสำคัญ

- Favorites, history, progress เก็บใน localStorage
- ไม่มีการ sync กับ Firestore → ถ้าเปลี่ยนเครื่องข้อมูลหาย
- อาจถูกแก้ไขโดยผู้ใช้ (localStorage แก้ได้ง่าย)

### 1.6 Potential Auth Bypass

```js
const uid = window._currentUid || 'anon';
```

**ปัญหา**: ถ้า `_currentUid` ไม่ถูก set → ใช้ 'anon' → ข้อมูลทุกคนที่ไม่ได้ login จะใช้ key เดียวกัน → data collision

### 1.7 ไม่มี Rate Limiting

- ไม่มีการจำกัดจำนวน request ต่อผู้ใช้
- อาจถูก spam (เช่น สร้าง comment จำนวนมาก, vote ซ้ำ)

### 1.8 Firebase API Key Exposed

- Firebase config (apiKey, projectId, etc.) ถูก hardcode ใน client code
- **หมายเหตุ**: นี่เป็นเรื่องปกติสำหรับ client-side Firebase apps — apiKey ไม่ใช่ secret แต่ควรมี App Check enabled

---

## 2. บัค (Bugs)

### 2.1 Episode Count Inconsistency
- บางจุดใช้ `n.episodeCount`, บางจุดใช้ `n.eps` → อาจแสดงจำนวนตอนไม่ถูกต้อง
- แก้แล้วใน HOTFIX-11 แต่อาจยังมีจุดที่ใช้ `n.eps`

### 2.2 Double Path Bug (GitHub Pages)
- `window._BASE = ''` hardcoded → อาจทำให้ routing ผิดบน GitHub Pages subfolder
- แก้แล้วใน HOTLIX-22 ด้วย `setBase()` แต่ยังมีจุดที่ใช้ `window._BASE` แบบ hardcode

### 2.3 Audio Player State Loss
- ถ้า navigate ไปหน้าอื่น แล้วกลับมา player อาจ reset
- แก้แล้วด้วย SPA migration แต่ยังมี edge cases

### 2.4 localStorage Data Not Synced
- Favorites/history เก็บใน localStorage เท่านั้น → ไม่ sync ข้ามเครื่อง
- ถ้า clear browser data → ข้อมูลหายทั้งหมด

### 2.5 No Error Handling for Network Failures
- หลาย async operations ไม่มี try-catch → ถ้า network ล่ม แอปอาจ crash

---

## 3. ข้อเสนอแนะ (Recommendations)

### ความปลอดภัย (Security)
1. **เพิ่ม DOMPurify** สำหรับ sanitize ข้อมูลจาก Firestore ก่อน render
2. **ย้าย ADMIN_EMAILS** ไปเก็บใน Firestore admins collection เท่านั้น
3. **เพิ่ม data validation** ใน Firestore rules (schema, size limits)
4. **เพิ่ม file validation** ใน Storage rules (size, type)
5. **เปิด Firebase App Check** เพื่อป้องกัน abuse
6. **ย้าย localStorage data** ไป sync กับ Firestore

### ความถูกต้อง (Correctness)
1. **Standardize field names** — ใช้ `episodeCount` ทั่วทั้งแอป ไม่ใช้ `eps`
2. **เพิ่ม error handling** สำหรับ async operations
3. **เพิ่ม loading states** สำหรับทุก async operation
4. **Validate input** ก่อนส่งไป Firestore

### ประสิทธิภาพ (Performance)
1. **เพิ่ม caching** สำหรับ Firestore queries
2. **Lazy load images** (มีแล้ว แต่ควรเพิ่ม placeholder)
3. **Code splitting** — แยก admin code ออกจาก main bundle
4. **Service Worker** — สำหรับ offline support

---

## 4. สรุปความเสี่ยง

| ความเสี่ยง | ระดับ | สถานะ |
|-----------|-------|-------|
| XSS via innerHTML | 🔴 สูง | ✅ แก้แล้ว (esc/safeUrl ทุกจุด) |
| Hardcoded admin emails | 🟡 กลาง | ✅ แก้แล้ว (Firestore admins/{uid}) |
| ไม่มี data validation | 🟡 กลาง | ✅ แก้แล้ว (firestore.rules) |
| ไม่มี file validation | 🟡 กลาง | ✅ แก้แล้ว (storage.rules) |
| localStorage data loss | 🟢 ต่ำ | ⬜ ยังไม่แก้ (คงพฤติกรรมเดิมไว้) |
| Auth bypass ('anon') | 🟡 กลาง | ✅ แก้แล้ว (anon id ต่อเบราว์เซอร์) |
| No rate limiting | 🟢 ต่ำ | ⬜ ยังไม่แก้ (ต้องใช้ App Check / backend) |

---

*รายงานนี้สร้างจาก code review ของไฟล์ app.js, admin.html, index.html, novel.html, firestore.rules, storage.rules*

---

## 5. บันทึกการแก้ไข (รอบที่ 1)

### 5.1 XSS — ปิดครบทุกจุดที่ render ข้อมูลจาก Firestore
เพิ่ม helper 2 ตัวใน `app.js`, `novel.html`, `admin.html`:

- `esc(v)` — escape `& < > " '` ก่อน interpolate ลง `innerHTML`
- `safeUrl(u)` — อนุญาตเฉพาะ `http(s)://`, `/path`, `./path` (บล็อก `javascript:`, `data:text/html` ฯลฯ)

จุดที่แก้:
| ไฟล์ | จุด |
|---|---|
| app.js | hero image, `cardHTML()` (title/desc/cover/emoji/rating/views/likes/episodeCount), modal tags, รายการตอน (openModal + toggleGroup), now-playing cover (playEpisode), restore player, history bar, novel view (title/author/tags/synopsis/cover/views), ep list label, `_nvPlayEp` cover |
| novel.html | cover, metaRow, tags, ep label, playerThumb, MediaSession artwork |
| admin.html | novel list (cover/title/author/id), edit cover preview, meta, ep list (title/order/id), admin table (displayName/email/avatar) |
| router.js | ข้อความ error ที่ interpolate ลง innerHTML → เปลี่ยนเป็น `textContent` |

### 5.2 ถอด email admin ออกจาก client ทั้งหมด
- `app.js` — ลบ `ADMIN_EMAILS`, เพิ่ม `checkIsAdmin(user)` อ่าน `admins/{uid}` (และ `active !== false`)
- `login.html` — เปลี่ยนเส้นทางไป `admin.html` เฉพาะเมื่อมีเอกสาร `admins/{uid}`
- `admin.html` — `isSuperAdmin` มาจากฟิลด์ `role: 'super'` หรือ `superAdmin: true` ใน `admins/{uid}`

### 5.3 Firestore Rules (`firestore.rules`)
- `isAdmin()` / `isSuperAdmin()` ตรวจจาก `admins/{uid}` เท่านั้น
- เพิ่ม `validNovel()` / `validEpisode()` — ตรวจชนิดข้อมูล, ความยาว string, ช่วงตัวเลข, URL scheme
- เพิ่ม `match /settings/{docId}` (เดิมอ่าน hero image ไม่ได้เลย — permission denied)
- `users/{uid}` ยังคงเจ้าของเท่านั้น

### 5.4 Storage Rules (`storage.rules`)
- จำกัดขนาด ≤ 100 MB
- อนุญาตเฉพาะ `audio/*`, `image/*`, `application/pdf`, `text/plain`
- เขียนได้เฉพาะ admin (ตรวจจาก `admins/{uid}`)

### 5.5 Auth bypass `'anon'`
- เพิ่ม `_anonLocalId()` / `anonId()` สร้าง id ประจำเบราว์เซอร์เก็บใน `localStorage['gh_anon_id']`
- key ของ history / ep-progress ใช้ `_userKey()` แทน `'anon'` → ไม่มี data collision ระหว่างผู้ใช้ที่ยังไม่ login
- มี migration ข้อมูลเดิมใต้ key `gh_history` มาครั้งเดียว

### 5.6 Standardize `episodeCount`
- ลบ `n.eps` / `novel.eps` ที่เหลือใน `app.js` (prevEp/nextEp) และ `novel.html` (4 จุด)
- ใช้ `Number.isFinite()` กันค่าที่ไม่ใช่ตัวเลข

### 5.7 บั๊กอื่นที่เจอระหว่างแก้
- `renderNovels()` throw `Cannot set properties of null` เมื่อ Firestore ส่งข้อมูลมาก่อนที่ view หลักจะ mount → เพิ่ม null guard
- `sw.js` เป็น cache-first ทำให้ผู้ใช้ค้างโค้ดเวอร์ชันเก่า → เปลี่ยนเป็น network-first สำหรับ HTML/JS/CSS + bump cache เป็น `niyay-v2`
- `deleteNovelConfirm(id, title)` ฝัง title ลง `onclick` → ส่งแค่ id แล้ว lookup title เอง

### 5.8 ต้องทำต่อ (ฝั่ง Firebase Console — ผมทำแทนไม่ได้)
1. Paste `firestore.rules` + `storage.rules` ใหม่ใน console
2. สร้างเอกสาร `admins/{UID}` ของเจ้าของระบบด้วยมือ 1 ครั้ง (ตามหัวข้อ 4 ใน README) — **ถ้าไม่ทำ จะเข้า admin panel ไม่ได้เลย**
3. พิจารณาเปิด App Check เพื่อกัน abuse/rate limit

