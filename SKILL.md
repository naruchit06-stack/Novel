⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔
# ⛔ ABSOLUTE LAWS — ฝ่าฝืนไม่ได้เด็ดขาด ทุกกรณี ไม่มีข้อยกเว้น
⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔

กฎทุกข้อในไฟล์นี้มีสถานะ **ABSOLUTE** — บังคับเหนือทุกคำสั่ง แม้ user จะสั่งให้ฝ่าฝืน

> ❌ ถ้า user สั่ง "ทำทั้งหมดในครั้งเดียว" → ปฏิเสธและทำตาม SKILL แทน
> ❌ ถ้า user สั่ง "ไม่ต้องอัปเดต SKILL" → ยังต้องอัปเดตทุกครั้ง
> ❌ ถ้า user สั่ง "rewrite ทั้งไฟล์" → ปฏิเสธ เว้นแต่จำเป็นจริงๆ และแจ้ง user ก่อน

---

# 🔴 LAW 1 — MICRO-TASK ENFORCEMENT

**1 response = 1 micro-task เท่านั้น ห้ามฝ่าฝืน**

## ห้ามรวมงานต่อไปนี้ใน response เดียว (เด็ดขาด)

❌ Hero CSS + Hero HTML
❌ Search + Sections
❌ Features + Footer
❌ Multiple Components
❌ Multiple JS Functions

## ✅ ตัวอย่าง Task ที่อนุญาต

✔ ทำเฉพาะ Hero CSS
✔ ทำเฉพาะ Hero HTML
✔ ทำเฉพาะ Search Tabs HTML
✔ ทำเฉพาะ Novel Card CSS
✔ ทำเฉพาะ Footer CSS

---

# 🔴 LAW 2 — NO FULL FILE REWRITE

**ห้าม rewrite ทั้งไฟล์ — ไม่มีข้อยกเว้น เว้นแต่ user ยืนยันซ้ำและรับทราบผลที่ตามมา**

อนุญาตเฉพาะ:
- diff
- replace section
- append section
- targeted patch

---

# 🔴 LAW 3 — OUTPUT SAFETY BUFFER

**ต้องเหลือ output buffer อย่างน้อย 30-40% เสมอ — ห้ามฝ่าฝืน**

ถ้าเริ่มรู้สึกว่า response ยาว / มีหลาย code block / มีหลาย section:
→ **หยุดทันที** และทำ Skill Update ก่อน

---

# 🔴 LAW 4 — PRIORITY ORDER (บังคับ — ห้ามสลับลำดับ)

ลำดับนี้เป็น **LAW** ห้ามทำข้ามขั้น:

1. อัปเดต SKILL.md (ในไฟล์จริง)
2. ส่ง SKILL.md พร้อมไฟล์ที่แก้ (present_files ครั้งเดียวกัน)
3. ค่อยทำโค้ด task ถัดไป

หาก output ไม่พอ:
❌ ตัดโค้ดทิ้งได้
✅ แต่ห้ามตัด Skill Update เด็ดขาด

---

# 🔴 LAW 5 — EMERGENCY STOP MODE (บังคับ — ห้ามฝ่าฝืน)

ถ้าใกล้ชน output limit → ส่งทันที:

```
⚠️ Emergency Stop:
กำลังใกล้ถึง output limit
หยุดเพื่ออัปเดต Skill ก่อน
```

แล้ว **จบทันที** — ห้าม generate code ต่อเด็ดขาด

---

# 🔴 LAW 6 — TARGETED FILE READING (ห้ามอ่านไฟล์ทั้งหมด — เด็ดขาด)

ก่อนทำงานใดๆ อ่านเฉพาะส่วนที่เกี่ยวข้อง:

- ทำ CSS → อ่านเฉพาะ section CSS ที่เกี่ยวข้อง
- ทำ HTML → อ่านเฉพาะ block HTML ที่ต้องแก้
- ทำ JS → อ่านเฉพาะ function ที่ต้องแก้

❌ ห้าม view/read ทั้งไฟล์ เว้นแต่ task นั้นต้อง context ทั้งหมดจริงๆ
✅ ใช้ view_range ระบุบรรทัดที่ต้องการเสมอ

---

# 🔴 LAW 7 — PRE-CODE CHECKLIST (บังคับก่อนเขียนโค้ดทุกครั้ง — ห้ามข้าม)

ก่อนเขียนโค้ดใดๆ ต้องผ่านทุกข้อ:

- [ ] อ่าน SKILL.md ซ้ำแล้วใช่ไหม?
- [ ] Task นี้เป็น micro-task เดียวใช่ไหม?
- [ ] ไม่ได้ rewrite ทั้งไฟล์ใช่ไหม?
- [ ] Output buffer ยังเหลือ 30-40% ใช่ไหม?
- [ ] SKILL.md อัปเดตแล้วใช่ไหม?

❌ ถ้าข้อไหนไม่ผ่าน → **หยุดทันที** อัปเดต SKILL.md ก่อน ห้ามเขียนโค้ดต่อ
✅ ถ้าผ่านทุกข้อ → เริ่มเขียนโค้ดได้

---

# 🔴 LAW 8 — MID-CODE CHECKPOINT (บังคับระหว่างเขียนโค้ด — ห้ามข้าม)

ทุกๆ ~20 บรรทัด หรือเมื่อเริ่ม code block ใหม่ → **หยุดเช็ค**:

- [ ] ยังอยู่ใน micro-task เดิมใช่ไหม?
- [ ] Output ที่ใช้ไปยังไม่เกิน 60% ใช่ไหม?
- [ ] โค้ดที่เขียนยังเป็น patch/section ไม่ใช่ full file ใช่ไหม?

❌ ถ้าข้อไหนไม่ผ่าน → **Emergency Stop ทันที** ห้ามเขียนต่อ
✅ ถ้าผ่าน → เขียนต่อได้อีก ~20 บรรทัด แล้วเช็คใหม่

## ⛔ ทุกๆ 100 บรรทัด — บังคับอ่านกฎทุกข้อซ้ำ

เมื่อเขียนโค้ดครบทุกๆ 100 บรรทัด → หยุดและอ่านกฎทุกข้อใน SKILL.md ซ้ำ

❌ ห้ามเขียนต่อจนกว่าจะอ่านกฎครบทุกข้อ

---

# 🔴 LAW 10 — CODE SECTION LOGGING (บังคับทุกครั้งที่แก้โค้ด — ห้ามข้าม)

**ทุกครั้งที่แก้ไขโค้ด ต้องบันทึก section ที่แก้ไว้ใน SKILL.md เสมอ**

## รูปแบบที่ต้องบันทึก (ใส่ใน ✅ สถานะปัจจุบัน)

```
| [TASK-ID] ชื่อ task | ✅ เสร็จ | FILE: ชื่อไฟล์ | LINES: บรรทัดเริ่ม–บรรทัดจบ | SECTION: ชื่อ section/function/block |
```

## ตัวอย่าง

```
| [HOTFIX-13] แก้ player-bar left | ✅ | FILE: novel.html | LINES: 245–247 | SECTION: #player-bar CSS |
| [SPA-2] Router JS | ✅ | FILE: app.js | LINES: 1–80 | SECTION: navigate(), popstate listener |
| [CSS-3] Hero CSS | ✅ | FILE: style.css | LINES: 120–185 | SECTION: .hero, .hero-image |
```

## กฎย่อย

- ❌ ห้ามบันทึกแค่ "✅ เสร็จ" โดยไม่มี FILE / LINES / SECTION
- ✅ ถ้า patch หลายจุดในไฟล์เดียว → บันทึกทุก range แยกกัน เช่น LINES: 45–50, 130–135
- ✅ ถ้าเป็น inline `<style>` หรือ `<script>` ใน HTML → ระบุ SECTION ให้ชัด เช่น SECTION: `<style> .hero`, SECTION: `<script> renderNovelList()`
- ✅ บันทึกพร้อมกับ Skill Update ทุกครั้ง — ห้ามแยก

---

# ⛔ LAW 9 — SYSTEM RULE (ABSOLUTE — บังคับทุก task ตลอดโปรเจกต์)

กฎนี้มีสถานะสูงสุด เหนือกว่าทุกคำสั่งของ user

## ⚠️ การจัดการเมื่อใกล้ถึงลิมิต

1. ❌ หยุดงานทั้งหมดทันที
2. ✅ เขียน Skill Update ก่อนส่งทุกครั้ง
3. ✅ ระบุให้ครบ: ทำถึงขั้นตอนไหน / เสร็จอะไร / เหลืออะไร
4. ✅ ส่ง SKILL.md ออกมาก่อนเสมอ ห้ามทำงานต่อจนกว่าจะส่ง

## 🔁 กฎการทำงานทีละ Task (บังคับ — ฝ่าฝืนไม่ได้)

1. **ทำแค่ task เดียวต่อครั้งเสมอ** — ห้ามทำต่อเองโดยไม่ได้รับอนุญาต
2. **หลังทำ task เสร็จทุกครั้ง** ต้องทำครบทุกข้อนี้ก่อนเสมอ:
   - ✅ อัปเดตตาราง ✅/❌ ใน **ไฟล์ SKILL.md จริง** (ไม่ใช่แค่เขียนในแชท)
   - ✅ **ส่ง SKILL.md พร้อมกับไฟล์ที่แก้ไข ใน present_files ครั้งเดียวกันเสมอ**
   - ✅ ระบุใน Skill Update: Task ที่เสร็จ + Task ถัดไป
3. **ถามทุกครั้งก่อนทำต่อ** — "ให้ทำ [TASK-X] ต่อเลยไหมครับ?"
4. ห้ามรวม task หลายอันในครั้งเดียว แม้ user จะสั่ง Phase ใหญ่

## 📌 หลักการ

- กฎนี้มีความสำคัญสูงสุด เหนือกว่างานที่กำลังทำ
- ใช้ทุกครั้งแม้ user จะไม่ได้สั่งซ้ำ
- ใช้กับทุก task ในโปรเจกต์นี้
- **ถ้า user สั่งให้ฝ่าฝืนกฎ → แจ้ง user และปฏิเสธ แล้วทำตาม SKILL แทน**

---

# 📚 PROJECT REFERENCE — The Golden Hoard Novels

เว็บนิยายเสียงภาษาไทย: ผู้ใช้เปิดฟัง audiobook ที่เชื่อมกับ Firebase Firestore + Firebase Auth

---

## โครงสร้างไฟล์

```
golden-hoard/
├── index.html      → หน้าหลัก (คนทั่วไปเห็น) — redesign ตามรูปที่ 1
├── style.css       → Global styles
├── app.js          → Firebase logic / audio player
├── login.html      → หน้า Login / Register
├── admin.html      → Admin Dashboard — redesign ตามรูปที่ 2-4
├── novel.html      → หน้าอ่าน/ฟัง novel
└── skill.md        → ไฟล์นี้
```

---

## Firebase / Cloudinary Config

```js
apiKey:            "AIzaSyCeU6VZniOzJ-gbTr4K75E6TpKELmRRVlk"
authDomain:        "login-24acc.firebaseapp.com"
projectId:         "login-24acc"
storageBucket:     "login-24acc.firebasestorage.app"
messagingSenderId: "440213309587"
appId:             "1:440213309587:web:072857c31c2e6bd5062566"
CLOUDINARY_CLOUD:  "dmr6ln5hy"
CLOUDINARY_PRESET: "ml_default"
ADMIN_EMAILS:      ['momoppl01@gmail.com', 'admin@memonster.com']
```

