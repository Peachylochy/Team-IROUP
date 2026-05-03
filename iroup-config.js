// ============================================================
// iROUP — Config & API Helper
// เปลี่ยน SCRIPT_URL เป็น URL ของ Apps Script ที่ Deploy แล้ว
// ============================================================

const IROUP = {
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyZ7h-jYflQAexSj4ss9oYyZMd6DyHfEvkjK03F6XIVDMpdcLjBsIOLFci-q8RwMGtE/exec',

  SHEETS: {
    STAFF:    'บุคลากร',
    MOU:      'MOU',
    SCHOLAR:  'ทุนการศึกษา',
    EVENT:    'กิจกรรม',
    TRAVEL:   'การเดินทาง',
    INBOUND:  'Inbound',
    OUTBOUND: 'Outbound',
  },

  // ============================================================
  // GET — ดึงข้อมูลทั้งหมด
  // ============================================================
  async getAll(sheet) {
    const url = `${this.SCRIPT_URL}?action=getAll&sheet=${encodeURIComponent(sheet)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data || [];
  },

  // ============================================================
  // SEARCH — ค้นหาข้อมูล
  // ============================================================
  async search(sheet, query) {
    const url = `${this.SCRIPT_URL}?action=search&sheet=${encodeURIComponent(sheet)}&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data || [];
  },

  // ============================================================
  // SEARCH STAFF — ค้นหาบุคลากร
  // ============================================================
  async searchStaff(query) {
    const url = `${this.SCRIPT_URL}?action=searchStaff&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data || [];
  },

  // ============================================================
  // ADD — เพิ่มข้อมูลใหม่
  // ============================================================
  async add(sheet, data) {
    const res = await fetch(this.SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'add', sheet, data }),
    });
    return await res.json();
  },

  // ============================================================
  // EDIT — แก้ไขข้อมูล
  // ============================================================
  async edit(sheet, id, data) {
    const res = await fetch(this.SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'edit', sheet, id, data }),
    });
    return await res.json();
  },

  // ============================================================
  // DELETE — ลบข้อมูล
  // ============================================================
  async delete(sheet, id) {
    const res = await fetch(this.SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', sheet, id }),
    });
    return await res.json();
  },

  // ============================================================
  // GET STATS — ดึงสถิติ Dashboard
  // ============================================================
  async getStats() {
    const url = `${this.SCRIPT_URL}?action=getStats`;
    const res = await fetch(url);
    const data = await res.json();
    return data.stats || {};
  },

  // ============================================================
  // GET MOU BY COUNTRY — สำหรับแผนที่โลก
  // ============================================================
  async getMouByCountry() {
    const url = `${this.SCRIPT_URL}?action=getMouByCountry`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data || {};
  },

  // ============================================================
  // HELPER — แสดง Loading
  // ============================================================
  showLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = `
      <div style="text-align:center;padding:40px;color:#6B7A8D;font-family:'Sarabun',sans-serif;font-size:13px">
        <div style="font-size:28px;margin-bottom:8px;animation:spin 1s linear infinite;display:inline-block">⏳</div>
        <div>กำลังโหลดข้อมูล...</div>
      </div>`;
  },

  // ============================================================
  // HELPER — แสดง Error
  // ============================================================
  showError(elementId, msg) {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = `
      <div style="text-align:center;padding:40px;color:#D63B32;font-family:'Sarabun',sans-serif;font-size:13px">
        <div style="font-size:28px;margin-bottom:8px">⚠️</div>
        <div>${msg || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'}</div>
      </div>`;
  },

  // ============================================================
  // HELPER — คำนวณสถานะจากวันที่อัตโนมัติ
  // ============================================================
  getStatus(startDate, endDate) {
    const today = new Date();
    const start = new Date(startDate);
    const end   = new Date(endDate);
    const diff  = Math.floor((end - today) / (1000 * 60 * 60 * 24));

    if (today < start) return { status: 'upcoming', label: 'รอเดินทาง',     color: '#D4890A' };
    if (today > end)   return { status: 'done',     label: 'เสร็จสิ้น',     color: '#6B7A8D' };
    return               { status: 'active',    label: 'กำลังดำเนินการ', color: '#5BAD3E' };
  },

  getMouStatus(endDate) {
    const today = new Date();
    const end   = new Date(endDate);
    const diff  = Math.floor((end - today) / (1000 * 60 * 60 * 24));

    if (diff < 0)   return { status: 'expired', label: 'หมดอายุ',   color: '#D63B32' };
    if (diff <= 180) return { status: 'soon',    label: 'ใกล้หมด',   color: '#D4890A' };
    return            { status: 'active',   label: 'Active',     color: '#5BAD3E' };
  },

  parseDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return isNaN(dateStr) ? null : dateStr;
    const s = String(dateStr).trim();
    if (!s || s === '-' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return null;

    let m = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
    if (m) {
      let y = +m[1];
      if (y > 2400) y -= 543;
      return new Date(y, +m[2] - 1, +m[3]);
    }

    m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/);
    if (m) {
      let y = +m[3];
      if (y > 2400) y -= 543;
      if (y < 100) y += 2000;
      return new Date(y, +m[2] - 1, +m[1]);
    }

    const d = new Date(s);
    return isNaN(d) ? null : d;
  },

  startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  },

  daysBetween(a, b) {
    return Math.ceil((this.startOfDay(b) - this.startOfDay(a)) / 86400000);
  },

  getScholarStatus(openDate, closeDate) {
    const today = this.startOfDay(new Date());
    const open  = this.parseDate(openDate);
    const close = this.parseDate(closeDate);
    const openDay  = open  ? this.startOfDay(open)  : null;
    const closeDay = close ? this.startOfDay(close) : null;

    if (closeDay && today > closeDay) return { status:'closed',   label:'ปิดรับแล้ว',   daysLeft:null, priority:5 };
    if (openDay && today < openDay)   return { status:'upcoming', label:'ยังไม่เปิดรับ', daysLeft:null, priority:4 };

    if (closeDay) {
      const diff = this.daysBetween(today, closeDay);
      if (diff <= 3)  return { status:'urgent', label:'🔥 ด่วน',     daysLeft:diff, priority:1 };
      if (diff <= 10) return { status:'soon',   label:'ใกล้ปิดรับ', daysLeft:diff, priority:2 };
      return { status:'open', label:'เปิดรับ', daysLeft:diff, priority:3 };
    }

    return { status:'open', label:'เปิดรับ', daysLeft:null, priority:3 };
  },

  // ============================================================
  // HELPER — Format วันที่เป็นภาษาไทย
  // ============================================================
  formatDate(dateStr) {
    const d = this.parseDate ? this.parseDate(dateStr) : new Date(dateStr);
    if (!d || isNaN(d)) return '—';
    return d.toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: '2-digit'
    });
  },
};
