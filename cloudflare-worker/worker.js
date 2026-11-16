/**
 * The Golden Hoard — Cloudinary Usage Proxy (Cloudflare Worker)
 * ---------------------------------------------------------------
 * ทำหน้าที่เป็นตัวกลางอ่านยอดใช้จริงจาก Cloudinary Admin API
 * เพราะ api_secret ห้ามอยู่ในโค้ดฝั่งเว็บ (ใครเปิดเว็บก็เห็น)
 *
 * Endpoint:  GET /usage          → คืน JSON จาก Cloudinary /usage (แคช 5 นาที)
 *            GET /usage?refresh=1 → บังคับดึงใหม่ (ข้ามแคช)
 *
 * ต้องตั้งค่า (Settings → Variables and Secrets) — ใช้แบบ "Secret" ทุกตัว:
 *   CLOUDINARY_CLOUD_NAME  = dmr6ln5hy
 *   CLOUDINARY_API_KEY     = <API Key จาก Cloudinary Dashboard>
 *   CLOUDINARY_API_SECRET  = <API Secret จาก Cloudinary Dashboard>
 *   ALLOW_ORIGINS          = http://localhost:8099,https://your-site.pages.dev   (ไม่ใส่ก็ได้)
 */

const DEFAULT_ALLOW = ['http://localhost:8099', 'http://127.0.0.1:8099'];
const CACHE_SECONDS = 300;

function parseAllow(env) {
  const raw = (env.ALLOW_ORIGINS || '').trim();
  if (!raw) return DEFAULT_ALLOW;
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

function corsFor(origin, env) {
  const allow = parseAllow(env);
  // อนุญาต origin ที่ระบุ + โดเมน workers.dev/pages.dev ของตัวเอง
  const ok = allow.includes(origin) ||
    /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.(workers\.dev|pages\.dev)$/i.test(origin);
  const h = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  if (ok && origin) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

function json(body, status, extra) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: Object.assign({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    }, extra || {}),
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const cors = corsFor(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'GET') {
      return json({ error: 'method_not_allowed' }, 405, cors);
    }
    if (url.pathname !== '/usage' && url.pathname !== '/') {
      return json({ error: 'not_found', hint: 'GET /usage' }, 404, cors);
    }

    const missing = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
      .filter(k => !env[k]);
    if (missing.length) {
      return json({ error: 'missing_config', missing }, 500, cors);
    }

    const cache = caches.default;
    const cacheKey = new Request(`https://cache.internal/usage/${env.CLOUDINARY_CLOUD_NAME}`, { method: 'GET' });
    const force = url.searchParams.get('refresh') === '1';

    if (!force) {
      const hit = await cache.match(cacheKey);
      if (hit) {
        const data = await hit.text();
        return new Response(data, {
          status: 200,
          headers: Object.assign({
            'Content-Type': 'application/json; charset=utf-8',
            'X-Cache': 'HIT',
            'Cache-Control': 'no-store',
          }, cors),
        });
      }
    }

    let upstream;
    try {
      const auth = btoa(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`);
      upstream = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(env.CLOUDINARY_CLOUD_NAME)}/usage`,
        { headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' } }
      );
    } catch (e) {
      return json({ error: 'upstream_unreachable', message: String(e && e.message || e) }, 502, cors);
    }

    const text = await upstream.text();
    if (!upstream.ok) {
      // 401 = key/secret ผิด, 420/429 = เรียกถี่เกิน
      return json({ error: 'cloudinary_error', status: upstream.status, detail: text.slice(0, 300) }, 502, cors);
    }

    let parsed;
    try { parsed = JSON.parse(text); } catch (e) {
      return json({ error: 'bad_json', detail: text.slice(0, 300) }, 502, cors);
    }

    // เพิ่มเวลาที่ดึง เพื่อให้หน้าแอดมินบอกได้ว่าข้อมูลเก่าแค่ไหน
    parsed.fetched_at = new Date().toISOString();

    const body = JSON.stringify(parsed);
    // เก็บแคช (ไม่มี CORS ติดไป) — TTL 5 นาที กันยิง Cloudinary ถี่เกิน limit
    ctx.waitUntil(cache.put(cacheKey, new Response(body, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': `max-age=${CACHE_SECONDS}`,
      },
    })));

    return new Response(body, {
      status: 200,
      headers: Object.assign({
        'Content-Type': 'application/json; charset=utf-8',
        'X-Cache': 'MISS',
        'Cache-Control': 'no-store',
      }, cors),
    });
  },
};