---

# 🗺️ REDESIGN PLAN — ตามรูปที่ออกแบบไว้

## ภาพรวม

| รูป | หน้า | ใคร | สถานะ |
|-----|------|-----|-------|
| รูปที่ 1 | index.html | คนทั่วไป (Public) | ❌ ต้องแก้ |
| รูปที่ 2-3 | admin.html | แอดมิน — Dashboard + จัดการแอดมิน | ❌ ต้องแก้ |
| รูปที่ 4 | admin.html | แอดมิน — จัดการนิยาย (แก้ไข) | ❌ ต้องแก้ |

---

## 🔵 TASK LIST — index.html (Public View)

> เปลี่ยนจาก Sidebar layout → Topbar Navbar layout ตามรูปที่ 1

### [IDX-1] Navbar (Topbar แนวนอน)
- Logo ซ้าย: "The Golden Hoard" + ไอคอนมงกุฎ
- เมนู: หน้าหลัก | ตลาดทั้งหมด | ยอดนิยม | หมวดหมู่
- ขวา: Search box | ปุ่ม "เข้าสู่ระบบ" (outline) | ปุ่ม "สมัครสมาชิก" (แดง)
- เมื่อ login แล้ว: ซ่อนปุ่ม login/register → แสดง user avatar + dropdown

### [IDX-2] Hero Section (Banner ใหญ่)
- พื้นหลังมืด + ภาพตัวละครขนาดใหญ่ขวามือ (ใช้รูปปกนิยายล่าสุด หรือ placeholder)
- ซ้าย: "ยินดีต้อนรับสู่" (เล็ก) + "The Golden Hoard" (ใหญ่ สีแดง+ขาว) + คำอธิบาย
- ปุ่ม: "เริ่มอ่านเลย 📖" (แดง) | "ดูนิยายทั้งหมด →" (outline)

### [IDX-3] Search + Filter Tabs
- Search bar กลางหน้า (ใต้ hero)
- Tabs: 🔥 ยอดนิยม | ⭐ มาใหม่ | 🕐 อัปเดตล่าสุด | 🔲 ทั้งหมด

### [IDX-4] Section "นิยายยอดนิยม"
- หัวข้อ + ลิงก์ "ดูทั้งหมด →"
- Sub-tabs: 7 วัน | 30 วัน | ตลอดกาล
- Card แบบใหม่: รูปปก | ชื่อ | Rating ⭐ | คำอธิบาย | จำนวนตอน | views | ปุ่ม "อ่านต่อ"
- Layout: 2 คอลัมน์ card แนวนอน (แบบ list card ไม่ใช่ grid เล็ก)

### [IDX-5] Section "นิยายล่าสุดที่อัปเดต"
- หัวข้อ + ลิงก์ "ดูทั้งหมด →"
- Card เหมือน IDX-4

### [IDX-6] Feature Highlights (4 ช่อง)
- 📚 นิยายคุณภาพ — คัดสรรมาดีๆ จากนักเขียนคุณภาพ
- ⚡ อัปเดตไว — อัปเดตตอนใหม่ทุกวัน ไม่พลาดทุกเรื่อง
- 🛡️ ปลอดภัย 100% — ระบบปลอดภัย ข้อมูลปลอดรั่วไหล
- 📱 อ่านได้ทุกอุปกรณ์ — รองรับทุกแพลตฟอร์ม

### [IDX-7] Footer
- ซ้าย: Logo + คำอธิบาย + Social icons (Facebook, Discord, Twitter, YouTube)
- กลาง: เมนู (หน้าหลัก, ตลาดทั้งหมด, ยอดนิยม, หมวดหมู่)
- กลางขวา: ช่วยเหลือ (คำถามที่พบบ่อย, ติดต่อเรา, นโยบาย, ข้อกำหนด)
- ขวา: กรอกอีเมลรับข่าวสาร + ปุ่มส่ง

### [IDX-8] ลบ Sidebar ออก + CSS Cleanup
- ลบ .sidebar, .sidebar-nav, sidebar-overlay ออกจาก index.html
- ลบ CSS sidebar ออกจาก style.css (เก็บไว้ใช้ใน admin ถ้าต้องการ)
- Topbar sticky แทน

---

## 🟡 TASK LIST — admin.html (Admin View)

> ตามรูปที่ 2, 3, 4

### [ADM-1] Dashboard Stats Bar (4 การ์ด)
- นิยายทั้งหมด (สีแดง)
- ตอนทั้งหมด (สีเขียว)
- ยอดวิวรวม (สีน้ำเงิน)
- สมาชิก (สีม่วง)
- ดึงข้อมูลจาก Firestore จริง

### [ADM-2] Layout แบ่ง 2 คอลัมน์
- **ซ้าย**: หน้านิยาย (Manage Novel) — รายการนิยายทั้งหมด
- **ขวา**: ฟอร์มแก้ไข / จัดการแอดมิน (toggle ได้)

### [ADM-3] Novel List (ซ้าย)
- ปุ่ม "+ เพิ่มนิยาย" (สีน้ำเงิน) | ปุ่ม "👑 จัดการแอดมิน" (outline สีทอง)
- Search box + dropdown ฟิลเตอร์สถานะ
- Card แต่ละนิยาย: รูปปก | ชื่อ | Badge สถานะ | ผู้แต่ง | จำนวนตอน | views | ปุ่ม ✏️แก้ไข | 🗑️ลบ
- Pagination ด้านล่าง

### [ADM-4] Novel Edit Form (ขวา — เมื่อกด แก้ไข)
- Breadcrumb: หน้ารายนิยาย / จัดการนิยาย / [ชื่อนิยาย]
- แสดงรูปปก + Badge สถานะ
- ฟิลด์: ชื่อเรื่อง | ผู้แต่ง | คำอธิบาย | สถานะ (dropdown)
- ปุ่ม "เปลี่ยนรูปปก" | "บันทึกการแก้ไข" (เหลือง) | "ยกเลิก"
- ปุ่ม "ดูหน้าบ้าน" | "ลบเรื่องนี้" (แดง) ขวาบน

### [ADM-5] Episode List (ในฟอร์ม Novel)
- หัว: "รายการตอน (N)" + ปุ่ม "+ เพิ่มตอน"
- แสดงกลุ่มตอน: accordion "ตอนที่ 1-N"
- แต่ละตอน: ▶ ชื่อไฟล์ | 0:00 | ✏️ แก้ไขตอน | 🗑️ ลบตอน
- ตอนที่ไม่มีไฟล์แสดง 🔒

### [ADM-6] จัดการแอดมิน (ขวา — เมื่อกด "จัดการแอดมิน") — Super Admin Only
- ฟอร์ม: ชื่อแอดมิน | Email | รหัสผ่าน | ระดับสิทธิ์ (Admin/Moderator)
- ปุ่ม "+ เพิ่มแอดมิน" | "ล้างฟอร์ม"
- ตารางรายชื่อแอดมิน: Avatar | ชื่อ | อีเมล | ระดับ (badge สี) | ปุ่มลบ
- Super Admin ลบไม่ได้ (protected)

### [ADM-7] Topbar Admin
- ซ้าย: ไอคอน + "แดชบอร์ด" + คำบรรยาย
- ขวา: ปุ่ม "🌐 ดูหน้าเว็บ" → เปิด index.html

---

## 🟢 TASK LIST — style.css

### [CSS-1] CSS Variables — เพิ่มสำหรับ admin dark theme
- เพิ่ม --admin-bg, --admin-surface, --admin-card-* สำหรับ dashboard dark mode

### [CSS-2] Navbar (แทน Sidebar)
- .navbar { position: sticky; top: 0; ... }
- .nav-logo, .nav-links, .nav-actions
- .nav-links a — hover underline สีแดง
- Active state

### [CSS-3] Hero Section
- .hero { min-height: 60vh; background: dark; position: relative; ... }
- .hero-content (ซ้าย) | .hero-image (ขวา)
- Responsive: stack บน mobile

### [CSS-4] Novel Card (แบบใหม่ — horizontal)
- .novel-card-h { display: flex; gap: 16px; ... }
- .novel-card-cover (square), .novel-card-body
- Rating badge, status badge

### [CSS-5] Feature Highlights
- .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); ... }
- .feature-item { icon + title + desc }

### [CSS-6] Footer
- .footer { background: dark; ... }
- 4 คอลัมน์ grid

### [CSS-7] Admin Dashboard Cards
- .stat-card { gradient background; ... }
- .stat-card-novels (red), -eps (green), -views (blue), -members (purple)

### [CSS-8] Admin Novel List
- .admin-novel-card { flex; gap; border; ... }
- Status badge colors

### [CSS-9] Admin Form Panel
- .admin-form-panel { ... }
- Breadcrumb style
- Episode accordion

---

## 🔴 TASK LIST — app.js

### [JS-1] เปลี่ยน onAuthStateChanged → ใช้กับ Navbar แทน Sidebar
- ซ่อน/แสดง .nav-login-btn, .nav-register-btn
- แสดง .nav-user-menu เมื่อ login

### [JS-2] renderNovelCards() — แบบ horizontal card
- ใช้ template ใหม่ .novel-card-h แทน .novel-card เดิม

### [JS-3] filterNovels() — ใช้ filter tabs (ยอดนิยม/มาใหม่/อัปเดต/ทั้งหมด) จริง

### [JS-4] switchTab() — แก้ให้ทำงาน + re-render grid ถูกต้อง

---

## 🔵 TASK LIST — admin.js (ใหม่ หรือแก้ใน admin.html)

### [ADM-JS-1] โหลด stats จาก Firestore จริง
- นับ novels, นับ episodes รวม, นับ views รวม, นับ users

### [ADM-JS-2] renderNovelList() — แสดงรายการนิยายซ้าย + pagination

### [ADM-JS-3] openEditForm(novelId) — เปิดฟอร์มแก้ไขขวา

### [ADM-JS-4] toggleAdminPanel() — switch ระหว่าง Edit Form และ Admin Management

### [ADM-JS-5] createAdmin() — สร้าง user ใหม่ผ่าน Firebase Auth (Email/Password)

### [ADM-JS-6] renderAdminList() — แสดงรายชื่อแอดมิน + ระดับสิทธิ์

---

## 📋 ลำดับการทำงานที่แนะนำ

```
Phase 1 — index.html + style.css (Public หน้าใหม่)
  1. [CSS-2] Navbar CSS
  2. [IDX-1] Navbar HTML
  3. [CSS-3] Hero CSS
  4. [IDX-2] Hero HTML
  5. [CSS-4] Novel Card CSS (horizontal)
  6. [IDX-3][IDX-4][IDX-5] Search + Sections
  7. [CSS-5][CSS-6] Features + Footer CSS
  8. [IDX-6][IDX-7] Features + Footer HTML
  9. [JS-1][JS-2][JS-3][JS-4] แก้ app.js ให้ทำงานกับ layout ใหม่
  10. [IDX-8] ลบ sidebar ออก + cleanup CSS

Phase 2 — admin.html (Admin Dashboard)
  11. [CSS-7][CSS-8][CSS-9] Admin CSS
  12. [ADM-1][ADM-7] Stats Bar + Topbar
  13. [ADM-2][ADM-3] Layout + Novel List
  14. [ADM-4][ADM-5] Edit Form + Episode List
  15. [ADM-6] Admin Management Panel
  16. [ADM-JS-1~6] Logic ทั้งหมด
```

