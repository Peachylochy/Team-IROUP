
// ============================================================
// CHECK ADMIN — เช็คสิทธิ์ Email จาก Sheet Admin
// ============================================================
function checkAdmin(email) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Admin');
  if (!sheet) return { allowed: false, reason: 'ไม่พบ Sheet Admin' };

  const data  = sheet.getDataRange().getValues();
  const emails = data.slice(1).map(r => r[0].toString().toLowerCase().trim());
  const allowed = emails.includes(email.toLowerCase().trim());

  if (allowed) {
    const row  = data.find(r => r[0].toString().toLowerCase().trim() === email.toLowerCase().trim());
    return { allowed: true, name: row ? row[1] : email };
  }

  return { allowed: false, reason: 'Email นี้ไม่มีสิทธิ์เข้าใช้งาน' };
}

// ============================================================
// iROUP — Google Apps Script Backend
// งานวิเทศสัมพันธ์ มหาวิทยาลัยพะเยา
// วิธีใช้: Extensions → Apps Script → วางโค้ดนี้ → Deploy
// ============================================================

const SHEET_NAMES = {
  STAFF:      'บุคลากร',
  MOU:        'MOU',
  SCHOLAR:    'ทุนการศึกษา',
  EVENT:      'กิจกรรม',
  TRAVEL:     'การเดินทาง',
  INBOUND:    'Inbound',
  OUTBOUND:   'Outbound',
};

// ============================================================
// MAIN ENTRY — รับ Request จากเว็บ
// ============================================================
function doGet(e) {
  const action = e.parameter.action;
  const sheet  = e.parameter.sheet;
  let result;

  try {
    if (action === 'getAll')         result = getAll(sheet);
    else if (action === 'search')    result = search(sheet, e.parameter.q);
    else if (action === 'searchStaff') result = searchStaff(e.parameter.q);
    else if (action === 'getStats')  result = getStats();
    else if (action === 'getMouByCountry') result = getMouByCountry();
    else if (action === 'checkAdmin') result = checkAdmin(e.parameter.email);
    else result = { error: 'Unknown action' };
  } catch(err) {
    result = { error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body   = JSON.parse(e.postData.contents);
  const action = body.action;
  const sheet  = body.sheet;
  let result;

  try {
    if (action === 'add')    result = addRow(sheet, body.data);
    else if (action === 'edit')   result = editRow(sheet, body.id, body.data);
    else if (action === 'delete') result = deleteRow(sheet, body.id);
    else result = { error: 'Unknown action' };
  } catch(err) {
    result = { error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// GET ALL — ดึงข้อมูลทั้งหมดของ Sheet
// ============================================================
function getAll(sheetName) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { error: `ไม่พบ Sheet: ${sheetName}` };

  const data   = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows   = data.slice(1).filter(r => r[0] !== ''); // กรองแถวว่าง

  const result = rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });

  return { success: true, data: result, total: result.length };
}

// ============================================================
// SEARCH — ค้นหาข้อมูลในทุกคอลัมน์
// ============================================================
function search(sheetName, query) {
  if (!query) return getAll(sheetName);
  const q = query.toString().toLowerCase();
  const all = getAll(sheetName);
  if (all.error) return all;

  const filtered = all.data.filter(row =>
    Object.values(row).some(val =>
      val.toString().toLowerCase().includes(q)
    )
  );

  return { success: true, data: filtered, total: filtered.length };
}

// ============================================================
// SEARCH STAFF — ค้นหาบุคลากร (ใช้ในหน้าการเดินทาง + Outbound)
// ============================================================
function searchStaff(query) {
  if (!query || query.length < 2) return { success: true, data: [] };
  const q = query.toString().toLowerCase();
  const all = getAll(SHEET_NAMES.STAFF);
  if (all.error) return all;

  const filtered = all.data.filter(row => {
    const fullName = `${row['คำนำหน้า']} ${row['ชื่อ']} ${row['สกุล']}`.toLowerCase();
    const code     = (row['รหัส'] || '').toString().toLowerCase();
    return fullName.includes(q) || code.includes(q);
  }).slice(0, 10); // แสดงแค่ 10 รายการแรก

  // จัดรูปแบบให้เว็บใช้งานง่าย
  const result = filtered.map(r => ({
    id:       r['รหัส'],
    name:     `${r['คำนำหน้า']} ${r['ชื่อ']} ${r['สกุล']}`,
    faculty:  r['คณะ'],
    dept:     r['สาขา'],
    position: r['ตำแหน่ง'],
    type:     r['ประเภท'],
  }));

  return { success: true, data: result };
}

// ============================================================
// ADD ROW — เพิ่มข้อมูลใหม่
// ============================================================
function addRow(sheetName, data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { error: `ไม่พบ Sheet: ${sheetName}` };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // สร้าง ID อัตโนมัติ
  const prefix  = getPrefix(sheetName);
  const lastRow = sheet.getLastRow();
  const newId   = `${prefix}-${String(lastRow).padStart(3, '0')}`;
  data['ID']    = newId;

  // บันทึกวันที่เพิ่มข้อมูล
  data['วันที่บันทึก'] = new Date().toLocaleDateString('th-TH');

  const row = headers.map(h => data[h] !== undefined ? data[h] : '');
  sheet.appendRow(row);

  return { success: true, id: newId, message: 'เพิ่มข้อมูลสำเร็จ' };
}

// ============================================================
// EDIT ROW — แก้ไขข้อมูล
// ============================================================
function editRow(sheetName, id, data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { error: `ไม่พบ Sheet: ${sheetName}` };

  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idCol   = headers.indexOf('ID');

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idCol] === id) {
      headers.forEach((h, j) => {
        if (data[h] !== undefined) {
          sheet.getRange(i + 1, j + 1).setValue(data[h]);
        }
      });
      return { success: true, message: 'แก้ไขข้อมูลสำเร็จ' };
    }
  }

  return { error: `ไม่พบ ID: ${id}` };
}

