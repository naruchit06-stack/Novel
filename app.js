/* ============================================================
   app.js — The Golden Hoard Novels
   ทุกอย่างที่เกี่ยวกับการทำงาน / ตรรกะ / Firebase
   ============================================================

   INDEX:
   1. Firebase Init
   2. Auth — onAuthStateChanged, handleSignOut
   3. Firestore — โหลด + render นิยาย
   4. Novel Cards — cardHTML(), renderNovels(), renderSection()
   5. Search & Filter — filterNovels()
   6. Tab Switch — switchTab()
   7. Modal — openModal(), toggleGroup(), closeModal()
   8. Audio Player — playEpisode(), togglePlay(), prevEp(), nextEp()
   9. Progress Bar & Time — seekAudio(), timeupdate, formatTime()
   10. Media Session API
   11. Theme — setTheme()
   ============================================================ */

import { initializeApp }    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut }
                            from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, orderBy, where, doc, getDoc, getDocs, setDoc, addDoc, serverTimestamp }
                            from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/* ===== 1. FIREBASE INIT ===== */

// BASE PATH จาก import.meta.url ของ app.js — ถูกต้องเสมอ ไม่ขึ้นกับ URL ปัจจุบัน
window._BASE = (() => {
  try {
    const folder = new URL('.', import.meta.url).pathname.replace(/\/$/, '');
    return folder === '/' ? '' : folder;
  } catch (e) { return ''; }
})();

const app = initializeApp({
  apiKey:            "AIzaSyCeU6VZniOzJ-gbTr4K75E6TpKELmRRVlk",
  authDomain:        "login-24acc.firebaseapp.com",
  projectId:         "login-24acc",
  storageBucket:     "login-24acc.firebasestorage.app",
  messagingSenderId: "440213309587",
  appId:             "1:440213309587:web:072857c31c2e6bd5062566"
});
const auth = getAuth(app);
const db   = getFirestore(app);


/* ===== 1b. SEC-1: XSS GUARDS ===== */
/* ข้อมูลทุกอย่างจาก Firestore ถือเป็น "ข้อมูลที่ไม่เชื่อถือ" —
   ก่อนเอาไปประกอบเป็น HTML ต้องผ่าน esc() หรือ safeUrl() ทุกครั้ง */

// escape อักขระ HTML — ใช้กับข้อความทุกตัวที่ interpolate ลง innerHTML
function esc(v) {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
window.esc = esc;

// อนุญาตเฉพาะ URL ที่ขึ้นต้นด้วย http(s):// หรือ path relative
// กัน javascript:, vbscript:, data:text/html ฯลฯ
function safeUrl(u) {
  if (!u) return '';
  const s = String(u).trim();
  return /^(https?:\/\/|\/|\.\/)/i.test(s) ? s : '';
}
window.safeUrl = safeUrl;


const membershipDocRef = doc(db, 'settings', 'membership');
let _membership = { enabled: false, priceText: '', memberDays: 30, qrUrl: '' };
let _membershipLoaded = false;
let _memberUntil = null;
let _memberCheckedUid = null;
let _authUser = null;
let _adminKnown = null;
let _nvLocked = new Set();

function toDateVal(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v.toDate === 'function') return v.toDate();
  if (typeof v.seconds === 'number') return new Date(v.seconds * 1000);
  if (typeof v === 'number') return new Date(v);
  return null;
}

async function loadMembershipSettings(force) {
  if (_membershipLoaded && !force) return _membership;
  try {
    const snap = await getDoc(membershipDocRef);
    if (snap.exists()) {
      const d = snap.data() || {};
      _membership = {
        enabled: d.enabled === true,
        priceText: typeof d.priceText === 'string' ? d.priceText : '',
        memberDays: Number(d.memberDays) > 0 ? Number(d.memberDays) : 30,
        qrUrl: safeUrl(d.qrUrl)
      };
    }
  } catch (e) {
    console.warn('[membership/settings]', e);
  }
  _membershipLoaded = true;
  return _membership;
}

async function loadMemberStatus(user) {
  _memberUntil = null;
  _memberCheckedUid = user ? user.uid : null;
  if (!user) return null;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    _memberUntil = snap.exists() ? toDateVal(snap.data().memberUntil) : null;
  } catch (e) {
    _memberUntil = null;
  }
  return _memberUntil;
}

let _memberUnsub = null;

function watchMemberStatus(user) {
  if (_memberUnsub) { _memberUnsub(); _memberUnsub = null; }
  if (!user) return;
  _memberUnsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
    const wasActive = isMemberActive();
    _memberUntil = snap.exists() ? toDateVal(snap.data().memberUntil) : null;
    if (!wasActive && isMemberActive()) {
      closeUnlockDialog();
      refreshNovelForMembership();
    }
    syncMemberMenu();
  }, (e) => console.warn('[membership/watch]', e));
}

function isMemberActive() {
  return !!_memberUntil && _memberUntil.getTime() > Date.now();
}

function fmtMemberUntil() {
  if (!_memberUntil) return '';
  try {
    return _memberUntil.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) {
    return _memberUntil.toISOString().slice(0, 10);
  }
}

function memberPageHref() {
  return (window._BASE || '') + '/member.html';
}

function syncMemberMenu() {
  const label = isMemberActive() ? 'สมาชิกของฉัน' : 'สมัครสมาชิก';
  const href  = memberPageHref();
  const onMemberPage = /\/member\.html$/i.test(window.location.pathname);

  document.querySelectorAll('.nav-links').forEach(nav => {
    let a = nav.querySelector('a[data-member-nav]');
    if (!a) {
      a = document.createElement('a');
      a.setAttribute('data-member-nav', '');
      nav.appendChild(a);
    }
    a.setAttribute('href', href);
    a.textContent = label;
    a.classList.toggle('active', onMemberPage);
  });

  document.querySelectorAll('.nav-mobile-drawer').forEach(nav => {
    let a = nav.querySelector('a[data-member-nav]');
    if (!a) {
      a = document.createElement('a');
      a.setAttribute('data-member-nav', '');
      a.innerHTML = '<span data-icon="crown"></span> <span data-member-nav-label></span>';
      const authBlock = nav.querySelector('.nav-mobile-auth');
      if (authBlock) nav.insertBefore(a, authBlock);
      else nav.appendChild(a);
    }
    a.setAttribute('href', href);
    const lbl = a.querySelector('[data-member-nav-label]');
    if (lbl) lbl.textContent = label;
    a.classList.toggle('active', onMemberPage);
  });
}

function isEpisodeLocked(af, idx) {
  if (!_membership.enabled) return false;
  if (_adminKnown === true) return false;
  if (idx !== undefined && _nvLocked.has(idx)) return true;
  return !!(af && af.premium === true) && !isMemberActive();
}

async function isAdminNow() {
  if (_adminKnown === true) return true;
  if (!_authUser) return false;
  _adminKnown = await checkIsAdmin(_authUser);
  return _adminKnown === true;
}

const AUDIO_WORKER  = 'https://novel-audio.hollymons4654.workers.dev';
const SIGN_MIN_LEFT = 60000;

let _r2Sign    = { key: '', url: '', expiresAt: 0 };
let _r2Pending = null;

class MembersOnlyError extends Error {
  constructor() { super('MEMBERS_ONLY'); this.code = 'MEMBERS_ONLY'; }
}

function isR2Episode(af) {
  return !!(af && af.audioKey && !af.url);
}

async function r2SignUrl(key) {
  if (!key) throw new Error('NO_KEY');
  if (_r2Sign.key === key && _r2Sign.url && _r2Sign.expiresAt - Date.now() > SIGN_MIN_LEFT) return _r2Sign.url;
  if (_r2Pending && _r2Pending.key === key) return _r2Pending.promise;
  const promise = (async () => {
    const user  = auth.currentUser;
    const token = user ? await user.getIdToken().catch(() => '') : '';
    if (!token) throw new MembersOnlyError();
    const res = await fetch(AUDIO_WORKER + '/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ key })
    });
    if (res.status === 403) throw new MembersOnlyError();
    if (!res.ok) throw new Error('SIGN_' + res.status);
    const data = await res.json();
    if (!data || !data.url) throw new Error('SIGN_BAD_RESPONSE');
    _r2Sign = { key, url: data.url, expiresAt: Number(data.expiresAt) || (Date.now() + 600000) };
    return _r2Sign.url;
  })();
  _r2Pending = { key, promise };
  try { return await promise; }
  finally { if (_r2Pending && _r2Pending.promise === promise) _r2Pending = null; }
}

async function resolveEpisodeSrc(af) {
  if (isR2Episode(af)) return await r2SignUrl(af.audioKey);
  let src = af.url || '';
  if (src.includes('cloudinary.com') && src.includes('/raw/upload/'))
    src = src.replace('/raw/upload/', '/video/upload/');
  return src;
}

async function showMembersOnly(novel) {
  try { await openUnlockDialog(novel); } catch (e) {}
  if (_unlockEl && _unlockEl.classList.contains('open')) return;
  alert('ตอนนี้สำหรับสมาชิก — กรุณาเข้าสู่ระบบด้วยบัญชีสมาชิกที่ยังไม่หมดอายุ');
}

async function loadEpisodesForAccess(novelId, epCnt) {
  const epsRef   = collection(db, 'novels', novelId, 'episodes');
  const fullOpen = !_membership.enabled || isMemberActive() || await isAdminNow();
  const cacheKey = novelId + (fullOpen ? '|full' : '|free');
  if (_epCache[cacheKey]) return _epCache[cacheKey];

  let out;
  if (fullOpen) {
    const snap = await getDocs(query(epsRef, orderBy('order', 'asc')));
    const list = snap.docs.map(d => ({ id: d.id, url: d.data().audioUrl, name: d.data().title, ...d.data() }));
    out = { list, locked: new Set(), count: list.length };
  } else {
    let snap = null;
    try {
      snap = await getDocs(query(epsRef, where('premium', '==', false)));
    } catch (e) {
      console.warn('[membership/episodes]', e);
      try { snap = await getDocs(query(epsRef, orderBy('order', 'asc'))); } catch (e2) { snap = null; }
    }
    const total = Math.max(Number(epCnt) || 0, snap ? snap.size : 0);
    const list  = new Array(total);
    const rest  = [];
    if (snap) {
      snap.docs.forEach(d => {
        const data = d.data();
        const rec  = { id: d.id, url: data.audioUrl, name: data.title, ...data };
        const idx  = Number(data.order) - 1;
        if (Number.isInteger(idx) && idx >= 0 && idx < total && !list[idx]) list[idx] = rec;
        else rest.push(rec);
      });
      rest.forEach(r => list.push(r));
    }
    const locked = new Set();
    for (let i = 0; i < total; i++) if (!list[i]) locked.add(i);
    out = { list, locked, count: total };
  }
  _epCache[cacheKey] = out;
  return out;
}

async function refreshNovelForMembership() {
  if (!_membershipLoaded) await loadMembershipSettings();
  if (!_nvNovel || !document.getElementById('nvEpList')) return;
  const epCnt = Math.max(Number.isFinite(_nvNovel.episodeCount) ? _nvNovel.episodeCount : 0, _nvAudioFiles.length);
  try {
    const eps = await loadEpisodesForAccess(_nvNovel.id, epCnt);
    _nvBuildEpList(epCnt, eps.list, _nvNovel, eps.locked);
  } catch (e) {
    console.warn('[membership/refresh]', e);
  }
}

let _unlockEl = null;

function buildUnlockDom() {
  if (_unlockEl && document.body.contains(_unlockEl)) return _unlockEl;
  _unlockEl = document.createElement('div');
  _unlockEl.className = 'gh-unlock-overlay';
  _unlockEl.innerHTML = `
    <div class="gh-unlock-card" role="dialog" aria-modal="true" aria-label="ปลดล็อกตอนสมาชิก">
      <button class="gh-unlock-close" type="button" aria-label="ปิด">✕</button>
      <div class="gh-unlock-title">${icon('lock')} ตอนนี้สำหรับสมาชิก</div>
      <div class="gh-unlock-body"></div>
    </div>`;
  _unlockEl.querySelector('.gh-unlock-close').addEventListener('click', closeUnlockDialog);
  _unlockEl.addEventListener('click', (e) => { if (e.target === _unlockEl) closeUnlockDialog(); });
  document.body.appendChild(_unlockEl);
  return _unlockEl;
}

function closeUnlockDialog() {
  if (!_unlockEl) return;
  _unlockEl.classList.remove('open');
  document.body.style.overflow = '';
}

async function openUnlockDialog(novel) {
  await loadMembershipSettings();
  if (!_membership.enabled) return;
  const el  = buildUnlockDom();
  const box = el.querySelector('.gh-unlock-body');
  box.innerHTML = '<div class="gh-unlock-note">กำลังโหลดข้อมูล...</div>';
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
  await renderUnlockBody(box, novel);
}

