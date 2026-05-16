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
import { getFirestore, collection, onSnapshot, query, orderBy, doc, getDoc, getDocs }
                            from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/* ===== 1. FIREBASE INIT ===== */

// BASE PATH จาก import.meta.url ของ app.js — ถูกต้องเสมอ ไม่ขึ้นกับ URL ปัจจุบัน
window._BASE = new URL('.', import.meta.url).pathname.replace(/\/$/, '');

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
  const cover = n.coverUrl
    ? `<img src="${n.coverUrl}" alt="${n.title}" loading="lazy" onerror="this.style.display='none'">`
    : `<div class="novel-card-cover-placeholder">${n.emoji || '📖'}</div>`;
  const rating = n.rating ? `⭐ ${n.rating}` : '';
  const views  = n.views  ? `👁 ${(n.views/1000).toFixed(1)}K`  : '';
  const likes  = n.likes  ? `❤ ${(n.likes/1000).toFixed(1)}K`  : '';
  const isFav  = _getFavs().includes(n.id);
  return `
  <a href="javascript:void(0)" data-novel-id="${n.id}" class="novel-card-h" onclick="window._spaNavigate(this)">
    <div class="novel-card-cover" style="position:relative">
      ${cover}
      <span class="novel-card-cover-badge badge ${st.cls}">${st.label}</span>
      <button class="novel-card-heart${isFav ? ' fav-active' : ''}" data-fav-id="${n.id}"
        onclick="event.preventDefault();event.stopPropagation();toggleFav('${n.id}',this)"
        title="${isFav ? 'เอาออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}">
        ${isFav ? '❤️' : '🤍'}
      </button>
    </div>
    <div class="novel-card-body">
      <div class="novel-card-title">${n.title}</div>
      <div class="novel-card-desc">${n.desc || n.description || ''}</div>
      <div class="novel-card-meta">
        ${rating ? `<span class="meta-rating">${rating}</span>` : ''}
        ${views  ? `<span>${views}</span>` : ''}
        ${likes  ? `<span class="meta-likes">${likes}</span>` : ''}
        <span>📖 ${n.episodeCount || 0} ตอน</span>
      </div>
      <div class="novel-card-footer">
        <span class="novel-card-read-btn">▶ ฟังเลย</span>
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
function toggleFav(novelId, btn) {
  let favs = _getFavs();
  const idx = favs.indexOf(novelId);
  if (idx === -1) {
    favs.push(novelId);
    btn.classList.add('fav-active');
    btn.textContent = '❤️';
    btn.title = 'เอาออกจากรายการโปรด';
  } else {
    favs.splice(idx, 1);
    btn.classList.remove('fav-active');
    btn.textContent = '🤍';
    btn.title = 'เพิ่มในรายการโปรด';
    /* ถ้ากำลังอยู่ในหน้า favorites ให้ลบการ์ดทิ้ง */
    const appView = document.getElementById('app-view');
    const isFavPage = appView?.dataset.view === 'favorites';
    if (isFavPage) {
      const card = btn.closest('.novel-card-h');
      if (card) card.remove();
    }
  }
  _saveFavs(favs);
  _updateFavBadge();
}
function _updateFavBadge() {
  const count = _getFavs().length;
  const link = document.getElementById('nav-favorites-link');
  if (!link) return;
  link.textContent = count > 0 ? `รายการโปรด (${count})` : 'รายการโปรด';
}
window.toggleFav = toggleFav;

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
  const epCount = Math.max(n.episodeCount || 0, audioFiles_modal.length);
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
    const epCount        = Math.max(n.episodeCount || 0, audioFiles_local.length);
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
  const el = document.querySelector('.np-vol-icon');
  if (!el) return;
  el.textContent = audio.volume === 0 ? '🔇' : audio.volume < 0.5 ? '🔉' : '🔊';
}

// -- Sleep Timer --
let _sleepTimer = null;
let _sleepMins  = 0;
const SLEEP_OPTIONS = [15, 30, 60, 90, 0]; // 0 = ยกเลิก
let _sleepIdx = 0;

window.toggleSleepTimer = function() {
  const mins = SLEEP_OPTIONS[_sleepIdx % SLEEP_OPTIONS.length];
  _sleepIdx++;

  if (_sleepTimer) { clearTimeout(_sleepTimer); _sleepTimer = null; }

  const btn = document.getElementById('npSleepBtn');
  if (!btn) return;

  if (mins === 0) {
    btn.textContent = '⏰ ตั้งเวลาปิด';
    btn.classList.remove('active');
    _sleepIdx = 0;
    return;
  }

  _sleepTimer = setTimeout(() => {
    audio.pause();
    isPlaying = false;
    syncPlayBtn(false);
    if (btn) { btn.textContent = '⏰ ตั้งเวลาปิด'; btn.classList.remove('active'); }
    _sleepIdx = 0;
  }, mins * 60 * 1000);

  btn.textContent = `⏰ ${mins} นาที`;
  btn.classList.add('active');
};

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

  const fill  = document.getElementById('npBarFill');
  const thumb = document.getElementById('npBarThumb');
  if (fill)  fill.style.width = pct + '%';
  if (thumb) thumb.style.left = `calc(${pct}% - 6px)`;
  document.getElementById('npCurrent').textContent  = cur;
  document.getElementById('npDuration').textContent = dur;

  const f2 = document.getElementById('npBarFill2');
  const t2 = document.getElementById('npBarThumb2');
  const c2 = document.getElementById('npCurrent2');
  const d2 = document.getElementById('npDuration2');
  if (f2) f2.style.width = pct + '%';
  if (t2) t2.style.left  = `calc(${pct}% - 6px)`;
  if (c2) c2.textContent = cur;
  if (d2) d2.textContent = dur;
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
    const coverHtml = s.coverUrl
      ? `<img src="${s.coverUrl}" alt="" style="width:100%;height:100%;object-fit:cover">`
      : `<span style="font-size:3rem">🎧</span>`;
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

/* ===== [IDX-NEW-3] HISTORY — saveHistory + renderHistory ===== */

const HISTORY_KEY = 'gh_history';
const HISTORY_MAX = 10;

window.saveHistory = function(novelId, novelTitle, coverUrl, epLabel, progress) {
  if (!novelId) return;
  try {
    let list = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    // ลบรายการเดิมถ้ามีอยู่แล้ว
    list = list.filter(h => h.novelId !== novelId);
    // เพิ่มล่าสุดไว้หน้าสุด
    list.unshift({ novelId, novelTitle, coverUrl, epLabel, progress: progress || 0, ts: Date.now() });
    // จำกัดไว้ 10 รายการ
    if (list.length > HISTORY_MAX) list = list.slice(0, HISTORY_MAX);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch(e) { console.warn('saveHistory error:', e); }
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

  // inject skeleton HTML
  appView.innerHTML = `
    <!-- HISTORY BAR -->
    <section id="historyBar" class="history-bar">
      <div class="history-header">
        <span class="history-title">⏱ ประวัติการฟังล่าสุด</span>
      </div>
      <div id="historyItems" class="history-items"></div>
    </section>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">🎙️ นิยายเสียงภาษาไทย</div>
        <h1 class="hero-title">ฟังนิยายที่คุณชื่นชอบ<br>ได้ทุกที่ทุกเวลา</h1>
        <p class="hero-subtitle">รวมนิยายเสียงคุณภาพสูง พากย์โดยนักพากย์มืออาชีพ อัปเดตใหม่ทุกสัปดาห์</p>
        <div class="hero-actions">
          <button class="btn-primary" onclick="navigateToLibrary()">🎧 เริ่มฟังเลย</button>
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
          <div class="hero-crown-badge">👑</div>
        </div>
      </div>
    </section>

    <!-- SEARCH + FILTER TABS -->
    <section class="search-section">
      <div class="search-bar-wrap">
        <input id="searchInputMain" class="search-input" type="text"
               placeholder="ค้นหานิยาย, ผู้แต่ง, แท็ก..." oninput="filterNovels()">
        <span class="search-icon">🔍</span>
      </div>
      <div class="filter-tabs">
        <button class="filter-tab active" onclick="switchFilterTab(this,'popular')">🔥 ยอดนิยม</button>
        <button class="filter-tab" onclick="switchFilterTab(this,'new')">✨ มาใหม่</button>
        <button class="filter-tab" onclick="switchFilterTab(this,'updated')">🔄 อัปเดต</button>
        <button class="filter-tab" onclick="switchFilterTab(this,'all')">📚 ทั้งหมด</button>
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
        <h2 class="section-title">✨ มาใหม่ล่าสุด</h2>
      </div>
      <div id="newReleasesGrid" class="novels-grid"></div>
    </section>

    <!-- POPULAR -->
    <section class="novels-section">
      <div class="section-header">
        <h2 class="section-title">🔥 ยอดนิยม</h2>
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

