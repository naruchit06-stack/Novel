# MeMonster Novel — GitHub Pages + Firebase Setup

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
ไปที่ Firebase Console → Firestore → Rules แล้ว paste นี้:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // นิยาย: อ่านได้ทุกคน, เขียนได้เฉพาะ admin
    match /novels/{novelId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.email in ['momoppl01@gmail.com', 'admin@memonster.com'];
    }
    // Users: อ่าน/เขียนได้เฉพาะเจ้าของ
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /novels/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.email in ['momoppl01@gmail.com', 'admin@memonster.com'];
    }
  }
}
```

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