async function renderUnlockBody(box, novel) {
  const priceLine = _membership.priceText
    ? `<div class="gh-unlock-price">${esc(_membership.priceText)}</div>`
    : '';
  const qrBlock = _membership.qrUrl
    ? `<img class="gh-unlock-qr" src="${esc(_membership.qrUrl)}" alt="QR รับโอน">`
    : `<div class="gh-unlock-note">แอดมินยังไม่ได้อัปโหลด QR รับโอน</div>`;
  const memberHref = memberPageHref();
  const memberCta = text =>
    `<a class="gh-unlock-btn gh-unlock-link" href="${memberHref}">${text}</a>`;

  if (!_authUser) {
    box.innerHTML = `
      ${qrBlock}
      ${priceLine}
      <div class="gh-unlock-note">เข้าสู่ระบบก่อน แล้วกลับมาแจ้งโอนได้ทันที (สมาชิก ${_membership.memberDays} วันต่อการอนุมัติ 1 ครั้ง)</div>
      ${memberCta('สมัครสมาชิก')}
      <button class="gh-unlock-btn ghost" id="ghUnlockLogin" type="button">เข้าสู่ระบบ</button>`;
    box.querySelector('#ghUnlockLogin').addEventListener('click', () => {
      window.location.href = (window._BASE || '') + '/login.html';
    });
    return;
  }

  if (isMemberActive()) {
    box.innerHTML = `
      <div class="gh-unlock-note">คุณเป็นสมาชิกอยู่แล้ว ใช้ได้ถึง ${esc(fmtMemberUntil())}</div>
      ${memberCta('ดูสถานะสมาชิก')}
      <button class="gh-unlock-btn ghost" id="ghUnlockClose" type="button">ปิด</button>`;
    box.querySelector('#ghUnlockClose').addEventListener('click', closeUnlockDialog);
    return;
  }

  let pending = null;
  try {
    const snap = await getDocs(query(
      collection(db, 'paymentRequests'),
      where('uid', '==', _authUser.uid),
      where('status', '==', 'pending')
    ));
    pending = snap.empty ? null : snap.docs[0].data();
  } catch (e) {
    console.warn('[membership/pending]', e);
  }

  if (pending) {
    const amt = Number(pending.amount) || 0;
    box.innerHTML = `
      ${qrBlock}
      ${priceLine}
      <div class="gh-unlock-pending">
        <strong>รอตรวจสอบ</strong>
        <span>แจ้งโอน ${amt.toLocaleString('th-TH')} บาทแล้ว แอดมินกำลังตรวจสอบ</span>
      </div>
      ${memberCta('ไปหน้าสมัครสมาชิก')}
      <button class="gh-unlock-btn ghost" id="ghUnlockClose" type="button">ปิด</button>`;
    box.querySelector('#ghUnlockClose').addEventListener('click', closeUnlockDialog);
    return;
  }

  box.innerHTML = `
    ${qrBlock}
    ${priceLine}
    ${memberCta('สมัครสมาชิก — ดูราคาและ QR')}
    <div class="gh-unlock-note">หรือแจ้งโอนที่นี่: โอนตาม QR ด้านบน แล้วกรอกยอดที่โอนจริง (สมาชิก ${_membership.memberDays} วันต่อการอนุมัติ 1 ครั้ง)</div>
    <label class="gh-unlock-label" for="ghUnlockAmount">ยอดเงินที่โอน (บาท)</label>
    <input class="gh-unlock-input" id="ghUnlockAmount" type="number" min="1" step="1" inputmode="numeric" placeholder="เช่น 99">
    <label class="gh-unlock-label" for="ghUnlockNote">หมายเหตุ (ไม่บังคับ)</label>
    <textarea class="gh-unlock-input" id="ghUnlockNote" rows="2" maxlength="500" placeholder="เช่น ชื่อบัญชีผู้โอน / เลขอ้างอิง"></textarea>
    <div class="gh-unlock-msg" id="ghUnlockMsg"></div>
    <button class="gh-unlock-btn ghost" id="ghUnlockSubmit" type="button">แจ้งโอนแล้ว</button>`;

  const submitBtn = box.querySelector('#ghUnlockSubmit');
  const msgEl     = box.querySelector('#ghUnlockMsg');

  submitBtn.addEventListener('click', async () => {
    const amount = Number(box.querySelector('#ghUnlockAmount').value);
    const note   = (box.querySelector('#ghUnlockNote').value || '').trim();
    msgEl.textContent = '';
    if (!Number.isFinite(amount) || amount <= 0) {
      msgEl.textContent = 'กรุณากรอกยอดเงินที่โอนให้ถูกต้อง';
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังส่ง...';
    try {
      await addDoc(collection(db, 'paymentRequests'), {
        uid: _authUser.uid,
        name: _authUser.displayName || (_authUser.email || '').split('@')[0] || 'ผู้ใช้',
        email: _authUser.email || '',
        amount,
        note,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      await renderUnlockBody(box, novel);
    } catch (e) {
      console.warn('[membership/request]', e);
      msgEl.textContent = 'ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
      submitBtn.disabled = false;
      submitBtn.textContent = 'แจ้งโอนแล้ว';
    }
  });
}


/* ===== 2. AUTH ===== */
// [SEC-3] ไม่ฝัง email admin ใน client อีกต่อไป — ตรวจจาก Firestore admins/{uid} เท่านั้น
// (เอกสาร admins/{uid} ต้องมีอยู่จริง, field active ไม่ใช่ false)
async function checkIsAdmin(user) {
  if (!user) return false;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists() && snap.data()?.active !== false;
  } catch (e) {
    console.warn('[admin-check]', e);
    return false;
  }
}

onAuthStateChanged(auth, async (user) => {
  _authUser = user;
  if (!user) _adminKnown = null;
  // [JS-1] Navbar elements
  const loginBtn      = document.getElementById('navLoginBtn');
  const registerBtn   = document.getElementById('navRegisterBtn');
  const userMenu      = document.getElementById('navUserMenu');
  const userNameEl    = document.getElementById('navUserName');
  const adminBtn      = document.getElementById('navAdminBtn');
  const mobileGuest   = document.getElementById('mobileGuestAuth');

  if (user) {
    // ซ่อนปุ่ม login/register
    if (loginBtn)    loginBtn.style.display    = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (mobileGuest) mobileGuest.style.display = 'none';
    // แสดง user menu
    if (userMenu) {
      userMenu.style.display = 'flex';
      if (userNameEl) userNameEl.textContent = user.displayName || user.email.split('@')[0];
    }
    // [AVATAR-1] เดิมอวตารแสดงตัวอักษร U ตายตัว → ใช้รูปโปรไฟล์ หรืออักษรแรกของชื่อ
    const avatarEl = document.getElementById('navAvatar');
    if (avatarEl) {
      avatarEl.textContent = '';
      if (user.photoURL) {
        const im = document.createElement('img');
        im.src = user.photoURL;
        im.alt = '';
        im.referrerPolicy = 'no-referrer';
        avatarEl.appendChild(im);
      } else {
        const nm = (user.displayName || user.email || 'U').trim();
        avatarEl.textContent = (nm.charAt(0) || 'U').toUpperCase();
      }
    }
    // แสดงปุ่ม admin ถ้าเป็น admin (ตรวจจาก Firestore)
    if (adminBtn) {
      const isAdmin = await checkIsAdmin(user);
      window._isAdmin = isAdmin;
      _adminKnown = isAdmin;
      adminBtn.style.display = isAdmin ? 'flex' : 'none';
    }
    // แสดงประวัติการฟัง
    renderHistory();
  } else {
    // แสดงปุ่ม login/register
    if (loginBtn)    loginBtn.style.display    = 'inline-flex';
    if (registerBtn) registerBtn.style.display = 'inline-flex';
    if (mobileGuest) mobileGuest.style.display = 'flex';
    // ซ่อน user menu + admin
    if (userMenu)  userMenu.style.display  = 'none';
    if (adminBtn)  adminBtn.style.display  = 'none';
  }

  await loadMemberStatus(user);
  watchMemberStatus(user);
  syncMemberMenu();
  await refreshNovelForMembership();
});

window.handleSignOut = async function() {
  await signOut(auth);
  window.location.reload();
};

/* [DROPDOWN-FIX-2] คลิกอวตารเพื่อเปิด/ปิดเมนู (จำเป็นบนจอสัมผัสที่ไม่มี hover)
   + คลิกนอกเมนูเพื่อปิด */
(function () {
  const avatar = document.getElementById('navAvatar');
  const menu   = document.getElementById('navUserMenu');
  if (!avatar || !menu) return;
  avatar.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) menu.classList.remove('open');
  });
})();


/* ===== 3. FIRESTORE — โหลดนิยาย ===== */
let allNovels = [];
let filtered  = [];

const novelsRef   = collection(db, 'novels');

/* ===== HERO IMAGE ===== */
async function loadHeroImage() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'hero'));
    if (snap.exists() && snap.data().imageUrl) {
      const el = document.getElementById('heroImage');
      if (!el) return;
      const heroUrl = safeUrl(snap.data().imageUrl);
      if (!heroUrl) return;
      el.innerHTML = `<img src="${esc(heroUrl)}" alt="Hero" style="width:100%;height:100%;object-fit:cover;border-radius:16px;">`;
    }
  } catch(e) { console.warn('Hero image:', e); }
}
loadHeroImage();
const novelsQuery = query(novelsRef, orderBy('createdAt', 'desc'));

onSnapshot(novelsQuery, (snapshot) => {
  allNovels = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  filtered  = [...allNovels];
  _pruneFavs();   // [FAV-PRUNE-1] เก็บกวาด id ที่นิยายถูกลบไปแล้ว
  renderSection('newReleasesGrid', allNovels.slice(0, 3));
  renderSection('popularGrid',     allNovels.slice(0, 4));
  renderNovels(filtered);
}, (error) => {
  console.warn('Firestore error:', error);
  allNovels = [];
  filtered  = [];
  renderSection('newReleasesGrid', []);
  renderSection('popularGrid',     []);
  renderNovels([]);
});


/* ===== 4. NOVEL CARDS ===== */
const STATUS_MAP = {
  ongoing: { label: 'กำลังดำเนิน', cls: 'badge-ongoing' },
  done:    { label: 'จบแล้ว',       cls: 'badge-complete' },
  new:     { label: 'ใหม่',          cls: 'badge-ongoing'  },
  hiatus:  { label: 'หยุดพัก',      cls: 'badge-hiatus'   },
};

// [JS-2] Horizontal card template
function cardHTML(n) {
  const st  = STATUS_MAP[n.status] || STATUS_MAP.ongoing;
  const coverUrl = safeUrl(n.coverUrl);
  const cover = coverUrl
    ? `<img src="${esc(coverUrl)}" alt="${esc(n.title)}" loading="lazy" onerror="this.style.display='none'">`
    : `<div class="novel-card-cover-placeholder">${icon('book')}</div>`;
  const rating = Number.isFinite(n.rating) && n.rating ? `${icon('star')} ${n.rating}` : '';
  const views  = Number.isFinite(n.views)  && n.views  ? `${icon('eye')} ${(n.views/1000).toFixed(1)}K`  : '';
  const likes  = Number.isFinite(n.likes)  && n.likes  ? `${icon('heart')} ${(n.likes/1000).toFixed(1)}K`  : '';
  const epCount = Number.isFinite(n.episodeCount) ? n.episodeCount : 0;
  const isFav  = _getFavs().includes(n.id);
  return `
  <a href="javascript:void(0)" data-novel-id="${esc(n.id)}" class="novel-card-h" onclick="window._spaNavigate(this)">
    <div class="novel-card-cover" style="position:relative">
      ${cover}
      <span class="novel-card-cover-badge badge ${st.cls}">${st.label}</span>
      <button class="novel-card-heart${isFav ? ' fav-active' : ''}" data-fav-id="${esc(n.id)}"
        onclick="event.preventDefault();event.stopPropagation();toggleFav('${esc(n.id)}',this)"
        title="${isFav ? 'เอาออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}">
        ${isFav ? icon('heart') : icon('heart-outline')}
      </button>
    </div>
    <div class="novel-card-body">
      <div class="novel-card-title">${esc(n.title)}</div>
      <div class="novel-card-desc">${esc(n.desc || n.description || '')}</div>
      <div class="novel-card-meta">
        ${rating ? `<span class="meta-rating">${rating}</span>` : ''}
        ${views  ? `<span>${views}</span>` : ''}
        ${likes  ? `<span class="meta-likes">${likes}</span>` : ''}
        <span>${icon('book')} ${epCount} ตอน</span>
      </div>
      <div class="novel-card-footer">
        <span class="novel-card-read-btn">${icon('play')} ฟังเลย</span>
      </div>
    </div>
  </a>`;
}

/* ===== [CARD-H-1] Favorites helpers ===== */
function _getFavs() {
  try { return JSON.parse(localStorage.getItem('gh_favs') || '[]'); } catch { return []; }
}
function _saveFavs(arr) {
  localStorage.setItem('gh_favs', JSON.stringify(arr));
}
/* ===== [FAV-SYNC-1] ให้หัวใจของเรื่องเดียวกันตรงกันทุกการ์ด (หน้าแรกมีหลายกริด) ===== */
function _syncFavButtons(novelId) {
  const on = _getFavs().includes(novelId);
  const nodes = document.querySelectorAll('.novel-card-heart[data-fav-id="' + novelId + '"]');
  nodes.forEach(b => {
    b.classList.toggle('fav-active', on);
    b.innerHTML = on ? icon('heart') : icon('heart-outline');
    b.title = on ? 'เอาออกจากรายการโปรด' : 'เพิ่มในรายการโปรด';
  });
}
window._syncFavButtons = _syncFavButtons;