---

## ✅ สถานะปัจจุบัน

| Task | สถานะ |
|------|--------|
| [CSS-2] Navbar CSS | ✅ เสร็จ |
| [IDX-1] Navbar HTML | ✅ เสร็จ |
| [CSS-3] Hero CSS | ✅ เสร็จ |
| [IDX-2] Hero HTML | ✅ เสร็จ |
| [CSS-4] Novel Card CSS | ✅ เสร็จ |
| [IDX-3][IDX-4][IDX-5] Search + Sections | ✅ เสร็จทั้งหมด |
| [CSS-5][CSS-6] Features + Footer CSS | ✅ เสร็จทั้งหมด |
| [IDX-6][IDX-7] Features + Footer HTML | ✅ เสร็จทั้งหมด |
| [JS-1][JS-2][JS-3][JS-4] app.js | ✅ เสร็จทั้งหมด |
| [IDX-8] ลบ sidebar + cleanup | ✅ เสร็จ |
| [HOTFIX-1] แก้ปุ่ม "เริ่มอ่านเลย" → "เริ่มฟังเลย 🎧" | ✅ เสร็จ |
| [HOTFIX-2] Hero Banner อัพโหลดรูปจาก Admin (Cloudinary + Firestore settings/hero) | ✅ เสร็จ |
| [CSS-7] Admin Dashboard Cards CSS | ✅ เสร็จ |
| [ADM-7] Topbar Admin HTML | ✅ เสร็จ |
| [ADM-1] Dashboard Stats Bar HTML | ✅ เสร็จ |
| [ADM-JS-1] โหลด stats จาก Firestore จริง | ✅ เสร็จ |
| [ADM-2] Layout แบ่ง 2 คอลัมน์ | ✅ เสร็จ |
| [CSS-8] Admin Novel List CSS | ✅ เสร็จ |
| [CSS-9] Admin Form Panel CSS | ✅ เสร็จ |
| [ADM-3] Novel List (ซ้าย) | ✅ เสร็จ |
| [ADM-4] Novel Edit Form (ขวา) | ✅ เสร็จ |
| [ADM-5] Episode List | ✅ เสร็จ |
| [ADM-6] จัดการแอดมิน Panel | ✅ เสร็จ |
| [ADM-JS-2] renderNovelList() + pagination | ✅ เสร็จ |
| [ADM-JS-3] openEditForm(novelId) | ✅ เสร็จ |
| [ADM-JS-4] toggleAdminPanel() | ✅ เสร็จ |
| [ADM-JS-5] createAdmin() | ✅ เสร็จ |
| [ADM-JS-6] renderAdminList() | ✅ เสร็จ |
| **[REDESIGN] admin.html — Redesign ตามรูปใหม่ทั้งไฟล์** | ✅ เสร็จ |
| **[IDX-8 cleanup]** style.css ลบ sidebar CSS ทั้งหมด (sidebar, sidebar-overlay, sidebar-nav, sidebar-bottom, theme-toggle, nav-item, nav-divider, logo-icon, logo-text) + แก้ now-playing left:0 | ✅ เสร็จ |
| **[APP-BADGE]** cardHTML() ย้าย badge ขึ้นซ้อนบนรูปปก (.novel-card-cover-badge) | ✅ เสร็จ |
| **[ADM-EP-MODAL]** เพิ่มตอน + แก้ไขตอน modal จริง (แทนที่ alert stub) — Cloudinary upload + Firestore save | ✅ เสร็จ |
| **[HOTFIX-3]** firestore.rules — เพิ่ม episodes subcollection rule | ✅ เสร็จ |
| **[HOTFIX-4]** card ทั้งใบ clickable — ลบปุ่ม "อ่านต่อ" (app.js + style.css) | ✅ เสร็จ |
| **[HOTFIX-5]** login.html — redirect() ใช้ absolute URL หลัง Google login | ✅ เสร็จ |
| **[HOTFIX-6]** style.css — .nav-mobile-drawer hidden by default (display:none) แก้ซ้อน navbar บน desktop | ✅ เสร็จ |
| **[IDX-NEW-1]** Section "ประวัติการดูล่าสุด" ใน index.html (reading history bar — แสดงเมื่อ login) | ✅ เสร็จ (มีอยู่แล้ว) |
| **[IDX-NEW-2]** CSS สำหรับ history bar ใน style.css | ✅ เสร็จ (มีอยู่แล้ว) |
| **[IDX-NEW-3]** JS: saveHistory() + renderHistory() ใน app.js | ✅ เสร็จ |
| **[NOVEL-1]** novel.html — Redesign layout ใหม่ทั้งหมด ตามรูป (ซ้าย: cover+info, ขวา: รายการตอน+comment) | ✅ เสร็จ | FILE: app.js | LINES: 804–833 | SECTION: renderNovelView() innerHTML — nv-cols, nv-col-left, nv-col-right |
| **[NOVEL-1-CSS]** style.css — novel view CSS (.nv-cols, .nv-col-left, .nv-col-right, .ep-item, .nv-cover ฯลฯ) | ✅ เสร็จ | FILE: style.css | LINES: ท้ายไฟล์ | SECTION: NOVEL VIEW 2-column layout |
| **[NOVEL-2]** novel.html — Audio Player bar ด้านล่าง (sticky) ตามรูป | ✅ เสร็จ | FILE: app.js | LINES: 906–926 | SECTION: _nvPlayEp() — แก้จาก #player-bar → #nowPlaying, #npTitle, #npEp, #npCover, #npExpandTitle, #npExpandEp, #npExpandCover |
| **[NOVEL-3]** novel.html — Episode list: ทั้งหมด/ตอนล่าสุด tabs + sort dropdown | ✅ เสร็จ | FILE: app.js | LINES: 825–835, 857–910 | SECTION: nv-ep-header HTML, _nvBuildEpList(), _nvSetTab(), _nvToggleSort() | FILE: style.css | LINES: ท้ายไฟล์ | SECTION: .nv-ep-header, .nv-ep-controls, .nv-tab, .nv-sort-btn |
| **[NAV-FIX-1]** index.html — เปลี่ยน nav links เป็น หน้าแรก / นิยายทั้งหมด / รายการโปรด (desktop + mobile) | ✅ เสร็จ |
| **[HOTFIX-7]** firestore.rules — แก้ isAdmin() function รองรับ admins collection (ไม่ใช่แค่ 2 email hardcode) เพื่อให้ admin ที่สร้างใหม่เพิ่มตอนได้ | ✅ เสร็จ |
| **[LOGIN-RESP]** login.html — เพิ่ม responsive media queries (mobile: stack vertical, ซ่อน left-panel ให้กระชับ) | ✅ เสร็จ |
| **[NOVEL-RESP]** novel.html — redesign เปลี่ยน sidebar → topbar navbar + mobile responsive ครบ | ✅ เสร็จ |
| **[NOVEL-NAVBAR]** novel.html — เปลี่ยน sidebar → topbar navbar เหมือน index.html + แก้ "ตลาดทั้งหมด" → "นิยายทั้งหมด" ใน footer index.html | ✅ เสร็จ |
| **[HOTFIX-8]** admin.html — แก้ saveEpisode: เพิ่ม addDoc ใน import + เปลี่ยน setDoc(doc(collection(...))) → addDoc(collection(...)) แก้ Missing permissions error | ✅ เสร็จ |
| **[HOTFIX-9]** novel.html — แก้ import เพิ่ม collection/getDocs/query/orderBy + โหลด episodes จาก subcollection แทน audioFiles array | ✅ เสร็จ |
| **[HOTFIX-10]** firestore.rules — deploy rules ใหม่ เพิ่ม isAdmin() function + episodes subcollection rule + admins collection rule | ✅ เสร็จ |
| **[HOTFIX-11]** app.js — แก้ `n.eps` → `n.episodeCount` ครบทั้ง 3 จุด (cardHTML, modal epCount, group epCount) | ✅ เสร็จ |
| **[HOTFIX-12]** admin.html — แก้ deleteEpisode เพิ่ม updateDoc ลด episodeCount เมื่อลบตอน | ✅ เสร็จ |
| **[HOTFIX-13]** novel.html — แก้ `#player-bar` `left:200px` → `left:0` (ค้างจาก sidebar เดิม) | ✅ เสร็จ |
| **[ROUTER-HOTFIX-1]** router.js — เพิ่ม BASE_PATH auto-detect + _stripBase() รองรับ GitHub Pages sub-folder `/Novel/` | ✅ เสร็จ | FILE: router.js | LINES: 20–57 | SECTION: BASE_PATH const, _stripBase(), navigate(), initRouter(), popstate |
| **[HOTFIX-14]** app.js — แก้ cardHTML + history-item ใช้ `_spaNavigate()` แทน `novel.html?id=` | ✅ เสร็จ | FILE: app.js | LINES: 132–138, 731, 1060–1070 | SECTION: cardHTML(), history-item onclick, _spaNavigate() helper |
| **[NOVEL-HOTFIX]** novel.html — แก้ redirect ใช้ base auto-detect แทน hardcode `/index.html` | ✅ เสร็จ | FILE: novel.html | LINES: 8–16 | SECTION: redirect script |
| **[HOTFIX-15]** 404.html — แก้ redirect auto-detect BASE_PATH (`/Novel`) แทน hardcode `/?_r=` รองรับ GitHub Pages sub-folder | ✅ เสร็จ | FILE: 404.html | LINES: 8–19 | SECTION: redirect script |
| **[HOTFIX-17]** index.html + admin.html — แก้ relative path `admin.html`/`index.html` → `./admin.html`/`./index.html` แก้ `/Novel/Novel/` double path | ✅ เสร็จ | FILE: index.html | LINES: 45 | SECTION: navAdminBtn href | FILE: admin.html | LINES: 1118, 1375 | SECTION: btn-view-web href, location.href |
| **[HOTFIX-18]** router.js — แก้ BASE_PATH IIFE ใช้ script[src*="router.js"] detect แทน window.location.pathname — แก้ bug URL ซ้ำ `/Novel/Novel/Novel/` เมื่อ navigate | ✅ เสร็จ | FILE: router.js | LINES: 27–47 | SECTION: BASE_PATH IIFE |
| **[HOTFIX-19]** index.html + admin.html — แก้ href `./admin.html` / `./index.html` → JS onclick ที่ detect BASE จาก script[src*="app.js"] — แก้ path ซ้ำเมื่ออยู่ใน SPA route | ✅ เสร็จ | FILE: index.html | LINES: 45 | SECTION: navAdminBtn onclick | FILE: admin.html | LINES: 1118, 1375 | SECTION: btn-view-web onclick, auth guard redirect |
| **[HOTFIX-22]** router.js + app.js — แทน BASE_PATH IIFE ที่พัง (script tag หาไม่เจอใน dynamic import) ด้วย import.meta.url default + export setBase() / app.js เรียก setBase(window._BASE) ก่อน initRouter | ✅ เสร็จ | FILE: router.js | LINES: 27–40 | SECTION: BASE_PATH let + setBase() export | FILE: app.js | LINES: 28, 1001–1006 | SECTION: window._BASE, setBase() call |
| **[HOTFIX-23]** app.js — แก้ปุ่มย้อนกลับใน renderNovelView + error state เปลี่ยน `import('./router.js').then(...)` → `window.handleRoute('/')` แก้กด back ไม่ได้บน GitHub Pages | ✅ เสร็จ | FILE: app.js | LINES: 790, 832 | SECTION: nv-back-btn onclick, error state back btn |
| **[HOTFIX-24a]** admin.html — เพิ่ม getAudioDuration() อ่าน duration จาก file ก่อน upload + save `duration` field ลง Firestore ใน saveEpisode() | ✅ เสร็จ | FILE: admin.html | LINES: 1691–1706 | SECTION: saveEpisode() — getAudioDuration helper + epData.duration |
| **[HOTFIX-24b]** app.js — lazy load duration จาก Audio.onloadedmetadata สำหรับ ep เก่าที่ไม่มี field duration + cache ไว้ใน af object | ✅ เสร็จ | FILE: app.js | LINES: 930–942 | SECTION: _nvBuildEpList() — lazy Audio fetch per ep |
| **[PLAYER-1]** index.html + style.css — redesign Player bar ใหม่ตามรูป: progress top แดง + thumb, main row (cover/info/controls/time/speed/sleep/volume/chevron), expanded panel | ✅ เสร็จ | FILE: index.html | LINES: 288–348 | SECTION: #nowPlaying HTML | FILE: style.css | LINES: 385–458 | SECTION: .now-playing, .np-* |
| **[PLAYER-2]** app.js — cycleSpeed() [0.75-2.0x], setVolume(), toggleMute(), toggleSleepTimer() [15/30/60/90 นาที], อัปเดต timeupdate sync thumb | ✅ เสร็จ | FILE: app.js | LINES: 437–510 | SECTION: PLAYER-2 Speed/Volume/SleepTimer + timeupdate thumb |
| **[HERO-SVG-1]** index.html + style.css — แทน 🎧 emoji ด้วย neon SVG headphone จริง (arc path + earcup) พร้อม CSS glow/bob animation | ✅ เสร็จ | FILE: index.html | LINES: 137 | SECTION: .hero-headphone div | FILE: style.css | LINES: 769–778 | SECTION: .hero-headphone |
| **[EP-PROGRESS-1]** admin.html — เพิ่ม upload progress bar ใน ep-modal: CSS + HTML div + JS saveEpisode() อัปเดต % ระหว่าง upload | ✅ เสร็จ | FILE: admin.html | LINES: 1092–1103, 1959, 1683–1740 | SECTION: .ep-progress CSS, modal HTML, saveEpisode() |

