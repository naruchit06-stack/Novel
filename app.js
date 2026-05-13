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
import { getFirestore, collection, onSnapshot, query, orderBy, doc, getDoc }
                            from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/* ===== 1. FIREBASE INIT ===== */
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


/* ===== 2. AUTH ===== */
const ADMIN_EMAILS = ['momoppl01@gmail.com', 'admin@memonster.com'];

onAuthStateChanged(auth, (user) => {
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
    // แสดงปุ่ม admin ถ้าเป็น admin
    if (adminBtn && ADMIN_EMAILS.includes(user.email)) {
      adminBtn.style.display = 'flex';
    }
  } else {
    // แสดงปุ่ม login/register
    if (loginBtn)    loginBtn.style.display    = 'inline-flex';
    if (registerBtn) registerBtn.style.display = 'inline-flex';
    if (mobileGuest) mobileGuest.style.display = 'flex';
    // ซ่อน user menu + admin
    if (userMenu)  userMenu.style.display  = 'none';
    if (adminBtn)  adminBtn.style.display  = 'none';
  }
});

window.handleSignOut = async function() {
  await signOut(auth);
  window.location.reload();
};


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
      el.innerHTML = `<img src="${snap.data().imageUrl}" alt="Hero" style="width:100%;height:100%;object-fit:cover;border-radius:16px;">`;
    }
  } catch(e) { console.warn('Hero image:', e); }
}
loadHeroImage();
const novelsQuery = query(novelsRef, orderBy('createdAt', 'desc'));