function toggleFav(novelId, btn) {
  let favs = _getFavs();
  const idx = favs.indexOf(novelId);
  const adding = idx === -1;
  if (adding) favs.push(novelId);
  else favs.splice(idx, 1);
  _saveFavs(favs);

  // [FAV-SYNC-1] อัปเดตหัวใจของเรื่องเดียวกันทุกการ์ด (หน้าแรกมี 3 กริด)
  _syncFavButtons(novelId);
  _updateFavBadge();

  if (!adding) {
    /* ถ้ากำลังอยู่ในหน้า favorites ให้ลบการ์ดทิ้ง */
    const appView = document.getElementById('app-view');
    const isFavPage = appView?.dataset.view === 'favorites';
    if (isFavPage) {
      const card = btn && btn.closest ? btn.closest('.novel-card-h') : null;
      if (card) card.remove();
      const grid = document.getElementById('favGrid');
      if (grid && !grid.querySelector('.novel-card-h')) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">${icon('heart-outline')}</div><p>ยังไม่มีรายการโปรด<br><small>กดรูปหัวใจบนการ์ดนิยายเพื่อเพิ่ม</small></p></div>`;
      }
    }
  }
}
function _updateFavBadge() {
  const count = _getFavs().length;
  const link = document.getElementById('nav-favorites-link');
  if (!link) return;
  link.textContent = count > 0 ? `รายการโปรด (${count})` : 'รายการโปรด';
}
window.toggleFav = toggleFav;

/* ===== [FAV-PRUNE-1] ลบ id ที่นิยายถูกลบไปแล้ว เพื่อให้ตัวเลขบนเมนูตรงกับการ์ด ===== */
function _pruneFavs() {
  if (!allNovels || !allNovels.length) return false;   // ยังโหลดไม่เสร็จ → อย่าแตะ
  const favs = _getFavs();
  let changed = false;
  if (favs.length) {
    const valid = favs.filter(id => allNovels.some(n => n.id === id));
    if (valid.length !== favs.length) {
      _saveFavs(valid);
      changed = true;
    }
  }
  _updateFavBadge();   // ให้ตัวเลขบนเมนูตรงกับของจริงเสมอ
  return changed;
}
window._pruneFavs = _pruneFavs;

function renderNovels(list) {
  const grid = document.getElementById('novelsGrid');
  const countEl = document.getElementById('novels-count');
  if (countEl) countEl.textContent = list.length + ' เรื่อง';
  // [BUG-GRID-1] grid อาจยังไม่มี (view อื่นไม่ได้ mount อยู่) — ไม่ต้อง throw
  if (!grid) return;
  grid.innerHTML = list.length
    ? list.map(cardHTML).join('')
    : `<div class="empty-state"><div class="empty-icon">${icon('mic')}</div><p>ยังไม่มีนิยายเสียง</p></div>`;
}

function renderSection(gridId, novels) {
  const el = document.getElementById(gridId);
  if (el) el.innerHTML = novels.length
    ? novels.map(cardHTML).join('')
    : `<div class="empty-state"><p>ยังไม่มีข้อมูล</p></div>`;
}


/* ===== 5. SEARCH & FILTER ===== */
let currentFilterTab = 'popular'; // track active filter tab

window.filterNovels = function(src) {
  // [SEARCH-FIX-2] รับ element ที่พิมพ์เข้ามา (this) — เดิม sync ค่ากลับทำให้ลบข้อความไม่ได้
  const ids = ['searchInputMain', 'searchInput', 'searchInputDrawer'];
  const boxes = ids.map(id => document.getElementById(id)).filter(Boolean);

  let raw;
  if (src && typeof src.value === 'string') {
    raw = src.value;
  } else {
    const filled = boxes.find(b => b.value.trim());
    raw = filled ? filled.value : '';
  }
  // sync ไปยังช่องอื่น (ไม่แตะช่องที่กำลังพิมพ์)
  boxes.forEach(b => { if (b !== src && b.value !== raw) b.value = raw; });

  const q = raw.toLowerCase().trim();

  let result = applyFilterTab(currentFilterTab, allNovels);
  if (q) {
    result = result.filter(n =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.author || '').toLowerCase().includes(q) ||
      (n.tags || []).some(t => String(t).toLowerCase().includes(q))
    );
  }
  renderNovels(result);
};

// [JS-3] filter tab logic — ยอดนิยม / มาใหม่ / อัปเดต / ทั้งหมด
function applyFilterTab(tab, novels) {
  const now      = Date.now();
  const msPerDay = 86_400_000;

  if (tab === 'popular') {
    return [...novels].sort((a, b) => (b.views || 0) - (a.views || 0));
  }
  if (tab === 'new') {
    return [...novels].sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? (a.createdAt?.seconds * 1000) ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? (b.createdAt?.seconds * 1000) ?? 0;
      return tb - ta;
    });
  }

// --- MID-CODE CHECKPOINT: งานเดียว, buffer พอ ---

  if (tab === 'updated') {
    return [...novels].sort((a, b) => {
      const ta = a.updatedAt?.toMillis?.() ?? (a.updatedAt?.seconds * 1000) ?? 0;
      const tb = b.updatedAt?.toMillis?.() ?? (b.updatedAt?.seconds * 1000) ?? 0;
      return tb - ta;
    });
  }
  return [...novels]; // 'all'
}

window.switchFilterTab = function(btn, tab) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  currentFilterTab = tab;
  window.filterNovels();
};


/* ===== 6. TAB SWITCH (popular sub-tabs: 7วัน/30วัน/ตลอดกาล) ===== */
window.switchTab = function(btn, period) {
  document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const now      = Date.now();
  const msPerDay = 86_400_000;
  const cutoff   = period === '7day'  ? now - 7  * msPerDay
                 : period === '30day' ? now - 30 * msPerDay
                 : 0;

  const list = cutoff > 0
    ? allNovels.filter(n => {
        const ts = n.createdAt?.toMillis?.() ?? (n.createdAt?.seconds * 1000) ?? 0;
        return ts >= cutoff;
      })
    : [...allNovels].sort((a, b) => (b.views || 0) - (a.views || 0));

  renderSection('popularGrid', list.slice(0, 4));
};


/* ===== 7. (modal ถูกแทนด้วย novel.html?id= แล้ว) ===== */
let currentNovel    = null;
let currentEpIdx    = 0;
let audioFiles_modal = [];

window.openModal = function(id) {
  const n = allNovels.find(x => x.id === id);
  if (!n) return;
  currentNovel = n;
  currentEpIdx = 0;

  document.getElementById('modalTitle').textContent  = n.title;
  document.getElementById('modalAuthor').innerHTML = icon('edit') + ' ' + esc(n.author || 'Unknown');
  document.getElementById('modalSynopsis').textContent = n.synopsis || '';
  document.getElementById('modalEmoji').innerHTML  = icon('headphones');

  const img = document.getElementById('modalCoverImg');
  if (n.coverUrl) {
    img.src = n.coverUrl; img.style.display = 'block';
    document.getElementById('modalEmoji').style.display = 'none';
  } else {
    img.style.display = 'none';
    document.getElementById('modalEmoji').style.display = 'block';
  }

  document.getElementById('modalTags').innerHTML =
    (Array.isArray(n.tags) ? n.tags : []).map(t => `<span class="player-tag">${esc(t)}</span>`).join('');

  audioFiles_modal = n.audioFiles || [];
  const epCount = Math.max(n.episodeCount || 0, audioFiles_modal.length);
  const epList  = document.getElementById('episodeList');

  if (epCount === 0) {
    epList.innerHTML = `<div style="text-align:center;padding:20px;color:var(--muted);font-size:0.85rem">${icon('hourglass')} ยังไม่มีตอน</div>`;
  } else {
    const GROUP  = 50;
    const groups = [];
    for (let i = 0; i < epCount; i += GROUP) {
      groups.push({ start: i, end: Math.min(i + GROUP - 1, epCount - 1) });
    }

    epList.innerHTML = groups.map((g, gi) => {
      const isFirst      = gi === 0;
      const groupHasAudio = Array.from(
        { length: g.end - g.start + 1 },
        (_, i) => audioFiles_modal[g.start + i]
      ).some(af => af && af.url);

      const groupIcon  = groupHasAudio ? icon('play') : icon('lock');
      const groupStyle = groupHasAudio ? '' : 'opacity:0.55;cursor:default';

      return `<div class="episode-group ${isFirst && groupHasAudio ? 'active' : ''}" style="${groupStyle}"
                   onclick="${groupHasAudio ? `toggleGroup(this,${g.start})` : ''}">
        <div class="eg-icon">${groupIcon}</div>
        <div class="eg-label">ตอนที่ ${g.start + 1} - ${g.end + 1}${groupHasAudio ? '' : ' <span style=\'font-size:0.72rem;color:var(--muted)\'>ยังไม่มีไฟล์</span>'}</div>
        <div class="eg-arrow">${isFirst && groupHasAudio ? icon('chevron-up') : icon('chevron-down')}</div>
      </div>
      <div class="episode-sublist" id="sublist-${g.start}"
           style="${isFirst && groupHasAudio ? 'display:flex;flex-direction:column' : 'display:none'}">
        ${isFirst && groupHasAudio ? Array.from({ length: g.end - g.start + 1 }, (_, i) => {
          const idx    = g.start + i;
          const af     = audioFiles_modal[idx];
          const hasAudio = af && af.url;
          const title  = esc(af ? (af.name || `ตอนที่ ${idx + 1}`) : `ตอนที่ ${idx + 1}`);
          return `<div class="episode-item${hasAudio ? '' : ' locked'}" id="ep-${idx}"
                       onclick="${hasAudio ? `playEpisode(${idx})` : ''}">
            <div class="ep-play">${hasAudio ? icon('play') : icon('lock')}</div>
            <div class="ep-info">
              <div class="ep-title">${title}</div>
              <div class="ep-duration" style="${hasAudio ? '' : 'color:var(--muted)'}">${hasAudio ? formatDuration(af.duration) : 'ยังไม่มีไฟล์'}</div>
            </div>
          </div>`;
        }).join('') : ''}
      </div>`;
    }).join('');
  }

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.toggleGroup = function(el, startIdx) {
  const sublist = document.getElementById('sublist-' + startIdx);
  const isOpen  = sublist.style.display !== 'none';

  document.querySelectorAll('.episode-sublist').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.episode-group').forEach(g => {
    g.classList.remove('active');
    g.querySelector('.eg-arrow').innerHTML = icon('chevron-down');
  });

  if (!isOpen) {
    const n              = currentNovel;
    const audioFiles_local = n.audioFiles || [];
    const epCount        = Math.max(n.episodeCount || 0, audioFiles_local.length);
    const endIdx         = Math.min(startIdx + 49, epCount - 1);

    sublist.innerHTML = Array.from({ length: endIdx - startIdx + 1 }, (_, i) => {
      const idx      = startIdx + i;
      const af       = audioFiles_local[idx];
      const hasAudio = af && af.url;
      const title    = esc(af ? (af.name || `ตอนที่ ${idx + 1}`) : `ตอนที่ ${idx + 1}`);
      return `<div class="episode-item${hasAudio ? '' : ' locked'}" id="ep-${idx}"
                   onclick="${hasAudio ? `playEpisode(${idx})` : ''}">
        <div class="ep-play">${hasAudio ? icon('play') : icon('lock')}</div>
        <div class="ep-info">
          <div class="ep-title">${title}</div>
          <div class="ep-duration" style="${hasAudio ? '' : 'color:var(--muted)'}">${hasAudio ? formatDuration(af.duration) : 'ยังไม่มีไฟล์'}</div>
        </div>
      </div>`;
    }).join('');

    sublist.style.display     = 'flex';
    sublist.style.flexDirection = 'column';
    el.classList.add('active');
    el.querySelector('.eg-arrow').innerHTML = icon('chevron-up');
  }
};

window.closeModal      = function() { document.getElementById('modalOverlay').classList.remove('open'); document.body.style.overflow = ''; };
window.closeModalOnBg  = function(e) { if (e.target === document.getElementById('modalOverlay')) closeModal(); };


/* ===== 8. AUDIO PLAYER ===== */
const audio = document.getElementById('audioEl');
let isPlaying = false;

function syncPlayBtn(playing) {
  const svgPlay  = document.getElementById('svgPlay');
  const svgPause = document.getElementById('svgPause');
  if (svgPlay)  svgPlay.style.display  = playing ? 'none' : '';
  if (svgPause) svgPause.style.display = playing ? ''     : 'none';
}

window.playEpisode = function(idx) {
  if (!currentNovel) return;
  currentEpIdx = idx;
  const af = audioFiles_modal[idx];

  document.querySelectorAll('.episode-item').forEach((el, i) => {
    el.classList.toggle('playing', i === idx);
    const ep = el.querySelector('.ep-play');
    if (ep) ep.innerHTML = i === idx ? icon('pause') : icon('play');
  });

  const n       = currentNovel;
  const epLabel = af ? (af.name || `ตอนที่ ${idx + 1}`) : `ตอนที่ ${idx + 1}`;

  if (af && af.url) {
    let src = af.url;
    if (src.includes('cloudinary.com') && src.includes('/raw/upload/')) {
      src = src.replace('/raw/upload/', '/video/upload/');
    }
    audio.src = src;
    audio.load();
    audio.play()
      .then(() => { isPlaying = true; syncPlayBtn(true); })
      .catch(e => {
        console.warn('play error:', e);
        audio.src = af.url;
        audio.load();
        audio.play().catch(() => {});
        isPlaying = true; syncPlayBtn(true);
      });
  } else {
    isPlaying = false; syncPlayBtn(false);
  }

  document.getElementById('npTitle').textContent       = n.title;
  document.getElementById('npEp').textContent          = epLabel;
  document.getElementById('npExpandTitle').textContent = n.title;
  document.getElementById('npExpandEp').textContent    = epLabel;

  const npCoverUrl = safeUrl(n.coverUrl);
  const coverHtml = npCoverUrl
    ? `<img src="${esc(npCoverUrl)}" alt="" style="width:100%;height:100%;object-fit:cover">`
    : `<span style="font-size:3rem">${icon('headphones')}</span>`;
  document.getElementById('npCover').innerHTML       = coverHtml;
  document.getElementById('npExpandCover').innerHTML = coverHtml;

  document.getElementById('nowPlaying').classList.add('visible');
  updateMediaSession();
};

