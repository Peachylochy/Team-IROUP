// ============================================================
// iROUP Sidebar Rescue/Fixer
// อัปไฟล์นี้ทับ iroup-sidebar.js เดิมไฟล์เดียว
// - ถ้าหน้ามี sidebar เก่าอยู่: ไม่สร้าง sidebar ใหม่ซ้อน แต่ทำให้ nav-item กดได้
// - ถ้าหน้าไม่มี sidebar: สร้าง sidebar แบบ fixed ให้
// - แก้ลิงก์ dashboard-full.html ที่ทำให้ 404 ให้กลับเป็น dashboard.html
// ============================================================
(function () {
  const NAV_ITEMS = [
    { icon: '📊', label: 'Executive Dashboard', href: 'dashboard.html', keys: ['dashboard','executive'] },
    { icon: '🤝', label: 'MOU', href: 'mou.html', keys: ['mou'] },
    { icon: '🌏', label: 'Mobility', href: 'mobility.html', keys: ['mobility'] },
    { icon: '✈️', label: 'การเดินทาง', href: 'travel.html', keys: ['travel','การเดินทาง'] },
    { icon: '🎓', label: 'ทุน / กิจกรรม', href: 'scholarship-events.html', keys: ['ทุน','กิจกรรม','scholar'] },
    { icon: '📤', label: 'รายงาน & Export', href: 'report.html', keys: ['report','รายงาน','export'] },
    { icon: '🌐', label: 'Public View', href: 'public-landing.html', keys: ['public'] }
  ];

  const current = (location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();

  function fixBrokenLinks() {
    document.querySelectorAll('a[href="dashboard-full.html"]').forEach(a => {
      a.setAttribute('href', 'dashboard.html');
    });
  }

  function removeDuplicateGeneratedSidebar() {
    // ลบ sidebar component ที่เคยถูก inject ซ้อนจนเกิดแถบคู่/พื้นที่ว่างด้านบน
    document.querySelectorAll('.iroup-sidebar').forEach(el => el.remove());
    document.querySelectorAll('.iroup-shell').forEach(shell => {
      const main = shell.querySelector('.iroup-main');
      if (main) {
        while (main.firstChild) document.body.appendChild(main.firstChild);
      }
      shell.remove();
    });
    const holder = document.getElementById('iroupSidebar');
    if (holder && document.querySelector('.sidebar, .app > .sidebar')) holder.remove();
    document.body.style.marginLeft = '';
    document.body.style.paddingLeft = '';
  }

  function guessHrefFromText(text, index) {
    const t = String(text || '').toLowerCase();
    const found = NAV_ITEMS.find(item => item.keys.some(k => t.includes(k.toLowerCase())));
    if (found) return found.href;

    // fallback สำหรับ sidebar แบบ icon-only ที่ไม่มี tooltip ชัดเจน
    const fallback = ['dashboard.html','mou.html','scholarship-events.html','travel.html','mobility.html','report.html'];
    return fallback[index] || '#';
  }

  function enhanceOldSidebar() {
    const sidebars = Array.from(document.querySelectorAll('.sidebar'));
    if (!sidebars.length) return false;

    sidebars.forEach(sidebar => {
      const items = Array.from(sidebar.querySelectorAll('.nav-item'));
      items.forEach((item, index) => {
        const tip = item.querySelector('.nav-tooltip')?.textContent || item.textContent || '';
        const href = guessHrefFromText(tip, index);
        if (!href || href === '#') return;

        // ทำให้ div กดแล้วเปลี่ยนหน้าได้ โดยไม่รื้อ HTML เดิม
        item.style.cursor = 'pointer';
        item.setAttribute('role', 'link');
        item.setAttribute('tabindex', '0');
        item.dataset.href = href;
        item.onclick = function (e) {
          e.preventDefault();
          window.location.href = href;
        };
        item.onkeydown = function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.href = href;
          }
        };

        if (href.toLowerCase() === current || (current === '' && href === 'dashboard.html')) {
          item.classList.add('active');
        } else if (!item.classList.contains('active')) {
          // ไม่ยุ่งกับ active เดิมมากเกินไป
        }
      });
    });
    return true;
  }

  function injectComponentStyle() {
    if (document.getElementById('iroupSidebarRescueStyle')) return;
    const style = document.createElement('style');
    style.id = 'iroupSidebarRescueStyle';
    style.textContent = `
      .iroup-fixed-sidebar{width:230px;height:100vh;position:fixed;left:0;top:0;background:#fff;border-right:1px solid #E6EDF6;z-index:9999;font-family:'Prompt',sans-serif;display:flex;flex-direction:column}
      .iroup-fixed-brand{height:76px;display:flex;align-items:center;gap:10px;padding:0 18px;border-bottom:1px solid #E6EDF6}
      .iroup-fixed-brand img{width:68px;height:auto;object-fit:contain}
      .iroup-fixed-brand-text{font-size:12px;color:#66758a;line-height:1.35}.iroup-fixed-brand-text b{color:#0F2D5A;font-weight:900}
      .iroup-fixed-nav{padding:16px 12px;overflow:auto;flex:1}.iroup-fixed-section{font-size:11px;font-weight:800;color:#a0adbc;text-transform:uppercase;margin:16px 8px 8px}
      .iroup-fixed-link{display:flex;align-items:center;gap:10px;padding:12px;border-radius:14px;color:#26364e;font-weight:800;font-size:14px;text-decoration:none;margin-bottom:4px}
      .iroup-fixed-link:hover{background:#F1F7FD;color:#1A6DB5}.iroup-fixed-link.active{background:#E8F4FD;color:#1A6DB5;box-shadow:inset 3px 0 0 #1A6DB5}
      .iroup-fixed-user{padding:16px;border-top:1px solid #E6EDF6;display:flex;gap:10px;align-items:center}.iroup-fixed-avatar{width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#4BBDE8,#1A6DB5);display:grid;place-items:center;color:#fff;font-weight:900}
      .iroup-fixed-user-name{font-size:12px;font-weight:900;color:#10233f}.iroup-fixed-user-mail{font-size:11px;color:#66758a}
      body.has-iroup-fixed-sidebar{padding-left:230px!important;margin-left:0!important;display:block!important;overflow-x:hidden!important}
      @media(max-width:900px){.iroup-fixed-sidebar{position:relative;width:100%;height:auto}.iroup-fixed-nav{display:flex;gap:6px;overflow-x:auto;padding:10px 12px}.iroup-fixed-section,.iroup-fixed-user{display:none}body.has-iroup-fixed-sidebar{padding-left:0!important}}
    `;
    document.head.appendChild(style);
  }

  function renderFixedSidebarIfNeeded() {
    // สำหรับหน้าอย่าง report/travel ที่ไม่มี sidebar เดิม แต่มี script นี้อยู่
    if (document.querySelector('.sidebar, .app > .sidebar, .iroup-fixed-sidebar')) return;
    injectComponentStyle();
    const aside = document.createElement('aside');
    aside.className = 'iroup-fixed-sidebar';
    aside.innerHTML = `
      <div class="iroup-fixed-brand">
        <img src="iroup-logo.png" alt="iROUP" onerror="this.style.display='none'">
        <div class="iroup-fixed-brand-text"><b>iROUP</b><br>International Relations Office</div>
      </div>
      <nav class="iroup-fixed-nav">
        <div class="iroup-fixed-section">OVERVIEW</div>
        ${linkHTML(NAV_ITEMS[0])}
        <div class="iroup-fixed-section">MANAGEMENT</div>
        ${NAV_ITEMS.slice(1,6).map(linkHTML).join('')}
        <div class="iroup-fixed-section">PUBLIC</div>
        ${linkHTML(NAV_ITEMS[6])}
      </nav>
      <div class="iroup-fixed-user"><div class="iroup-fixed-avatar">IR</div><div><div class="iroup-fixed-user-name">งานวิเทศสัมพันธ์</div><div class="iroup-fixed-user-mail">University of Phayao</div></div></div>
    `;
    document.body.prepend(aside);
    document.body.classList.add('has-iroup-fixed-sidebar');
  }

  function linkHTML(item) {
    const active = item.href.toLowerCase() === current ? ' active' : '';
    return `<a class="iroup-fixed-link${active}" href="${item.href}"><span>${item.icon}</span><span>${item.label}</span></a>`;
  }

  function mount() {
    fixBrokenLinks();
    removeDuplicateGeneratedSidebar();
    const hasOld = enhanceOldSidebar();
    if (!hasOld) renderFixedSidebarIfNeeded();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
