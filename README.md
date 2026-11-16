# The Golden Hoard Novels

**เว็บจริง:** https://naruchit06-stack.github.io/Novel/
**โค้ด:** https://github.com/naruchit06-stack/Novel

> เว็บถูก deploy เป็น GitHub Pages แบบ project site (ใต้ `/Novel/`)
> `app.js` / `router.js` / `404.html` / `sw.js` อ่าน base path จาก `import.meta.url` เอง
> จึงรองรับทั้ง root และ subfolder — ไม่ต้องแก้โค้ดเมื่อย้ายโดเมน

## วิธีนำขึ้น GitHub Pages

### ขั้นตอนที่ 1: สร้าง Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### ขั้นตอนที่ 2: เปิด GitHub Pages
1. ไปที่ Repository → Settings → Pages
2. Source: **Deploy from a branch** → Branch: `main` / `/ (root)`
3. Save → รอ 1-2 นาที → เว็บออนไลน์!

---

## ตั้งค่า Firebase

### Firestore Rules (สำคัญมาก!)
ใช้ไฟล์ `firestore.rules` ในโฟลเดอร์นี้ได้เลย ( Firebase Console → Firestore → Rules → paste )

จุดสำคัญของ rules ชุดนี้:
- สิทธิ์ admin มาจาก collection `admins/{uid}` เท่านั้น (ไม่มี email ฝังในไฟล์)
- มี data validation ของ `novels` และ `episodes` (ชนิด/ขนาด field)
- รองรับ `settings/{doc}` สำหรับ hero image

**⚠️ ตั้งค่าครั้งแรก (จำเป็น):** เนื่องจาก rules ไม่ให้ใครเขียน `admins` ก่อนจะมี super admin
ต้องสร้างเอกสารนี้ใน Firebase Console ด้วยมือ 1 ครั้ง:

```
Collection: admins
Document ID: <UID ของคุณ>          (หาได้จาก Authentication → Users)
Fields:
  role         : "super"   (string)
  superAdmin   : true      (boolean)
  active       : true      (boolean)
  email        : "อีเมลของคุณ"
  displayName  : "ชื่อที่แสดง"
```

### Storage Rules
ใช้ไฟล์ `storage.rules` — จำกัดขนาดไม่เกิน 100 MB และอนุญาตเฉพาะ
`audio/*`, `image/*`, `application/pdf`, `text/plain` และเขียนได้เฉพาะ admin
(ตรวจจาก `admins/{uid}` เช่นกัน)

### เปิด Google Sign-In
Firebase Console → Authentication → Sign-in method → เปิด **Google**

### เพิ่ม GitHub Pages Domain ใน Firebase
Firebase Console → Authentication → Settings → Authorized domains
→ เพิ่ม: `your-username.github.io`

---

## ตั้งค่า Cloudinary (สำหรับ Cover Image)

1. ไปที่ [cloudinary.com](https://cloudinary.com) → เข้าสู่ระบบ
2. Settings → Upload → Upload presets → Add upload preset
3. Signing mode: **Unsigned**
4. Preset name: `ml_default` (หรือตั้งชื่อใหม่แล้วอัปเดตใน admin.html)
5. Cloud name: `dmr6ln5hy` (ของคุณอยู่แล้ว)

---

## โครงสร้างไฟล์

```
├── index.html      → หน้าหลัก (โหลดนิยายจาก Firestore realtime)
├── login.html      → หน้าเข้าสู่ระบบ (Firebase Auth)
├── admin.html      → Admin Panel (Firestore + Storage + Cloudinary)
└── README.md       → ไฟล์นี้
```

## ฟีเจอร์ที่ทำงานได้จริง
- ✅ เข้าสู่ระบบด้วย Google
- ✅ สมัครสมาชิก / Login ด้วย Email
- ✅ ลืมรหัสผ่าน (รีเซ็ตผ่านอีเมล)
- ✅ นิยาย sync realtime จาก Firestore
- ✅ Admin อัพโหลดนิยาย + เสียง + ปก
- ✅ ปก upload ผ่าน Cloudinary
- ✅ ไฟล์เสียง upload ผ่าน Firebase Storage
- ✅ ลบ/แก้ไขนิยายได้

---

## ยอดใช้จริงของ Cloudinary (แถบพื้นที่จัดเก็บในหน้าแอดมิน)

หน้าแอดมินแสดง **ยอดใช้จริง** ได้ 2 ทาง (เลือกทางเดียว):

1. **Cloudflare Worker (แนะนำสำหรับเว็บจริง)** — ดู `cloudflare-worker/README.md`
   แล้วเอา URL มาใส่ในหน้าแอดมิน → "ตั้งค่าการเชื่อมต่อ Cloudinary"
2. **ตัวอ่านในเครื่อง** — เติม `tools/cloudinary.json` แล้วรัน `python tools/usage_proxy.py`
   (เว็บจะลองเรียก `http://127.0.0.1:8100` เองอัตโนมัติ)

ถ้ายังไม่ตั้งค่าทั้งสองทาง แถบจะแสดง **ค่าประมาณ** จากไฟล์ในระบบ พร้อมบอกสาเหตุ

## หลัง deploy ครั้งแรก (สำคัญ)

- Firebase Console → Authentication → Settings → **Authorized domains**
  ต้องมี `naruchit06-stack.github.io` ไม่งั้น Google Sign-In จะขึ้น `auth/unauthorized-domain`
- เข้า `/Novel/admin.html` แล้วล็อกอินด้วยบัญชีแอดมิน (UID ต้องมีเอกสารใน collection `admins`)