window.toggleExpand = function() { document.getElementById('nowPlaying').classList.toggle('expanded'); };
window.rewind10     = function() { if (audio.src) audio.currentTime = Math.max(0, audio.currentTime - 10); };
window.forward10    = function() { if (audio.src) audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); };

/* ===== [PLAYER-2] Speed, Volume, Sleep Timer ===== */

// -- Speed --
const SPEEDS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
let _speedIdx = 1; // default 1.0x

window.cycleSpeed = function() {
  _speedIdx = (_speedIdx + 1) % SPEEDS.length;
  const s = SPEEDS[_speedIdx];
  audio.playbackRate = s;
  const btn = document.getElementById('npSpeedBtn');
  if (btn) btn.textContent = s.toFixed(2).replace('.00','').replace(/\.?0+$/,'') + 'x';
};

// -- Volume --
let _muted = false, _lastVol = 1;

window.setVolume = function(v) {
  audio.volume = parseFloat(v);
  _lastVol = audio.volume;
  _muted = audio.volume === 0;
  _syncVolIcon();
};

window.toggleMute = function() {
  _muted = !_muted;
  audio.volume = _muted ? 0 : _lastVol;
  const slider = document.getElementById('npVolume');
  if (slider) slider.value = audio.volume;
  _syncVolIcon();
};

function _syncVolIcon() {
  const on  = document.getElementById('svgVolOn');
  const off = document.getElementById('svgVolOff');
  if (on)  on.style.display  = audio.volume === 0 ? 'none' : '';
  if (off) off.style.display = audio.volume === 0 ? ''     : 'none';
}

// -- Sleep Timer --
let _sleepTimer    = null;
let _sleepInterval = null;
let _sleepEndTime  = 0;
let _sleepPickMins = 30; // ค่า default ใน popup

// อัปเดต badge นับถอยหลัง
function _updateSleepBadge() {
  const label = document.getElementById('npSleepLabel');
  const btn   = document.getElementById('npSleepBtn');
  if (!label) return;
  const remaining = Math.max(0, Math.round((_sleepEndTime - Date.now()) / 1000));
  if (remaining <= 0) {
    label.style.display = 'none';
    if (btn) btn.classList.remove('active');
    return;
  }
  const m = Math.floor(remaining / 60), s = remaining % 60;
  label.textContent   = m > 0 ? `${m}:${String(s).padStart(2,'0')}` : `${s}s`;
  label.style.display = 'block';
  if (btn) btn.classList.add('active');
}

window.openSleepPopup = function() {
  document.getElementById('sleepPopupOverlay').style.display = 'block';
  document.getElementById('sleepPopup').style.display = 'block';
  _renderSleepDisplay();
  _renderSleepConfirmBtn();
};

window.closeSleepPopup = function() {
  document.getElementById('sleepPopupOverlay').style.display = 'none';
  document.getElementById('sleepPopup').style.display = 'none';
};

window.setSleepMins = function(m) {
  _sleepPickMins = m;
  document.querySelectorAll('.sleep-preset').forEach(b => {
    b.classList.toggle('active', parseInt(b.textContent) === m ||
      (m===60 && b.textContent==='1 ชม.') || (m===120 && b.textContent==='2 ชม.'));
  });
  _renderSleepDisplay();
  _renderSleepConfirmBtn();
};

window.adjustSleepMins = function(delta) {
  _sleepPickMins = Math.max(5, Math.min(180, _sleepPickMins + delta));
  document.querySelectorAll('.sleep-preset').forEach(b => b.classList.remove('active'));
  _renderSleepDisplay();
  _renderSleepConfirmBtn();
};

function _renderSleepDisplay() {
  const el = document.getElementById('sleepDisplay');
  if (!el) return;
  const h = Math.floor(_sleepPickMins / 60), m = _sleepPickMins % 60;
  el.textContent = h > 0 ? `${h}:${String(m).padStart(2,'0')}` : `${m}:00`;
}

function _renderSleepConfirmBtn() {
  const btn = document.getElementById('sleepConfirmBtn');
  if (!btn) return;
  if (_sleepTimer) {
    btn.textContent = 'ยกเลิกตั้งเวลา';
    btn.style.color = '#e8445a';
    btn.style.borderColor = '#e8445a';
    btn.onclick = () => { _cancelSleep(); closeSleepPopup(); };
  } else {
    btn.textContent = 'ยืนยัน';
    btn.style.color = '#fff';
    btn.style.borderColor = 'rgba(255,255,255,0.15)';
    btn.style.background = '#e8445a';
    btn.onclick = () => { _startSleep(_sleepPickMins); closeSleepPopup(); };
  }
}

function _startSleep(mins) {
  _cancelSleep();
  _sleepEndTime = Date.now() + mins * 60 * 1000;
  _updateSleepBadge();
  _sleepInterval = setInterval(_updateSleepBadge, 1000);
  _sleepTimer = setTimeout(() => {
    audio.pause(); isPlaying = false; syncPlayBtn(false);
    _cancelSleep();
  }, mins * 60 * 1000);
}

function _cancelSleep() {
  if (_sleepTimer)    { clearTimeout(_sleepTimer);   _sleepTimer = null; }
  if (_sleepInterval) { clearInterval(_sleepInterval); _sleepInterval = null; }
  _sleepEndTime = 0;
  const label = document.getElementById('npSleepLabel');
  const btn   = document.getElementById('npSleepBtn');
  if (label) label.style.display = 'none';
  if (btn)   btn.classList.remove('active');
}

// legacy compat
window.toggleSleepTimer = window.openSleepPopup;

window.togglePlay = function() {
  if (!audio.src && !isPlaying) return;
  if (audio.src) {
    if (audio.paused) { audio.play(); isPlaying = true;  syncPlayBtn(true);  }
    else              { audio.pause(); isPlaying = false; syncPlayBtn(false); }
  } else {
    isPlaying = !isPlaying;
    syncPlayBtn(isPlaying);
  }
};

function _nvPlayableDir(from, dir) {
  let i = from + dir;
  while (i >= 0 && i < _nvAudioFiles.length) {
    const af = _nvAudioFiles[i];
    if (af && (af.url || af.audioKey) && !isEpisodeLocked(af, i)) return i;
    i += dir;
  }
  return -1;
}

window.prevEp = function() {
  if (_nvAudioFiles.length > 0) {
    const p = _nvPlayableDir(_nvCurrentIdx, -1);
    if (p >= 0) window._nvPlayEp(p, _nvAudioFiles, _nvNovel);
    return;
  }
  if (currentEpIdx > 0) playEpisode(currentEpIdx - 1);
};
window.nextEp = function() {
  if (_nvAudioFiles.length > 0) {
    const n = _nvPlayableDir(_nvCurrentIdx, 1);
    if (n >= 0) window._nvPlayEp(n, _nvAudioFiles, _nvNovel);
    return;
  }
  const max = Math.max((currentNovel?.episodeCount || 0), audioFiles_modal.length) - 1;
  if (currentEpIdx < max) playEpisode(currentEpIdx + 1);
};

let _r2Resigning = false;
audio.addEventListener('error', async () => {
  const af = _nvAudioFiles[_nvCurrentIdx];
  if (!isR2Episode(af) || _r2Resigning) return;
  _r2Resigning = true;
  const resumeAt = audio.currentTime || 0;
  const wantPlay = isPlaying || !audio.paused;
  try {
    _r2Sign = { key: '', url: '', expiresAt: 0 };
    const fresh = await r2SignUrl(af.audioKey);
    const seekAndPlay = () => {
      audio.removeEventListener('canplay', seekAndPlay);
      if (resumeAt > 0) audio.currentTime = resumeAt;
      if (wantPlay) audio.play().catch(() => {});
    };
    audio.addEventListener('canplay', seekAndPlay);
    audio.src = fresh;
    audio.load();
  } catch (e) {
    if (e && e.code === 'MEMBERS_ONLY') {
      isPlaying = false;
      syncPlayBtn(false);
      if (_nvNovel) await showMembersOnly(_nvNovel);
    } else {
      console.warn('[r2/resign]', e);
    }
  } finally {
    _r2Resigning = false;
  }
});


/* ===== 9. PROGRESS BAR & TIME ===== */
let _lastSaveTime = 0;
audio.addEventListener('timeupdate', () => {
  if (!audio.duration || _isDragging) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  const fill  = document.getElementById('npBarFill');
  const thumb = document.getElementById('npBarThumb');
  if (fill)  fill.style.width = pct + '%';
  if (thumb) thumb.style.left = `calc(${pct}% - 7px)`;
  // [EP-PROGRESS-LIVE] อัปเดต progress bar แดงบน ep-item ที่กำลังเล่น
  if (_nvCurrentIdx >= 0) {
    const epEl = document.getElementById('nvEp-' + _nvCurrentIdx);
    if (epEl) {
      let bar = epEl.querySelector('.ep-progress-fill');
      if (!bar) {
        if (!epEl.querySelector('.ep-progress-wrap')) {
          epEl.insertAdjacentHTML('beforeend',
            `<div class="ep-progress-wrap"><div class="ep-progress-fill" style="width:0%"></div></div>`);
        }
        bar = epEl.querySelector('.ep-progress-fill');
      }
      if (bar) bar.style.width = pct + '%';
    }
  }
  document.getElementById('npCurrent').textContent  = formatTime(audio.currentTime);
  document.getElementById('npDuration').textContent = formatTime(audio.duration);
  // [RESUME-1] save progress ทุก 5 วินาที — [HIST-BUG-1] ใช้ saveHistory() แทน setDoc ตรงๆ ให้ field ครบ
  const now = Date.now();
  if (now - _lastSaveTime > 5000 && _nvNovel && _nvCurrentIdx >= 0) {
    _lastSaveTime = now;
    const epLabel = _nvAudioFiles[_nvCurrentIdx]?.name || `ตอนที่ ${_nvCurrentIdx + 1}`;
    saveHistory(
      _nvNovel.id,
      _nvNovel.title || '',
      _nvNovel.coverUrl || _nvNovel.cover || '',
      epLabel,
      audio.currentTime / audio.duration,
      {
        currentTime: audio.currentTime,
        duration:    audio.duration,
        epIdx:       _nvCurrentIdx,
      }
    );
    // [EP-TRACK-1] บันทึก per-ep progress แยกต่างหาก
    saveEpProgress(_nvNovel.id, _nvCurrentIdx, audio.currentTime, audio.duration);
  }
});

audio.addEventListener('ended', () => {
  // [EP-TRACK-DONE] บันทึก 100% เมื่อฟังจบ
  if (_nvNovel && _nvCurrentIdx >= 0 && audio.duration) {
    saveEpProgress(_nvNovel.id, _nvCurrentIdx, audio.duration, audio.duration);
  }
  if (_nvAudioFiles.length > 0 && _nvCurrentIdx < _nvAudioFiles.length - 1) {
    const nx = _nvPlayableDir(_nvCurrentIdx, 1);
    if (nx >= 0) window._nvPlayEp(nx, _nvAudioFiles, _nvNovel);
  } else {
    nextEp();
  }
});

/* ===== DRAG PROGRESS BAR (PLAYER-NEW-3) ===== */
let _isDragging = false;

function _seekFromX(clientX) {
  if (!audio.duration) return;
  const bar  = document.getElementById('npBar');
  const rect = bar.getBoundingClientRect();
  const pct  = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  const fill  = document.getElementById('npBarFill');
  const thumb = document.getElementById('npBarThumb');
  if (fill)  fill.style.width = (pct * 100) + '%';
  if (thumb) thumb.style.left = `calc(${pct * 100}% - 7px)`;
  document.getElementById('npCurrent').textContent = formatTime(pct * audio.duration);
  return pct;
}

(function _initProgressDrag() {
  const bar = document.getElementById('npBar');
  if (!bar) return;

  // Mouse
  bar.addEventListener('mousedown', e => {
    _isDragging = true;
    bar.classList.add('dragging');
    _seekFromX(e.clientX);
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!_isDragging) return;
    _seekFromX(e.clientX);
  });
  document.addEventListener('mouseup', e => {
    if (!_isDragging) return;
    const pct = _seekFromX(e.clientX);
    if (pct !== undefined) audio.currentTime = pct * audio.duration;
    _isDragging = false;
    document.getElementById('npBar').classList.remove('dragging');
  });

  // Touch
  bar.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    _isDragging = true;
    bar.classList.add('dragging');
    _seekFromX(e.touches[0].clientX);
    e.preventDefault();
  }, { passive: false });
  bar.addEventListener('touchmove', e => {
    if (!_isDragging || e.touches.length !== 1) return;
    _seekFromX(e.touches[0].clientX);
    e.preventDefault();
  }, { passive: false });
  bar.addEventListener('touchend', e => {
    if (!_isDragging) return;
    const pct = _seekFromX(e.changedTouches[0].clientX);
    if (pct !== undefined && audio.duration) audio.currentTime = pct * audio.duration;
    _isDragging = false;
    bar.classList.remove('dragging');
  });
})();

window.seekAudio = function(e) {
  if (!audio.duration) return;
  const rect = document.getElementById('npBar').getBoundingClientRect();
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
};

