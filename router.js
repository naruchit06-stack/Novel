/* ============================================================
   router.js — The Golden Hoard SPA Router
   ============================================================

   INDEX:
   1. Route Registry
   2. navigate(path) — pushState + render
   3. popstate listener — back/forward
   4. resolveRoute() — จับ pattern เช่น /novels/:id
   5. initRouter() — เรียกครั้งแรก
   ============================================================ */


/* ===== 1. ROUTE REGISTRY ===== */

/**
 * routes: map path pattern → render function
 * render function ถูกผูกจาก app.js ผ่าน router.register()
 */
const _routes = new Map();

/**
 * unsubscribe fn จาก Firebase listener ของ view ก่อนหน้า
 * เพื่อไม่ให้ listener ซ้อนกัน
 */
let _currentUnsub = null;


/* ===== 2. PUBLIC API ===== */

/**
 * register(pattern, renderFn)
 * pattern: string เช่น '/', '/library', '/novels/:id'
 * renderFn: async function(params) → ทำงานแล้ว inject HTML เข้า #app-view
 */
export function register(pattern, renderFn) {
  _routes.set(pattern, renderFn);
}

/**
 * navigate(path)
 * เปลี่ยน URL + render view โดยไม่ reload หน้า
 * ปลอดภัย: ไม่แตะ <audio> / #player-bar
 */
export function navigate(path) {
  if (window.location.pathname === path) return; // ไม่ navigate ซ้ำ
  history.pushState(null, '', path);
  _render(path);
}

/**
 * initRouter()
 * เรียกครั้งเดียวตอน app เริ่ม — render route ปัจจุบัน
 */
export function initRouter() {
  _render(window.location.pathname);
}


/* ===== 3. POPSTATE — back / forward ===== */

window.addEventListener('popstate', () => {
  _render(window.location.pathname);
});


/* ===== 4. RESOLVE ROUTE ===== */

/**
 * resolveRoute(path)
 * คืน { renderFn, params } หรือ null ถ้าไม่เจอ route
 *
 * รองรับ dynamic segment เช่น /novels/:id
 * เช่น pattern '/novels/:id' + path '/novels/abc123'
 *   → params = { id: 'abc123' }
 */
function resolveRoute(path) {
  // ลอง exact match ก่อน
  if (_routes.has(path)) {
    return { renderFn: _routes.get(path), params: {} };
  }

  // ลอง dynamic match
  for (const [pattern, renderFn] of _routes) {
    const params = _matchPattern(pattern, path);
    if (params !== null) {
      return { renderFn, params };
    }
  }

  return null;
}

/**
 * _matchPattern(pattern, path)
 * คืน params object ถ้า match, null ถ้าไม่ match
 */
function _matchPattern(pattern, path) {
  const patternParts = pattern.split('/');
  const pathParts    = path.split('/');

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      // dynamic segment
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null; // ไม่ตรง
    }
  }
  return params;
}


/* ===== 5b. NAV ACTIVE SYNC — [SPA-10] ===== */

/**
 * _syncNavActive(path)
 * อัปเดต .active class บน nav links ทั้ง desktop (.nav-links a)
 * และ mobile drawer (.nav-mobile-drawer a) ให้ตรงกับ path ปัจจุบัน
 *
 * ใช้ data-route attribute เพื่อ match — ไม่ต้อง hardcode selector
 */
function _syncNavActive(path) {
  // normalize: /novels/xxx → '/novels/:id' bucket → ถือว่า novel ไม่ active nav ปกติ
  const base = path === '/' ? '/'
    : path.startsWith('/novels/') ? '/novels'
    : path; // /library หรืออื่นๆ

  // ทั้ง desktop nav links และ mobile drawer links
  document.querySelectorAll('.nav-links a, .nav-mobile-drawer a').forEach(a => {
    const href = a.getAttribute('href') || '';
    // match: '/' exact, '/library' exact, '/novels' prefix
    const isActive =
      (href === '/' && base === '/') ||
      (href !== '/' && base.startsWith(href));
    a.classList.toggle('active', isActive);
  });
}


/* ===== 5. INTERNAL RENDER ===== */

async function _render(path) {
  // unsubscribe Firebase listener ของ view เดิม (ถ้ามี)
  if (typeof _currentUnsub === 'function') {
    _currentUnsub();
    _currentUnsub = null;
  }

  const appView = document.getElementById('app-view');
  if (!appView) {
    console.error('[router] ไม่พบ #app-view');
    return;
  }

  const matched = resolveRoute(path);

  if (!matched) {
    // 404 fallback
    appView.innerHTML = `
      <div style="text-align:center;padding:80px 20px;">
        <h2 style="color:#c0392b;">404 — ไม่พบหน้านี้</h2>
        <p style="color:#888;">กลับ <a href="/" onclick="event.preventDefault();router.navigate('/')">หน้าหลัก</a></p>
      </div>`;
    return;
  }

  // แสดง loading spinner ระหว่างรอ render
  appView.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:40vh;">
      <div class="spinner"></div>
    </div>`;

  try {
    // renderFn คืน unsub fn ถ้ามี Firebase listener (optional)
    const unsub = await matched.renderFn(matched.params);
    if (typeof unsub === 'function') {
      _currentUnsub = unsub;
    }
    // [SPA-10] sync active state ของ nav links (desktop + mobile drawer)
    _syncNavActive(path);
  } catch (err) {
    console.error('[router] render error:', err);
    appView.innerHTML = `
      <div style="text-align:center;padding:80px 20px;">
        <h2 style="color:#c0392b;">เกิดข้อผิดพลาด</h2>
        <p style="color:#888;">${err.message}</p>
      </div>`;
  }
}
