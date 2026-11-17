import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import type {
  AssessmentLog,
  CourseOption,
  CourseStat,
  DashboardStats,
  GenderStat,
  LevelDistribution,
  Member,
  PrefixOption,
  PublicMember,
  StressResultText,
  WeeklyTrendPoint,
} from '../src/types/st5';

interface DatabaseSchema {
  members: Member[];
  assessmentLogs: AssessmentLog[];
}

const IS_VERCEL = Boolean(process.env.VERCEL || process.env.NOW_REGION);
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), 'st5-wellness-data')
  : path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export function ensureDataDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function getUploadsDir(): string {
  ensureDataDirs();
  return UPLOADS_DIR;
}

export function classifyStressText(totalScore: number): StressResultText {
  if (totalScore <= 4) return 'ความเครียดน้อย';
  if (totalScore <= 7) return 'ความเครียดปานกลาง';
  if (totalScore <= 9) return 'ความเครียดมาก';
  return 'ความเครียดมากที่สุด';
}

function makeSeedData(): DatabaseSchema {
  const members: Member[] = [
    {
      st_id: '64010001',
      prefix: 'นางสาว',
      name: 'นิชาภา',
      lname: 'ใจดี',
      dob: '29102534',
      email: 'nichapa.j@kmpht.ac.th',
      course: 'วทบ.เวชระเบียน',
      profile_img: '',
    },
    {
      st_id: '64010002',
      prefix: 'นาย',
      name: 'ธนกฤต',
      lname: 'รักษ์สุขภาพ',
      dob: '15052546',
      email: 'thanakrit.r@kmpht.ac.th',
      course: 'วทบ.เวชระเบียน',
      profile_img: '',
    },
    {
      st_id: '64010003',
      prefix: 'นางสาว',
      name: 'พิมพ์ชนก',
      lname: 'สุขสวัสดิ์',
      dob: '08082547',
      email: 'pimchanok.s@kmpht.ac.th',
      course: 'ปวส.เวชระเบียน',
      profile_img: '',
    },
    {
      st_id: '64010004',
      prefix: 'นาย',
      name: 'ปภังกร',
      lname: 'วงศ์เวช',
      dob: '12032547',
      email: 'paphangkorn.w@kmpht.ac.th',
      course: 'ปวส.เวชระเบียน',
      profile_img: '',
    },
    {
      st_id: '64010005',
      prefix: 'นางสาว',
      name: 'กัญญารัตน์',
      lname: 'ศรีมงคล',
      dob: '21112546',
      email: 'kanyarat.s@kmpht.ac.th',
      course: 'วทบ.เวชระเบียน',
      profile_img: '',
    },
    {
      st_id: '64010006',
      prefix: 'นาย',
      name: 'ศิริชัย',
      lname: 'ทองแท้',
      dob: '04092547',
      email: 'sirichai.t@kmpht.ac.th',
      course: 'ปวส.เวชระเบียน',
      profile_img: '',
    },
    {
      st_id: '64010007',
      prefix: 'นางสาว',
      name: 'วรัญญา',
      lname: 'แก้วมณี',
      dob: '17012547',
      email: 'waranya.k@kmpht.ac.th',
      course: 'วทบ.เวชระเบียน',
      profile_img: '',
    },
    {
      st_id: '64010008',
      prefix: 'นางสาว',
      name: 'ชุติมา',
      lname: 'บุญมี',
      dob: '25062547',
      email: 'chutima.b@kmpht.ac.th',
      course: 'ปวส.เวชระเบียน',
      profile_img: '',
    },
    {
      st_id: '64010009',
      prefix: 'นาย',
      name: 'ณัฐวุฒิ',
      lname: 'อินทร์แก้ว',
      dob: '10122546',
      email: 'nattawut.i@kmpht.ac.th',
      course: 'วทบ.เวชระเบียน',
      profile_img: '',
    },
    {
      st_id: '64010010',
      prefix: 'นาง',
      name: 'สุภาพร',
      lname: 'เจริญผล',
      dob: '03042545',
      email: 'supaporn.c@kmpht.ac.th',
      course: 'ปวส.เวชระเบียน',
      profile_img: '',
    },
  ];

  const rawLogs: Array<{
    st_id: string;
    date_time: string;
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
  }> = [
    { st_id: '64010001', date_time: '2026-10-06 09:30:00', q1: 1, q2: 1, q3: 1, q4: 0, q5: 0 },
    { st_id: '64010002', date_time: '2026-10-07 11:15:00', q1: 1, q2: 0, q3: 1, q4: 1, q5: 0 },
    { st_id: '64010003', date_time: '2026-10-08 14:20:00', q1: 2, q2: 1, q3: 1, q4: 1, q5: 1 },
    { st_id: '64010004', date_time: '2026-10-13 10:05:00', q1: 1, q2: 1, q3: 1, q4: 1, q5: 0 },
    { st_id: '64010005', date_time: '2026-10-14 15:40:00', q1: 2, q2: 2, q3: 1, q4: 1, q5: 1 },
    { st_id: '64010001', date_time: '2026-10-15 16:10:00', q1: 2, q2: 1, q3: 1, q4: 1, q5: 0 },
    { st_id: '64010006', date_time: '2026-10-16 09:45:00', q1: 0, q2: 1, q3: 1, q4: 0, q5: 0 },
    { st_id: '64010007', date_time: '2026-10-20 13:25:00', q1: 2, q2: 2, q3: 2, q4: 1, q5: 1 },
    { st_id: '64010008', date_time: '2026-10-21 17:00:00', q1: 3, q2: 2, q3: 2, q4: 2, q5: 1 },
    { st_id: '64010002', date_time: '2026-10-22 10:30:00', q1: 2, q2: 1, q3: 2, q4: 1, q5: 0 },
    { st_id: '64010009', date_time: '2026-10-23 14:50:00', q1: 1, q2: 2, q3: 1, q4: 1, q5: 1 },
    { st_id: '64010001', date_time: '2026-10-27 11:20:00', q1: 2, q2: 2, q3: 2, q4: 1, q5: 1 },
    { st_id: '64010010', date_time: '2026-10-28 09:10:00', q1: 1, q2: 1, q3: 1, q4: 0, q5: 1 },
    { st_id: '64010003', date_time: '2026-10-29 15:05:00', q1: 2, q2: 1, q3: 2, q4: 2, q5: 1 },
    { st_id: '64010005', date_time: '2026-10-30 16:40:00', q1: 1, q2: 1, q3: 1, q4: 1, q5: 0 },
    { st_id: '64010004', date_time: '2026-11-03 10:15:00', q1: 1, q2: 0, q3: 1, q4: 1, q5: 0 },
    { st_id: '64010006', date_time: '2026-11-04 13:45:00', q1: 1, q2: 1, q3: 1, q4: 1, q5: 1 },
    { st_id: '64010007', date_time: '2026-11-05 14:20:00', q1: 1, q2: 1, q3: 0, q4: 1, q5: 0 },
    { st_id: '64010001', date_time: '2026-11-06 18:00:00', q1: 1, q2: 1, q3: 1, q4: 0, q5: 1 },
    { st_id: '64010008', date_time: '2026-11-10 09:50:00', q1: 2, q2: 1, q3: 1, q4: 1, q5: 0 },
    { st_id: '64010009', date_time: '2026-11-11 11:30:00', q1: 0, q2: 1, q3: 1, q4: 0, q5: 0 },
    { st_id: '64010010', date_time: '2026-11-12 15:15:00', q1: 1, q2: 1, q3: 0, q4: 1, q5: 0 },
    { st_id: '64010002', date_time: '2026-11-13 16:45:00', q1: 1, q2: 0, q3: 1, q4: 0, q5: 0 },
    { st_id: '64010001', date_time: '2026-11-16 09:15:00', q1: 1, q2: 1, q3: 0, q4: 1, q5: 0 },
    { st_id: '64010003', date_time: '2026-11-16 11:40:00', q1: 1, q2: 2, q3: 1, q4: 1, q5: 0 },
  ];

  const assessmentLogs: AssessmentLog[] = rawLogs.map((item, idx) => {
    const total_score = item.q1 + item.q2 + item.q3 + item.q4 + item.q5;
    return {
      log_id: `LOG-${String(idx + 1).padStart(4, '0')}`,
      st_id: item.st_id,
      date_time: item.date_time,
      q1: item.q1,
      q2: item.q2,
      q3: item.q3,
      q4: item.q4,
      q5: item.q5,
      total_score,
      result_text: classifyStressText(total_score),
    };
  });

  return { members, assessmentLogs };
}