function formatTime(s)     { if (isNaN(s)) return '0:00'; return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0'); }
function formatDuration(s) { return s ? formatTime(s) : 'N/A'; }


/* ===== 10. MEDIA SESSION API ===== */
function updateMediaSession() {
  if (!currentNovel || !('mediaSession' in navigator)) return;
  const af = audioFiles_modal[currentEpIdx];
  navigator.mediaSession.metadata = new MediaMetadata({
    title:   af ? (af.name || `ตอนที่ ${currentEpIdx + 1}`) : currentNovel.title,
    artist:  currentNovel.author || 'The Golden Hoard Novels',
    album:   currentNovel.title,
    artwork: currentNovel.coverUrl ? [{ src: currentNovel.coverUrl, sizes: '512x512', type: 'image/jpeg' }] : []
  });
  navigator.mediaSession.setActionHandler('play',         () => { audio.play();  syncPlayBtn(true);  });
  navigator.mediaSession.setActionHandler('pause',        () => { audio.pause(); syncPlayBtn(false); });
  navigator.mediaSession.setActionHandler('previoustrack',() => prevEp());
  navigator.mediaSession.setActionHandler('nexttrack',    () => nextEp());
  navigator.mediaSession.setActionHandler('seekbackward', () => { audio.currentTime = Math.max(0,                audio.currentTime - 10); });
  navigator.mediaSession.setActionHandler('seekforward',  () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); });
}


/* ===== 11. THEME ===== */
window.setTheme = function(t) {
  localStorage.setItem('theme', t);   // [JS-11] save theme
  if (t === 'dark') {
    document.documentElement.style.setProperty('--bg',         '#0d0d14');
    document.documentElement.style.setProperty('--sidebar-bg', '#111118');
    document.documentElement.style.setProperty('--surface',    '#16161f');
    document.documentElement.style.setProperty('--surface2',   '#1e1e2e');
    document.documentElement.style.setProperty('--border',     'rgba(255,255,255,0.08)');
    document.documentElement.style.setProperty('--text',       '#f0f0f8');
    document.documentElement.style.setProperty('--muted',      '#888aaa');
    document.getElementById('nowPlaying').style.background = 'rgba(17,17,24,0.98)';
    document.getElementById('darkBtn').classList.add('active');
    document.getElementById('lightBtn').classList.remove('active');
  } else {
    document.documentElement.style.setProperty('--bg',         '#f5f5f7');
    document.documentElement.style.setProperty('--sidebar-bg', '#ffffff');
    document.documentElement.style.setProperty('--surface',    '#ffffff');
    document.documentElement.style.setProperty('--surface2',   '#f0f0f4');
    document.documentElement.style.setProperty('--border',     'rgba(0,0,0,0.08)');
    document.documentElement.style.setProperty('--text',       '#1a1a2e');
    document.documentElement.style.setProperty('--muted',      '#888aaa');
    document.getElementById('nowPlaying').style.background = 'rgba(255,255,255,0.98)';
    document.getElementById('lightBtn').classList.add('active');
    document.getElementById('darkBtn').classList.remove('active');
  }
};

// [JS-11] โหลด theme ที่ save ไว้ตอนเปิดหน้า
(function() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    // รอ DOM พร้อม (script เป็น module จึงรัน defer อยู่แล้ว)
    window.addEventListener('DOMContentLoaded', () => setTheme(saved), { once: true });
    // กรณี DOMContentLoaded ผ่านไปแล้ว (module defer)
    if (document.readyState !== 'loading') setTheme(saved);
  }
})();

/* ===== 12. RESTORE PLAYER จาก novel.html ===== */
(function restorePlayerFromNovel() {
  const raw = sessionStorage.getItem('ghPlayerState');
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    if (!s.audioUrl || !s.novelTitle) return;

    /* inject novel + audioFiles เข้า context */
    currentNovel      = { id: s.novelId, title: s.novelTitle, coverUrl: s.coverUrl };
    audioFiles_modal  = s.audioFiles || [];
    currentEpIdx      = s.epIdx || 0;

    /* set audio src + seek */
    let src = s.audioUrl;
    if (src.includes('cloudinary.com') && src.includes('/raw/upload/'))
      src = src.replace('/raw/upload/', '/video/upload/');
    audio.src = src;
    audio.load();
    audio.currentTime = s.currentTime || 0;

    /* อัปเดต UI */
    const rpCoverUrl = safeUrl(s.coverUrl);
    const coverHtml = rpCoverUrl
      ? `<img src="${esc(rpCoverUrl)}" alt="" style="width:100%;height:100%;object-fit:cover">`
      : `<span style="font-size:3rem">${icon('headphones')}</span>`;
    ['npCover','npExpandCover'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = coverHtml;
    });
    const titleEl = document.getElementById('npTitle');
    const epEl    = document.getElementById('npEp');
    if (titleEl) titleEl.textContent = s.novelTitle;
    if (epEl)    epEl.textContent    = s.epLabel;

    const etEl  = document.getElementById('npExpandTitle');
    const eeEl  = document.getElementById('npExpandEp');
    if (etEl) etEl.textContent = s.novelTitle;
    if (eeEl) eeEl.textContent = s.epLabel;

    /* แสดง player bar — หยุด (ไม่ autoplay) ให้ user กด play เอง */
    document.getElementById('nowPlaying').classList.add('visible');
    syncPlayBtn(false);
  } catch(e) {
    console.warn('restorePlayer error:', e);
  }
})();

/* ===== HISTORY v2 — saveHistory + renderHistory ===== */
// เขียนใหม่ทั้งหมด: เรียบง่าย, Firestore-first, expire 60 วัน, แสดงแค่ปก+ชื่อ

const HISTORY_KEY = 'gh_history';
const HISTORY_MAX = 10;
const HISTORY_EXPIRE_MS = 60 * 24 * 60 * 60 * 1000; // 60 วัน

// track uid ปัจจุบัน
let _currentUid = null;
onAuthStateChanged(auth, u => { _currentUid = u ? u.uid : null; });

// [SEC-2] anonymous local id — ไม่ให้ข้อมูลผู้ใช้ที่ยังไม่ login ชนกันใต้ key 'anon'
function _anonLocalId() {
  let id = null;
  try { id = localStorage.getItem('gh_anon_id'); } catch(e) {}
  if (!id) {
    try {
      id = 'anon-' + (crypto?.randomUUID ? crypto.randomUUID()
                                          : Date.now().toString(36) + Math.random().toString(36).slice(2));
      localStorage.setItem('gh_anon_id', id);
    } catch(e) { id = 'anon-fallback'; }
  }
  return id;
}
// key ของผู้ใช้ปัจจุบัน — ใช้แทน 'anon' ทุกที่
function _userKey() { return _currentUid || _anonLocalId(); }


// throttle renderHistory — max ทุก 30 วิ
let _lastRenderHistoryTime = 0;
function _throttledRenderHistory() {
  const now = Date.now();
  if (now - _lastRenderHistoryTime > 30000) {
    _lastRenderHistoryTime = now;
    if (window.renderHistory) window.renderHistory();
  }
}

// [HISTORY-UID-1] helper: localStorage key ผูกกับ uid (ถ้า login) หรือ anon id ของเบราว์เซอร์
// [SEC-2] ไม่ใช้ key เดียวร่วมกันทุกคนที่ยังไม่ login
function _historyKey() {
  const k = `gh_history_${_userKey()}`;
  if (!_currentUid) {
    // ย้ายข้อมูลเดิมที่เคยเก็บใต้ key กลาง 'gh_history' มาครั้งเดียว
    try {
      if (!localStorage.getItem(k)) {
        const legacy = localStorage.getItem(HISTORY_KEY);
        if (legacy) localStorage.setItem(k, legacy);
      }
    } catch(e) {}
  }
  return k;
}

// [EP-TRACK-1] per-ep progress key และ save helper
// format: gh_ep_{uid}_{novelId} → object { [epIdx]: {currentTime, duration, progress, ts} }
function _epProgressKey(novelId) {
  const uid = _userKey();
  return `gh_ep_${uid}_${novelId}`;
}

function saveEpProgress(novelId, epIdx, currentTime, duration) {
  if (!novelId || epIdx < 0 || !duration) return;
  const entry = {
    currentTime,
    duration,
    progress: currentTime / duration,
    ts: Date.now()
  };
  // localStorage fallback (always)
  try {
    const key = _epProgressKey(novelId);
    const map = JSON.parse(localStorage.getItem(key) || '{}');
    map[epIdx] = entry;
    localStorage.setItem(key, JSON.stringify(map));
  } catch(e) { console.warn('[ep-progress] localStorage error:', e); }
  // Firestore sync (login only)
  if (_currentUid) {
    const ref = doc(db, 'users', _currentUid, 'epProgress', novelId);
    setDoc(ref, { [epIdx]: { ...entry, ts: serverTimestamp() } }, { merge: true })
      .catch(e => console.warn('[ep-progress] Firestore error:', e));
  }
}

async function getEpProgressMap(novelId) {
  // local fallback
  let local = {};
  try {
    local = JSON.parse(localStorage.getItem(_epProgressKey(novelId)) || '{}');
  } catch(e) {}
  // Firestore merge (login only)
  if (_currentUid) {
    try {
      const snap = await getDoc(doc(db, 'users', _currentUid, 'epProgress', novelId));
      if (snap.exists()) {
        const remote = snap.data();
        // merge: remote ชนะถ้า ts ใหม่กว่า
        Object.entries(remote).forEach(([idx, val]) => {
          const localTs = local[idx]?.ts || 0;
          const remoteTs = val.ts?.toMillis ? val.ts.toMillis() : (val.ts || 0);
          if (remoteTs >= localTs) local[idx] = { ...val, ts: remoteTs };
        });
        // sync merged back to localStorage
        try { localStorage.setItem(_epProgressKey(novelId), JSON.stringify(local)); } catch(e) {}
      }
    } catch(e) { console.warn('[ep-progress] Firestore read error:', e); }
  }
  return local;
}

// saveHistory — เขียน localStorage + Firestore (ถ้า login)
// fields: novelId, novelTitle, coverUrl, epLabel, epIdx, currentTime, duration, progress, ts
window.saveHistory = function(novelId, novelTitle, coverUrl, epLabel, progress, extra) {
  if (!novelId) return;
  const entry = {
    novelId,
    novelTitle: novelTitle || '',
    coverUrl:   coverUrl   || '',
    epLabel:    epLabel    || '',
    progress:   progress   || 0,
    ts:         Date.now(),
    ...(extra || {})
  };
  // localStorage (always)
  try {
    const key = _historyKey();
    let list = JSON.parse(localStorage.getItem(key) || '[]');
    const cutoff = Date.now() - HISTORY_EXPIRE_MS;
    list = list.filter(h => h.novelId !== novelId && (h.ts || 0) > cutoff);
    list.unshift(entry);
    if (list.length > HISTORY_MAX) list = list.slice(0, HISTORY_MAX);
    localStorage.setItem(key, JSON.stringify(list));
    _throttledRenderHistory();
  } catch(e) { console.warn('[history] localStorage error:', e); }
  // Firestore sync (login only)
  if (_currentUid) {
    const ref = doc(db, 'users', _currentUid, 'history', novelId);
    setDoc(ref, { ...entry, ts: serverTimestamp() }, { merge: true })
      .catch(e => console.warn('[history] Firestore error:', e));
  }
};

/* ===== [SPA-3] HOME VIEW ===== */

/**
 * renderHomeView()
 * inject HTML ของหน้าหลักเข้า #app-view
 * แล้ว re-attach Firebase listener สำหรับ novels
 * คืน unsub function ให้ router เก็บไว้ unsubscribe ก่อน navigate ออก
 */
