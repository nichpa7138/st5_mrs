/**
 * ระบบประเมินตนเองเพื่อวัดระดับความสุขและความเครียด (ST-5)
 * Google Apps Script Backend API สำหรับเชื่อมต่อกับ React + Vercel
 *
 * วิธีติดตั้งและ Deploy:
 * 1. เปิด https://script.google.com/ แล้วสร้างโปรเจกต์ใหม่
 * 2. ลบโค้ดเดิมทั้งหมด แล้ววางโค้ดไฟล์นี้ลงใน Code.gs
 * 3. เลือกฟังก์ชัน "setupSheets" ด้านบนแล้วกด Run 1 ครั้ง เพื่อสร้างชีท MEMBER / ASSESSMENT_LOG และกด Allow Permissions
 * 4. กด Deploy -> New deployment -> เลือก Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. คัดลอก Web app URL (ลงท้ายด้วย /exec) ไปใส่ใน Environment Variable ชื่อ GAS_WEBAPP_URL บน Vercel
 */

var SPREADSHEET_ID = '1bZg9g51D6q8TEDZ_QeCG5ZwCOBQsKUm-Ens1--u6smU';
var DRIVE_FOLDER_ID = '1A0vT2pMMi0nU3FooBEw68ur8uBXokjMY';

var SHEET_MEMBER = 'MEMBER';
var SHEET_LOG = 'ASSESSMENT_LOG';

var MEMBER_HEADERS = ['st_id', 'prefix', 'name', 'lname', 'dob', 'email', 'course', 'profile_img'];
var LOG_HEADERS = ['log_id', 'st_id', 'date_time', 'q1', 'q2', 'q3', 'q4', 'q5', 'total_score', 'result_text'];

function setupSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureSheetWithHeaders_(ss, SHEET_MEMBER, MEMBER_HEADERS);
  ensureSheetWithHeaders_(ss, SHEET_LOG, LOG_HEADERS);
  // ทดสอบสิทธิ์การเข้าถึงโฟลเดอร์ Drive
  DriveApp.getFolderById(DRIVE_FOLDER_ID).getName();
}

function ensureSheetWithHeaders_(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || 'dashboard';

    if (action === 'dashboard') {
      return jsonResponse_({ ok: true, data: buildDashboardStats_() });
    }
    if (action === 'member') {
      var member = findMemberById_(params.st_id || '');
      if (!member) {
        return jsonResponse_({ ok: false, status: 404, error: 'ไม่พบข้อมูลนักศึกษา' });
      }
      return jsonResponse_({ ok: true, member: sanitizeMember_(member) });
    }
    if (action === 'assessments') {
      var logs = getAssessmentsByStId_(params.st_id || '');
      return jsonResponse_({ ok: true, logs: logs });
    }

    return jsonResponse_({ ok: false, status: 400, error: 'Unknown GET action' });
  } catch (err) {
    return jsonResponse_({ ok: false, status: 500, error: String(err) });
  }
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var body = JSON.parse(raw);
    var action = body.action || '';

    if (action === 'login') {
      return jsonResponse_(handleLogin_(body));
    }
    if (action === 'register') {
      return jsonResponse_(handleRegister_(body));
    }
    if (action === 'updateAvatar') {
      return jsonResponse_(handleUpdateAvatar_(body));
    }
    if (action === 'createAssessment') {
      return jsonResponse_(handleCreateAssessment_(body));
    }

    return jsonResponse_({ ok: false, status: 400, error: 'Unknown POST action' });
  } catch (err) {
    return jsonResponse_({ ok: false, status: 500, error: String(err) });
  }
}

function getAllMembers_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ensureSheetWithHeaders_(ss, SHEET_MEMBER, MEMBER_HEADERS);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, MEMBER_HEADERS.length).getDisplayValues();
  var list = [];
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    if (!row[0]) continue;
    list.push({
      rowIndex: i + 2,
      st_id: String(row[0]).trim(),
      prefix: String(row[1]).trim(),
      name: String(row[2]).trim(),
      lname: String(row[3]).trim(),
      dob: String(row[4]).trim(),
      email: String(row[5]).trim(),
      course: String(row[6]).trim(),
      profile_img: String(row[7]).trim()
    });
  }
  return list;
}

