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
  // HELPER — อ่านวันที่ให้เสถียรจาก Sheet / Apps Script
  // รองรับ ISO, dd/mm/yyyy, dd-mm-yyyy, พ.ศ. และ Date object
  // ============================================================
  parseDate(value) {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    if (typeof value === 'number') return new Date(Math.round((value - 25569) * 86400 * 1000));

    const raw = String(value).trim();
    if (!raw) return null;

    const dmy = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (dmy) {
      let d = Number(dmy[1]);
      let m = Number(dmy[2]);
      let y = Number(dmy[3]);
      if (y < 100) y += 2000;
      if (y > 2400) y -= 543;
      const dt = new Date(y, m - 1, d);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }

    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  },

  daysBetween(endDate, startDate = new Date()) {
    const end = this.parseDate(endDate);
    const start = this.parseDate(startDate) || new Date();
    if (!end) return null;
    return Math.floor((end - start) / (1000 * 60 * 60 * 24));
  },

  // ============================================================
  // HELPER — คำนวณสถานะจากวันที่อัตโนมัติ
  // ============================================================
  getStatus(startDate, endDate) {
    const today = new Date();
    const start = this.parseDate(startDate);
    const end   = this.parseDate(endDate);
    if (!start || !end) return { status: 'unknown', label: 'ไม่ระบุวันที่', color: '#6B7A8D' };

    if (today < start) return { status: 'upcoming', label: 'รอเดินทาง',     color: '#D4890A' };
    if (today > end)   return { status: 'done',     label: 'เสร็จสิ้น',     color: '#6B7A8D' };
    return               { status: 'active',    label: 'กำลังดำเนินการ', color: '#5BAD3E' };
  },

  getMouStatus(endDate) {
    const diff = this.daysBetween(endDate);
    if (diff === null) return { status: 'unknown', label: 'ไม่ระบุวันหมดอายุ', color: '#6B7A8D' };
    if (diff < 0)    return { status: 'expired', label: 'หมดอายุ', color: '#D63B32' };
    if (diff <= 180) return { status: 'soon',    label: 'ใกล้หมด', color: '#D4890A' };
    return             { status: 'active',  label: 'Active',   color: '#5BAD3E' };
  },

  getScholarStatus(openDate, closeDate) {
    const today = new Date();
    const open  = this.parseDate(openDate);
    const close = this.parseDate(closeDate);
    if (!open || !close) return { status: 'unknown', label: 'ไม่ระบุวันที่', daysLeft: null };
    const diff  = Math.floor((close - today) / (1000 * 60 * 60 * 24));

    if (today < open)  return { status: 'upcoming', label: 'เร็วๆ นี้',  daysLeft: null };
    if (today > close) return { status: 'closed',   label: 'ปิดรับแล้ว', daysLeft: null };
    return              { status: 'open',     label: 'กำลังรับสมัคร', daysLeft: diff };
  },

  // ============================================================
  // HELPER — Format วันที่เป็นภาษาไทย
  // ============================================================
  formatDate(dateStr) {
    const dt = this.parseDate(dateStr);
    if (!dt) return '—';
    return dt.toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: '2-digit'
    });
  },
};