export async function renderHomeView() {
  const appView = document.getElementById('app-view');
  if (!appView) return;
  appView.dataset.view = 'home';

  // inject skeleton HTML
  appView.innerHTML = `
    <!-- HISTORY BAR -->
    <section id="historyBar" class="history-bar">
      <div class="history-bar-inner">
        <div class="history-bar-header">
          <span class="history-bar-title">${icon('clock')} ประวัติการฟังล่าสุด</span>
        </div>
        <div id="historyItems" class="history-items"></div>
      </div>
    </section>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-content">
          <div class="hero-badge">${icon('mic')} นิยายเสียงภาษาไทย</div>
          <h1 class="hero-title">ฟังนิยายที่คุณชื่นชอบ<br>ได้ทุกที่ทุกเวลา</h1>
          <p class="hero-subtitle">รวมนิยายเสียงคุณภาพสูง พากย์โดยนักพากย์มืออาชีพ อัปเดตใหม่ทุกสัปดาห์</p>
          <div class="hero-actions">
            <button class="hero-btn-primary" onclick="navigateToLibrary()">${icon('play')} เริ่มฟังเลย</button>
          </div>
        </div>
        <div class="hero-image" id="heroImage">
          <div class="hero-neon-graphic">
            <svg class="hero-waveform" viewBox="0 0 260 120" xmlns="http://www.w3.org/2000/svg">
              <g opacity="0.7">
                <rect x="0"   y="55" width="6" height="10" rx="3" fill="#e8445a"/>
                <rect x="10"  y="45" width="6" height="30" rx="3" fill="#e8445a"/>
                <rect x="20"  y="30" width="6" height="60" rx="3" fill="#e8445a"/>
                <rect x="30"  y="40" width="6" height="40" rx="3" fill="#e8445a"/>
                <rect x="40"  y="20" width="6" height="80" rx="3" fill="#e8445a"/>
                <rect x="50"  y="35" width="6" height="50" rx="3" fill="#e8445a"/>
                <rect x="60"  y="50" width="6" height="20" rx="3" fill="#e8445a"/>
                <rect x="70"  y="25" width="6" height="70" rx="3" fill="#e8445a"/>
                <rect x="80"  y="10" width="6" height="100" rx="3" fill="#e8445a"/>
                <rect x="90"  y="30" width="6" height="60" rx="3" fill="#e8445a"/>
                <rect x="100" y="45" width="6" height="30" rx="3" fill="#e8445a"/>
                <rect x="110" y="55" width="6" height="10" rx="3" fill="#e8445a"/>
                <rect x="150" y="55" width="6" height="10" rx="3" fill="#e8445a"/>
                <rect x="160" y="45" width="6" height="30" rx="3" fill="#e8445a"/>
                <rect x="170" y="30" width="6" height="60" rx="3" fill="#e8445a"/>
                <rect x="180" y="20" width="6" height="80" rx="3" fill="#e8445a"/>
                <rect x="190" y="35" width="6" height="50" rx="3" fill="#e8445a"/>
                <rect x="200" y="10" width="6" height="100" rx="3" fill="#e8445a"/>
                <rect x="210" y="30" width="6" height="60" rx="3" fill="#e8445a"/>
                <rect x="220" y="45" width="6" height="30" rx="3" fill="#e8445a"/>
                <rect x="230" y="55" width="6" height="10" rx="3" fill="#e8445a"/>
                <rect x="240" y="40" width="6" height="40" rx="3" fill="#e8445a"/>
                <rect x="250" y="25" width="6" height="70" rx="3" fill="#e8445a"/>
              </g>
            </svg>
            <div class="hero-headphone">
              <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" width="160" height="128">
                <defs>
                  <filter id="heroNeonGlow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="4" result="blur1"/>
                    <feGaussianBlur stdDeviation="10" result="blur2"/>
                    <feMerge><feMergeNode in="blur2"/><feMergeNode in="blur1"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <path d="M 30 100 A 70 75 0 0 1 170 100"
                      fill="none" stroke="#e8445a" stroke-width="7"
                      stroke-linecap="round" filter="url(#heroNeonGlow)"/>
                <path d="M 38 100 A 62 67 0 0 1 162 100"
                      fill="none" stroke="rgba(232,68,90,0.3)" stroke-width="2"
                      stroke-linecap="round"/>
                <rect x="14" y="88" width="28" height="44" rx="12"
                      fill="rgba(232,68,90,0.15)" stroke="#e8445a" stroke-width="3"
                      filter="url(#heroNeonGlow)"/>
                <rect x="20" y="96" width="16" height="28" rx="7"
                      fill="rgba(232,68,90,0.25)"/>
                <rect x="158" y="88" width="28" height="44" rx="12"
                      fill="rgba(232,68,90,0.15)" stroke="#e8445a" stroke-width="3"
                      filter="url(#heroNeonGlow)"/>
                <rect x="164" y="96" width="16" height="28" rx="7"
                      fill="rgba(232,68,90,0.25)"/>
              </svg>
            </div>
            <div class="hero-crown-badge">${icon('crown')}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- SEARCH + FILTER TABS -->
    <section class="search-section">
      <div class="search-bar-wrap">
        <input id="searchInputMain" class="search-bar-input" type="text"
               placeholder="ค้นหานิยาย, ผู้แต่ง, แท็ก..." oninput="filterNovels(this)">
        <span class="search-icon">${icon('search')}</span>
      </div>
      <div class="filter-tabs">
        <button class="filter-tab active" onclick="switchFilterTab(this,'popular')">${icon('flame')} ยอดนิยม</button>
        <button class="filter-tab" onclick="switchFilterTab(this,'new')">${icon('sparkles')} มาใหม่</button>
        <button class="filter-tab" onclick="switchFilterTab(this,'updated')">${icon('refresh')} อัปเดต</button>
        <button class="filter-tab" onclick="switchFilterTab(this,'all')">${icon('book')} ทั้งหมด</button>
      </div>
    </section>

    <!-- ALL NOVELS GRID -->
    <section class="novels-section">
      <div class="section-header">
        <h2 class="section-title">นิยายทั้งหมด</h2>
        <span id="novels-count" class="novels-count"></span>
      </div>
      <div id="novelsGrid" class="novels-grid"></div>
    </section>

    <!-- NEW RELEASES -->
    <section class="novels-section">
      <div class="section-header">
        <h2 class="section-title">${icon('sparkles')} มาใหม่ล่าสุด</h2>
      </div>
      <div id="newReleasesGrid" class="novels-grid"></div>
    </section>

    <!-- POPULAR -->
    <section class="novels-section">
      <div class="section-header">
        <h2 class="section-title">${icon('flame')} ยอดนิยม</h2>
        <div class="sub-tabs">
          <button class="sub-tab active" onclick="switchTab(this,'all')">ตลอดกาล</button>
          <button class="sub-tab" onclick="switchTab(this,'30day')">30 วัน</button>
          <button class="sub-tab" onclick="switchTab(this,'7day')">7 วัน</button>
        </div>
      </div>
      <div id="popularGrid" class="novels-grid"></div>
    </section>`;

  // โหลด hero image
  loadHeroImage();

  // render history (ถ้า login อยู่แล้ว)
  window.renderHistory();

  // re-attach Firestore listener — คืน unsub ให้ router
  const unsub = onSnapshot(novelsQuery, (snapshot) => {
    allNovels = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    filtered  = [...allNovels];
  _pruneFavs();   // [FAV-PRUNE-1] เก็บกวาด id ที่นิยายถูกลบไปแล้ว
    renderSection('newReleasesGrid', allNovels.slice(0, 3));
    renderSection('popularGrid',     allNovels.slice(0, 4));
    renderNovels(filtered);
  }, (err) => {
    console.warn('[renderHomeView] Firestore error:', err);
    renderNovels([]);
  });

  return unsub; // router จะเรียก unsub() ก่อน navigate ออก
}

/** helper: navigate ไป library view (ใช้ใน hero button) */
window.navigateToLibrary = function() {
  import('./router.js').then(r => r.navigate('/library'));
};

// renderHistory v2 — async, อ่าน Firestore merge localStorage, แสดงปก+ชื่อ, expire 60 วัน
window.renderHistory = async function() {
  const bar   = document.getElementById('historyBar');
  const items = document.getElementById('historyItems');
  if (!bar || !items) return;

  const cutoff = Date.now() - HISTORY_EXPIRE_MS;

  // อ่าน localStorage ก่อน (fast path)
  let localList = [];
  try {
    localList = JSON.parse(localStorage.getItem(_historyKey()) || '[]')
      .filter(h => (h.ts || 0) > cutoff);
  } catch(e) {}

  // merge Firestore (login only)
  let list = localList;
  if (_currentUid) {
    try {
      const snap = await getDocs(collection(db, 'users', _currentUid, 'history'));
      if (!snap.empty) {
        const remoteMap = {};
        snap.forEach(d => {
          const data = d.data();
          const ts = data.ts?.toMillis ? data.ts.toMillis() : (data.ts || 0);
          if (ts > cutoff) remoteMap[d.id] = { ...data, ts };
        });
        // merge: novel ไหนใน remote ใหม่กว่า local → ใช้ remote
        const localMap = {};
        localList.forEach(h => { localMap[h.novelId] = h; });
        Object.entries(remoteMap).forEach(([novelId, rh]) => {
          if (!localMap[novelId] || rh.ts > (localMap[novelId].ts || 0)) {
            localMap[novelId] = rh;
          }
        });
        list = Object.values(localMap)
          .sort((a, b) => (b.ts || 0) - (a.ts || 0))
          .slice(0, HISTORY_MAX);
        // sync merged back to localStorage
        try { localStorage.setItem(_historyKey(), JSON.stringify(list)); } catch(e) {}
      }
    } catch(e) { console.warn('[history] Firestore read error:', e); }
  }

  if (!list.length) { bar.classList.remove('visible'); return; }

  // แสดงแค่ปก + ชื่อ — กดแล้วเปิด novel view
  items.innerHTML = list.map(h => {
    const hCover = safeUrl(h.coverUrl);
    return `
    <div class="history-item"
         data-novel-id="${esc(h.novelId)}"
         data-ep-idx="${esc(h.epIdx ?? 0)}"
         data-resume-time="${esc(h.currentTime || 0)}"
         onclick="window._spaNavigate(this)">
      <div class="history-item-cover">
        ${hCover
          ? `<img src="${esc(hCover)}" alt="${esc(h.novelTitle || '')}" loading="lazy" onerror="this.style.display='none'">`
          : `<span class="history-cover-placeholder">${icon('book')}</span>`}
      </div>
      <div class="history-item-title">${esc(h.novelTitle || '—')}</div>
    </div>`;
  }).join('');
  bar.classList.add('visible');
};


/* ===== SPA-4: renderNovelView(novelId) ===== */

// [PERF-2] Novel metadata cache — ไม่ hit Firestore ซ้ำถ้าเปิดนิยายเดิม
const _novelCache = {};
// [PERF-3] Episode list cache — ไม่ getDocs ซ้ำถ้า episode ยังไม่เปลี่ยน
const _epCache = {};

const STATUS_LABEL_NV = { ongoing:'กำลังดำเนิน', done:'จบแล้ว', new:'ใหม่', hiatus:'หยุดพัก' };
const STATUS_CLS_NV   = { ongoing:'badge-ongoing', done:'badge-done', new:'badge-new', hiatus:'badge-hiatus' };
const fmtNV = s => {
  if (!s || isNaN(s)) return '0:00';
  s = s|0; const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=s%60;
  return h ? `${h}:${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}` : `${m}:${String(sc).padStart(2,'0')}`;
};