function getAllLogs_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ensureSheetWithHeaders_(ss, SHEET_LOG, LOG_HEADERS);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, LOG_HEADERS.length).getDisplayValues();
  var list = [];
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    if (!row[0]) continue;
    list.push({
      log_id: String(row[0]).trim(),
      st_id: String(row[1]).trim(),
      date_time: String(row[2]).trim(),
      q1: Number(row[3]) || 0,
      q2: Number(row[4]) || 0,
      q3: Number(row[5]) || 0,
      q4: Number(row[6]) || 0,
      q5: Number(row[7]) || 0,
      total_score: Number(row[8]) || 0,
      result_text: String(row[9]).trim()
    });
  }
  return list;
}

function sanitizeMember_(m) {
  return {
    st_id: m.st_id,
    prefix: m.prefix,
    name: m.name,
    lname: m.lname,
    email: m.email,
    course: m.course,
    profile_img: m.profile_img
  };
}

function findMemberById_(stId) {
  var target = String(stId || '').trim();
  if (!target) return null;
  var members = getAllMembers_();
  for (var i = 0; i < members.length; i++) {
    if (members[i].st_id === target) return members[i];
  }
  return null;
}

function handleLogin_(body) {
  var stId = String(body.st_id || '').trim();
  var dob = String(body.dob || '').trim();
  if (!stId || !dob) {
    return { ok: false, status: 400, error: 'กรุณากรอกรหัสนักศึกษาและวันเดือนปีเกิด' };
  }
  var member = findMemberById_(stId);
  if (!member || member.dob !== dob) {
    return {
      ok: false,
      status: 401,
      error: 'รหัสนักศึกษาหรือวันเดือนปีเกิด (ววดดปปปป พ.ศ.) ไม่ถูกต้อง'
    };
  }
  return { ok: true, member: sanitizeMember_(member) };
}