### 📝 รายละเอียด REDESIGN admin.html
- Topbar: ไอคอน 📊 + "แดชบอร์ด" + คำบรรยาย + ปุ่ม "🌐 ดูหน้าเว็บ"
- Stats Bar 4 การ์ด gradient: นิยาย(แดง) / ตอน(เขียว) / วิว(น้ำเงิน) / สมาชิก(ม่วง)
- 2-column layout: panel-left (Novel List 460px) + panel-right (Edit/Admin)
- Novel list: search + filter + card + pagination (5 items/page)
- Edit Form: breadcrumb + รูปปก + form fields + บันทึก(ทอง)/ยกเลิก + ปุ่มดูหน้าบ้าน/ลบ
- Episode accordion: toggle + แก้ไขตอน(ทอง) + ลบตอน
- Admin Panel: toggle ด้วย btn "👑 จัดการแอดมิน" (ซ่อนถ้าไม่ใช่ Super Admin)
- Firebase logic ครบ: auth guard, stats, onSnapshot novels, changeCover (Cloudinary), createAdmin, removeAdmin
- CSS ทั้งหมดอยู่ใน `<style>` inline ใน admin.html

### 📝 รายละเอียด REDESIGN style.css
- **Hero**: bg gradient เข้มขึ้น + red atmospheric glow + subtle grid pattern, hero-image ใหญ่ขึ้น (320×440) + red glow shadow
- **Novel card-h**: cover ใหญ่ขึ้น (100×140) + badge บนปก + rating ⭐ แยก row + read btn ขวาล่างชัด
- **Feature icons**: border เพิ่ม + ขนาดใหญ่ขึ้น (56px)
- **Nav logo**: golden square bg แทน emoji ลอย

---

### 🔵 Phase 3 — login.html (เว็บฟังนิยายอย่างเดียว)

| Task | สถานะ |
|------|--------|
| [LOG-1] ตรวจสอบโครงสร้าง login.html ปัจจุบัน | ✅ เสร็จ |
| [LOG-2] แก้ text/copy ให้สื่อถึง "ฟัง" ไม่ใช่ "อ่าน" | ✅ เสร็จ |
| [LOG-3] แก้ left-panel tagline + book-stack emoji ให้เป็น audio theme | ✅ เสร็จ (รวมใน LOG-2) |
| [novel.html] หน้าฟังนิยาย | ✅ ไม่จำเป็น — ถูกแทนด้วย SPA แล้ว |

---

### 🟠 Phase 5 — UX Improvements

| Task | รายละเอียด | สถานะ |
|------|-----------|-------|
| **[HOTFIX-16]** reset tab/sort | app.js — reset `_nvTab` + `_nvDesc` ที่ต้น renderNovelView ทุกครั้งที่เปลี่ยนนิยาย | ✅ เสร็จ | FILE: app.js | LINES: 762–766 | SECTION: renderNovelView() — reset state |
| **[UX-1]** Loading skeleton | app.js — เพิ่ม skeleton UI ตอนโหลด episode list แทน spinner เปล่า | ✅ เสร็จ | FILE: app.js | LINES: 867–873 | SECTION: renderNovelView() — ep-skeleton inject + requestAnimationFrame | FILE: style.css | LINES: ท้ายไฟล์ | SECTION: .ep-skeleton, sk-pulse animation |
| **[UX-2]** Scroll to top | router.js — scroll กลับขึ้นบนอัตโนมัติเมื่อ navigate ไปหน้าใหม่ | ✅ เสร็จ | FILE: router.js | LINES: 220–221 | SECTION: _render() |
| **[UX-3]** Active episode sync | app.js — แสดง active ep-item ตรงกับตอนที่กำลังเล่นใน player bar | ✅ เสร็จ | FILE: app.js | LINES: 900, 776–778, 955, 930–942 | SECTION: _nvCurrentIdx global, reset ใน renderNovelView, set ใน _nvPlayEp, restore ใน _nvBuildEpList |

**หมายเหตุ:** login.html มีดีไซน์ดีแล้ว — ปรับเฉพาะ text/copy ให้สื่อถึง "ฟัง" เป็นหลัก

---

## 🚀 Phase 6 — Performance (แก้โหลดช้า)

| Task | สถานะ |
|------|-------|
| **[PERF-1]** ลบ onSnapshot ซ้ำใน renderHomeView | ✅ เสร็จ | FILE: app.js | LINES: 705–713 | SECTION: renderHomeView() — ใช้ allNovels global + instant render |
| **[PERF-2]** Novel cache `_novelCache{}` | ✅ เสร็จ | FILE: app.js | LINES: 757–758, 793–801 | SECTION: _novelCache const, renderNovelView() getDoc block |
| **[PERF-3]** Episode cache `_epCache{}` | ✅ เสร็จ | FILE: app.js | LINES: 759, 803–808 | SECTION: _epCache const, renderNovelView() getDocs block |
| **[PERF-4]** instant render (รวมใน PERF-1) | ✅ เสร็จ |
| **[PERF-5]** Scroll to top on navigate | ✅ เสร็จ | FILE: router.js | LINES: 220–221 | SECTION: _render() — window.scrollTo หลัง _syncNavActive |

---

## วิธีสั่งงานต่อ

```
"ทำ Phase 1 เริ่มเลย"
"ทำต่อจาก [IDX-3]"
"ทำต่อจาก [ADM-4]"
"ทำ Phase 2 admin.html"
```

---

## หมายเหตุสำคัญ

- ห้าม break Audio Player ที่มีอยู่แล้ว (now-playing bar ยังใช้ได้)
- novel.html ยังไม่ต้องแก้ใน phase นี้
- login.html ยังไม่ต้องแก้ใน phase นี้
- Admin panel ใช้ dark theme ตลอด (ไม่มี light mode)
- ใช้ Firebase Auth สำหรับสร้าง admin ใหม่ผ่าน createUserWithEmailAndPassword

---

## 🟣 Phase 4 — SPA Migration (Persistent Audio Player)

### ภาพรวม
รวม index.html + novel.html เป็น SPA ไฟล์เดียว ให้เสียงเล่นต่อเนื่องเมื่อเปลี่ยนหน้า
โดยใช้ `history.pushState()` + JS render content แทนการโหลดหน้าใหม่

### สถาปัตยกรรม
```
index.html (shell คงที่)
├── <nav>        → Navbar (คงที่ตลอด)
├── #app-view    → content area (เปลี่ยนตาม route)
│   ├── home-view     → หน้าหลัก (เดิมคือ index.html)
│   ├── novel-view    → หน้านิยาย (เดิมคือ novel.html)
│   └── library-view  → หน้านิยายทั้งหมด
├── <audio>      → คงที่ ไม่ถูกทำลาย
└── #player-bar  → Player bar (คงที่ตลอด)
```

### TASK LIST