window.renderNovelView = async function({ id: novelId }) {
  const appView = document.getElementById('app-view');
  if (!appView) return;

  // ── reset tab + sort state ทุกครั้งที่เปลี่ยนนิยาย
  _nvTab  = 'all';
  _nvDesc = false;
  _nvCurrentIdx = -1; // [UX-3] reset active ep

  // ── loading state
  appView.innerHTML = `
    <div class="nv-wrap">
      <div class="nv-state-box" id="nvStateLoading">
        <div class="spinner"></div>
        <span>กำลังโหลด...</span>
      </div>
      <div class="nv-state-box" id="nvStateError" style="display:none">
        <span class="nv-err-icon">${icon('alert')}</span>
        <p id="nvErrMsg">เกิดข้อผิดพลาด</p>
        <a href="/" onclick="event.preventDefault();window.handleRoute('/')" class="nv-back-btn">${icon('arrow-left')} กลับหน้าหลัก</a>
      </div>
      <div id="nvContent" style="display:none"></div>
    </div>`;

  if (!novelId) { _nvErr('ไม่พบ ID นิยาย'); return; }

  let novel, audioFiles;
  try {
    await loadMembershipSettings();
    // [PERF-2] เช็ค novel cache ก่อน — ถ้ามีแล้วไม่ hit Firestore
    if (_novelCache[novelId]) {
      novel = _novelCache[novelId];
    } else {
      const snap = await getDoc(doc(db, 'novels', novelId));
      if (!snap.exists()) { _nvErr('ไม่พบนิยายนี้ในฐานข้อมูล'); return; }
      novel = { id: snap.id, ...snap.data() };
      _novelCache[novelId] = novel;
    }

    const eps = await loadEpisodesForAccess(novelId, novel.episodeCount || 0);
    audioFiles = eps.list;
    _nvLocked  = eps.locked;
  } catch(e) {
    console.error('[renderNovelView]', e);
    _nvErr('โหลดข้อมูลไม่สำเร็จ'); return;
  }

  // ── build content
  const st     = novel.status || 'ongoing';
  // [FIX-EPCOUNT] ใช้ episodeCount อย่างเดียว ไม่ fallback ไป eps แล้ว
  const epCnt  = Math.max(Number.isFinite(novel.episodeCount) ? novel.episodeCount : 0, audioFiles.length);
  const tagsHTML = (Array.isArray(novel.tags) ? novel.tags : []).map(t=>`<span class="nv-tag">${esc(t)}</span>`).join('');
  const memberBadge = isMemberActive()
    ? `<div class="nv-member-badge">${icon('crown')} สมาชิกถึง ${esc(fmtMemberUntil())}</div>`
    : '';
  const nvCoverUrl = safeUrl(novel.coverUrl);
  const coverImg = nvCoverUrl
    ? `<img src="${esc(nvCoverUrl)}" alt="${esc(novel.title)}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border-radius:12px">`
    : `<span class="nv-cover-title">${esc(novel.title)}</span>`;

  document.getElementById('nvContent').innerHTML = `
    <div class="nv-main">
      <a href="/" class="nv-back-btn" onclick="event.preventDefault();window.handleRoute('/')">${icon('arrow-left')} ย้อนกลับ</a>

      <div class="nv-cols">
        <div class="nv-col-left">
          <div class="nv-cover" id="nvCoverBox">${coverImg}</div>
          <div class="nv-info">
            <h1 class="nv-title">${esc(novel.title)}</h1>
            <p class="nv-author">${icon('edit')} ${esc(novel.author||'Unknown')}</p>
            <div class="nv-meta">
              <span class="badge ${STATUS_CLS_NV[st]||'badge-ongoing'}">${esc(STATUS_LABEL_NV[st]||st)}</span>
              <span class="badge badge-ep">${epCnt} ตอน</span>
              ${Number.isFinite(novel.views) && novel.views ? `<span style="color:#a0a0a0;font-size:13px">• ${icon('eye')} ${novel.views}</span>` : ''}
            </div>
            <div class="nv-tags">${tagsHTML}</div>
            <p class="nv-synopsis">${esc(novel.synopsis||'')}</p>
            <button class="nv-play-first-btn" id="nvPlayFirstBtn">${icon('play')} เริ่มฟังนิยาย</button>
            ${memberBadge}
          </div>
        </div>
        <div class="nv-col-right">
          <div class="nv-ep-section">
            <div class="nv-ep-header">
              <h2 class="nv-ep-title">รายการตอน (${epCnt})</h2>
              <div class="nv-ep-controls">
                <div class="nv-ep-tabs">
                  <button class="nv-tab active" id="nvTabAll" onclick="window._nvSetTab('all')">ทั้งหมด</button>
                  <button class="nv-tab" id="nvTabLatest" onclick="window._nvSetTab('latest')">ล่าสุด 10 ตอน</button>
                </div>
                <button class="nv-sort-btn" id="nvSortBtn" onclick="window._nvToggleSort()">${icon('sort')} <span id="nvSortLabel">เก่า→ใหม่</span></button>
              </div>
            </div>
            <div class="ep-list" id="nvEpList"></div>
          </div>
        </div>
      </div>
    </div>`;

  // ── episode list — แสดง skeleton ก่อน แล้ว build จริง (UX-1)
  const epListEl = document.getElementById('nvEpList');
  if (epListEl) {
    epListEl.innerHTML = Array.from({ length: Math.min(epCnt, 6) })
      .map(() => `<div class="ep-skeleton"><span class="ep-sk-icon"></span><span class="ep-sk-label"></span><span class="ep-sk-dur"></span></div>`)
      .join('');
  }
  requestAnimationFrame(() => _nvBuildEpList(epCnt, audioFiles, novel, _nvLocked));

  // ── play first btn (smart resume)
  document.getElementById('nvPlayFirstBtn').addEventListener('click', () => {
    // smart resume: หา ep ล่าสุดที่ยังฟังไม่จบ
    try {
      const uid = _userKey();
      const key = `gh_ep_${uid}_${novelId}`;
      const map = JSON.parse(localStorage.getItem(key) || '{}');
      const latest = Object.entries(map)
        .filter(([, v]) => v.currentTime > 0 && (v.progress || 0) < 1.0)
        .sort(([, a], [, b]) => (b.ts || 0) - (a.ts || 0))[0];
      if (latest) {
        const [idxStr, epData] = latest;
        const epIdx = Number(idxStr);
        const af = audioFiles[epIdx];
        if (af && (af.url || af.audioKey)) { window._nvPlayEp(epIdx, audioFiles, novel, epData.currentTime); return; }
      }
    } catch(e) {}
    // ไม่เคยฟัง → เล่น ep แรก
    const i = audioFiles.findIndex(af => af && (af.url || af.audioKey));
    if (i >= 0) window._nvPlayEp(i, audioFiles, novel);
  });

  // ── show content
  document.getElementById('nvStateLoading').style.display = 'none';
  document.getElementById('nvContent').style.display = 'block';
  document.title = `${novel.title} — The Golden Hoard Novels`;

  // [RESUME-FIX-3] resume จาก history-item (sessionStorage)
  // [REFRESH-RESUME-1] fallback: ถ้าไม่มี sessionStorage (เช่น refresh) → อ่าน Firestore history โดยตรง
  const _doResume = (epIdx, resumeTime) => {
    const af = audioFiles[epIdx];
    if (!af || !af.url) return;
    const audioEl = document.getElementById('audioEl');
    if (resumeTime > 0) {
      const onReady = () => {
        audioEl.currentTime = resumeTime;
        audioEl.removeEventListener('canplay', onReady);
      };
      audioEl.addEventListener('canplay', onReady);
    }
    window._nvPlayEp(epIdx, audioFiles, novel);
  };

  try {
    const resumeKey = 'ghResume_' + novelId;
    const raw = sessionStorage.getItem(resumeKey);
    if (raw) {
      // path ปกติ: กดจาก history bar
      sessionStorage.removeItem(resumeKey);
      const { epIdx, resumeTime } = JSON.parse(raw);
      _doResume(epIdx, resumeTime);
    }
    // [AUTO-RESUME-REMOVED] ไม่ auto-resume เมื่อ refresh — user ต้องกดปุ่มเอง
  } catch(e) {}
};

function _nvErr(msg) {
  const el = document.getElementById('nvStateLoading');
  const er = document.getElementById('nvStateError');
  const em = document.getElementById('nvErrMsg');
  if (el) el.style.display = 'none';
  if (er) er.style.display = 'flex';
  if (em) em.textContent = msg;
}

// ── tab + sort state
let _nvTab  = 'all';   // 'all' | 'latest'
let _nvDesc = false;   // false = เก่า→ใหม่, true = ใหม่→เก่า
let _nvAudioFiles = [], _nvNovel = null;
let _nvCurrentIdx = -1; // [UX-3] track ep ที่กำลังเล่นอยู่

async function _nvBuildEpList(epCnt, audioFiles, novel, locked) {
  _nvAudioFiles = audioFiles;
  _nvNovel = novel;
  if (locked) _nvLocked = locked;
  const list = document.getElementById('nvEpList');
  if (!list) return;
  if (epCnt === 0) {
    list.innerHTML = `<div style="text-align:center;padding:30px;color:#666">${icon('hourglass')} ยังไม่มีตอน</div>`;
    return;
  }

  // [EP-RESUME] อ่าน history ของนิยายนี้ — ได้ ep ล่าสุดที่ฟัง + resumeTime
  // [HISTORY-UID-1] อ่านจาก localStorage ผูก uid
  let histEpIdx = -1, histCurrentTime = 0;
  try {
    const hList = JSON.parse(localStorage.getItem(_historyKey()) || '[]');
    const hEntry = hList.find(h => h.novelId === novel.id);
    if (hEntry) {
      histEpIdx       = hEntry.epIdx ?? -1;
      histCurrentTime = hEntry.currentTime || 0;
    }
  } catch(e) {}

  // [EP-TRACK-2] อ่าน per-ep progress map ทุกตอน (async Firestore+localStorage)
  const epProgressMap = await getEpProgressMap(novel.id);

  // สร้าง array index ตาม tab + sort
  let indices = Array.from({ length: epCnt }, (_, i) => i);
  if (_nvDesc) indices = indices.slice().reverse();
  if (_nvTab === 'latest') indices = indices.slice(0, 10);

  list.innerHTML = '';
  indices.forEach(i => {
    const af  = audioFiles[i];
    const ok  = af && (af.url || af.audioKey);
    const lbl = esc(af ? (af.name || `ตอนที่ ${i+1}`) : `ตอนที่ ${i+1}`);

    // [EP-TRACK-2] progress จาก per-ep map ก่อน fallback history เดิม
    const epRec = epProgressMap[i];
    const epProgress = epRec ? epRec.progress : (i === histEpIdx ? (histCurrentTime && epRec?.duration ? histCurrentTime / epRec.duration : 0) : 0);
    const epCurrentTime = epRec ? epRec.currentTime : (i === histEpIdx ? histCurrentTime : 0);
    const isDone = ok && epProgress >= 1.0;
    const hasProgress = ok && epProgress > 0 && !isDone;
    const pctStr = hasProgress ? `${Math.round(epProgress * 100)}%` : '0%';
    const progressHTML = isDone
      ? `<span class="ep-done-badge">${icon('check')} จบแล้ว</span>`
      : hasProgress
        ? `<div class="ep-progress-wrap"><div class="ep-progress-fill" style="width:${pctStr}"></div></div>`
        : '';

    const isLocked = isEpisodeLocked(af, i);

    const item = document.createElement('div');
    item.className = 'ep-item' + (isLocked ? ' ep-premium-locked' : (ok ? '' : ' no-audio'));
    item.id = 'nvEp-' + i;
    item.innerHTML = isLocked
      ? `<span class="ep-icon">${icon('lock')}</span>
         <span class="ep-label">${lbl}</span>
         <span class="ep-dur">ต้องเป็นสมาชิก</span>`
      : `<span class="ep-icon">${ok ? icon('play') : icon('hourglass')}</span>
         <span class="ep-label">${lbl}</span>
         ${af && af.premium === true ? `<span class="ep-premium-tag">${icon('crown')} สมาชิก</span>` : ''}
         <span class="ep-dur">${ok ? fmtNV(af.duration) : ''}</span>
         ${progressHTML}`;

    if (isLocked) item.addEventListener('click', () => openUnlockDialog(novel));
    else if (ok) item.addEventListener('click', async () => {
      await window._nvPlayEp(i, audioFiles, novel);

      // [RESUME-FIX-2] helper: seek audioEl — รอ canplay ถ้ายังไม่พร้อม
      const _seekTo = (t) => {
        if (!(t > 0)) return;
        const audioEl = document.getElementById('audioEl');
        if (!audioEl) return;
        if (audioEl.readyState >= 2) {
          audioEl.currentTime = t;
        } else {
          const onReady = () => {
            audioEl.currentTime = t;
            audioEl.removeEventListener('canplay', onReady);
          };
          audioEl.addEventListener('canplay', onReady);
        }
      };

      // [EP-TRACK-2] ถ้าจบแล้ว (isDone) → เล่นจากต้น, ไม่ seek
      if (isDone) return;
      if (item._resumeTime !== undefined) {
        _seekTo(item._resumeTime);
      } else {
        _seekTo(epCurrentTime);
      }
    });
    list.appendChild(item);

    // [HOTFIX-24b] lazy load duration ถ้าไม่มี field (ข้อมูลเก่า)
    if (ok && af.url && (!af.duration || af.duration === 0)) {
      const durEl = item.querySelector('.ep-dur');
      const a = new Audio();
      a.onloadedmetadata = () => {
        const d = Math.round(a.duration) || 0;
        af.duration = d; // cache ไว้ใน object
        if (durEl) durEl.textContent = fmtNV(d);
      };
      a.preload = 'metadata';
      a.src = af.url;
    }
  });

  // [UX-3] restore active state ถ้ามี ep ที่กำลังเล่นอยู่
  if (_nvCurrentIdx >= 0) {
    const activeEl = document.getElementById('nvEp-' + _nvCurrentIdx);
    if (activeEl) {
      activeEl.classList.add('active');
      const ic = activeEl.querySelector('.ep-icon');
      if (ic) ic.innerHTML = icon('pause');
    }
  }
}

window._nvSetTab = function(tab) {
  _nvTab = tab;
  document.getElementById('nvTabAll')?.classList.toggle('active', tab === 'all');
  document.getElementById('nvTabLatest')?.classList.toggle('active', tab === 'latest');
  const epCnt = Math.max(_nvNovel?.episodeCount || 0, _nvAudioFiles.length);
  _nvBuildEpList(epCnt, _nvAudioFiles, _nvNovel);
};

window._nvToggleSort = function() {
  _nvDesc = !_nvDesc;
  const lbl = document.getElementById('nvSortLabel');
  if (lbl) lbl.textContent = _nvDesc ? 'ใหม่→เก่า' : 'เก่า→ใหม่';
  const epCnt = Math.max(_nvNovel?.episodeCount || 0, _nvAudioFiles.length);
  _nvBuildEpList(epCnt, _nvAudioFiles, _nvNovel);
};

// ── play episode (ใช้ audio element เดิมใน shell — SPA-5 ต้องตรวจ)
window._nvPlayEp = async function(idx, audioFiles, novel, resumeTime = 0) {
  const audio = document.getElementById('audioEl');
  if (!audio) { console.warn('[SPA-5] ไม่พบ #audioEl element'); return; }
  // [BUG-PREVNEXT-1] อัปเดต global ให้ prevEp/nextEp/ended ใช้ได้เสมอ
  _nvAudioFiles = audioFiles;
  _nvNovel = novel;

  const af = audioFiles[idx];
  if (isEpisodeLocked(af, idx)) { openUnlockDialog(novel); return; }
  if (!af || (!af.url && !af.audioKey)) return;

  let playSrc;
  try {
    playSrc = await resolveEpisodeSrc(af);
  } catch (e) {
    if (e && e.code === 'MEMBERS_ONLY') { await showMembersOnly(novel); return; }
    console.warn('[r2/sign]', e);
    return;
  }

  _nvCurrentIdx = idx; // [UX-3] track ep ที่กำลังเล่น

  // reset active state
  document.querySelectorAll('.ep-item').forEach(el => {
    el.classList.remove('active');
    const ic = el.querySelector('.ep-icon'); if (ic) ic.innerHTML = icon('play');
  });
  const activeEl = document.getElementById('nvEp-' + idx);
  if (activeEl) {
    activeEl.classList.add('active');
    const ic = activeEl.querySelector('.ep-icon'); if (ic) ic.innerHTML = icon('pause');
    activeEl.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }

  audio.src = playSrc; audio.load();
  if (resumeTime > 0) {
    const onReady = () => { audio.currentTime = resumeTime; audio.removeEventListener('canplay', onReady); };
    audio.addEventListener('canplay', onReady);
  }
  audio.play().catch(() => { audio.play().catch(()=>{}); });
  isPlaying = true;
  syncPlayBtn(true);

  const lbl = af.name || `ตอนที่ ${idx+1}`;

  // ── อัปเดต now-playing bar (shell elements)
  const nowPlaying = document.getElementById('nowPlaying');
  const npTitle    = document.getElementById('npTitle');
  const npEp       = document.getElementById('npEp');
  const npCover    = document.getElementById('npCover');
  const npExpandTitle = document.getElementById('npExpandTitle');
  const npExpandEp    = document.getElementById('npExpandEp');
  const npExpandCover = document.getElementById('npExpandCover');

  if (npTitle) npTitle.textContent = novel?.title || lbl;
  if (npEp)    npEp.textContent    = lbl;
  if (npExpandTitle) npExpandTitle.textContent = novel?.title || lbl;
  if (npExpandEp)    npExpandEp.textContent    = lbl;

  const nvCoverSafe = safeUrl(novel?.coverUrl);
  const coverHTML = nvCoverSafe
    ? `<img src="${esc(nvCoverSafe)}" alt="" style="width:100%;height:100%;object-fit:cover">`
    : icon('headphones');
  if (npCover)       npCover.innerHTML       = coverHTML;
  if (npExpandCover) npExpandCover.innerHTML = coverHTML;

  if (nowPlaying) nowPlaying.classList.add('visible');

  // media session
  if ('mediaSession' in navigator && novel) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: lbl, artist: novel.author||'The Golden Hoard Novels', album: novel.title,
      artwork: novel.coverUrl ? [{src:novel.coverUrl,sizes:'512x512',type:'image/jpeg'}] : []
    });
  }

  // [RESUME-BUG-1] reset currentTime/duration/progress เมื่อเปลี่ยน ep ใหม่
  try {
    const entry = { novelId: novel.id, novelTitle: novel.title, coverUrl: novel.coverUrl||'', epLabel: lbl, epIdx: idx, currentTime: 0, duration: 0, progress: 0, ts: Date.now() };
    const key = _historyKey();
    const list = JSON.parse(localStorage.getItem(key)||'[]');
    const existing = list.find(h => h.novelId === novel.id) || {};
    const merged = { ...existing, ...entry };
    const filtered2 = list.filter(h => h.novelId !== novel.id);
    localStorage.setItem(key, JSON.stringify([merged, ...filtered2].slice(0, HISTORY_MAX)));
  } catch(e) {}
};