function handleRegister_(body) {
  var stId = String(body.st_id || '').trim();
  var prefix = String(body.prefix || '').trim();
  var name = String(body.name || '').trim();
  var lname = String(body.lname || '').trim();
  var dob = String(body.dob || '').trim();
  var email = String(body.email || '').trim();
  var course = String(body.course || '').trim();
  var profileImgBase64 = body.profileImgBase64 || '';

  if (!stId) return { ok: false, status: 400, error: 'กรุณากรอกรหัสนักศึกษา' };
  if (findMemberById_(stId)) {
    return { ok: false, status: 400, error: 'รหัสนักศึกษา ' + stId + ' มีอยู่ในระบบแล้ว' };
  }
  if (!/^\d{8}$/.test(dob)) {
    return {
      ok: false,
      status: 400,
      error: 'วันเดือนปีเกิดต้องเป็นตัวเลข 8 หลัก รูปแบบ ววดดปปปป (พ.ศ.) เช่น 29102534'
    };
  }
  if (!name || !lname) {
    return { ok: false, status: 400, error: 'กรุณากรอกชื่อและนามสกุลภาษาไทยให้ครบถ้วน' };
  }
  if (!email || email.indexOf('@') === -1) {
    return { ok: false, status: 400, error: 'กรุณากรอกอีเมลให้ถูกต้อง' };
  }

  var profileUrl = '';
  if (profileImgBase64) {
    profileUrl = uploadImageToDrive_(stId, profileImgBase64);
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ensureSheetWithHeaders_(ss, SHEET_MEMBER, MEMBER_HEADERS);
  var nextRow = sheet.getLastRow() + 1;
  var range = sheet.getRange(nextRow, 1, 1, MEMBER_HEADERS.length);
  range.setNumberFormats([['@', '@', '@', '@', '@', '@', '@', '@']]);
  range.setValues([[stId, prefix, name, lname, dob, email, course, profileUrl]]);

  return {
    ok: true,
    member: {
      st_id: stId,
      prefix: prefix,
      name: name,
      lname: lname,
      email: email,
      course: course,
      profile_img: profileUrl
    }
  };
}

function handleUpdateAvatar_(body) {
  var stId = String(body.st_id || '').trim();
  var profileImgBase64 = body.profileImgBase64 || '';
  if (!stId || !profileImgBase64) {
    return { ok: false, status: 400, error: 'ข้อมูลรูปภาพไม่สมบูรณ์' };
  }

  var member = findMemberById_(stId);
  if (!member) {
    return { ok: false, status: 404, error: 'ไม่พบข้อมูลนักศึกษา' };
  }

  var profileUrl = uploadImageToDrive_(stId, profileImgBase64);
  if (!profileUrl) {
    return { ok: false, status: 400, error: 'ไม่สามารถอัปโหลดรูปภาพลง Google Drive ได้' };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ensureSheetWithHeaders_(ss, SHEET_MEMBER, MEMBER_HEADERS);
  sheet.getRange(member.rowIndex, 8).setValue(profileUrl);

  member.profile_img = profileUrl;
  return { ok: true, member: sanitizeMember_(member) };
}

function uploadImageToDrive_(stId, dataUrl) {
  var match = /^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i.exec(dataUrl);
  if (!match) return '';

  var ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
  var mimeType = 'image/' + (ext === 'jpg' ? 'jpeg' : ext);
  var bytes = Utilities.base64Decode(match[2]);
  var safeId = stId.replace(/[^a-zA-Z0-9_-]/g, '');
  var filename = 'profile_' + safeId + '_' + Date.now() + '.' + ext;

  var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  var blob = Utilities.newBlob(bytes, mimeType, filename);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return 'https://lh3.googleusercontent.com/d/' + file.getId();
}

function classifyStressText_(totalScore) {
  if (totalScore <= 4) return 'ความเครียดน้อย';
  if (totalScore <= 7) return 'ความเครียดปานกลาง';
  if (totalScore <= 9) return 'ความเครียดมาก';
  return 'ความเครียดมากที่สุด';
}

function getAssessmentsByStId_(stId) {
  var target = String(stId || '').trim();
  if (!target) return [];
  var logs = getAllLogs_();
  var filtered = [];
  for (var i = 0; i < logs.length; i++) {
    if (logs[i].st_id === target) {
      filtered.push(logs[i]);
    }
  }
  filtered.sort(function (a, b) {
    return b.date_time.localeCompare(a.date_time);
  });
  return filtered;
}

function handleCreateAssessment_(body) {
  var stId = String(body.st_id || '').trim();
  if (!findMemberById_(stId)) {
    return { ok: false, status: 404, error: 'ไม่พบข้อมูลนักศึกษาในระบบ กรุณาเข้าสู่ระบบใหม่อีกครั้ง' };
  }

  var q1 = Number(body.q1);
  var q2 = Number(body.q2);
  var q3 = Number(body.q3);
  var q4 = Number(body.q4);
  var q5 = Number(body.q5);

  var scores = [q1, q2, q3, q4, q5];
  for (var i = 0; i < scores.length; i++) {
    if (isNaN(scores[i]) || scores[i] < 0 || scores[i] > 3 || Math.floor(scores[i]) !== scores[i]) {
      return { ok: false, status: 400, error: 'คะแนนแต่ละข้อต้องอยู่ระหว่าง 0 ถึง 3' };
    }
  }

  var totalScore = q1 + q2 + q3 + q4 + q5;
  var resultText = classifyStressText_(totalScore);
  var dateTime = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
  var logId = 'LOG-' + Utilities.getUuid().slice(0, 8).toUpperCase();

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ensureSheetWithHeaders_(ss, SHEET_LOG, LOG_HEADERS);
  var nextRow = sheet.getLastRow() + 1;
  var range = sheet.getRange(nextRow, 1, 1, LOG_HEADERS.length);
  range.setNumberFormats([['@', '@', '@', '0', '0', '0', '0', '0', '0', '@']]);
  range.setValues([[logId, stId, dateTime, q1, q2, q3, q4, q5, totalScore, resultText]]);

  return {
    ok: true,
    log: {
      log_id: logId,
      st_id: stId,
      date_time: dateTime,
      q1: q1,
      q2: q2,
      q3: q3,
      q4: q4,
      q5: q5,
      total_score: totalScore,
      result_text: resultText
    }
  };
}

function buildDashboardStats_() {
  var members = getAllMembers_();
  var logs = getAllLogs_();

  var totalMembers = members.length;
  var totalAssessments = logs.length;

  var totalScoreSum = 0;
  var lowStressCount = 0;
  for (var i = 0; i < logs.length; i++) {
    totalScoreSum += logs[i].total_score;
    if (logs[i].total_score <= 4) lowStressCount++;
  }

  var overallAvgScore = totalAssessments > 0 ? Number((totalScoreSum / totalAssessments).toFixed(2)) : 0;
  var lowStressRate = totalAssessments > 0 ? Number(((lowStressCount / totalAssessments) * 100).toFixed(1)) : 0;

  var courses = ['ปวส.เวชระเบียน', 'วทบ.เวชระเบียน'];
  var courseStats = [];
  for (var c = 0; c < courses.length; c++) {
    var course = courses[c];
    var courseIdSet = {};
    var courseMemberCount = 0;
    for (var m = 0; m < members.length; m++) {
      if (members[m].course === course) {
        courseIdSet[members[m].st_id] = true;
        courseMemberCount++;
      }
    }
    var courseLogCount = 0;
    var courseLogSum = 0;
    for (var l = 0; l < logs.length; l++) {
      if (courseIdSet[logs[l].st_id]) {
        courseLogCount++;
        courseLogSum += logs[l].total_score;
      }
    }
    courseStats.push({
      course: course,
      memberCount: courseMemberCount,
      memberPercent: totalMembers > 0 ? Number(((courseMemberCount / totalMembers) * 100).toFixed(1)) : 0,
      assessmentCount: courseLogCount,
      avgScore: courseLogCount > 0 ? Number((courseLogSum / courseLogCount).toFixed(2)) : 0
    });
  }

  var genders = ['ชาย', 'หญิง'];
  var genderStats = [];
  for (var g = 0; g < genders.length; g++) {
    var gender = genders[g];
    var genderIdSet = {};
    var genderMemberCount = 0;
    for (var m2 = 0; m2 < members.length; m2++) {
      var memGender = members[m2].prefix === 'นาย' ? 'ชาย' : 'หญิง';
      if (memGender === gender) {
        genderIdSet[members[m2].st_id] = true;
        genderMemberCount++;
      }
    }
    var gLogCount = 0;
    var gLogSum = 0;
    for (var l2 = 0; l2 < logs.length; l2++) {
      if (genderIdSet[logs[l2].st_id]) {
        gLogCount++;
        gLogSum += logs[l2].total_score;
      }
    }
    genderStats.push({
      gender: gender,
      memberCount: genderMemberCount,
      memberPercent: totalMembers > 0 ? Number(((genderMemberCount / totalMembers) * 100).toFixed(1)) : 0,
      assessmentCount: gLogCount,
      avgScore: gLogCount > 0 ? Number((gLogSum / gLogCount).toFixed(2)) : 0
    });
  }

  var thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  var weekMap = {};
  for (var l3 = 0; l3 < logs.length; l3++) {
    var datePart = logs[l3].date_time.slice(0, 10);
    var parts = datePart.split('-');
    if (parts.length !== 3) continue;
    var dt = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
    var day = dt.getUTCDay();
    var diff = day === 0 ? -6 : 1 - day;
    dt.setUTCDate(dt.getUTCDate() + diff);
    var wy = dt.getUTCFullYear();
    var wm = ('0' + (dt.getUTCMonth() + 1)).slice(-2);
    var wd = ('0' + dt.getUTCDate()).slice(-2);
    var weekKey = wy + '-' + wm + '-' + wd;
    if (!weekMap[weekKey]) weekMap[weekKey] = [];
    weekMap[weekKey].push(logs[l3]);
  }

  var weekKeys = Object.keys(weekMap).sort();
  if (weekKeys.length > 10) {
    weekKeys = weekKeys.slice(weekKeys.length - 10);
  }
  var weeklyTrend = [];
  for (var wk = 0; wk < weekKeys.length; wk++) {
    var key = weekKeys[wk];
    var wLogs = weekMap[key];
    var wSum = 0;
    for (var j = 0; j < wLogs.length; j++) wSum += wLogs[j].total_score;
    var wAvg = Number((wSum / wLogs.length).toFixed(2));
    var kp = key.split('-');
    var label = Number(kp[2]) + ' ' + thaiMonths[Number(kp[1]) - 1];
    weeklyTrend.push({
      weekKey: key,
      weekLabel: label,
      avgScore: wAvg,
      assessmentCount: wLogs.length,
      dominantLevel: classifyStressText_(Math.round(wAvg))
    });
  }

  var levels = ['ความเครียดน้อย', 'ความเครียดปานกลาง', 'ความเครียดมาก', 'ความเครียดมากที่สุด'];
  var levelDistribution = [];
  for (var lv = 0; lv < levels.length; lv++) {
    var levelName = levels[lv];
    var lvCount = 0;
    for (var l4 = 0; l4 < logs.length; l4++) {
      if (logs[l4].result_text === levelName) lvCount++;
    }
    levelDistribution.push({
      level: levelName,
      count: lvCount,
      percent: totalAssessments > 0 ? Number(((lvCount / totalAssessments) * 100).toFixed(1)) : 0
    });
  }

  return {
    totalMembers: totalMembers,
    totalAssessments: totalAssessments,
    overallAvgScore: overallAvgScore,
    lowStressRate: lowStressRate,
    courseStats: courseStats,
    genderStats: genderStats,
    weeklyTrend: weeklyTrend,
    levelDistribution: levelDistribution
  };
}
