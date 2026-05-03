// ============================================================
// iROUP Shared Sidebar Component
// ใช้กับทุกหน้า Admin: dashboard / mou / mobility / travel / scholarship-events / report
// วิธีใช้:
// 1) วางไฟล์นี้ไว้โฟลเดอร์เดียวกับ HTML
// 2) ใส่ <div id="iroupSidebar"></div> หลัง <body>
// 3) ใส่ <script src="iroup-sidebar.js"></script> ก่อน </body>
// ============================================================

(function () {
  const current = (location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();

  const menu = [
    {
      section: 'OVERVIEW',
      items: [
        { icon: '📊', label: 'Executive Dashboard', href: 'dashboard-full.html', match: ['dashboard-full.html', 'dashboard.html'] },
      ],
    },
    {
      section: 'MANAGEMENT',
      items: [
        { icon: '🤝', label: 'MOU', href: 'mou.html', match: ['mou.html'] },
        { icon: '🌏', label: 'Mobility', href: 'mobility.html', match: ['mobility.html'] },
        { icon: '✈️', label: 'การเดินทาง', href: 'travel.html', match: ['travel.html'] },
        { icon: '🎓', label: 'ทุน / กิจกรรม', href: 'scholarship-events.html', match: ['scholarship-events.html'] },
        { icon: '📤', label: 'รายงาน & Export', href: 'report.html', match: ['report.html'] },
      ],
    },
    {
      section: 'PUBLIC',
      items: [
        { icon: '🌐', label: 'Public View', href: 'public-landing.html', match: ['public-landing.html'] },
      ],
    },
  ];

  const css = `
    .iroup-shell{
      display:grid;
      grid-template-columns:250px minmax(0,1fr);
      min-height:100vh;
      width:100%;
    }
    .iroup-sidebar{
      background:#fff;
      border-right:1px solid #E6EDF6;
      display:flex;
      flex-direction:column;
      position:sticky;
      top:0;
      height:100vh;
      z-index:9999;
      box-shadow:0 0 0 rgba(0,0,0,0);
      font-family:'Prompt',sans-serif;
    }
    .iroup-brand{
      height:76px;
      display:flex;
      align-items:center;
      gap:12px;
      padding:0 22px;
      border-bottom:1px solid #E6EDF6;
      flex-shrink:0;
    }
    .iroup-brand img{
      width:68px;
      height:auto;
      object-fit:contain;
      display:block;
    }
    .iroup-brand-text{
      font-size:12px;
      color:#66758a;
      line-height:1.35;
    }
    .iroup-brand-text b{
      color:#0F2D5A;
      font-weight:900;
    }
    .iroup-nav{
      padding:16px 12px;
      overflow:auto;
      flex:1;
    }
    .iroup-nav-section{
      font-size:11px;
      font-weight:800;
      color:#a0adbc;
      text-transform:uppercase;
      margin:18px 12px 8px;
      letter-spacing:.2px;
    }
    .iroup-nav-btn{
      width:100%;
      border:0;
      background:transparent;
      display:flex;
      align-items:center;
      gap:12px;
      padding:12px 14px;
      border-radius:14px;
      color:#26364e;
      font-weight:800;
      font-size:14px;
      cursor:pointer;
      font-family:'Prompt',sans-serif;
      transition:.18s;
      text-decoration:none;
      margin-bottom:4px;
    }
    .iroup-nav-btn:hover{
      background:#F1F7FD;
      color:#1A6DB5;
      transform:translateX(1px);
    }
    .iroup-nav-btn.active{
      background:#E8F4FD;
      color:#1A6DB5;
      box-shadow:inset 3px 0 0 #1A6DB5;
    }
    .iroup-nav-icon{
      font-size:20px;
      width:24px;
      text-align:center;
      flex:0 0 24px;
    }
    .iroup-userbox{
      margin-top:auto;
      padding:16px;
      border-top:1px solid #E6EDF6;
      display:flex;
      align-items:center;
      gap:10px;
      flex-shrink:0;
    }
    .iroup-avatar{
      width:38px;
      height:38px;
      border-radius:12px;
      background:linear-gradient(135deg,#4BBDE8,#1A6DB5);
      display:grid;
      place-items:center;
      color:#fff;
      font-weight:900;
    }
    .iroup-user-name{
      font-size:12px;
      font-weight:900;
      color:#10233f;
    }
    .iroup-user-mail{
      font-size:11px;
      color:#66758a;
    }
    .iroup-main{
      min-width:0;
      width:100%;
    }

    /* Compatibility: ซ่อน sidebar เก่า ถ้ายังหลงเหลือในหน้า */
    body.iroup-component-on > .sidebar,
    body.iroup-component-on .app > .sidebar{
      display:none !important;
    }
    body.iroup-component-on > .main-layout{
      min-width:0;
    }

    @media(max-width:900px){
      .iroup-shell{
        grid-template-columns:1fr;
      }
      .iroup-sidebar{
        position:relative;
        height:auto;
      }
      .iroup-brand{
        height:auto;
        padding:14px 16px;
      }
      .iroup-nav{
        display:flex;
        gap:6px;
        overflow-x:auto;
        padding:10px 12px;
      }
      .iroup-nav-section{
        display:none;
      }
      .iroup-nav-btn{
        white-space:nowrap;
        width:auto;
        margin-bottom:0;
      }
      .iroup-userbox{
        display:none;
      }
    }
  `;

  function injectStyle() {
    if (document.getElementById('iroupSidebarStyle')) return;
    const style = document.createElement('style');
    style.id = 'iroupSidebarStyle';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function isActive(item) {
    return item.match.some(x => x.toLowerCase() === current);
  }

  function sidebarHTML() {
    return `
      <aside class="iroup-sidebar">
        <div class="iroup-brand">
          <img src="iroup-logo.png" alt="iROUP" onerror="this.style.display='none'">
          <div class="iroup-brand-text">
            <b>iROUP</b><br>International Relations Office
          </div>
        </div>

        <nav class="iroup-nav">
          ${menu.map(group => `
            <div class="iroup-nav-section">${group.section}</div>
            ${group.items.map(item => `
              <a class="iroup-nav-btn ${isActive(item) ? 'active' : ''}" href="${item.href}">
                <span class="iroup-nav-icon">${item.icon}</span>
                <span>${item.label}</span>
              </a>
            `).join('')}
          `).join('')}
        </nav>

        <div class="iroup-userbox">
          <div class="iroup-avatar">IR</div>
          <div>
            <div class="iroup-user-name">งานวิเทศสัมพันธ์</div>
            <div class="iroup-user-mail">University of Phayao</div>
          </div>
        </div>
      </aside>
    `;
  }

  function mount() {
    injectStyle();
    document.body.classList.add('iroup-component-on');

    const target = document.getElementById('iroupSidebar');

    if (target) {
      target.outerHTML = sidebarHTML();
      return;
    }

    // Auto-wrap fallback:
    // ถ้าหน้ายังไม่ได้เตรียม <div id="iroupSidebar"></div>
    // จะพยายามห่อ content ทั้งหมดเข้า shell ให้เอง
    const oldChildren = Array.from(document.body.children).filter(el => {
      return el.tagName !== 'SCRIPT' && el.id !== 'iroupSidebarStyle';
    });

    const shell = document.createElement('div');
    shell.className = 'iroup-shell';

    const main = document.createElement('main');
    main.className = 'iroup-main';

    oldChildren.forEach(el => main.appendChild(el));
    shell.innerHTML = sidebarHTML();
    shell.appendChild(main);

    document.body.prepend(shell);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