/* ===== SPA-5: Audio persist + Route Registration ===== */

/**
 * register routes ผ่าน router.js
 * - '/'           → renderHomeView()
 * - '/novels/:id' → renderNovelView({ id })
 * - '/library'    → renderLibraryView() (SPA-8, placeholder ตอนนี้)
 *
 * audio element #audioEl อยู่นอก #app-view → ไม่ถูก destroy เมื่อ navigate
 */
import('./router.js').then(router => {
  router.setBase(window._BASE);   // ส่ง BASE ที่ถูกต้องให้ router ก่อน
  router.register('/', renderHomeView);
  router.register('/novels/:id', window.renderNovelView);
  router.register('/library', renderLibraryView);
  router.register('/favorites', renderFavoritesView);
  router.initRouter();
}).catch(e => console.error('[SPA-5] router load failed:', e));

/* [CARD-H-1] wire nav-favorites-link + init badge */
document.addEventListener('DOMContentLoaded', () => {
  _updateFavBadge();
  syncMemberMenu();
  const favLink = document.getElementById('nav-favorites-link');
  if (favLink) favLink.onclick = e => { e.preventDefault(); window.handleRoute('/favorites'); };
});


/* ===== SPA-8: Library View ===== */

let _libQuery = '';
let _libFilter = 'all'; // all | ongoing | completed

/**
 * renderLibraryView() — แสดงนิยายทั้งหมด พร้อม search + filter
 * ใช้ allNovels ที่โหลดไว้แล้ว (onSnapshot ใน section 3)
 */
window.renderLibraryView = async function renderLibraryView() {
  const appView = document.getElementById('app-view');
  if (!appView) return;
  appView.dataset.view = 'library';

  appView.innerHTML = `
    <div class="lib-wrap">
      <div class="lib-header">
        <h1 class="lib-title">${icon('book')} นิยายทั้งหมด</h1>
        <p class="lib-sub" id="libCount"></p>
      </div>

      <div class="lib-controls">
        <div class="search-bar-wrap">
          <input id="libSearch" class="search-input" type="text"
            placeholder="ค้นหานิยาย, ผู้แต่ง, แท็ก..."
            oninput="window._libDoFilter()">
          <span class="search-icon">${icon('search')}</span>
        </div>
        <div class="filter-tabs" id="libFilterTabs">
          <button class="filter-tab active" onclick="window._libSetFilter(this,'all')">${icon('book')} ทั้งหมด</button>
          <button class="filter-tab" onclick="window._libSetFilter(this,'ongoing')">${icon('refresh')} กำลังออก</button>
          <button class="filter-tab" onclick="window._libSetFilter(this,'completed')">${icon('check')} จบแล้ว</button>
          <button class="filter-tab" onclick="window._libSetFilter(this,'popular')">${icon('flame')} ยอดนิยม</button>
        </div>
      </div>

      <div id="libGrid" class="novels-grid"></div>
      <div id="libEmpty" style="display:none;text-align:center;padding:60px 20px;color:#666;">
        <div style="font-size:2rem;margin-bottom:12px">${icon('search')}</div>
        <p>ไม่พบนิยายที่ตรงกับการค้นหา</p>
      </div>
    </div>

    <style>
      .lib-wrap{max-width:1100px;margin:0 auto;padding:40px 24px 32px}
      .lib-header{margin-bottom:28px}
      .lib-title{font-size:1.7rem;font-weight:700;color:#e8e8e8;margin-bottom:6px}
      .lib-sub{color:#a0a0a0;font-size:0.9rem}
      .lib-controls{display:flex;flex-direction:column;gap:14px;margin-bottom:28px}
      @media(max-width:600px){.lib-wrap{padding:24px 16px 24px}}
    </style>`;

  _libQuery = '';
  _libFilter = 'all';

  // ใช้ onSnapshot ของตัวเอง — ไม่พึ่ง allNovels global ที่อาจยังว่าง
  const unsub = onSnapshot(novelsQuery, (snapshot) => {
    allNovels = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    filtered  = [...allNovels];
  _pruneFavs();   // [FAV-PRUNE-1] เก็บกวาด id ที่นิยายถูกลบไปแล้ว
    _libDoRender();
  }, (err) => {
    console.warn('[renderLibraryView] Firestore error:', err);
  });

  return unsub; // router จะเรียก unsub() ก่อน navigate ออก
};

/** กรอง + เรียงนิยายตาม query + filter ปัจจุบัน */
window._libDoFilter = function() {
  _libQuery = (document.getElementById('libSearch')?.value || '').toLowerCase().trim();
  _libDoRender();
};

window._libSetFilter = function(btn, filter) {
  _libFilter = filter;
  document.querySelectorAll('#libFilterTabs .filter-tab')
    .forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  _libDoRender();
};

function _libDoRender() {
  const grid  = document.getElementById('libGrid');
  const empty = document.getElementById('libEmpty');
  const count = document.getElementById('libCount');
  if (!grid) return;

  let list = [...allNovels];

  // filter by status
  if (_libFilter === 'ongoing')   list = list.filter(n => (n.status || 'ongoing') === 'ongoing');
  if (_libFilter === 'completed') list = list.filter(n => n.status === 'completed');
  if (_libFilter === 'popular')   list = list.sort((a, b) => (b.views || 0) - (a.views || 0));

  // search
  if (_libQuery) {
    list = list.filter(n =>
      (n.title  || '').toLowerCase().includes(_libQuery) ||
      (n.author || '').toLowerCase().includes(_libQuery) ||
      (n.tags   || []).some(t => t.toLowerCase().includes(_libQuery))
    );
  }

  if (count) count.textContent = `${list.length} เรื่อง`;

  if (list.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  grid.innerHTML = list.map(n => cardHTML(n)).join('');
}

/* ===== [CARD-H-1] Favorites View ===== */
window.renderFavoritesView = async function renderFavoritesView() {
  const appView = document.getElementById('app-view');
  if (!appView) return;
  appView.dataset.view = 'favorites';

  // inject shell ก่อน
  appView.innerHTML = `
  <div class="lib-container">
    <div class="lib-header">
      <h1 class="lib-title">${icon('heart')} รายการโปรด</h1>
      <span class="lib-count" id="favCount">0 เรื่อง</span>
    </div>
    <div class="novels-grid" id="favGrid">
      <div class="empty-state"><div class="empty-icon">${icon('heart-outline')}</div><p>กำลังโหลด...</p></div>
    </div>
  </div>`;

  function _renderFavGrid() {
    const favIds    = _getFavs();
    const favNovels = allNovels.filter(n => favIds.includes(n.id));
    const grid      = document.getElementById('favGrid');
    const count     = document.getElementById('favCount');
    if (!grid) return;
    if (count) count.textContent = favNovels.length + ' เรื่อง';
    grid.innerHTML = favNovels.length
      ? favNovels.map(n => cardHTML(n)).join('')
      : `<div class="empty-state"><div class="empty-icon">${icon('heart-outline')}</div><p>ยังไม่มีรายการโปรด<br><small>กดรูปหัวใจบนการ์ดนิยายเพื่อเพิ่ม</small></p></div>`;
  }

  // ใช้ onSnapshot ของตัวเอง
  const unsub = onSnapshot(novelsQuery, (snapshot) => {
    allNovels = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    filtered  = [...allNovels];
  _pruneFavs();   // [FAV-PRUNE-1] เก็บกวาด id ที่นิยายถูกลบไปแล้ว
    _renderFavGrid();
  }, (err) => {
    console.warn('[renderFavoritesView] Firestore error:', err);
    _renderFavGrid(); // render จาก allNovels ที่มีอยู่
  });

  return unsub;
};

/**
 * window.handleRoute — bridge สำหรับ inline onclick ใน HTML shell
 * ก่อน module โหลดเสร็จ navigate() ใน index.html จะเรียกนี้
 */
/* ===== SPA NAVIGATE HELPER ===== */
/**
 * _spaNavigate(el) — ใช้ใน onclick ของ card/history-item
 * อ่าน data-novel-id แล้ว navigate ผ่าน router แทน href
 */
window._spaNavigate = function(el) {
  const id = el.dataset.novelId;
  if (!id) return;
  // [RESUME-1] ถ้ามี resume data (จาก history-item) → เก็บไว้ใน sessionStorage
  const epIdx      = el.dataset.epIdx;
  const resumeTime = parseFloat(el.dataset.resumeTime || 0);
  if (epIdx !== undefined) {
    try { sessionStorage.setItem('ghResume_' + id, JSON.stringify({ epIdx: parseInt(epIdx), resumeTime })); } catch(e) {}
  }
  import('./router.js').then(r => r.navigate('/novels/' + encodeURIComponent(id)));
};

/* ===== [NAV-JS-1] Sync active state for bottom-nav & sidebar ===== */
window._syncNavActive = function(path) {
  // map: route prefix → item id suffix
  const map = [
    { prefix: '/library',   key: 'library'   },
    { prefix: '/favorites', key: 'favorites' },
    { prefix: '/novels/',   key: null        }, // novel page — ไม่ highlight
    { prefix: '/',          key: 'home'      },
  ];
  const matched = map.find(m => path === m.prefix || path.startsWith(m.prefix));
  const activeKey = matched ? matched.key : null;

  // bottom-nav items
  ['home','library','favorites','login'].forEach(k => {
    const el = document.getElementById('bnav-' + k);
    if (el) el.classList.toggle('active', k === activeKey);
  });
  // sidebar items
  ['home','library','favorites','login'].forEach(k => {
    const el = document.getElementById('snav-' + k);
    if (el) el.classList.toggle('active', k === activeKey);
  });
};

window.handleRoute = function(path) {
  window._syncNavActive(path);
  import('./router.js').then(r => r.navigate(path));
};


/* ===== SPA-9: Deep Link Handler (GitHub Pages) ===== */

/**
 * GitHub Pages ไม่รองรับ server-side rewrite
 * เมื่อ user เปิด /novels/abc123 ตรง → GitHub serve 404.html
 * 404.html redirect มาที่ /?_r=/novels/abc123
 * ฟังก์ชันนี้อ่าน ?_r= แล้ว navigate ไป path จริงหลัง router พร้อม
 *
 * novel.html?id=xxx (legacy) → /?_novel=xxx → /novels/xxx ก็รองรับด้วย
 */
(function _handleDeepLink() {
  const sp   = new URLSearchParams(window.location.search);
  const base = window._BASE || '';

  // helper: ตัด BASE_PATH ออกจาก path ถ้ามี
  function stripBase(p) {
    if (base && p.startsWith(base)) {
      return p.slice(base.length) || '/';
    }
    return p;
  }

  // กรณี 404.html redirect: ?_r=/Novel/novels/abc123
  // ถ้า Netlify ใช้ _redirects แล้ว ไม่ควรมี ?_r= เลย
  const redirectPath = sp.get('_r');
  if (redirectPath) {
    const decoded = decodeURIComponent(redirectPath);
    // ป้องกัน loop: ถ้า decoded ยังมี ?_r= อยู่ ให้ไป / แทน
    if (decoded.includes('_r=')) {
      history.replaceState(null, '', base + '/');
      return;
    }
    const cleanPath = stripBase(decoded);
    const fullPath  = base + cleanPath;
    history.replaceState(null, '', fullPath);
    return;
  }

  // กรณี novel.html?id=xxx redirect: ?_novel=xxx
  const novelId = sp.get('_novel');
  if (novelId) {
    const cleanPath = '/novels/' + encodeURIComponent(novelId);
    history.replaceState(null, '', base + cleanPath);
  }
})();
