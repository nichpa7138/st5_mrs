// server.ts
import express2 from "express";
import path2 from "path";

// server/app.ts
import express from "express";

// server/db.ts
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
var IS_VERCEL = Boolean(process.env.VERCEL || process.env.NOW_REGION);
var DATA_DIR = IS_VERCEL ? path.join(os.tmpdir(), "st5-wellness-data") : path.resolve(process.cwd(), "data");
var UPLOADS_DIR = path.join(DATA_DIR, "uploads");
var DB_FILE = path.join(DATA_DIR, "db.json");
function ensureDataDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}
function getUploadsDir() {
  ensureDataDirs();
  return UPLOADS_DIR;
}
function classifyStressText(totalScore) {
  if (totalScore <= 4) return "\u0E04\u0E27\u0E32\u0E21\u0E40\u0E04\u0E23\u0E35\u0E22\u0E14\u0E19\u0E49\u0E2D\u0E22";
  if (totalScore <= 7) return "\u0E04\u0E27\u0E32\u0E21\u0E40\u0E04\u0E23\u0E35\u0E22\u0E14\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07";
  if (totalScore <= 9) return "\u0E04\u0E27\u0E32\u0E21\u0E40\u0E04\u0E23\u0E35\u0E22\u0E14\u0E21\u0E32\u0E01";
  return "\u0E04\u0E27\u0E32\u0E21\u0E40\u0E04\u0E23\u0E35\u0E22\u0E14\u0E21\u0E32\u0E01\u0E17\u0E35\u0E48\u0E2A\u0E38\u0E14";
}
function makeSeedData() {
  const members = [
    {
      st_id: "64010001",
      prefix: "\u0E19\u0E32\u0E07\u0E2A\u0E32\u0E27",
      name: "\u0E19\u0E34\u0E0A\u0E32\u0E20\u0E32",
      lname: "\u0E43\u0E08\u0E14\u0E35",
      dob: "29102534",
      email: "nichapa.j@kmpht.ac.th",
      course: "\u0E27\u0E17\u0E1A.\u0E40\u0E27\u0E0A\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19",
      profile_img: ""
    },
    {
      st_id: "64010002",
      prefix: "\u0E19\u0E32\u0E22",
      name: "\u0E18\u0E19\u0E01\u0E24\u0E15",
      lname: "\u0E23\u0E31\u0E01\u0E29\u0E4C\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E",
      dob: "15052546",
      email: "thanakrit.r@kmpht.ac.th",
      course: "\u0E27\u0E17\u0E1A.\u0E40\u0E27\u0E0A\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19",
      profile_img: ""
    },
    {
      st_id: "64010003",
      prefix: "\u0E19\u0E32\u0E07\u0E2A\u0E32\u0E27",
      name: "\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E0A\u0E19\u0E01",
      lname: "\u0E2A\u0E38\u0E02\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E34\u0E4C",
      dob: "08082547",
      email: "pimchanok.s@kmpht.ac.th",
      course: "\u0E1B\u0E27\u0E2A.\u0E40\u0E27\u0E0A\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19",
      profile_img: ""
    },
    {
      st_id: "64010004",
      prefix: "\u0E19\u0E32\u0E22",
      name: "\u0E1B\u0E20\u0E31\u0E07\u0E01\u0E23",
      lname: "\u0E27\u0E07\u0E28\u0E4C\u0E40\u0E27\u0E0A",
      dob: "12032547",
      email: "paphangkorn.w@kmpht.ac.th",
      course: "\u0E1B\u0E27\u0E2A.\u0E40\u0E27\u0E0A\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19",
      profile_img: ""
    },
    {
      st_id: "64010005",
      prefix: "\u0E19\u0E32\u0E07\u0E2A\u0E32\u0E27",
      name: "\u0E01\u0E31\u0E0D\u0E0D\u0E32\u0E23\u0E31\u0E15\u0E19\u0E4C",
      lname: "\u0E28\u0E23\u0E35\u0E21\u0E07\u0E04\u0E25",
      dob: "21112546",
      email: "kanyarat.s@kmpht.ac.th",
      course: "\u0E27\u0E17\u0E1A.\u0E40\u0E27\u0E0A\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19",
      profile_img: ""
    },
    {
      st_id: "64010006",
      prefix: "\u0E19\u0E32\u0E22",
      name: "\u0E28\u0E34\u0E23\u0E34\u0E0A\u0E31\u0E22",
      lname: "\u0E17\u0E2D\u0E07\u0E41\u0E17\u0E49",
      dob: "04092547",
      email: "sirichai.t@kmpht.ac.th",
      course: "\u0E1B\u0E27\u0E2A.\u0E40\u0E27\u0E0A\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19",
      profile_img: ""
    },
    {
      st_id: "64010007",
      prefix: "\u0E19\u0E32\u0E07\u0E2A\u0E32\u0E27",
      name: "\u0E27\u0E23\u0E31\u0E0D\u0E0D\u0E32",
      lname: "\u0E41\u0E01\u0E49\u0E27\u0E21\u0E13\u0E35",
      dob: "17012547",
      email: "waranya.k@kmpht.ac.th",
      course: "\u0E27\u0E17\u0E1A.\u0E40\u0E27\u0E0A\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19",
      profile_img: ""
    },
    {
      st_id: "64010008",
      prefix: "\u0E19\u0E32\u0E07\u0E2A\u0E32\u0E27",
      name: "\u0E0A\u0E38\u0E15\u0E34\u0E21\u0E32",
      lname: "\u0E1A\u0E38\u0E0D\u0E21\u0E35",
      dob: "25062547",
      email: "chutima.b@kmpht.ac.th",
      course: "\u0E1B\u0E27\u0E2A.\u0E40\u0E27\u0E0A\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19",
      profile_img: ""
    },
    {
      st_id: "64010009",
      prefix: "\u0E19\u0E32\u0E22",
      name: "\u0E13\u0E31\u0E10\u0E27\u0E38\u0E12\u0E34",
      lname: "\u0E2D\u0E34\u0E19\u0E17\u0E23\u0E4C\u0E41\u0E01\u0E49\u0E27",
      dob: "10122546",
      email: "nattawut.i@kmpht.ac.th",
      course: "\u0E27\u0E17\u0E1A.\u0E40\u0E27\u0E0A\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19",
      profile_img: ""
    },
    {
      st_id: "64010010",
      prefix: "\u0E19\u0E32\u0E07",
      name: "\u0E2A\u0E38\u0E20\u0E32\u0E1E\u0E23",
      lname: "\u0E40\u0E08\u0E23\u0E34\u0E0D\u0E1C\u0E25",
      dob: "03042545",
      email: "supaporn.c@kmpht.ac.th",
      course: "\u0E1B\u0E27\u0E2A.\u0E40\u0E27\u0E0A\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19",
      profile_img: ""
    }
  ];
  const rawLogs = [
    { st_id: "64010001", date_time: "2026-10-06 09:30:00", q1: 1, q2: 1, q3: 1, q4: 0, q5: 0 },
    { st_id: "64010002", date_time: "2026-10-07 11:15:00", q1: 1, q2: 0, q3: 1, q4: 1, q5: 0 },
    { st_id: "64010003", date_time: "2026-10-08 14:20:00", q1: 2, q2: 1, q3: 1, q4: 1, q5: 1 },
    { st_id: "64010004", date_time: "2026-10-13 10:05:00", q1: 1, q2: 1, q3: 1, q4: 1, q5: 0 },
    { st_id: "64010005", date_time: "2026-10-14 15:40:00", q1: 2, q2: 2, q3: 1, q4: 1, q5: 1 },
    { st_id: "64010001", date_time: "2026-10-15 16:10:00", q1: 2, q2: 1, q3: 1, q4: 1, q5: 0 },
    { st_id: "64010006", date_time: "2026-10-16 09:45:00", q1: 0, q2: 1, q3: 1, q4: 0, q5: 0 },
    { st_id: "64010007", date_time: "2026-10-20 13:25:00", q1: 2, q2: 2, q3: 2, q4: 1, q5: 1 },
    { st_id: "64010008", date_time: "2026-10-21 17:00:00", q1: 3, q2: 2, q3: 2, q4: 2, q5: 1 },
    { st_id: "64010002", date_time: "2026-10-22 10:30:00", q1: 2, q2: 1, q3: 2, q4: 1, q5: 0 },
    { st_id: "64010009", date_time: "2026-10-23 14:50:00", q1: 1, q2: 2, q3: 1, q4: 1, q5: 1 },
    { st_id: "64010001", date_time: "2026-10-27 11:20:00", q1: 2, q2: 2, q3: 2, q4: 1, q5: 1 },
    { st_id: "64010010", date_time: "2026-10-28 09:10:00", q1: 1, q2: 1, q3: 1, q4: 0, q5: 1 },
    { st_id: "64010003", date_time: "2026-10-29 15:05:00", q1: 2, q2: 1, q3: 2, q4: 2, q5: 1 },
    { st_id: "64010005", date_time: "2026-10-30 16:40:00", q1: 1, q2: 1, q3: 1, q4: 1, q5: 0 },
    { st_id: "64010004", date_time: "2026-11-03 10:15:00", q1: 1, q2: 0, q3: 1, q4: 1, q5: 0 },
    { st_id: "64010006", date_time: "2026-11-04 13:45:00", q1: 1, q2: 1, q3: 1, q4: 1, q5: 1 },
    { st_id: "64010007", date_time: "2026-11-05 14:20:00", q1: 1, q2: 1, q3: 0, q4: 1, q5: 0 },
    { st_id: "64010001", date_time: "2026-11-06 18:00:00", q1: 1, q2: 1, q3: 1, q4: 0, q5: 1 },
    { st_id: "64010008", date_time: "2026-11-10 09:50:00", q1: 2, q2: 1, q3: 1, q4: 1, q5: 0 },
    { st_id: "64010009", date_time: "2026-11-11 11:30:00", q1: 0, q2: 1, q3: 1, q4: 0, q5: 0 },
    { st_id: "64010010", date_time: "2026-11-12 15:15:00", q1: 1, q2: 1, q3: 0, q4: 1, q5: 0 },
    { st_id: "64010002", date_time: "2026-11-13 16:45:00", q1: 1, q2: 0, q3: 1, q4: 0, q5: 0 },
    { st_id: "64010001", date_time: "2026-11-16 09:15:00", q1: 1, q2: 1, q3: 0, q4: 1, q5: 0 },
    { st_id: "64010003", date_time: "2026-11-16 11:40:00", q1: 1, q2: 2, q3: 1, q4: 1, q5: 0 }
  ];
  const assessmentLogs = rawLogs.map((item, idx) => {
    const total_score = item.q1 + item.q2 + item.q3 + item.q4 + item.q5;
    return {
      log_id: `LOG-${String(idx + 1).padStart(4, "0")}`,
      st_id: item.st_id,
      date_time: item.date_time,
      q1: item.q1,
      q2: item.q2,
      q3: item.q3,
      q4: item.q4,
      q5: item.q5,
      total_score,
      result_text: classifyStressText(total_score)
    };
  });
  return { members, assessmentLogs };
}
var memoryFallbackDb = null;
function readDb() {
  try {
    ensureDataDirs();
    if (!fs.existsSync(DB_FILE)) {
      const seed = makeSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), "utf8");
      return seed;
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    if (!memoryFallbackDb) {
      memoryFallbackDb = makeSeedData();
    }
    return memoryFallbackDb;
  }
}
function writeDb(db) {
  memoryFallbackDb = db;
  try {
    ensureDataDirs();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch {
  }
}
function sanitizeMember(member) {
  const { dob: _dob, ...rest } = member;
  return rest;
}
function authenticateMember(st_id, dob) {
  const db = readDb();
  const normalizedId = st_id.trim();
  const normalizedDob = dob.trim();
  const found = db.members.find(
    (m) => m.st_id === normalizedId && m.dob === normalizedDob
  );
  return found ? sanitizeMember(found) : null;
}
function registerMember(input) {
  const db = readDb();
  const st_id = input.st_id.trim();
  const dob = input.dob.trim();
  const name = input.name.trim();
  const lname = input.lname.trim();
  const email = input.email.trim();
  if (!st_id) {
    return { ok: false, error: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E23\u0E2D\u0E01\u0E23\u0E2B\u0E31\u0E2A\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32" };
  }
  if (db.members.some((m) => m.st_id === st_id)) {
    return { ok: false, error: `\u0E23\u0E2B\u0E31\u0E2A\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32 ${st_id} \u0E21\u0E35\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A\u0E41\u0E25\u0E49\u0E27` };
  }
  if (!/^\d{8}$/.test(dob)) {
    return {
      ok: false,
      error: "\u0E27\u0E31\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E1B\u0E35\u0E40\u0E01\u0E34\u0E14\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02 8 \u0E2B\u0E25\u0E31\u0E01 \u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A \u0E27\u0E27\u0E14\u0E14\u0E1B\u0E1B\u0E1B\u0E1B (\u0E1E.\u0E28.) \u0E40\u0E0A\u0E48\u0E19 29102534"
    };
  }
  if (!name || !lname) {
    return { ok: false, error: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E23\u0E2D\u0E01\u0E0A\u0E37\u0E48\u0E2D\u0E41\u0E25\u0E30\u0E19\u0E32\u0E21\u0E2A\u0E01\u0E38\u0E25\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22\u0E43\u0E2B\u0E49\u0E04\u0E23\u0E1A\u0E16\u0E49\u0E27\u0E19" };
  }
  if (!email || !email.includes("@")) {
    return { ok: false, error: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E23\u0E2D\u0E01\u0E2D\u0E35\u0E40\u0E21\u0E25\u0E43\u0E2B\u0E49\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07" };
  }
  let profile_img = "";
  if (input.profileImgBase64) {
    const saved = saveBase64ProfileImage(st_id, input.profileImgBase64);
    if (saved) {
      profile_img = saved;
    }
  }
  const newMember = {
    st_id,
    prefix: input.prefix,
    name,
    lname,
    dob,
    email,
    course: input.course,
    profile_img
  };
  db.members.push(newMember);
  writeDb(db);
  return { ok: true, member: sanitizeMember(newMember) };
}
function updateMemberAvatar(st_id, profileImgBase64) {
  const db = readDb();
  const member = db.members.find((m) => m.st_id === st_id);
  if (!member) return null;
  const saved = saveBase64ProfileImage(st_id, profileImgBase64);
  if (!saved) return null;
  member.profile_img = saved;
  writeDb(db);
  return sanitizeMember(member);
}
function saveBase64ProfileImage(st_id, dataUrl) {
  const match = /^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i.exec(dataUrl);
  if (!match) return null;
  const ext = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 4 * 1024 * 1024) return null;
  if (IS_VERCEL) {
    return dataUrl;
  }
  try {
    const safeId = st_id.replace(/[^a-zA-Z0-9_-]/g, "");
    const filename = `profile_${safeId}_${Date.now()}.${ext}`;
    const fullPath = path.join(getUploadsDir(), filename);
    fs.writeFileSync(fullPath, buffer);
    return `/uploads/${filename}`;
  } catch {
    return dataUrl;
  }
}
function getMemberById(st_id) {
  const db = readDb();
  const found = db.members.find((m) => m.st_id === st_id);
  return found ? sanitizeMember(found) : null;
}
function getMemberAssessments(st_id) {
  const db = readDb();
  return db.assessmentLogs.filter((log) => log.st_id === st_id).sort((a, b) => b.date_time.localeCompare(a.date_time));
}
function formatNowDateTime() {
  const now = /* @__PURE__ */ new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
function createAssessmentLog(input) {
  const db = readDb();
  const memberExists = db.members.some((m) => m.st_id === input.st_id);
  if (!memberExists) {
    return { ok: false, error: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A \u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A\u0E43\u0E2B\u0E21\u0E48\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07" };
  }
  const scores = [input.q1, input.q2, input.q3, input.q4, input.q5];
  if (scores.some((s) => !Number.isInteger(s) || s < 0 || s > 3)) {
    return { ok: false, error: "\u0E04\u0E30\u0E41\u0E19\u0E19\u0E41\u0E15\u0E48\u0E25\u0E30\u0E02\u0E49\u0E2D\u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07 0 \u0E16\u0E36\u0E07 3" };
  }
  const total_score = scores.reduce((acc, val) => acc + val, 0);
  const log = {
    log_id: `LOG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    st_id: input.st_id,
    date_time: formatNowDateTime(),
    q1: input.q1,
    q2: input.q2,
    q3: input.q3,
    q4: input.q4,
    q5: input.q5,
    total_score,
    result_text: classifyStressText(total_score)
  };
  db.assessmentLogs.push(log);
  writeDb(db);
  return { ok: true, log };
}
var THAI_SHORT_MONTHS = [
  "\u0E21.\u0E04.",
  "\u0E01.\u0E1E.",
  "\u0E21\u0E35.\u0E04.",
  "\u0E40\u0E21.\u0E22.",
  "\u0E1E.\u0E04.",
  "\u0E21\u0E34.\u0E22.",
  "\u0E01.\u0E04.",
  "\u0E2A.\u0E04.",
  "\u0E01.\u0E22.",
  "\u0E15.\u0E04.",
  "\u0E1E.\u0E22.",
  "\u0E18.\u0E04."
];
function getWeekMondayKey(dateTimeStr) {
  const datePart = dateTimeStr.slice(0, 10);
  const [y, m, d] = datePart.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const day = dt.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  dt.setUTCDate(dt.getUTCDate() + diffToMonday);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
function formatThaiWeekLabel(mondayKey) {
  const [, m, d] = mondayKey.split("-").map(Number);
  return `${d} ${THAI_SHORT_MONTHS[m - 1]}`;
}
function getDashboardStats() {
  const db = readDb();
  const members = db.members;
  const logs = db.assessmentLogs;
  const totalMembers = members.length;
  const totalAssessments = logs.length;
  const overallAvgScore = totalAssessments > 0 ? Number(
    (logs.reduce((sum, l) => sum + l.total_score, 0) / totalAssessments).toFixed(2)
  ) : 0;
  const lowStressCount = logs.filter((l) => l.total_score <= 4).length;
  const lowStressRate = totalAssessments > 0 ? Number((lowStressCount / totalAssessments * 100).toFixed(1)) : 0;
  const courses = ["\u0E1B\u0E27\u0E2A.\u0E40\u0E27\u0E0A\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19", "\u0E27\u0E17\u0E1A.\u0E40\u0E27\u0E0A\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19"];
  const courseStats = courses.map((course) => {
    const courseMembers = members.filter((m) => m.course === course);
    const courseMemberIds = new Set(courseMembers.map((m) => m.st_id));
    const courseLogs = logs.filter((l) => courseMemberIds.has(l.st_id));
    const avgScore = courseLogs.length > 0 ? Number(
      (courseLogs.reduce((s, l) => s + l.total_score, 0) / courseLogs.length).toFixed(2)
    ) : 0;
    return {
      course,
      memberCount: courseMembers.length,
      memberPercent: totalMembers > 0 ? Number((courseMembers.length / totalMembers * 100).toFixed(1)) : 0,
      assessmentCount: courseLogs.length,
      avgScore
    };
  });
  const getGender = (prefix) => prefix === "\u0E19\u0E32\u0E22" ? "\u0E0A\u0E32\u0E22" : "\u0E2B\u0E0D\u0E34\u0E07";
  const genders = ["\u0E0A\u0E32\u0E22", "\u0E2B\u0E0D\u0E34\u0E07"];
  const genderStats = genders.map((gender) => {
    const genderMembers = members.filter((m) => getGender(m.prefix) === gender);
    const genderMemberIds = new Set(genderMembers.map((m) => m.st_id));
    const genderLogs = logs.filter((l) => genderMemberIds.has(l.st_id));
    const avgScore = genderLogs.length > 0 ? Number(
      (genderLogs.reduce((s, l) => s + l.total_score, 0) / genderLogs.length).toFixed(2)
    ) : 0;
    return {
      gender,
      memberCount: genderMembers.length,
      memberPercent: totalMembers > 0 ? Number((genderMembers.length / totalMembers * 100).toFixed(1)) : 0,
      assessmentCount: genderLogs.length,
      avgScore
    };
  });
  const weekGroups = /* @__PURE__ */ new Map();
  for (const log of logs) {
    const key = getWeekMondayKey(log.date_time);
    const arr = weekGroups.get(key) ?? [];
    arr.push(log);
    weekGroups.set(key, arr);
  }
  const weeklyTrend = Array.from(weekGroups.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-10).map(([weekKey, weekLogs]) => {
    const avgScore = Number(
      (weekLogs.reduce((s, l) => s + l.total_score, 0) / weekLogs.length).toFixed(2)
    );
    return {
      weekKey,
      weekLabel: formatThaiWeekLabel(weekKey),
      avgScore,
      assessmentCount: weekLogs.length,
      dominantLevel: classifyStressText(Math.round(avgScore))
    };
  });
  const levels = [
    "\u0E04\u0E27\u0E32\u0E21\u0E40\u0E04\u0E23\u0E35\u0E22\u0E14\u0E19\u0E49\u0E2D\u0E22",
    "\u0E04\u0E27\u0E32\u0E21\u0E40\u0E04\u0E23\u0E35\u0E22\u0E14\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07",
    "\u0E04\u0E27\u0E32\u0E21\u0E40\u0E04\u0E23\u0E35\u0E22\u0E14\u0E21\u0E32\u0E01",
    "\u0E04\u0E27\u0E32\u0E21\u0E40\u0E04\u0E23\u0E35\u0E22\u0E14\u0E21\u0E32\u0E01\u0E17\u0E35\u0E48\u0E2A\u0E38\u0E14"
  ];
  const levelDistribution = levels.map((level) => {
    const count = logs.filter((l) => l.result_text === level).length;
    return {
      level,
      count,
      percent: totalAssessments > 0 ? Number((count / totalAssessments * 100).toFixed(1)) : 0
    };
  });
  return {
    totalMembers,
    totalAssessments,
    overallAvgScore,
    lowStressRate,
    courseStats,
    genderStats,
    weeklyTrend,
    levelDistribution
  };
}

// server/app.ts
function createApiApp() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));
  try {
    app.use("/uploads", express.static(getUploadsDir()));
  } catch {
  }
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });
  app.get("/api/dashboard", (_req, res) => {
    try {
      const stats = getDashboardStats();
      res.json(stats);
    } catch (err) {
      console.error("Error building dashboard stats:", err);
      res.status(500).json({ error: "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E42\u0E2B\u0E25\u0E14\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E23\u0E38\u0E1B\u0E2A\u0E16\u0E34\u0E15\u0E34\u0E44\u0E14\u0E49" });
    }
  });
  app.post("/api/auth/login", (req, res) => {
    const { st_id, dob } = req.body;
    if (!st_id || !dob) {
      return res.status(400).json({ error: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E23\u0E2D\u0E01\u0E23\u0E2B\u0E31\u0E2A\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32\u0E41\u0E25\u0E30\u0E27\u0E31\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E1B\u0E35\u0E40\u0E01\u0E34\u0E14" });
    }
    const member = authenticateMember(st_id, dob);
    if (!member) {
      return res.status(401).json({
        error: "\u0E23\u0E2B\u0E31\u0E2A\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32\u0E2B\u0E23\u0E37\u0E2D\u0E27\u0E31\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E1B\u0E35\u0E40\u0E01\u0E34\u0E14 (\u0E27\u0E27\u0E14\u0E14\u0E1B\u0E1B\u0E1B\u0E1B \u0E1E.\u0E28.) \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07"
      });
    }
    return res.json({ member });
  });
  app.post("/api/auth/register", (req, res) => {
    const body = req.body;
    const allowedPrefixes = ["\u0E19\u0E32\u0E22", "\u0E19\u0E32\u0E07\u0E2A\u0E32\u0E27", "\u0E19\u0E32\u0E07"];
    const allowedCourses = ["\u0E1B\u0E27\u0E2A.\u0E40\u0E27\u0E0A\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19", "\u0E27\u0E17\u0E1A.\u0E40\u0E27\u0E0A\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19"];
    if (!body.prefix || !allowedPrefixes.includes(body.prefix)) {
      return res.status(400).json({ error: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E04\u0E33\u0E19\u0E33\u0E2B\u0E19\u0E49\u0E32\u0E0A\u0E37\u0E48\u0E2D" });
    }
    if (!body.course || !allowedCourses.includes(body.course)) {
      return res.status(400).json({ error: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E2B\u0E25\u0E31\u0E01\u0E2A\u0E39\u0E15\u0E23 / \u0E2A\u0E32\u0E02\u0E32\u0E27\u0E34\u0E0A\u0E32" });
    }
    const result = registerMember({
      st_id: body.st_id ?? "",
      prefix: body.prefix,
      name: body.name ?? "",
      lname: body.lname ?? "",
      dob: body.dob ?? "",
      email: body.email ?? "",
      course: body.course,
      profileImgBase64: body.profileImgBase64
    });
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json({ member: result.member });
  });
  app.post("/api/member/avatar", (req, res) => {
    const { st_id, profileImgBase64 } = req.body;
    if (!st_id || !profileImgBase64) {
      return res.status(400).json({ error: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E23\u0E39\u0E1B\u0E20\u0E32\u0E1E\u0E44\u0E21\u0E48\u0E2A\u0E21\u0E1A\u0E39\u0E23\u0E13\u0E4C" });
    }
    const updated = updateMemberAvatar(st_id, profileImgBase64);
    if (!updated) {
      return res.status(400).json({
        error: "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E23\u0E39\u0E1B\u0E20\u0E32\u0E1E\u0E44\u0E14\u0E49 (\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A PNG/JPG/WEBP \u0E02\u0E19\u0E32\u0E14\u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19 4MB)"
      });
    }
    return res.json({ member: updated });
  });
  app.get("/api/member/:st_id", (req, res) => {
    const member = getMemberById(req.params.st_id);
    if (!member) {
      return res.status(404).json({ error: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32" });
    }
    return res.json({ member });
  });
  app.get("/api/assessments/:st_id", (req, res) => {
    const logs = getMemberAssessments(req.params.st_id);
    res.json({ logs });
  });
  app.post("/api/assessments", (req, res) => {
    const body = req.body;
    if (!body.st_id) {
      return res.status(400).json({ error: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A\u0E01\u0E48\u0E2D\u0E19\u0E2A\u0E48\u0E07\u0E41\u0E1A\u0E1A\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19" });
    }
    const result = createAssessmentLog({
      st_id: body.st_id,
      q1: Number(body.q1),
      q2: Number(body.q2),
      q3: Number(body.q3),
      q4: Number(body.q4),
      q5: Number(body.q5)
    });
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json({ log: result.log });
  });
  return app;
}

// server.ts
async function startServer() {
  const app = createApiApp();
  const PORT = Number(process.env.PORT) || 3e3;
  if (process.env.NODE_ENV === "production") {
    const distDir = path2.resolve(process.cwd(), "dist");
    app.use(express2.static(distDir));
    app.get("*splat", (_req, res) => {
      res.sendFile(path2.join(distDir, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ST-5 Wellness Server listening on http://localhost:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
