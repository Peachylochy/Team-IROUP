(function () {

  const current = location.pathname.split('/').pop();

  const menu = [
    { icon: '📊', name: 'Dashboard', link: 'dashboard-full.html' },
    { icon: '🤝', name: 'MOU', link: 'mou.html' },
    { icon: '🌏', name: 'Mobility', link: 'mobility.html' },
    { icon: '✈️', name: 'Travel', link: 'travel.html' },
    { icon: '🎓', name: 'Scholarship', link: 'scholarship-events.html' },
    { icon: '📤', name: 'Report', link: 'report.html' },
  ];

  function render() {
    const el = document.getElementById('iroupSidebar');
    if (!el) return;

    el.innerHTML = `
      <div style="
        width:240px;
        height:100vh;
        position:fixed;
        left:0;
        top:0;
        background:#fff;
        border-right:1px solid #eee;
        padding:16px;
        font-family:sans-serif;
        z-index:9999;
      ">
        <h2 style="margin-bottom:20px;">iROUP</h2>

        ${menu.map(m => `
          <a href="${m.link}"
             style="
               display:block;
               padding:10px;
               margin-bottom:6px;
               border-radius:8px;
               text-decoration:none;
               color:${current === m.link ? '#1A6DB5' : '#333'};
               background:${current === m.link ? '#E8F4FD' : 'transparent'};
               font-weight:600;
             ">
            ${m.icon} ${m.name}
          </a>
        `).join('')}
      </div>
    `;

    document.body.style.marginLeft = "240px";
  }

  document.addEventListener("DOMContentLoaded", render);

})();
