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
| **[HOTFIX-20]** router.js + app.js + index.html — expose window._navigate ใน router.js, แทน dynamic import('./router.js') ทุกจุดใน app.js, ลบ pushState ซ้ำ + popstate ซ้ำใน index.html | ✅ เสร็จ | FILE: router.js | LINES: 90–95 | SECTION: window._navigate | FILE: app.js | LINES: 718, 780, 810, 1124, 1128 | SECTION: navigate calls | FILE: index.html | LINES: 352–368 | SECTION: navigate() bridge |
| **[HOTFIX-21]** app.js + admin.html + index.html — expose window._BASE จาก import.meta.url ใน app.js และ admin.html, แก้ onclick ทุกจุดใช้ window._BASE | ✅ เสร็จ | FILE: app.js | LINES: 28 | SECTION: window._BASE | FILE: admin.html | LINES: 1343, 1118, 1376 | SECTION: window._BASE, btn-view-web, auth guard | FILE: index.html | LINES: 45 | SECTION: navAdminBtn onclick |

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
| **[UX-1]** Loading skeleton | app.js — เพิ่ม skeleton UI ตอนโหลด episode list แทน spinner เปล่า | ❌ ต้องทำ |
| **[UX-2]** Scroll to top | router.js — scroll กลับขึ้นบนอัตโนมัติเมื่อ navigate ไปหน้าใหม่ | ❌ ต้องทำ |
| **[UX-3]** Active episode sync | app.js — แสดง active ep-item ตรงกับตอนที่กำลังเล่นใน player bar | ❌ ต้องทำ |

**หมายเหตุ:** login.html มีดีไซน์ดีแล้ว — ปรับเฉพาะ text/copy ให้สื่อถึง "ฟัง" เป็นหลัก

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