// ============================================================
// DELETE ROW — ลบข้อมูล
// ============================================================
function deleteRow(sheetName, id) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { error: `ไม่พบ Sheet: ${sheetName}` };

  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idCol   = headers.indexOf('ID');

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idCol] === id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'ลบข้อมูลสำเร็จ' };
    }
  }

  return { error: `ไม่พบ ID: ${id}` };
}

// ============================================================
// GET STATS — ดึงสถิติสำหรับ Dashboard
// ============================================================
function getStats() {
  const mouData      = getAll(SHEET_NAMES.MOU);
  const scholarData  = getAll(SHEET_NAMES.SCHOLAR);
  const travelData   = getAll(SHEET_NAMES.TRAVEL);
  const inboundData  = getAll(SHEET_NAMES.INBOUND);
  const outboundData = getAll(SHEET_NAMES.OUTBOUND);

  const today = new Date();

  // นับ MOU Active
  const mouActive = mouData.data.filter(m => {
    const end = new Date(m['วันสิ้นสุด']);
    return end >= today;
  }).length;

  // นับ MOU ใกล้หมด (180 วัน)
  const mouSoon = mouData.data.filter(m => {
    const end  = new Date(m['วันสิ้นสุด']);
    const diff = (end - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 180;
  }).length;

  // นับทุนกำลังรับสมัคร
  const scholarOpen = scholarData.data.filter(m => {
    const open  = new Date(m['วันเปิดรับ']);
    const close = new Date(m['วันปิดรับ']);
    return today >= open && today <= close;
  }).length;

  // นับการเดินทางกำลังเดินทาง
  const travelNow = travelData.data.filter(m => {
    const start = new Date(m['วันเริ่ม']);
    const end   = new Date(m['วันสิ้นสุด']);
    return today >= start && today <= end;
  }).length;

  // นับประเทศ MOU (unique)
  const countries = [...new Set(mouData.data.map(m => m['ประเทศ']))].filter(Boolean);

  return {
    success: true,
    stats: {
      mou:          { total: mouData.total, active: mouActive, soon: mouSoon, countries: countries.length },
      scholarship:  { total: scholarData.total, open: scholarOpen },
      travel:       { total: travelData.total, active: travelNow },
      inbound:      { total: inboundData.total },
      outbound:     { total: outboundData.total },
      mobility:     { total: inboundData.total + outboundData.total },
    }
  };
}

// ============================================================
// GET MOU BY COUNTRY — สำหรับแผนที่โลก
// ============================================================
function getMouByCountry() {
  const all = getAll(SHEET_NAMES.MOU);
  if (all.error) return all;

  const today    = new Date();
  const byCountry = {};

  all.data.forEach(m => {
    const country = m['ประเทศ'];
    const end     = new Date(m['วันสิ้นสุด']);
    if (!country) return;
    if (end < today) return; // นับเฉพาะ Active

    byCountry[country] = (byCountry[country] || 0) + 1;
  });

  return { success: true, data: byCountry };
}

// ============================================================
// HELPER — สร้าง Prefix ID
// ============================================================
function getPrefix(sheetName) {
  const map = {
    [SHEET_NAMES.MOU]:      'MOU',
    [SHEET_NAMES.SCHOLAR]:  'SCH',
    [SHEET_NAMES.EVENT]:    'EVT',
    [SHEET_NAMES.TRAVEL]:   'TRV',
    [SHEET_NAMES.INBOUND]:  'IN',
    [SHEET_NAMES.OUTBOUND]: 'OUT',
  };
  return map[sheetName] || 'ROW';
}

// ============================================================
// SETUP — รันครั้งแรกเพื่อสร้าง Sheet Headers อัตโนมัติ
// เข้า Apps Script แล้วกด Run → setupSheets()
// ============================================================
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const configs = [
    {
      name: SHEET_NAMES.MOU,
      headers: ['ID','หน่วยงาน_UP','องค์กร_ตปท','ประเทศ','ทวีป','ประเภท',
                'วันเริ่ม','วันสิ้นสุด','ปีงบ','หมายเหตุ','ไฟล์_URL','วันที่บันทึก']
    },
    {
      name: SHEET_NAMES.SCHOLAR,
      headers: ['ID','ชื่อทุน','สถาบัน','ประเทศ','ระดับ',
                'วันประชาสัมพันธ์','วันเปิดรับ','วันปิดรับ',
                'ครอบคลุม','Link','Poster_URL','ไฟล์_URL','Pin','หมายเหตุ','วันที่บันทึก']
    },
    {
      name: SHEET_NAMES.EVENT,
      headers: ['ID','ชื่อกิจกรรม','ประเภท','วันเริ่ม','วันสิ้นสุด',
                'สถานที่','หน่วยงาน','จำนวน','รายละเอียด','ไฟล์_URL','Pin','วันที่บันทึก']
    },
    {
      name: SHEET_NAMES.TRAVEL,
      headers: ['ID','ชื่อโครงการ','วัตถุประสงค์','วันเริ่ม','วันสิ้นสุด',
                'ประเทศ','เมือง','จำนวน','รหัสผู้เดินทาง','ชื่อผู้เดินทาง',
                'ปีงบ','งบประเภท','จำนวนเงิน','ไฟล์_URL','หมายเหตุ','วันที่บันทึก']
    },
    {
      name: SHEET_NAMES.INBOUND,
      headers: ['ID','ชื่อ','ชื่อกลาง','สกุล','เพศ','ประเภท','สถาบัน','ประเทศ',
                'ระดับ','หน่วยงาน_UP','ภาษา','วันมาถึง','วันกลับ',
                'โครงการ','วัตถุประสงค์','ปีงบ','งบประเภท','จำนวนเงิน',
                'ไฟล์_URL','หมายเหตุ','วันที่บันทึก']
    },
    {
      name: SHEET_NAMES.OUTBOUND,
      headers: ['ID','รหัส','ชื่อ_สกุล','คณะ','สาขา','ประเภท','เพศ',
                'สถาบัน_ปลายทาง','ประเทศ','วันออก','วันกลับ',
                'โครงการ','วัตถุประสงค์','ปีงบ','งบประเภท','จำนวนเงิน',
                'ไฟล์_URL','หมายเหตุ','วันที่บันทึก']
    },
  ];

  configs.forEach(config => {
    let sheet = ss.getSheetByName(config.name);

    // สร้าง Sheet ถ้ายังไม่มี
    if (!sheet) {
      sheet = ss.insertSheet(config.name);
    }

    // ใส่ Header ถ้า Sheet ว่างเปล่า
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);

      // จัดสไตล์ Header
      const headerRange = sheet.getRange(1, 1, 1, config.headers.length);
      headerRange.setBackground('#0F2D5A');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      headerRange.setFontSize(11);
      sheet.setFrozenRows(1);
      sheet.setFrozenColumns(1);

      // ปรับความกว้าง Column
      sheet.autoResizeColumns(1, config.headers.length);
    }

    Logger.log(`✅ Setup Sheet: ${config.name}`);
  });

  // สร้าง Sheet Admin ถ้ายังไม่มี
  let adminSheet = ss.getSheetByName('Admin');
  if (!adminSheet) {
    adminSheet = ss.insertSheet('Admin');
    adminSheet.getRange(1,1,1,3).setValues([['email','ชื่อ-สกุล','หมายเหตุ']]);
    const h = adminSheet.getRange(1,1,1,3);
    h.setBackground('#D63B32');
    h.setFontColor('#FFFFFF');
    h.setFontWeight('bold');
    adminSheet.setFrozenRows(1);
    Logger.log('✅ สร้าง Sheet Admin แล้ว');
  }

  SpreadsheetApp.getUi().alert('✅ สร้าง Sheets สำเร็จ!\n\nSheets ที่สร้างแล้ว:\n' + configs.map(c => '• ' + c.name).join('\n'));
}