window.renderHistory = function() {
  // helper: วินาที → "m:ss"
  function _fmtTime(s) {
    s = Math.floor(s || 0);
    return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0');
  }
  const bar   = document.getElementById('historyBar');
  const items = document.getElementById('historyItems');
  if (!bar || !items) return;
  try {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (!list.length) { bar.classList.remove('visible'); return; }
    items.innerHTML = list.map(h => {
      const pct = Math.min(100, Math.round((h.progress || 0) * 100));
      const cur = h.currentTime ? _fmtTime(h.currentTime) : '—';
      const dur = h.duration    ? _fmtTime(h.duration)    : '—';
      return `
        <div class="history-item" data-novel-id="${h.novelId}" onclick="window._spaNavigate(this)">
          <div class="history-item-cover">
            📖
            <img src="${h.coverUrl || ''}" alt="${h.novelTitle || ''}"
                 loading="lazy" onerror="this.style.display='none'"
                 ${h.coverUrl ? '' : 'style="display:none"'}>
          </div>
          <div class="history-item-info">
            <div class="history-item-title">${h.novelTitle || '—'}</div>
            <div class="history-item-ep">${h.epLabel || ''}</div>
            <div class="history-progress-wrap">
              <div class="history-progress-bar">
                <div class="history-progress-fill" style="width:${pct}%"></div>
              </div>
              <span class="history-progress-pct">${cur} / ${dur}</span>
            </div>
          </div>
          <span class="history-item-heart">❤️</span>
        </div>`;
    }).join('');
    bar.classList.add('visible');
  } catch(e) { console.warn('renderHistory error:', e); }
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
        <span class="nv-err-icon">⚠️</span>
        <p id="nvErrMsg">เกิดข้อผิดพลาด</p>
        <a href="/" onclick="event.preventDefault();window.handleRoute('/')" class="nv-back-btn">← กลับหน้าหลัก</a>
      </div>
      <div id="nvContent" style="display:none"></div>
    </div>`;

  if (!novelId) { _nvErr('ไม่พบ ID นิยาย'); return; }

  let novel, audioFiles;
  try {
    // [PERF-2] เช็ค novel cache ก่อน — ถ้ามีแล้วไม่ hit Firestore
    if (_novelCache[novelId]) {
      novel = _novelCache[novelId];
    } else {
      const snap = await getDoc(doc(db, 'novels', novelId));
      if (!snap.exists()) { _nvErr('ไม่พบนิยายนี้ในฐานข้อมูล'); return; }
      novel = { id: snap.id, ...snap.data() };
      _novelCache[novelId] = novel;
    }

    // [PERF-3] เช็ค episode cache ก่อน — ถ้ามีแล้วไม่ getDocs ซ้ำ
    if (_epCache[novelId]) {
      audioFiles = _epCache[novelId];
    } else {
      const epSnap = await getDocs(query(collection(db, 'novels', novelId, 'episodes'), orderBy('order','asc')));
      audioFiles = epSnap.docs.map(d => ({ url: d.data().audioUrl, name: d.data().title, ...d.data() }));
      _epCache[novelId] = audioFiles;
    }
  } catch(e) {
    console.error('[renderNovelView]', e);
    _nvErr('โหลดข้อมูลไม่สำเร็จ'); return;
  }

  // ── build content
  const st     = novel.status || 'ongoing';
  const epCnt  = Math.max(novel.episodeCount || novel.eps || 0, audioFiles.length);
  const tagsHTML = (novel.tags||[]).map(t=>`<span class="nv-tag">${t}</span>`).join('');
  const coverImg = novel.coverUrl
    ? `<img src="${novel.coverUrl}" alt="${novel.title}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border-radius:12px">`
    : `<span class="nv-cover-title">${novel.title}</span>`;

  document.getElementById('nvContent').innerHTML = `
    <div class="nv-main">
      <a href="/" class="nv-back-btn" onclick="event.preventDefault();window.handleRoute('/')">← ย้อนกลับ</a>

      <div class="nv-cols">
        <div class="nv-col-left">
          <div class="nv-cover" id="nvCoverBox">${coverImg}</div>
          <div class="nv-info">
            <h1 class="nv-title">${novel.title}</h1>
            <p class="nv-author">✍️ ${novel.author||'Unknown'}</p>
            <div class="nv-meta">
              <span class="badge ${STATUS_CLS_NV[st]||'badge-ongoing'}">${STATUS_LABEL_NV[st]||st}</span>
              <span class="badge badge-ep">${epCnt} ตอน</span>
              ${novel.views ? `<span style="color:#a0a0a0;font-size:13px">• 👁 ${novel.views}</span>` : ''}
            </div>
            <div class="nv-tags">${tagsHTML}</div>
            <p class="nv-synopsis">${novel.synopsis||''}</p>
            <button class="nv-play-first-btn" id="nvPlayFirstBtn">▶ เล่นตอนแรก</button>
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
                <button class="nv-sort-btn" id="nvSortBtn" onclick="window._nvToggleSort()">⇅ <span id="nvSortLabel">เก่า→ใหม่</span></button>
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
  requestAnimationFrame(() => _nvBuildEpList(epCnt, audioFiles, novel));

  // ── play first btn
  document.getElementById('nvPlayFirstBtn').addEventListener('click', () => {
    const i = audioFiles.findIndex(af => af && af.url);
    if (i >= 0) window._nvPlayEp(i, audioFiles, novel);
  });

  // ── show content
  document.getElementById('nvStateLoading').style.display = 'none';
  document.getElementById('nvContent').style.display = 'block';
  document.title = `${novel.title} — The Golden Hoard Novels`;
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

function _nvBuildEpList(epCnt, audioFiles, novel) {
  _nvAudioFiles = audioFiles;
  _nvNovel = novel;
  const list = document.getElementById('nvEpList');
  if (!list) return;
  if (epCnt === 0) {
    list.innerHTML = `<div style="text-align:center;padding:30px;color:#666">⏳ ยังไม่มีตอน</div>`;
    return;
  }

  // สร้าง array index ตาม tab + sort
  let indices = Array.from({ length: epCnt }, (_, i) => i);
  if (_nvDesc) indices = indices.slice().reverse();
  if (_nvTab === 'latest') indices = indices.slice(0, 10);

  list.innerHTML = '';
  indices.forEach(i => {
    const af  = audioFiles[i];
    const ok  = af && af.url;
    const lbl = af ? (af.name || `ตอนที่ ${i+1}`) : `ตอนที่ ${i+1}`;
    const item = document.createElement('div');
    item.className = 'ep-item' + (ok ? '' : ' no-audio');
    item.id = 'nvEp-' + i;
    item.innerHTML = `<span class="ep-icon">${ok ? '▶' : '⏳'}</span>
      <span class="ep-label">${lbl}</span>
      <span class="ep-dur">${ok ? fmtNV(af.duration) : ''}</span>`;
    if (ok) item.addEventListener('click', () => window._nvPlayEp(i, audioFiles, novel));
    list.appendChild(item);

    // [HOTFIX-24b] lazy load duration ถ้าไม่มี field (ข้อมูลเก่า)
    if (ok && (!af.duration || af.duration === 0)) {
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
      if (ic) ic.textContent = '⏸';
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
window._nvPlayEp = function(idx, audioFiles, novel) {
  const audio = document.getElementById('audioEl');
  if (!audio) { console.warn('[SPA-5] ไม่พบ #audioEl element'); return; }

  const af = audioFiles[idx];
  if (!af || !af.url) return;

  _nvCurrentIdx = idx; // [UX-3] track ep ที่กำลังเล่น

  // reset active state
  document.querySelectorAll('.ep-item').forEach(el => {
    el.classList.remove('active');
    const ic = el.querySelector('.ep-icon'); if (ic) ic.textContent = '▶';
  });
  const activeEl = document.getElementById('nvEp-' + idx);
  if (activeEl) {
    activeEl.classList.add('active');
    const ic = activeEl.querySelector('.ep-icon'); if (ic) ic.textContent = '⏸';
    activeEl.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }

  let src = af.url;
  if (src.includes('cloudinary.com') && src.includes('/raw/upload/'))
    src = src.replace('/raw/upload/', '/video/upload/');
  audio.src = src; audio.load();
  audio.play().catch(() => { audio.src = af.url; audio.load(); audio.play().catch(()=>{}); });

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

  const coverHTML = novel?.coverUrl
    ? `<img src="${novel.coverUrl}" alt="" style="width:100%;height:100%;object-fit:cover">`
    : '🎧';
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

  // save history
  try {
    const HISTORY_KEY = 'gh_history';
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');
    const entry = { novelId: novel.id, novelTitle: novel.title, coverUrl: novel.coverUrl||'', epLabel: lbl, epIdx: idx, progress: 0 };
    const filtered2 = list.filter(h => h.novelId !== novel.id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...filtered2].slice(0,10)));
  } catch(e) {}
};


/* ===== SPA-5: Audio persist + Route Registration ===== */

/**
 * register routes ผ่าน router.js
 * - '/'           → renderHomeView()
 * - '/novels/:id' → renderNovelView({ id })
 * - '/library'    → renderLibraryView() (SPA-8, placeholder ตอนนี้)
 *
 * audio element #audioEl อยู่นอก #app-view → ไม่ถูก destroy เมื่อ navigate ✅
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

  appView.innerHTML = `
    <div class="lib-wrap">
      <div class="lib-header">
        <h1 class="lib-title">📚 นิยายทั้งหมด</h1>
        <p class="lib-sub" id="libCount"></p>
      </div>

      <div class="lib-controls">
        <div class="search-bar-wrap">
          <input id="libSearch" class="search-input" type="text"
            placeholder="ค้นหานิยาย, ผู้แต่ง, แท็ก..."
            oninput="window._libDoFilter()">
          <span class="search-icon">🔍</span>
        </div>
        <div class="filter-tabs" id="libFilterTabs">
          <button class="filter-tab active" onclick="window._libSetFilter(this,'all')">📚 ทั้งหมด</button>
          <button class="filter-tab" onclick="window._libSetFilter(this,'ongoing')">🔄 กำลังออก</button>
          <button class="filter-tab" onclick="window._libSetFilter(this,'completed')">✅ จบแล้ว</button>
          <button class="filter-tab" onclick="window._libSetFilter(this,'popular')">🔥 ยอดนิยม</button>
        </div>
      </div>

      <div id="libGrid" class="novels-grid"></div>
      <div id="libEmpty" style="display:none;text-align:center;padding:60px 20px;color:#666;">
        <div style="font-size:2rem;margin-bottom:12px">🔍</div>
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
  _libDoRender();
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

  const favIds = _getFavs();
  const favNovels = allNovels.filter(n => favIds.includes(n.id));

  appView.innerHTML = `
  <div class="lib-container">
    <div class="lib-header">
      <h1 class="lib-title">❤️ รายการโปรด</h1>
      <span class="lib-count" id="favCount">${favNovels.length} เรื่อง</span>
    </div>
    <div class="novels-grid" id="favGrid">
      ${favNovels.length
        ? favNovels.map(n => cardHTML(n)).join('')
        : `<div class="empty-state"><div class="empty-icon">🤍</div><p>ยังไม่มีรายการโปรด<br><small>กดหัวใจ ❤ บนการ์ดนิยายเพื่อเพิ่ม</small></p></div>`
      }
    </div>
  </div>`;
};
window.renderFavoritesView = window.renderFavoritesView;

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
  import('./router.js').then(r => r.navigate('/novels/' + encodeURIComponent(id)));
};

window.handleRoute = function(path) {
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
  const redirectPath = sp.get('_r');
  if (redirectPath) {
    const cleanPath = stripBase(decodeURIComponent(redirectPath));
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