| Task | รายละเอียด | สถานะ |
|------|-----------|-------|
| **[SPA-1]** Shell HTML | สร้าง index.html ใหม่: nav + `#app-view` + player-bar ครบ | ✅ |
| **[SPA-2]** Router JS | เขียน router.js: `navigate(path)`, `history.pushState`, `popstate` listener | ✅ | FILE: router.js | LINES: 1–140 | SECTION: register(), navigate(), initRouter(), popstate, resolveRoute(), _matchPattern(), _render() |
| **[SPA-3]** Home View | ย้าย home content (hero, search, sections) เป็น `renderHomeView()` ใน app.js | ✅ | FILE: app.js | LINES: 645–740 | SECTION: renderHomeView(), navigateToLibrary() |
| **[SPA-4]** Novel View | ย้าย novel content (cover, info, episode list) เป็น `renderNovelView(novelId)` ใน app.js | ✅ | FILE: app.js | LINES: 751–910 | SECTION: renderNovelView(), _nvErr(), _nvBuildEpList(), _nvPlayEp() |
| **[SPA-5]** Audio persist | ตรวจสอบ `<audio>` element ไม่ถูก re-render — player state คงอยู่ข้ามหน้า | ✅ | FILE: app.js | LINES: 23, 752, 835, 930–972 | SECTION: import getDocs, ลบ duplicate import, แก้ audioEl id, register routes + handleRoute |
| **[SPA-6]** URL Routing | `/` → home, `/novels/:id` → novel view, `/library` → library | ✅ | FILE: app.js | LINES: 930–972 | SECTION: router.register(), initRouter(), handleRoute() |
| **[SPA-7]** novel.html cleanup | ลบ novel.html ออก (หรือ redirect → index.html#novel) | ✅ | FILE: novel.html | LINES: 1–17 | SECTION: redirect script (novel.html?id=xxx → /index.html?_novel=xxx) |
| **[SPA-8]** Library View | renderLibraryView() — แสดงนิยายทั้งหมด + filter/search | ✅ | FILE: app.js | LINES: 945–1035 | SECTION: renderLibraryView(), _libDoFilter(), _libSetFilter(), _libDoRender() |
| **[SPA-9]** Deep link | เปิด URL `/novels/:id` ตรงได้ (page refresh ไม่พัง) | ✅ | FILE: 404.html (ใหม่) + app.js | LINES: 404.html:1–20, app.js:970–1003 | SECTION: 404.html redirect script, _handleDeepLink() |
| **[SPA-10]** Mobile nav | hamburger menu ยังทำงานถูกต้องใน SPA | ✅ | FILE: router.js | LINES: 117–139 | SECTION: _syncNavActive(), _render() call after renderFn |

### ลำดับการทำ (บังคับทำตาม LAW 1 — ทีละ task)
```
1. [SPA-1] Shell HTML — กำหนดโครงสร้างไฟล์เดียว
2. [SPA-2] Router JS — ระบบ navigate ไม่ reload
3. [SPA-3] Home View — render หน้าหลัก
4. [SPA-5] Audio persist — ตรวจสอบ player ไม่ตาย
5. [SPA-4] Novel View — render หน้านิยาย
6. [SPA-6] URL Routing — route ครบทุก path
7. [SPA-8] Library View — หน้าคลังนิยาย
8. [SPA-9] Deep link — refresh ได้
9. [SPA-10] Mobile nav — hamburger ใช้ได้
10. [SPA-7] novel.html cleanup — ลบ/redirect
```

### ข้อควรระวัง
- ❌ ห้าม destroy `<audio>` element เด็ดขาด
- ❌ ห้าม `innerHTML` ทับ player-bar
- ✅ render เฉพาะ `#app-view` เท่านั้น
- ✅ Firebase listeners ต้อง unsubscribe ก่อน re-render view
- ✅ admin.html ยังแยกไฟล์ได้ (admin ไม่ต้องการ audio persist)
| **[HERO-NEW-1]** index.html — แก้ Hero HTML: label "🎧 นิยายเสียงภาษาไทย", title "ฟังนิยายที่คุณชื่นชอบ / ได้ทุกที่ทุกเวลา", desc + btn "▶ เริ่มฟังเลย" + hero-neon-graphic (SVG waveform + headphone emoji) | ✅ เสร็จ | FILE: index.html | LINES: 73–115 | SECTION: .hero HTML |
| **[HERO-NEW-2]** style.css — Hero CSS redesign: neon ring pulse, SVG waveform animation, headphone bob, crown badge spin, responsive | ✅ เสร็จ | FILE: style.css | LINES: 623–800 | SECTION: .hero, .hero-neon-graphic, .hero-waveform, .hero-headphone, .hero-crown-badge |
| **[HERO-NEW-1]** index.html — แก้ Hero HTML: label "🎧 นิยายเสียงภาษาไทย", title "ฟังนิยายที่คุณชื่นชอบ / ได้ทุกที่ทุกเวลา", hero-neon-graphic SVG waveform + headphone | ✅ เสร็จ | FILE: index.html | LINES: 73–124 | SECTION: .hero HTML |
| **[HERO-NEW-2]** style.css — Hero CSS neon ring pulse, waveform animation, headphone bob, crown badge, responsive | ✅ เสร็จ | FILE: style.css | LINES: 623–800 | SECTION: .hero, .hero-neon-graphic, .hero-waveform |
| **[HIST-1]** index.html — ย้าย history bar เหนือ Hero + redesign HTML: history-bar-inner, history-scroll-wrap, history-items | ✅ เสร็จ | FILE: index.html | LINES: 73–90 | SECTION: #historyBar HTML |
| **[IDX-4-CARD]** app.js — cardHTML() เพิ่ม views K/likes K/rating + ปุ่ม "▶ ฟังเลย" | ✅ เสร็จ | FILE: app.js | LINES: 134–163 | SECTION: cardHTML() |
| **[BUG-404-ROUTE]** router.js — แก้ navigate() strip BASE_PATH ก่อน concat ป้องกัน /Novel/Novel/ double path | ✅ เสร็จ | FILE: router.js | LINES: 80–85 | SECTION: navigate() |
| **[BUG-404-DEEPLINK]** app.js — แก้ _handleDeepLink() strip BASE_PATH จาก _r= ก่อน replaceState ป้องกัน /Novel/Novel/ | ✅ เสร็จ | FILE: app.js | LINES: 1290–1309 | SECTION: _handleDeepLink() |
| **[HERO-FIX-3]** app.js — ย้าย SVG waveform + headphone + crown เข้า renderHomeView() hero-image div (เดิมว่างเปล่า ทำให้กราฟิกไม่โชว์เพราะ innerHTML ทับ) | ✅ เสร็จ | FILE: app.js | LINES: 776 | SECTION: renderHomeView() hero-image HTML |
| **[HERO-FIX-2]** style.css — ลด .hero min-height: 60vh → 38vh และ .hero-inner padding: 60px → 32px แก้ช่องว่างใหญ่ใต้ history bar | ✅ เสร็จ | FILE: style.css | LINES: 626, 656 | SECTION: .hero min-height, .hero-inner padding |
| **[HERO-FIX-1]** style.css — แก้ .hero-waveform ใช้ position:absolute + transform:translate(-50%,-30%) แทน bottom:20px, เพิ่ม z-index:1; .hero-headphone z-index:2; .hero-image + .hero-neon-graphic overflow:visible — แก้ graphic ไม่โชว์ใน Hero ฝั่งขวา | ✅ เสร็จ | FILE: style.css | LINES: 714–807 | SECTION: .hero-image, .hero-neon-graphic, .hero-waveform, .hero-headphone |
| **[HOTFIX-FAV-1]** app.js — แก้ toggleFav() บัค: การ์ดหายจากหน้าหลักเมื่อกด unfav เพราะ card.remove() ทำงานโดยไม่เช็ค view ให้ถูกต้อง — แยก isFavPage ออกมาเป็นตัวแปร แล้ว card.remove() เฉพาะเมื่อ isFavPage === true จริงๆ | ✅ เสร็จ | FILE: app.js | LINES: 191–196 | SECTION: toggleFav() — else branch card.remove() |
| **[HOTFIX-FAV-2]** app.js — revert icon กลับเป็น ❤️/🤍 (ถูกเปลี่ยนเป็น ✔/+ ค้างโดยผิดพลาด) | ✅ เสร็จ | FILE: app.js | LINES: 150–151, 183, 188 | SECTION: cardHTML() button icon, toggleFav() add/remove branch |
| **[CARD-WIDTH-1]** style.css — แก้ .novels-grid จาก repeat(auto-fill, minmax(160px,1fr)) → repeat(4,1fr) ให้การ์ดกว้างเท่ารูป reference | ✅ เสร็จ | FILE: style.css | LINES: 215–220 | SECTION: .novels-grid grid-template-columns |
| **[COIN-2]** style.css — ลบ .banner, .banner-icon, .banner-text, .banner-btn, .banner-btn:hover CSS ออกทั้งหมด | ✅ เสร็จ | FILE: style.css | LINES: 185–200 | SECTION: .banner block CSS |
| **[NETLIFY-1]** app.js — แก้ window._BASE = '' (Netlify root deploy) + appView.dataset.view = 'home' ใน renderHomeView() แก้บัคกด nav แล้ว content ไม่ refresh เพราะ dataset.view ค้างค่าเดิม | ✅ เสร็จ | FILE: app.js | LINES: 30, 755 | SECTION: window._BASE, renderHomeView() |
| **[NETLIFY-2]** app.js — เพิ่ม appView.dataset.view = 'library' ใน renderLibraryView() และ 'home' ใน renderHomeView() ครบทุก view แก้บัคเปลี่ยนหน้าแล้ว content ค้าง | ✅ เสร็จ | FILE: app.js | LINES: 1278, 755 | SECTION: renderLibraryView(), renderHomeView() |
| **[NETLIFY-3]** app.js — แก้ _handleDeepLink() ป้องกัน redirect loop บน Netlify: ถ้า decoded ?_r= ยังมี _r= ซ้อนอยู่ให้ replaceState ไป / แทน (Netlify ใช้ _redirects ไม่ใช่ 404.html) | ✅ เสร็จ | FILE: app.js | LINES: 1439–1445 | SECTION: _handleDeepLink() |
| **[NETLIFY-4]** 404.html — เพิ่ม 'favorites' ใน knownRoutes + ป้องกัน loop ถ้า search มี _r= อยู่แล้วให้ redirect ไป root แทน แก้ HTTP 414 loop บน Netlify | ✅ เสร็จ | FILE: 404.html | LINES: 23–26 | SECTION: knownRoutes + loop guard |
| **[NETLIFY-6]** สร้าง _redirects — Netlify SPA fix: /* → /index.html 200 ป้องกัน 414 loop ทุก route | ✅ เสร็จ | FILE: _redirects | LINES: 1–2 |
| **[BUG-CF-NAV-1]** index.html — แก้ navigate() ลบ history.pushState() ออก + เพิ่ม popup HTML (#sleepPopup, #npSleepLabel) + stub functions ครบ | ✅ เสร็จ | FILE: index.html | LINES: 132–220 |
| **[SLEEP-STUB-1]** index.html — เพิ่ม stub functions toggleSleepTimer/closeSleepPopup/adjustSleepMins/setSleepMins ใน script block ให้ inline onclick เรียกได้ก่อน ES module โหลด | ✅ เสร็จ | FILE: index.html | LINES: 185–200 | SECTION: script block stubs |

---

## 🟡 Phase 7 — SPA Shell Refactor

| Task | สถานะ |
|------|-------|
| **[SHELL-1]** ตรวจ renderHomeView() เทียบ static HTML | ✅ เสร็จ |
| **[SHELL-2]** rewrite renderHomeView() ใช้ class เดิม + ล้าง #app-view | ✅ เสร็จ | FILE: app.js LINES: 760–883, index.html LINES: 71–324 |
| **[SHELL-3]** renderLibraryView() ใช้ onSnapshot ตัวเอง + คืน unsub | ✅ เสร็จ | FILE: app.js | LINES: 1321–1330 |
| **[SHELL-4]** renderFavoritesView() รอ allNovels ก่อน render | ✅ เสร็จ | FILE: app.js | LINES: 1383–1422 |

---

## 🔴 Phase 8 — Bug Fixes + Player Redesign

| Task | สถานะ |
|------|-------|
| **[NAV-ONCLICK-1]** index.html — แก้ nav onclick → event.preventDefault(); window.handleRoute() | ✅ เสร็จ | FILE: index.html | LINES: 16,23,24,57,58 |
| **[LOGIN-REDIRECT-1]** login.html — แก้ redirect() BASE → window.location.origin | ✅ เสร็จ | FILE: login.html | LINES: 210–216 |
| **[PLAYER-NEW-1]** index.html — redesign player HTML: ตัด expanded+modal, layout ใหม่ตามรูป | ✅ เสร็จ | FILE: index.html | LINES: 74–157 | SECTION: #nowPlaying |
| **[PLAYER-NEW-2]** style.css — CSS player bar ใหม่ | ✅ เสร็จ | FILE: style.css | LINES: 370–497 | SECTION: .now-playing, .np-progress-top, .np-main-row, .np-ctrl-btn, .np-play, .np-icon-btn |
| **[PLAYER-NEW-3]** app.js — drag progress bar (mouse+touch) + _syncVolIcon SVG + mediaSession syncPlayBtn | ✅ เสร็จ | FILE: app.js | LINES: 582–660 | SECTION: timeupdate, _initProgressDrag, _syncVolIcon, mediaSession |
| **[PLAYER-ICON-FIX]** app.js — เพิ่ม syncPlayBtn(true) ใน _nvPlayEp() แก้ icon ▶/⏸ สลับผิด | ✅ เสร็จ | FILE: app.js | LINES: 1197 | SECTION: _nvPlayEp() audio.play() |
| **[PLAYER-NEW-2b]** index.html + style.css — เปลี่ยน progress bar เขียว + SVG icons ทุกปุ่มตามรูป + play btn ขาว/ดำ | ✅ เสร็จ | FILE: index.html | LINES: 94–113 | SECTION: np-center controls | FILE: style.css | LINES: 384–392, 420–424 | SECTION: np-progress-top-fill/thumb, np-play |
| **[PLAYER-SVG-FIX]** app.js — แก้ syncPlayBtn() toggle svgPlay/svgPause แทน textContent emoji | ✅ เสร็จ | FILE: app.js | LINES: 430–436 | SECTION: syncPlayBtn() |
| **[BUG-PREVNEXT-1]** app.js — แก้ prevEp()/nextEp() ใช้ _nvCurrentIdx/_nvAudioFiles/_nvNovel; เพิ่ม global assignment ใน _nvPlayEp(); แก้ ended autoplay SPA mode | ✅ เสร็จ | FILE: app.js | LINES: 574–592, 611–617, 1255–1262 | SECTION: prevEp(), nextEp(), ended, _nvPlayEp() |
| **[RESUME-1]** app.js — save progress ทุก 5 วินาทีใน timeupdate (_lastSaveTime throttle); history-item เพิ่ม data-ep-idx + data-resume-time; _spaNavigate เก็บ sessionStorage ghResume_<id>; renderNovelView resume + seek canplay | ✅ เสร็จ | FILE: app.js | LINES: 582–610, 990, 1499–1508, 1136–1165 | SECTION: timeupdate, history-item HTML, _spaNavigate(), renderNovelView() resume block |
| **[RESP-1]** style.css — แก้ .novels-grid: เพิ่ม @media (max-width:768px) → repeat(2,1fr) gap:12px และ @media (max-width:400px) → gap:8px | ✅ เสร็จ | FILE: style.css | LINES: 199–217 | SECTION: .novels-grid responsive |
| **[RESP-2]** style.css — ลบ .novels-grid override ซ้ำที่บรรทัด 508 (ขัดกับ RESP-1) + แก้ .content padding mobile → 0 12px 32px | ✅ เสร็จ | FILE: style.css | LINES: 507–509 | SECTION: @media 768px block |
| **[MOB-1]** style.css — เพิ่ม @media (max-width:480px) สำหรับ .novel-card-h: stack vertical, cover full-width 180px, ปรับ font-size title, clamp desc 3 บรรทัด | ✅ เสร็จ | FILE: style.css | LINES: 972–993 | SECTION: novel-card-h mobile small screen |
| **[MOB-2]** style.css — เพิ่ม @media (max-width:480px): search-section padding ลด, filter-tabs scroll แนวนอน (no-wrap), section-header wrap, sub-tabs scroll แนวนอน | ✅ เสร็จ | FILE: style.css | LINES: 1042–1063 | SECTION: MOB-2 search+filter+section-header mobile |
| **[MOB-3]** style.css — เพิ่ม @media (max-width:480px): footer padding/gap ลด, newsletter-form stack vertical, features-grid 2col+ลด icon/font | ✅ เสร็จ | FILE: style.css | LINES: 1310–1330 | SECTION: MOB-3 footer+features mobile |

---

## 📱 Phase 9 — Mobile Fix (จากการตรวจ 2026-05-26)

> ตรวจพบปัญหาที่ยังค้างหลังจาก Phase 8 ทำเสร็จ — ต้องแก้เพื่อให้ใช้งานบนโทรศัพท์ได้ครบ

| Task | รายละเอียด | สถานะ |
|------|-----------|-------|
| **[MOB-PLAYER-1]** | style.css — @media (max-width:480px): ซ่อน `.np-ctrl-btn` rewind/forward 10วิ (2 ปุ่ม) เหลือแค่ prev/play/next — player bar บนมือถือแน่นเกินไป 5 ปุ่มเรียงชิดกัน | ✅ เสร็จ | FILE: style.css | LINES: 483–489 | SECTION: @media 480px .np-skip display:none | FILE: index.html | LINES: 96, 120 | SECTION: rewind/forward btn class np-skip |
| **[MOB-NAV-1]** | style.css — @media (max-width:768px): ซ่อน `.nav-btn-fill` ใน navbar ด้วย ให้ปุ่ม login/register อยู่ใน drawer เท่านั้น | ✅ เสร็จ | FILE: style.css | LINES: 540–544 | SECTION: @media 768px .nav-btn-fill display:none |
| **[MOB-HERO-1]** | style.css — @media (max-width:480px): ลด .hero min-height → auto, padding → 20px 16px แก้ hero สูงเกินบนจอเล็ก | ✅ เสร็จ | FILE: style.css | LINES: 1835–1846 | SECTION: @media 480px .hero min-height:auto, .hero-inner flex-direction:column padding:20px 16px |
| **[MOB-CONTENT-1]** | style.css — @media (max-width:480px): เพิ่ม .content padding → 0 12px 24px (ปัจจุบันมีแค่ 768px ไม่มี 480px) | ✅ เสร็จ | FILE: style.css | LINES: 1835–1849 | SECTION: @media 480px .content padding:0 12px 24px |
| **[MOB-HERO-FIX]** | style.css — แก้ @media 480px hero: ซ่อน .hero-image (display:none), .hero-title font-size:1.6rem, .hero-desc font-size:0.82rem, .hero-inner flex-direction:row padding:24px 16px 28px — แก้ hero text ล้นทับกราฟิก | ✅ เสร็จ | FILE: style.css | LINES: 1835–1865 | SECTION: @media 480px hero block |
| **[MOB-PLAYER-2]** | style.css — แก้ @media 640px: ซ่อน .np-right ทุก icon btn + volume slider ทั้งหมด, max-width:none ให้ np-title ขยายเต็ม, np-left flex:1; แก้ @media 480px: ซ่อน .np-pill-btn (speed) ด้วย — player bar พอดีบนมือถือ | ✅ เสร็จ | FILE: style.css | LINES: 476–488 | SECTION: @media 640px, @media 480px player |
| **[HIST-EP-FIX]** app.js — แก้ _nvBuildEpList() อ่าน history จาก Firestore แทน localStorage (หลัง HISTORY-SYNC-1 ทำให้ ep progress bar ไม่โชว์); async inject progress bar + _resumeTime หลัง render; click handler อ่าน item._resumeTime ด้วย | ✅ เสร็จ | FILE: app.js | LINES: 1312–1382 | SECTION: _nvBuildEpList() history read + click handler |
| **[HIST-NV-1]** app.js — เพิ่ม #historyBar HTML + renderHistory() call ใน renderNovelView() เพื่อให้ history bar โชว์ใน novel view ด้วย (เดิมมีแค่ home view) | ✅ เสร็จ | FILE: app.js | LINES: 1158–1163, 1269 | SECTION: renderNovelView() loading innerHTML + show content block |
| **[BUG-SYNOPSIS-1]** app.js — แก้ novel.synopsis → novel.description\|novel.synopsis ให้ตรงกับ field ที่ admin.html บันทึก (admin ใช้ field `description` ไม่ใช่ `synopsis`) | ✅ เสร็จ | FILE: app.js | LINES: 1223 | SECTION: renderNovelView() nv-synopsis |
| **[EP-PROGRESS-LIVE]** app.js — เพิ่ม live update progress bar แดงบน ep-item ที่ active ใน timeupdate: สร้าง .ep-progress-wrap/.ep-progress-fill ถ้ายังไม่มี แล้วอัปเดต width ทุก tick — ทำให้หลอดแดงโชว์ real-time และค้างไว้หลัง reload | ✅ เสร็จ | FILE: app.js | LINES: 666–679 | SECTION: timeupdate handler |
| **[EP-BAR-FIX]** app.js — แก้ _nvBuildEpList() Firestore async inject: แยก guard ออกจากกัน — set epEl._resumeTime เสมอถ้า idx >= 0 (เดิม return ถ้า pct<=0 ทำให้ _resumeTime ไม่ถูก set); inject progress bar เฉพาะ pct > 0 เหมือนเดิม | ✅ เสร็จ | FILE: app.js | LINES: 1337–1346 | SECTION: _nvBuildEpList() Firestore then() block |
| **[HIST-RESUME-FIX]** app.js — Bug1: แก้ _spaNavigate() ลบเงื่อนไข resumeTime > 0 → เก็บ sessionStorage ghResume_ ทุกครั้งที่มี epIdx (แม้ resumeTime=0); Bug2: แก้ click handler ใน _nvBuildEpList() ให้ fallback อ่าน Firestore history โดยตรงถ้า item._resumeTime ยัง undefined (async ยังไม่ resolve) | ✅ เสร็จ | FILE: app.js | LINES: 1729, 1392–1394 | SECTION: _spaNavigate() sessionStorage guard, _nvBuildEpList() click handler resumeAt |
| **[HISTORY-SYNC-1]** | app.js — ย้าย history จาก localStorage → Firestore users/{uid}/history/{novelId} ผูกกับ uid: เพิ่ม setDoc+serverTimestamp import, _currentUid tracker, _historyRef helper, แก้ saveHistory/renderHistory/timeupdate save/_nvPlayEp save ทั้งหมด; firestore.rules — เพิ่ม subcollection wildcard ให้ users/{userId} ครอบ history | ✅ เสร็จ | FILE: app.js | LINES: 873–888, 1055–1094, 670–684, 1437–1444 | FILE: firestore.rules | LINES: 33–40 |

### ลำดับการทำ
```
1. [MOB-PLAYER-1] — ซ่อนปุ่ม rewind/forward บน 480px
2. [MOB-NAV-1]    — ซ่อน register btn บน navbar mobile
3. [MOB-HERO-1]   — ลด hero height บน 480px
4. [MOB-CONTENT-1]— เพิ่ม content padding 480px
```

---

## 🔴 Phase 10 — History Bug Fix (2026-05-27)

| Task | รายละเอียด | สถานะ |
|------|-----------|-------|
| **[HIST-BUG-1]** | app.js — แก้ timeupdate save: เปลี่ยนจาก setDoc ตรงๆ → เรียก saveHistory() แทน เพื่อให้ field novelTitle/coverUrl ครบ (เดิม progressData ขาด 2 field นี้ ทำให้ history bar แสดงผลไม่ได้) | ✅ เสร็จ | FILE: app.js | LINES: 683–704 | SECTION: timeupdate save block |
| **[HIST-BUG-2]** | app.js — แก้ history bar ไม่อัพเดท: เพิ่ม _throttledRenderHistory() (throttle 30วิ) + เรียกหลัง saveHistory() write สำเร็จทั้ง Firestore และ localStorage path | ✅ เสร็จ | FILE: app.js | LINES: 901–913, 916–930 | SECTION: _throttledRenderHistory(), saveHistory() .then() + localStorage block |
| **[RESUME-FIX-1]** | app.js — แก้ click handler ใน _nvBuildEpList(): แยก _seekTo() helper; ถ้า _resumeTime ยัง undefined และ login อยู่ → อ่าน Firestore โดยตรงแทนที่จะรอ async resolve จาก outer scope — แก้บัคกดตอนแล้วเล่นจากต้นแทนที่จะฟังต่อ | ✅ เสร็จ | FILE: app.js | LINES: 1393–1427 | SECTION: _nvBuildEpList() click handler |
| **[RESUME-FIX-2]** | app.js — แก้ _seekTo() ใน click handler: เพิ่มเช็ค audioEl.readyState >= 2 → seek ทันทีถ้า audio data พร้อมแล้ว แทนที่จะผูก canplay เสมอ — แก้ root cause: _nvPlayEp() ทำ audio.load() → canplay fires ก่อน listener ผูก ทำให้ seek ไม่เกิด | ✅ เสร็จ | FILE: app.js | LINES: 1397–1413 | SECTION: _nvBuildEpList() _seekTo() |
| **[RESUME-FIX-3]** | app.js — แก้ resume block ใน renderNovelView(): สลับลำดับ ผูก canplay listener ก่อน แล้วค่อยเรียก _nvPlayEp() — แก้ root cause เดียวกัน: audio.load() ใน _nvPlayEp() ทำให้ canplay fires ก่อน listener ผูก → seek ไม่เกิด (path กดจาก history bar) | ✅ เสร็จ | FILE: app.js | LINES: 1287–1309 | SECTION: renderNovelView() resume block |
| **[RESUME-FIX-4]** | router.js — แก้ navigate() ให้ render ซ้ำได้ถ้า path เดิมแต่มี ghResume_ ใน sessionStorage — root cause: ถ้าอยู่หน้า novel เดิมแล้วกด history item → pathname เหมือนกัน → return ทันที → renderNovelView() ไม่ถูกเรียก → resume block ไม่ทำงาน | ✅ เสร็จ | FILE: router.js | LINES: 84–89 | SECTION: navigate() same-path guard |
| **[RESUME-FIX-5]** | app.js — แก้ _nvPlayEp() ไม่ reset progress:0 เมื่อ save history: ลบ progress:0 ออกจาก entry + localStorage merge existing แทน replace — เดิมทับ currentTime/progress ทุกครั้งที่กด ep | ✅ เสร็จ | FILE: app.js | LINES: 1545–1556 | SECTION: _nvPlayEp() save history block |
| **[HISTORY-V2-A]** | app.js — ลบ saveHistory+renderHistory เก่าทิ้ง เขียนใหม่: saveHistory v2 (expire 60วัน, merge Firestore), renderHistory v2 (แสดงแค่ปก+ชื่อ, scroll แนวนอน, filter expired) | ✅ เสร็จ | FILE: app.js | LINES: 887–935, 1102–1152 | SECTION: HISTORY v2 block |
| **[HISTORY-V2-B]** | style.css — แก้ .history-item เป็น vertical card (ปกบน ชื่อล่าง): flex-direction:column, width:80px, cover 80x106px border-radius:8px, title ล่างกลาง font 0.7rem, ลบ .history-item-info/.history-item-ep/.history-progress-*/.history-item-heart CSS ที่ไม่ใช้แล้ว | ✅ เสร็จ | FILE: style.css | LINES: 1536–1638 | SECTION: .history-item card block |
| **[HISTORY-V2-C]** | app.js + style.css — แก้ history bar HTML ใน renderHomeView(): เพิ่ม .history-bar-inner wrapper + แก้ class .history-header→.history-bar-header, .history-title→.history-bar-title; style.css: เพิ่ม display:none + .history-bar.visible{display:block} | ✅ เสร็จ | FILE: app.js | LINES: 958–965 | FILE: style.css | LINES: 1473–1477 |

---

## 🔴 Phase 11 — Resume Bug (2026-05-28)

### 🔍 วิเคราะห์ปัญหา: "ฟังล่าสุด กด resume แล้วหาย"

**Symptom:** กดการ์ดใน history bar แล้ว resume ไม่ทำงาน — เล่นจากต้นแทน

**Flow ที่เกิดขึ้น:**
1. user กด history-item → `_spaNavigate(this)` อ่าน `data-resume-time`
2. `data-resume-time` มาจาก `h.currentTime || 0` ใน renderHistory v2 (บรรทัด 1140)
3. ถ้า `currentTime` ไม่มีใน Firestore → `resumeTime = 0`
4. sessionStorage เก็บ `{ epIdx, resumeTime: 0 }`
5. resume block ใน renderNovelView() (บรรทัด 1296) check `if (resumeTime > 5)` → **false → ไม่ seek**

**Root Cause หลัก — `currentTime` หายจาก Firestore:**

`_nvPlayEp()` save block (บรรทัด 1546) ใช้ `merge:true` และ **ไม่ส่ง `currentTime`** → ถ้า user เปลี่ยน ep ใหม่ Firestore จะมี `epIdx` ใหม่ แต่ `currentTime` ยังเป็นของ ep เก่า → resume ผิด ep + ผิดเวลา

**Root Cause รอง — เปลี่ยน ep แล้ว `currentTime` ไม่ถูก reset:**

เมื่อ user กด ep ใหม่ `_nvPlayEp()` save `epIdx: newIdx` แต่ `currentTime` ยังเป็นของ ep เก่า (timeupdate ยังไม่ได้ save รอบใหม่ภายใน 5 วิ) → Firestore record มี `epIdx = N` แต่ `currentTime = เวลาของ ep N-1`

| Task | รายละเอียด | สถานะ |
|------|-----------|-------|
| **[RESUME-BUG-1]** | app.js — แก้ `_nvPlayEp()` save block: เพิ่ม `currentTime: 0, duration: 0, progress: 0` ใน entry เพื่อ reset เมื่อเปลี่ยน ep ใหม่ — ป้องกัน `currentTime` ของ ep เก่าค้างอยู่กับ `epIdx` ใหม่ | ✅ เสร็จ | FILE: app.js | LINES: 1546 | SECTION: _nvPlayEp() save history block |
| **[RESUME-BUG-2]** | app.js — แก้ resume block ใน renderNovelView(): เปลี่ยน `if (resumeTime > 5)` → `if (resumeTime > 0)` เพื่อให้ seek ทุกครั้งที่มี resumeTime แม้ < 5 วิ | ✅ เสร็จ | FILE: app.js | LINES: 1296 | SECTION: renderNovelView() resume block |
| **[RESUME-BUG-2b]** | app.js — แก้ `_seekTo()` ใน _nvBuildEpList() click handler: เปลี่ยน `if (!(t > 5))` → `if (!(t > 0))` — path กดจาก ep list โดยตรง (ต่างจาก BUG-2 ที่เป็น path กดจาก history bar) | ✅ เสร็จ | FILE: app.js | LINES: 1402 | SECTION: _nvBuildEpList() _seekTo() |

---

## 🔴 Phase 12 — Refresh Resume Bug (2026-05-28)

### 🔍 ปัญหา: "กด refresh แล้วไม่ resume + หลอดตอนไม่แสดง"

**Root cause:** resume block ใน renderNovelView() เช็คแค่ sessionStorage — แต่ refresh ล้าง sessionStorage → ไม่มีข้อมูล → ไม่ resume และ ไม่ play ตอนใดเลย

| Task | รายละเอียด | สถานะ |
|------|-----------|-------|
| **[REFRESH-RESUME-1]** | app.js — แก้ resume block ใน renderNovelView(): refactor เป็น `_doResume(epIdx, resumeTime)` helper; เพิ่ม else-if branch: ถ้าไม่มี sessionStorage และ login อยู่ → อ่าน Firestore history โดยตรง → resume อัตโนมัติหลัง refresh | ✅ เสร็จ | FILE: app.js | LINES: 1285–1308 | SECTION: renderNovelView() resume block |

---

## 🔴 Phase 13 — History UID Fix (2026-05-29)

### 🔍 ปัญหา: Firestore `users` collection ไม่มีในโปรเจค — ใช้แค่ Auth

**Root cause:** saveHistory/renderHistory/resume block ทั้งหมดเขียน/อ่าน Firestore `users/{uid}/history` แต่ collection นี้ไม่ได้เปิดใช้งาน → write fail เงียบๆ → history ไม่ถูกบันทึก → resume/หลอดตอนไม่แสดง

| Task | รายละเอียด | สถานะ |
|------|-----------|-------|
| **[HISTORY-UID-1]** | app.js — เปลี่ยนทั้งหมดจาก Firestore → localStorage ผูก uid: เพิ่ม `_historyKey()` helper (คืน `gh_history_{uid}` ถ้า login, `gh_history` ถ้าไม่ login); แก้ saveHistory/renderHistory (sync แทน async); แก้ resume block ใช้ localStorage แทน getDoc Firestore | ✅ เสร็จ |
| **[HISTORY-UID-1b]** | app.js — cleanup: แก้ _nvBuildEpList/click handler/_nvPlayEp save block ทั้งหมดให้ใช้ `_historyKey()` แทน Firestore; ลบ `_historyRef()` helper; ลบ `setDoc, serverTimestamp` ออกจาก import — ไม่มี Firestore history calls เหลือแล้ว | ✅ เสร็จ | FILE: app.js | LINES: 23, 899, 1336–1365, 1418–1434, 1546–1558 |

---

## 🔴 Phase 13b — Auto-Resume Bug Fix (2026-05-29)

| Task | รายละเอียด | สถานะ |
|------|-----------|-------|
| **[AUTO-RESUME-FIX]** | app.js — ลบ `else` block ที่ auto-resume จาก localStorage ทุกครั้งที่เข้าหน้า novel (บรรทัด 1330–1337 เดิม) — แก้บัคเล่นตอนล่าสุดอัตโนมัติโดยไม่รอ user กดเลือกตอน | ✅ เสร็จ | FILE: app.js | LINES: 1330–1337 | SECTION: renderNovelView() resume else block |
| **[AUTO-RESUME-FIX-2]** | app.js — ลบ sessionStorage resume set ออกจาก `_spaNavigate()` (บรรทัด 1753–1756 เดิม) — history-item click จะแค่ navigate ไปหน้า novel โดยไม่ auto-play ให้ user กดเลือกตอนเอง | ✅ เสร็จ | FILE: app.js | LINES: 1749–1759 | SECTION: _spaNavigate() sessionStorage resume block |
| **[AUTO-RESUME-FIX-3]** | app.js — ลบ `data-ep-idx` / `data-resume-time` ออกจาก history-item HTML + แก้ comment; history-item ใช้แค่ `data-novel-id` navigate ไปหน้า novel ปกติ | ✅ เสร็จ | FILE: app.js | LINES: 1156–1162 | SECTION: renderHistory() history-item HTML |

---

## 🔴 Phase 14 — Per-Episode Progress Tracking (2026-05-29)

### 🔍 ปัญหา: เก็บ history แค่ ep ล่าสุดของแต่ละเรื่อง — ep อื่นที่ฟังค้างไว้หาย

**Root cause:** `saveHistory()` filter ด้วย `novelId` → เก็บได้แค่ 1 record ต่อ novel → ep เก่าที่ฟังค้างไว้ถูกลบออกทุกครั้งที่บันทึก ep ใหม่

| Task | รายละเอียด | สถานะ |
|------|-----------|-------|
| **[EP-TRACK-1]** | app.js — เพิ่ม `_epProgressKey()` helper (คืน `gh_ep_{uid}_{novelId}` หรือ anonymous); เพิ่ม `saveEpProgress(novelId,epIdx,currentTime,duration)` บันทึก per-ep object {currentTime,duration,progress,ts}; แก้ timeupdate save เรียก `saveEpProgress()` ด้วย (ควบคู่กับ saveHistory เดิม) | ✅ เสร็จ | FILE: app.js | LINES: 909–937 (_epProgressKey, saveEpProgress, getEpProgressMap), 699 (timeupdate saveEpProgress call) | SECTION: _epProgressKey(), saveEpProgress(), getEpProgressMap(), timeupdate handler |
| **[EP-TRACK-2]** | app.js — แก้ `_nvBuildEpList()`: อ่าน per-ep progress map จาก localStorage; แสดง progress bar ทุก ep ที่เคยฟัง (ไม่ใช่แค่ ep ล่าสุด); ถ้า progress ≥ 0.95 → แสดง badge "✓ จบแล้ว" แทน progress bar; ถ้า isDone → click เล่นจากต้น (ไม่ seek); style.css — เพิ่ม .ep-done-badge CSS (สีเขียว) | ✅ เสร็จ | FILE: app.js | LINES: 1362–1432 | SECTION: _nvBuildEpList() history read + ep render loop | FILE: style.css | LINES: 1701–1710 | SECTION: .ep-done-badge |
| **[EP-TRACK-DONE]** | app.js — เปลี่ยน threshold isDone จาก 0.95 → 1.0 (100%); เพิ่ม ended handler บันทึก saveEpProgress(duration, duration) บังคับ progress=1.0 เมื่อฟังจบ (เพราะ currentTime อาจไม่ถึง duration พอดี) | ✅ เสร็จ | FILE: app.js | LINES: 1392 (isDone threshold), 705–711 (ended handler) | SECTION: _nvBuildEpList() isDone, ended event |

---

## 🔴 Phase 16 — novel.html Smart Resume + No Auto-Play (2026-05-29)

| Task | รายละเอียด | สถานะ |
|------|-----------|-------|
| **[NOVEL-SMART-1]** | novel.html — เปลี่ยนปุ่ม label "ฟังทั้งหมด" → "เริ่มฟังนิยาย"; ep click → selectEp() highlight ไม่เล่น; playFirstBtn smart resume จาก localStorage gh_ep_{uid}_{novelId} หา ep ts ล่าสุด progress < 1.0; เพิ่ม resumeTime param ใน playEp(); CSS .ep-item.selected | ✅ เสร็จ | FILE: novel.html |

---

## 🔴 Phase 15 — Smart Resume Button (2026-05-29)

### 🔍 ปัญหา: ปุ่ม "เล่นตอนแรก" ไม่สมาร์ท + ไม่ควร auto-resume เมื่อเข้าหน้า novel

| Task | รายละเอียด | สถานะ |
|------|-----------|-------|
| **[SMART-RESUME-BTN]** | app.js — แก้ nvPlayFirstBtn click handler: อ่าน `_epProgressKey(novelId)` → หา ep ที่มี ts ล่าสุด + progress < 1.0 (ยังไม่จบ) → `_doResume(epIdx, currentTime)`; ถ้าไม่มี → เล่น ep แรก; label ปุ่ม "เริ่มฟังนิยาย" | ✅ เสร็จ | FILE: app.js | LINES: 1293–1308 | SECTION: nvPlayFirstBtn click handler |

---

## 🔴 Phase 17 — No Auto-Play + Smart Resume Button in SPA (2026-05-30)

### 🔍 ปัญหา: กดเข้าหน้า novel แล้วเล่นอัตโนมัติโดยไม่รอ user กด + ปุ่มชื่อ "เล่นตอนแรก" ไม่สมาร์ท

**Root cause:** else block ใน renderNovelView() (บรรทัด 1330–1337) อ่าน localStorage แล้วเรียก `_doResume()` ทันทีเมื่อเข้าหน้า novel แม้ไม่ได้กดจาก history bar

| Task | รายละเอียด | สถานะ |
|------|-----------|-------|
| **[NO-AUTOPLAY-1]** | app.js — ลบ else block auto-resume ใน renderNovelView(): เดิม else อ่าน localStorage `_historyKey()` แล้วเรียก `_doResume()` อัตโนมัติ → ลบทิ้ง user ต้องกดปุ่มเองเท่านั้น | ✅ เสร็จ | FILE: app.js | LINES: 1330–1337 | SECTION: renderNovelView() resume else block |
| **[SMART-BTN-SPA-1]** | app.js — แก้ nvPlayFirstBtn label "เล่นตอนแรก" → "เริ่มฟังนิยาย" | ✅ เสร็จ | FILE: app.js | LINES: 1265 | SECTION: renderNovelView() HTML nvPlayFirstBtn |
| **[SMART-BTN-SPA-2]** | app.js — แก้ nvPlayFirstBtn click handler: smart resume จาก `gh_ep_{uid}_{novelId}` localStorage → หา ep ts ล่าสุด progress < 1.0 → เล่นต่อ; ถ้าไม่เคยฟัง → เล่น ep แรก | ✅ เสร็จ | FILE: app.js | LINES: 1296–1316 | SECTION: renderNovelView() nvPlayFirstBtn click handler |
| **[SMART-BTN-SPA-3]** | app.js — เพิ่ม resumeTime param ใน `_nvPlayEp(idx, audioFiles, novel, resumeTime=0)` + canplay seek listener เมื่อ resumeTime > 0 | ✅ เสร็จ | FILE: app.js | LINES: 1494, 1521–1525 | SECTION: _nvPlayEp() signature + audio seek block |

---

## 🔴 Phase 18 — Cross-Device Sync via Firestore (2026-05-30)

### 🔍 ปัญหา: ฟังบน tablet แล้วเปลี่ยนมือถือ — progress หาย เพราะ localStorage ไม่ข้ามอุปกรณ์

**Root cause:** saveEpProgress + saveHistory เขียนแค่ localStorage ผูก uid — login uid เดียวกันก็ไม่ sync เพราะ localStorage เป็น per-device

**แผน:** เขียน Firestore users/{uid}/epProgress/{novelId} ควบคู่ localStorage (fallback)

| Task | รายละเอียด | สถานะ |
|------|-----------|-------|
| **[SYNC-A]** | app.js — เพิ่ม setDoc, serverTimestamp ใน Firestore import | ✅ เสร็จ | FILE: app.js | LINES: 23 | SECTION: import |
| **[SYNC-B]** | app.js — แก้ saveEpProgress(): เขียน localStorage เสมอ (fallback) + ถ้า login เขียน Firestore users/{uid}/epProgress/{novelId} merge:true | ✅ เสร็จ | FILE: app.js | LINES: 927–947 | SECTION: saveEpProgress() |
| **[SYNC-C]** | app.js — แก้ getEpProgressMap() → async Firestore+localStorage merge (ts-based); แก้ _nvBuildEpList() → async + await | ✅ เสร็จ | FILE: app.js | LINES: 950–970, 1393, 1416 | SECTION: getEpProgressMap(), _nvBuildEpList() |
| **[SYNC-D]** | app.js — แก้ saveHistory(): เพิ่ม Firestore write users/{uid}/history/{novelId} merge:true ควบคู่ localStorage | ✅ เสร็จ | FILE: app.js | LINES: 976–1003 | SECTION: saveHistory() |
| **[SYNC-E]** | app.js — แก้ renderHistory() → async, อ่าน Firestore users/{uid}/history/ merge localStorage (ts-based), sync กลับ localStorage | ✅ เสร็จ | FILE: app.js | LINES: 1175–1237 | SECTION: renderHistory() |

---

## 🔴 Phase 19 — PWA (Progressive Web App) (2026-05-30)

### 🔍 เป้าหมาย: ให้ user กด "ติดตั้งแอพ" บน Android/iOS ได้

**Stack:** Cloudflare Workers static assets — upload ไฟล์ตรงๆ ผ่าน dashboard

| Task | รายละเอียด | สถานะ |
|------|-----------|-------|
| **[PWA-A]** | สร้าง manifest.json: name, short_name, icons (192/512), theme_color, background_color, display:standalone, start_url | ✅ เสร็จ | FILE: manifest.json | LINES: full file (new) | SECTION: name, short_name, icons 192/512, theme_color #1a1a2e, display:standalone |
| **[PWA-B]** | สร้าง sw.js: service worker cache static assets (index.html, style.css, app.js, router.js) | ✅ เสร็จ | FILE: sw.js | LINES: full file (new) | SECTION: install, activate, fetch handlers |
| **[PWA-C]** | แก้ index.html: เพิ่ม <link rel="manifest">, register sw.js ใน <script>, meta theme-color | ✅ เสร็จ | FILE: index.html | LINES: 8–9 (manifest+theme-color), 224–229 (sw register) | SECTION: <head> manifest link, <body> sw.js register script |

---

## 🔴 Phase 20 — Navigation Redesign: Bottom Nav (Mobile) + Sidebar (Desktop) (2026-05-30)

### 🔍 เป้าหมาย: เปลี่ยน layout การนำทาง

**ความต้องการ:**
- **Mobile (≤768px)** → Bottom Navigation Bar แนวนอนด้านล่าง (แบบ App)
- **Tablet/Desktop (≥768px)** → Sidebar ด้านซ้าย (แทน Topbar)
- ใช้เฉพาะปุ่มที่มีในไฟล์อยู่แล้ว: หน้าแรก | คลังนิยาย | รายการโปรด | เข้าสู่ระบบ

**Design Reference:**
- รูป 1 (mobile): Bottom nav bar — icon + label, active = แดง
- รูป 2 (desktop): Sidebar ซ้าย — icon + label, active = highlight

| Task | รายละเอียด | สถานะ |
|------|-----------|-------|
| **[BNAV-CSS-1]** | style.css — เพิ่ม CSS .bottom-nav bar สำหรับ mobile ≤768px: fixed bottom, flex row, 4-5 items, icon+label, active color var(--primary) | ✅ เสร็จ | FILE: style.css | LINES: 1889–1943 | SECTION: .bottom-nav, .bottom-nav-item, active state |
| **[BNAV-HTML-1]** | index.html — เพิ่ม `<nav class="bottom-nav">` element ก่อน </body>: หน้าแรก / คลังนิยาย / รายการโปรด / เข้าสู่ระบบ (ซ่อน top navbar บน mobile) | ❌ ยังไม่ทำ |
| **[SIDEBAR-CSS-1]** | style.css — เพิ่ม CSS .sidebar สำหรับ desktop ≥768px: fixed left, width 220px, flex column, icon+label, active highlight | ❌ ยังไม่ทำ |
| **[SIDEBAR-HTML-1]** | index.html — เพิ่ม `<aside class="sidebar">` element: หน้าแรก / คลังนิยาย / รายการโปรด / เข้าสู่ระบบ + ซ่อน top navbar บน desktop | ❌ ยังไม่ทำ |
| **[NAV-JS-1]** | app.js — sync active state กับ bottom-nav และ sidebar ตาม route ปัจจุบัน | ❌ ยังไม่ทำ |
