/* ============================================================
   icons.js — ชุดไอคอน SVG ที่วาดจากโค้ด (ไม่ใช้ emoji / ไฟล์ภาพ)
   ใช้งาน:
     1) ใน HTML:   <span data-icon="search"></span>
     2) ใน JS:     icon('play')            → คืนสตริง <svg>
        หรือสร้าง element ที่มี data-icon แล้วให้ตัวเฝ้าดูเติมให้
   ทุกไอคอนใช้ stroke="currentColor" → เปลี่ยนสีตามสีตัวอักษร
   ============================================================ */
(function () {
  'use strict';

  var P = {
    /* --- navigation / ui --- */
    menu:       '<path d="M4 7h16M4 12h16M4 17h16"/>',
    search:     '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
    home:       '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/>',
    star:       '<path d="M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.6l-5.4 2.8 1-6.1L3.2 10l6.1-.9z"/>',
    'star-fill':'<path d="M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.6l-5.4 2.8 1-6.1L3.2 10l6.1-.9z" fill="currentColor" stroke="none"/>',
    gear:       '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7"/>',
    logout:     '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="m10 8-4 4 4 4"/><path d="M6 12h9"/>',
    globe:      '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.5 2.6 3.8 5.6 3.8 8.5s-1.3 5.9-3.8 8.5c-2.5-2.6-3.8-5.6-3.8-8.5S9.5 6.1 12 3.5z"/>',
    chart:      '<path d="M4 4v16h16"/><rect x="7.5" y="12" width="3" height="5" fill="currentColor" stroke="none"/><rect x="13" y="8" width="3" height="9" fill="currentColor" stroke="none"/>',
    clipboard:  '<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.5V3h6v1.5"/><path d="M9 10h6M9 14h6"/>',
    shield:     '<path d="M12 3l7 3v6c0 4.2-3 7.4-7 9-4-1.6-7-4.8-7-9V6z"/>',
    bolt:       '<path d="M13 3 5 14h5l-1 7 8-11h-5z"/>',
    mail:       '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    users:      '<circle cx="9" cy="8.5" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16.5 5.3a3.5 3.5 0 0 1 0 6.4"/><path d="M18 14.5a6 6 0 0 1 3 5.5"/>',

    /* --- media --- */
    play:       '<path d="M7 4.5 19 12 7 19.5Z" fill="currentColor" stroke="none"/>',
    pause:      '<rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/>',
    prev:       '<path d="M18 5v14L8 12z" fill="currentColor" stroke="none"/><rect x="5" y="5" width="2" height="14" fill="currentColor" stroke="none"/>',
    next:       '<path d="M6 5v14l10-7z" fill="currentColor" stroke="none"/><rect x="17" y="5" width="2" height="14" fill="currentColor" stroke="none"/>',
    rewind:     '<path d="M4 4v6h6"/><path d="M4.6 10A8 8 0 1 1 6 17.7"/>',
    forward:    '<path d="M20 4v6h-6"/><path d="M19.4 10A8 8 0 1 0 18 17.7"/>',
    headphones: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13.5" width="4" height="6" rx="2"/><rect x="17" y="13.5" width="4" height="6" rx="2"/>',
    mic:        '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3M9 21h6"/>',
    volume:     '<path d="M4 9.5h3L12 5v14l-5-4.5H4z"/><path d="M16 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a8.5 8.5 0 0 1 0 12"/>',
    repeat:     '<path d="m4 8 3-3 3 3"/><path d="M7 5h9a4 4 0 0 1 4 4v1"/><path d="m20 16-3 3-3-3"/><path d="M17 19H8a4 4 0 0 1-4-4v-1"/>',
    clock:      '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    hourglass:  '<path d="M7 3h10M7 21h10"/><path d="M8 3v3.5c0 2 4 3.5 4 5.5s-4 3.5-4 5.5V21"/><path d="M16 3v3.5c0 2-4 3.5-4 5.5s4 3.5 4 5.5V21"/>',
    music:      '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',

    /* --- content --- */
    book:       '<path d="M4 5a2 2 0 0 1 2-2h5v18H6a2 2 0 0 1-2-2z"/><path d="M13 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5z"/>',
    'book-open':'<path d="M12 6.5C10.5 5.2 8.3 4.5 4 4.5v14c4.3 0 6.5.7 8 2 1.5-1.3 3.7-2 8-2v-14c-4.3 0-6.5.7-8 2z"/><path d="M12 6.5v14"/>',
    flame:      '<path d="M12 3s5 4.5 5 9a5 5 0 0 1-10 0c0-1.6.6-3 1.4-4.2A4.6 4.6 0 0 1 12 3z"/>',
    sparkles:   '<path d="M11 3l1.7 4.4L17 9l-4.3 1.6L11 15l-1.7-4.4L5 9l4.3-1.6z"/><path d="M18 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    refresh:    '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4h-4"/>',
    crown:      '<path d="M4 17h16l-1.4-9-4.1 3.2L12 6l-2.5 5.2L5.4 8z"/>',
    eye:        '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off':  '<path d="M3 3l18 18"/><path d="M10.6 6.1A9.7 9.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.2 3.9"/><path d="M6.5 7.7A16.6 16.6 0 0 0 2.5 12S6 18 12 18a9.4 9.4 0 0 0 3.4-.6"/><path d="M9.9 10.1a3 3 0 0 0 4.2 4.2"/>',
    heart:      '<path d="M12 20.3s-7.5-4.6-7.5-9.6A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 3.1c0 5-7.5 9.6-7.5 9.6z" fill="currentColor" stroke="none"/>',
    'heart-outline':'<path d="M12 20.3s-7.5-4.6-7.5-9.6A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 3.1c0 5-7.5 9.6-7.5 9.6z"/>',
    thumbup:    '<path d="M7 20V9l4-6 1.4.8a3 3 0 0 1 1.2 3.4L13 10h5a2 2 0 0 1 2 2.4l-1.3 6A2 2 0 0 1 16.7 20z"/><path d="M7 10H4v10h3"/>',
    thumbdown:  '<path d="M17 4v11l-4 6-1.4-.8a3 3 0 0 1-1.2-3.4L11 14H6a2 2 0 0 1-2-2.4l1.3-6A2 2 0 0 1 7.3 4z"/><path d="M17 14h3V4h-3"/>',
    comment:    '<path d="M20 12a7.5 7.5 0 0 1-7.5 7.5H8L4 22v-4.4A7.5 7.5 0 0 1 12.5 4.5 7.5 7.5 0 0 1 20 12z"/>',
    folder:     '<path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h4L11.5 8.5h7A1.5 1.5 0 0 1 20 10v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z"/>',
    drive:      '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M3.5 12.5h17"/><circle cx="7.5" cy="15" r="1.1" fill="currentColor" stroke="none"/>',

    /* --- actions --- */
    edit:       '<path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    trash:      '<path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="m6 7 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M10 11v6M14 11v6"/>',
    plus:       '<path d="M12 5v14M5 12h14"/>',
    save:       '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4"/><path d="M8 20v-6h8v6"/>',
    image:      '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
    lock:       '<rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
    check:      '<path d="m4.5 12.5 5 5 10-11"/>',
    x:          '<path d="m6 6 12 12M18 6 6 18"/>',
    alert:      '<path d="M12 4 2.8 20h18.4z"/><path d="M12 10v5"/><path d="M12 18h.4"/>',
    'arrow-left':'<path d="M20 12H4"/><path d="m10 6-6 6 6 6"/>',
    'arrow-right':'<path d="M4 12h16"/><path d="m14 6 6 6-6 6"/>',
    'chevron-down':'<path d="m6 9 6 6 6-6"/>',
    'chevron-up': '<path d="m6 15 6-6 6 6"/>',
    sort:       '<path d="M8 4v16"/><path d="m4 8 4-4 4 4"/><path d="M16 20V4"/><path d="m12 16 4 4 4-4"/>',
    dot:        '<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>'
  };

  function icon(name, size) {
    var body = P[name] || P.dot;
    var s = size || '1em';
    return '<svg class="ico" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" ' +
           'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
           'stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  function mount(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var list = scope.querySelectorAll('[data-icon]');
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (el.getAttribute('data-icon-done') === '1') continue;
      var name = el.getAttribute('data-icon');
      if (!P[name]) continue;  // ชื่อที่ไม่รู้จัก → ข้าม ไม่ทับเนื้อหาเดิมของ element
      el.setAttribute('data-icon-done', '1');
      el.insertAdjacentHTML('afterbegin', icon(name, el.getAttribute('data-icon-size')));
    }
  }

  window.icon = icon;
  window.mountIcons = mount;

  function start() {
    mount(document);
    if (window.MutationObserver) {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (n.nodeType !== 1) continue;
            if (n.hasAttribute && n.hasAttribute('data-icon')) mount(n.parentNode || document);
            else if (n.querySelector && n.querySelector('[data-icon]')) mount(n);
          }
        }
      }).observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
