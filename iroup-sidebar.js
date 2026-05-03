// ============================================================
// iROUP Sidebar FINAL LAYOUT FIX
// อัปทับ iroup-sidebar.js
// - เมนูเหมือนหน้าแรกทุกหน้า
// - ไม่มี "Dashboard เดิม"
// - sidebar เป็น fixed เพื่อไม่ดัน content ลงล่าง
// ============================================================
(function () {
  const current = (location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();

  const MENU = [
    { section: 'OVERVIEW', items: [
      { icon: '📊', label: 'Executive Dashboard', href: 'dashboard.html', match: ['dashboard.html','dashboard-full.html',''] }
    ]},
    { section: 'MANAGEMENT', items: [
      { icon: '🤝', label: 'MOU', href: 'mou.html', match: ['mou.html'] },
      { icon: '🌏', label: 'Mobility', href: 'mobility.html', match: ['mobility.html'] },
      { icon: '✈️', label: 'การเดินทาง', href: 'travel.html', match: ['travel.html'] },
      { icon: '🎓', label: 'ทุน / กิจกรรม', href: 'scholarship-events.html', match: ['scholarship-events.html'] },
      { icon: '📤', label: 'รายงาน & Export', href: 'report.html', match: ['report.html'] }
    ]},
    { section: 'PUBLIC', items: [
      { icon: '🌐', label: 'Public View', href: 'public-landing.html', match: ['public-landing.html'] }
    ]}
  ];

  function active(item){ return item.match.includes(current); }

  function html(){
    return `
      <div class="ir-final-brand">
        <img src="iroup-logo.png" alt="iROUP" onerror="this.style.display='none'">
        <div class="ir-final-brand-title"><b>iROUP</b><br>International<br>Relations Office</div>
      </div>
      <nav class="ir-final-nav">
        ${MENU.map(g => `
          <div class="ir-final-section">${g.section}</div>
          ${g.items.map(i => `
            <a class="ir-final-link ${active(i) ? 'active' : ''}" href="${i.href}">
              <span class="ir-final-icon">${i.icon}</span>
              <span>${i.label}</span>
            </a>
          `).join('')}
        `).join('')}
      </nav>
      <div class="ir-final-user">
        <div class="ir-final-avatar">IR</div>
        <div>
          <div class="ir-final-user-name">งานวิเทศสัมพันธ์</div>
          <div class="ir-final-user-sub">University of Phayao</div>
        </div>
      </div>
    `;
  }

  function style(){
    if(document.getElementById('iroupSidebarFinalLayoutStyle')) return;
    const s=document.createElement('style');
    s.id='iroupSidebarFinalLayoutStyle';
    s.textContent=`
      #iroupSidebar,.iroup-sidebar,.iroup-shell{display:none!important}
      body{margin-left:0!important;padding-left:0!important}
      .sidebar{
        width:250px!important;min-width:250px!important;max-width:250px!important;
        height:100vh!important;background:#fff!important;color:#10233f!important;
        border-right:1px solid #E6EDF6!important;display:flex!important;flex-direction:column!important;
        align-items:stretch!important;padding:0!important;gap:0!important;
        position:fixed!important;left:0!important;top:0!important;z-index:99999!important;
        box-shadow:none!important;font-family:'Prompt',sans-serif!important;overflow:hidden!important;
      }
      .sidebar>*:not(.ir-final-brand):not(.ir-final-nav):not(.ir-final-user){display:none!important}

      .app{display:block!important;min-height:100vh!important}
      .main,.main-layout,.page{
        margin-left:250px!important;
        width:calc(100% - 250px)!important;
        max-width:none!important;
        min-width:0!important;
      }
      .page{padding-left:20px!important;padding-right:20px!important}
      .main .content,.main-layout .content{max-width:none!important}

      .ir-final-brand{height:76px;display:flex;align-items:center;gap:12px;padding:0 22px;border-bottom:1px solid #E6EDF6;flex-shrink:0}
      .ir-final-brand img{width:68px;height:auto;object-fit:contain;display:block}
      .ir-final-brand-title{font-size:12px;color:#66758a;line-height:1.25}
      .ir-final-brand-title b{color:#0F2D5A;font-weight:900}
      .ir-final-nav{padding:16px 12px;overflow:auto;flex:1}
      .ir-final-section{font-size:11px;font-weight:800;color:#a0adbc;text-transform:uppercase;margin:18px 12px 8px;letter-spacing:.2px}
      .ir-final-link{width:100%;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;color:#26364e!important;font-weight:800;font-size:14px;cursor:pointer;font-family:'Prompt',sans-serif;transition:.18s;text-decoration:none!important;margin-bottom:4px;background:transparent;border:0}
      .ir-final-link:hover{background:#F1F7FD;color:#1A6DB5!important;transform:translateX(1px)}
      .ir-final-link.active{background:#E8F4FD;color:#1A6DB5!important;box-shadow:inset 3px 0 0 #1A6DB5}
      .ir-final-icon{font-size:20px;width:24px;text-align:center;flex:0 0 24px}
      .ir-final-user{margin-top:auto;padding:16px;border-top:1px solid #E6EDF6;display:flex;align-items:center;gap:10px;flex-shrink:0}
      .ir-final-avatar{width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#4BBDE8,#1A6DB5);display:grid;place-items:center;color:#fff;font-weight:900}
      .ir-final-user-name{font-size:12px;font-weight:900;color:#10233f}
      .ir-final-user-sub{font-size:11px;color:#66758a}

      @media(max-width:900px){
        .sidebar{position:relative!important;width:100%!important;min-width:100%!important;max-width:100%!important;height:auto!important}
        .main,.main-layout,.page{margin-left:0!important;width:100%!important}
        .ir-final-brand{height:auto;padding:14px 16px}
        .ir-final-nav{display:flex;gap:6px;overflow-x:auto;padding:10px 12px}
        .ir-final-section{display:none}
        .ir-final-link{width:auto;white-space:nowrap;margin-bottom:0}
        .ir-final-user{display:none}
      }
    `;
    document.head.appendChild(s);
  }

  function cleanup(){
    document.querySelectorAll('.iroup-shell').forEach(shell=>{
      const main=shell.querySelector('.iroup-main');
      if(main){ while(main.firstChild) document.body.appendChild(main.firstChild); }
      shell.remove();
    });
    document.querySelectorAll('.iroup-sidebar').forEach(x=>x.remove());
    document.querySelectorAll('a[href="dashboard-full.html"]').forEach(a=>a.href='dashboard.html');
  }

  function mount(){
    style();
    cleanup();
    let sidebar=document.querySelector('.sidebar');
    if(!sidebar){
      sidebar=document.createElement('aside');
      sidebar.className='sidebar';
      document.body.insertBefore(sidebar, document.body.firstChild);
    }
    sidebar.innerHTML=html();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount);
  else mount();
})();