onSnapshot(novelsQuery, (snapshot) => {
  allNovels = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  filtered  = [...allNovels];
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
  const url = `novel.html?id=${encodeURIComponent(n.id)}`;
  const cover = n.coverUrl
    ? `<img src="${n.coverUrl}" alt="${n.title}" loading="lazy" onerror="this.style.display='none'">`
    : `<div class="novel-card-cover-placeholder">${n.emoji || '📖'}</div>`;
  const rating = n.rating ? `⭐ ${n.rating}` : '⭐ —';
  return `
  <div class="novel-card-h">
    <div class="novel-card-cover">
      ${cover}
      <span class="novel-card-cover-badge badge ${st.cls}">${st.label}</span>
    </div>
    <div class="novel-card-body">
      <div class="novel-card-title">${n.title}</div>
      <div class="novel-card-desc">${n.desc || n.description || ''}</div>
      <div class="novel-card-meta">
        <span>📖 ${n.eps || 0} ตอน</span>
        <span>👁 ${n.views || 0}</span>
      </div>
      <div class="novel-card-footer">
        <span class="novel-card-rating">${rating}</span>
        <a href="${url}" class="novel-card-read-btn">อ่านต่อ</a>
      </div>
    </div>
  </div>`;
}

function renderNovels(list) {
  const grid = document.getElementById('novelsGrid');
  const countEl = document.getElementById('novels-count');
  if (countEl) countEl.textContent = list.length + ' เรื่อง';
  grid.innerHTML = list.length
    ? list.map(cardHTML).join('')
    : `<div class="empty-state"><div class="empty-icon">🎙️</div><p>ยังไม่มีนิยายเสียง</p></div>`;
}

function renderSection(gridId, novels) {
  const el = document.getElementById(gridId);
  if (el) el.innerHTML = novels.length
    ? novels.map(cardHTML).join('')
    : `<div class="empty-state"><p>ยังไม่มีข้อมูล</p></div>`;
}


/* ===== 5. SEARCH & FILTER ===== */
let currentFilterTab = 'popular'; // track active filter tab

window.filterNovels = function() {
  // รับค่าจาก search bar ใหม่ (searchInputMain) หรือเดิม (searchInput)
  const el = document.getElementById('searchInputMain') || document.getElementById('searchInput');
  const q  = el ? el.value.toLowerCase().trim() : '';

  let result = applyFilterTab(currentFilterTab, allNovels);
  if (q) {
    result = result.filter(n =>
      n.title.toLowerCase().includes(q) ||
      (n.author || '').toLowerCase().includes(q) ||
      (n.tags || []).some(t => t.toLowerCase().includes(q))
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

// --- MID-CODE CHECKPOINT: ✅ task เดียว ✅ buffer พอ ---

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
  document.getElementById('modalAuthor').textContent = '✍️ ' + (n.author || 'Unknown');
  document.getElementById('modalSynopsis').textContent = n.synopsis || '';
  document.getElementById('modalEmoji').textContent  = n.emoji || '🎧';

  const img = document.getElementById('modalCoverImg');
  if (n.coverUrl) {
    img.src = n.coverUrl; img.style.display = 'block';
    document.getElementById('modalEmoji').style.display = 'none';
  } else {
    img.style.display = 'none';
    document.getElementById('modalEmoji').style.display = 'block';
  }

  document.getElementById('modalTags').innerHTML =
    (n.tags || []).map(t => `<span class="player-tag">${t}</span>`).join('');

  audioFiles_modal = n.audioFiles || [];
  const epCount = Math.max(n.eps || 0, audioFiles_modal.length);
  const epList  = document.getElementById('episodeList');

  if (epCount === 0) {
    epList.innerHTML = `<div style="text-align:center;padding:20px;color:var(--muted);font-size:0.85rem">⏳ ยังไม่มีตอน</div>`;
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

      const groupIcon  = groupHasAudio ? '▶' : '🔒';
      const groupStyle = groupHasAudio ? '' : 'opacity:0.55;cursor:default';

      return `<div class="episode-group ${isFirst && groupHasAudio ? 'active' : ''}" style="${groupStyle}"
                   onclick="${groupHasAudio ? `toggleGroup(this,${g.start})` : ''}">
        <div class="eg-icon">${groupIcon}</div>
        <div class="eg-label">ตอนที่ ${g.start + 1} - ${g.end + 1}${groupHasAudio ? '' : ' <span style=\'font-size:0.72rem;color:var(--muted)\'>ยังไม่มีไฟล์</span>'}</div>
        <div class="eg-arrow">${isFirst && groupHasAudio ? '▴' : '▾'}</div>
      </div>
      <div class="episode-sublist" id="sublist-${g.start}"
           style="${isFirst && groupHasAudio ? 'display:flex;flex-direction:column' : 'display:none'}">
        ${isFirst && groupHasAudio ? Array.from({ length: g.end - g.start + 1 }, (_, i) => {
          const idx    = g.start + i;
          const af     = audioFiles_modal[idx];
          const hasAudio = af && af.url;
          const title  = af ? (af.name || `ตอนที่ ${idx + 1}`) : `ตอนที่ ${idx + 1}`;
          return `<div class="episode-item${hasAudio ? '' : ' locked'}" id="ep-${idx}"
                       onclick="${hasAudio ? `playEpisode(${idx})` : ''}">
            <div class="ep-play">${hasAudio ? '▶' : '🔒'}</div>
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
    g.querySelector('.eg-arrow').textContent = '▾';
  });

  if (!isOpen) {
    const n              = currentNovel;
    const audioFiles_local = n.audioFiles || [];
    const epCount        = Math.max(n.eps || 0, audioFiles_local.length);
    const endIdx         = Math.min(startIdx + 49, epCount - 1);

    sublist.innerHTML = Array.from({ length: endIdx - startIdx + 1 }, (_, i) => {
      const idx      = startIdx + i;
      const af       = audioFiles_local[idx];
      const hasAudio = af && af.url;
      const title    = af ? (af.name || `ตอนที่ ${idx + 1}`) : `ตอนที่ ${idx + 1}`;
      return `<div class="episode-item${hasAudio ? '' : ' locked'}" id="ep-${idx}"
                   onclick="${hasAudio ? `playEpisode(${idx})` : ''}">
        <div class="ep-play">${hasAudio ? '▶' : '🔒'}</div>
        <div class="ep-info">
          <div class="ep-title">${title}</div>
          <div class="ep-duration" style="${hasAudio ? '' : 'color:var(--muted)'}">${hasAudio ? formatDuration(af.duration) : 'ยังไม่มีไฟล์'}</div>
        </div>
      </div>`;
    }).join('');

    sublist.style.display     = 'flex';
    sublist.style.flexDirection = 'column';
    el.classList.add('active');
    el.querySelector('.eg-arrow').textContent = '▴';
  }
};

window.closeModal      = function() { document.getElementById('modalOverlay').classList.remove('open'); document.body.style.overflow = ''; };
window.closeModalOnBg  = function(e) { if (e.target === document.getElementById('modalOverlay')) closeModal(); };


/* ===== 8. AUDIO PLAYER ===== */
const audio = document.getElementById('audioEl');
let isPlaying = false;

function syncPlayBtn(playing) {
  const icon = playing ? '⏸' : '▶';
  ['btnPlayPause', 'btnPlayPause2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = icon;
  });
}

window.playEpisode = function(idx) {
  if (!currentNovel) return;
  currentEpIdx = idx;
  const af = audioFiles_modal[idx];

  document.querySelectorAll('.episode-item').forEach((el, i) => {
    el.classList.toggle('playing', i === idx);
    const ep = el.querySelector('.ep-play');
    if (ep) ep.textContent = i === idx ? '⏸' : '▶';
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

  const coverHtml = n.coverUrl
    ? `<img src="${n.coverUrl}" alt="" style="width:100%;height:100%;object-fit:cover">`
    : `<span style="font-size:3rem">${n.emoji || '🎧'}</span>`;
  document.getElementById('npCover').innerHTML       = coverHtml;
  document.getElementById('npExpandCover').innerHTML = coverHtml;

  document.getElementById('nowPlaying').classList.add('visible');
  updateMediaSession();
};

window.toggleExpand = function() { document.getElementById('nowPlaying').classList.toggle('expanded'); };
window.rewind10     = function() { if (audio.src) audio.currentTime = Math.max(0, audio.currentTime - 10); };
window.forward10    = function() { if (audio.src) audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); };

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

window.prevEp = function() { if (currentEpIdx > 0) playEpisode(currentEpIdx - 1); };
window.nextEp = function() {
  const max = Math.max((currentNovel?.eps || 0), audioFiles_modal.length) - 1;
  if (currentEpIdx < max) playEpisode(currentEpIdx + 1);
};


/* ===== 9. PROGRESS BAR & TIME ===== */
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  const cur = formatTime(audio.currentTime);
  const dur = formatTime(audio.duration);

  document.getElementById('npBarFill').style.width  = pct + '%';
  document.getElementById('npCurrent').textContent  = cur;
  document.getElementById('npDuration').textContent = dur;

  const f2 = document.getElementById('npBarFill2');
  const c2 = document.getElementById('npCurrent2');
  const d2 = document.getElementById('npDuration2');
  if (f2) f2.style.width  = pct + '%';
  if (c2) c2.textContent  = cur;
  if (d2) d2.textContent  = dur;
});

audio.addEventListener('ended', () => { nextEp(); });

window.seekAudio  = function(e) {
  if (!audio.duration) return;
  const rect = document.getElementById('npBar').getBoundingClientRect();
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
};
window.seekAudio2 = function(e) {
  if (!audio.duration) return;
  const rect = document.getElementById('npBar2').getBoundingClientRect();
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
  navigator.mediaSession.setActionHandler('play',         () => { audio.play();  document.getElementById('btnPlayPause').textContent = '⏸'; });
  navigator.mediaSession.setActionHandler('pause',        () => { audio.pause(); document.getElementById('btnPlayPause').textContent = '▶'; });
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