let memoryFallbackDb: DatabaseSchema | null = null;

function readDb(): DatabaseSchema {
  try {
    ensureDataDirs();
    if (!fs.existsSync(DB_FILE)) {
      const seed = makeSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf8');
      return seed;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch {
    if (!memoryFallbackDb) {
      memoryFallbackDb = makeSeedData();
    }
    return memoryFallbackDb;
  }
}

function writeDb(db: DatabaseSchema) {
  memoryFallbackDb = db;
  try {
    ensureDataDirs();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch {
    // Fallback gracefully to in-memory storage if filesystem is read-only
  }
}

export function sanitizeMember(member: Member): PublicMember {
  const { dob: _dob, ...rest } = member;
  return rest;
}

export function authenticateMember(st_id: string, dob: string): PublicMember | null {
  const db = readDb();
  const normalizedId = st_id.trim();
  const normalizedDob = dob.trim();
  const found = db.members.find(
    (m) => m.st_id === normalizedId && m.dob === normalizedDob,
  );
  return found ? sanitizeMember(found) : null;
}

export function registerMember(input: {
  st_id: string;
  prefix: PrefixOption;
  name: string;
  lname: string;
  dob: string;
  email: string;
  course: CourseOption;
  profileImgBase64?: string;
}): { ok: true; member: PublicMember } | { ok: false; error: string } {
  const db = readDb();
  const st_id = input.st_id.trim();
  const dob = input.dob.trim();
  const name = input.name.trim();
  const lname = input.lname.trim();
  const email = input.email.trim();

  if (!st_id) {
    return { ok: false, error: 'กรุณากรอกรหัสนักศึกษา' };
  }
  if (db.members.some((m) => m.st_id === st_id)) {
    return { ok: false, error: `รหัสนักศึกษา ${st_id} มีอยู่ในระบบแล้ว` };
  }
  if (!/^\d{8}$/.test(dob)) {
    return {
      ok: false,
      error: 'วันเดือนปีเกิดต้องเป็นตัวเลข 8 หลัก รูปแบบ ววดดปปปป (พ.ศ.) เช่น 29102534',
    };
  }
  if (!name || !lname) {
    return { ok: false, error: 'กรุณากรอกชื่อและนามสกุลภาษาไทยให้ครบถ้วน' };
  }
  if (!email || !email.includes('@')) {
    return { ok: false, error: 'กรุณากรอกอีเมลให้ถูกต้อง' };
  }

  let profile_img = '';
  if (input.profileImgBase64) {
    const saved = saveBase64ProfileImage(st_id, input.profileImgBase64);
    if (saved) {
      profile_img = saved;
    }
  }

  const newMember: Member = {
    st_id,
    prefix: input.prefix,
    name,
    lname,
    dob,
    email,
    course: input.course,
    profile_img,
  };

  db.members.push(newMember);
  writeDb(db);
  return { ok: true, member: sanitizeMember(newMember) };
}

export function updateMemberAvatar(st_id: string, profileImgBase64: string): PublicMember | null {
  const db = readDb();
  const member = db.members.find((m) => m.st_id === st_id);
  if (!member) return null;

  const saved = saveBase64ProfileImage(st_id, profileImgBase64);
  if (!saved) return null;

  member.profile_img = saved;
  writeDb(db);
  return sanitizeMember(member);
}

function saveBase64ProfileImage(st_id: string, dataUrl: string): string | null {
  const match = /^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i.exec(dataUrl);
  if (!match) return null;

  const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 4 * 1024 * 1024) return null;

  // On Vercel serverless instances, local disk is ephemeral across invocations,
  // so keep validated Data URL directly for reliable rendering.
  if (IS_VERCEL) {
    return dataUrl;
  }

  try {
    const safeId = st_id.replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `profile_${safeId}_${Date.now()}.${ext}`;
    const fullPath = path.join(getUploadsDir(), filename);
    fs.writeFileSync(fullPath, buffer);
    return `/uploads/${filename}`;
  } catch {
    return dataUrl;
  }
}

export function getMemberById(st_id: string): PublicMember | null {
  const db = readDb();
  const found = db.members.find((m) => m.st_id === st_id);
  return found ? sanitizeMember(found) : null;
}

export function getMemberAssessments(st_id: string): AssessmentLog[] {
  const db = readDb();
  return db.assessmentLogs
    .filter((log) => log.st_id === st_id)
    .sort((a, b) => b.date_time.localeCompare(a.date_time));
}

function formatNowDateTime(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours(),
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export function createAssessmentLog(input: {
  st_id: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
}): { ok: true; log: AssessmentLog } | { ok: false; error: string } {
  const db = readDb();
  const memberExists = db.members.some((m) => m.st_id === input.st_id);
  if (!memberExists) {
    return { ok: false, error: 'ไม่พบข้อมูลนักศึกษาในระบบ กรุณาเข้าสู่ระบบใหม่อีกครั้ง' };
  }

  const scores = [input.q1, input.q2, input.q3, input.q4, input.q5];
  if (scores.some((s) => !Number.isInteger(s) || s < 0 || s > 3)) {
    return { ok: false, error: 'คะแนนแต่ละข้อต้องอยู่ระหว่าง 0 ถึง 3' };
  }

  const total_score = scores.reduce((acc, val) => acc + val, 0);
  const log: AssessmentLog = {
    log_id: `LOG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    st_id: input.st_id,
    date_time: formatNowDateTime(),
    q1: input.q1,
    q2: input.q2,
    q3: input.q3,
    q4: input.q4,
    q5: input.q5,
    total_score,
    result_text: classifyStressText(total_score),
  };

  db.assessmentLogs.push(log);
  writeDb(db);
  return { ok: true, log };
}

const THAI_SHORT_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

function getWeekMondayKey(dateTimeStr: string): string {
  const datePart = dateTimeStr.slice(0, 10);
  const [y, m, d] = datePart.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const day = dt.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  dt.setUTCDate(dt.getUTCDate() + diffToMonday);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function formatThaiWeekLabel(mondayKey: string): string {
  const [, m, d] = mondayKey.split('-').map(Number);
  return `${d} ${THAI_SHORT_MONTHS[m - 1]}`;
}

export function getDashboardStats(): DashboardStats {
  const db = readDb();
  const members = db.members;
  const logs = db.assessmentLogs;

  const totalMembers = members.length;
  const totalAssessments = logs.length;
  const overallAvgScore =
    totalAssessments > 0
      ? Number(
          (logs.reduce((sum, l) => sum + l.total_score, 0) / totalAssessments).toFixed(2),
        )
      : 0;

  const lowStressCount = logs.filter((l) => l.total_score <= 4).length;
  const lowStressRate =
    totalAssessments > 0 ? Number(((lowStressCount / totalAssessments) * 100).toFixed(1)) : 0;

  const courses: CourseOption[] = ['ปวส.เวชระเบียน', 'วทบ.เวชระเบียน'];
  const courseStats: CourseStat[] = courses.map((course) => {
    const courseMembers = members.filter((m) => m.course === course);
    const courseMemberIds = new Set(courseMembers.map((m) => m.st_id));
    const courseLogs = logs.filter((l) => courseMemberIds.has(l.st_id));
    const avgScore =
      courseLogs.length > 0
        ? Number(
            (courseLogs.reduce((s, l) => s + l.total_score, 0) / courseLogs.length).toFixed(2),
          )
        : 0;
    return {
      course,
      memberCount: courseMembers.length,
      memberPercent:
        totalMembers > 0
          ? Number(((courseMembers.length / totalMembers) * 100).toFixed(1))
          : 0,
      assessmentCount: courseLogs.length,
      avgScore,
    };
  });

  const getGender = (prefix: PrefixOption): 'ชาย' | 'หญิง' =>
    prefix === 'นาย' ? 'ชาย' : 'หญิง';

  const genders: Array<'ชาย' | 'หญิง'> = ['ชาย', 'หญิง'];
  const genderStats: GenderStat[] = genders.map((gender) => {
    const genderMembers = members.filter((m) => getGender(m.prefix) === gender);
    const genderMemberIds = new Set(genderMembers.map((m) => m.st_id));
    const genderLogs = logs.filter((l) => genderMemberIds.has(l.st_id));
    const avgScore =
      genderLogs.length > 0
        ? Number(
            (genderLogs.reduce((s, l) => s + l.total_score, 0) / genderLogs.length).toFixed(2),
          )
        : 0;
    return {
      gender,
      memberCount: genderMembers.length,
      memberPercent:
        totalMembers > 0
          ? Number(((genderMembers.length / totalMembers) * 100).toFixed(1))
          : 0,
      assessmentCount: genderLogs.length,
      avgScore,
    };
  });

  const weekGroups = new Map<string, AssessmentLog[]>();
  for (const log of logs) {
    const key = getWeekMondayKey(log.date_time);
    const arr = weekGroups.get(key) ?? [];
    arr.push(log);
    weekGroups.set(key, arr);
  }

  const weeklyTrend: WeeklyTrendPoint[] = Array.from(weekGroups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-10)
    .map(([weekKey, weekLogs]) => {
      const avgScore = Number(
        (weekLogs.reduce((s, l) => s + l.total_score, 0) / weekLogs.length).toFixed(2),
      );
      return {
        weekKey,
        weekLabel: formatThaiWeekLabel(weekKey),
        avgScore,
        assessmentCount: weekLogs.length,
        dominantLevel: classifyStressText(Math.round(avgScore)),
      };
    });

  const levels: StressResultText[] = [
    'ความเครียดน้อย',
    'ความเครียดปานกลาง',
    'ความเครียดมาก',
    'ความเครียดมากที่สุด',
  ];
  const levelDistribution: LevelDistribution[] = levels.map((level) => {
    const count = logs.filter((l) => l.result_text === level).length;
    return {
      level,
      count,
      percent: totalAssessments > 0 ? Number(((count / totalAssessments) * 100).toFixed(1)) : 0,
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
    levelDistribution,
  };
}
