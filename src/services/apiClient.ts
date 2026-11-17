import {
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
} from '../types/st5';

const LOCAL_DB_KEY = 'st5_wellness_local_db_v1';

interface LocalDbSchema {
  members: Member[];
  assessmentLogs: AssessmentLog[];
}

function classifyStressText(totalScore: number): StressResultText {
  if (totalScore <= 4) return 'ความเครียดน้อย';
  if (totalScore <= 7) return 'ความเครียดปานกลาง';
  if (totalScore <= 9) return 'ความเครียดมาก';
  return 'ความเครียดมากที่สุด';
}

function makeInitialLocalDb(): LocalDbSchema {
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

  const rawLogs = [
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

function readLocalDb(): LocalDbSchema {
  try {
    const raw = localStorage.getItem(LOCAL_DB_KEY);
    if (!raw) {
      const seed = makeInitialLocalDb();
      localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as LocalDbSchema;
  } catch {
    return makeInitialLocalDb();
  }
}

function writeLocalDb(db: LocalDbSchema) {
  try {
    localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
  } catch {
    // Ignore storage quota errors
  }
}

function sanitizeMember(member: Member): PublicMember {
  const { dob: _dob, ...rest } = member;
  return rest;
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

function computeLocalDashboard(): DashboardStats {
  const db = readLocalDb();
  const { members, assessmentLogs: logs } = db;

  const totalMembers = members.length;
  const totalAssessments = logs.length;
  const overallAvgScore =
    totalAssessments > 0
      ? Number((logs.reduce((s, l) => s + l.total_score, 0) / totalAssessments).toFixed(2))
      : 0;
  const lowStressCount = logs.filter((l) => l.total_score <= 4).length;
  const lowStressRate =
    totalAssessments > 0 ? Number(((lowStressCount / totalAssessments) * 100).toFixed(1)) : 0;

  const courses: CourseOption[] = ['ปวส.เวชระเบียน', 'วทบ.เวชระเบียน'];
  const courseStats: CourseStat[] = courses.map((course) => {
    const courseMembers = members.filter((m) => m.course === course);
    const ids = new Set(courseMembers.map((m) => m.st_id));
    const courseLogs = logs.filter((l) => ids.has(l.st_id));
    const avgScore =
      courseLogs.length > 0
        ? Number((courseLogs.reduce((s, l) => s + l.total_score, 0) / courseLogs.length).toFixed(2))
        : 0;
    return {
      course,
      memberCount: courseMembers.length,
      memberPercent:
        totalMembers > 0 ? Number(((courseMembers.length / totalMembers) * 100).toFixed(1)) : 0,
      assessmentCount: courseLogs.length,
      avgScore,
    };
  });

  const genders: Array<'ชาย' | 'หญิง'> = ['ชาย', 'หญิง'];
  const genderStats: GenderStat[] = genders.map((gender) => {
    const gMembers = members.filter((m) => (m.prefix === 'นาย' ? 'ชาย' : 'หญิง') === gender);
    const ids = new Set(gMembers.map((m) => m.st_id));
    const gLogs = logs.filter((l) => ids.has(l.st_id));
    const avgScore =
      gLogs.length > 0
        ? Number((gLogs.reduce((s, l) => s + l.total_score, 0) / gLogs.length).toFixed(2))
        : 0;
    return {
      gender,
      memberCount: gMembers.length,
      memberPercent:
        totalMembers > 0 ? Number(((gMembers.length / totalMembers) * 100).toFixed(1)) : 0,
      assessmentCount: gLogs.length,
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

function formatNowDateTime(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours(),
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

async function tryFetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<{ reachable: true; status: number; data: T } | { reachable: false }> {
  try {
    const res = await fetch(url, init);
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return { reachable: false };
    }
    const data = (await res.json()) as T;
    return { reachable: true, status: res.status, data };
  } catch {
    return { reachable: false };
  }
}

export async function fetchDashboardApi(): Promise<DashboardStats> {
  const remote = await tryFetchJson<DashboardStats>('/api/dashboard');
  if (remote.reachable && remote.status >= 200 && remote.status < 300) {
    return remote.data;
  }
  return computeLocalDashboard();
}

export async function loginApi(
  st_id: string,
  dob: string,
): Promise<{ ok: true; member: PublicMember } | { ok: false; error: string }> {
  const remote = await tryFetchJson<{ member?: PublicMember; error?: string }>(
    '/api/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ st_id, dob }),
    },
  );

  if (remote.reachable) {
    if (remote.status >= 200 && remote.status < 300 && remote.data.member) {
      return { ok: true, member: remote.data.member };
    }
    if (remote.status >= 400 && remote.status < 500) {
      return {
        ok: false,
        error: remote.data.error ?? 'รหัสนักศึกษาหรือวันเดือนปีเกิดไม่ถูกต้อง',
      };
    }
  }

  // Fallback to local database if server API is unavailable
  const db = readLocalDb();
  const found = db.members.find(
    (m) => m.st_id === st_id.trim() && m.dob === dob.trim(),
  );
  if (!found) {
    return {
      ok: false,
      error: 'รหัสนักศึกษาหรือวันเดือนปีเกิด (ววดดปปปป พ.ศ.) ไม่ถูกต้อง',
    };
  }
  return { ok: true, member: sanitizeMember(found) };
}

export async function registerApi(input: {
  st_id: string;
  prefix: PrefixOption;
  name: string;
  lname: string;
  dob: string;
  email: string;
  course: CourseOption;
  profileImgBase64?: string;
}): Promise<{ ok: true; member: PublicMember } | { ok: false; error: string }> {
  const remote = await tryFetchJson<{ member?: PublicMember; error?: string }>(
    '/api/auth/register',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (remote.reachable) {
    if (remote.status >= 200 && remote.status < 300 && remote.data.member) {
      return { ok: true, member: remote.data.member };
    }
    if (remote.status >= 400 && remote.status < 500) {
      return {
        ok: false,
        error: remote.data.error ?? 'ลงทะเบียนไม่สำเร็จ กรุณาตรวจสอบข้อมูล',
      };
    }
  }

  // Fallback local persistence
  const db = readLocalDb();
  const st_id = input.st_id.trim();
  const dob = input.dob.trim();

  if (!st_id) return { ok: false, error: 'กรุณากรอกรหัสนักศึกษา' };
  if (db.members.some((m) => m.st_id === st_id)) {
    return { ok: false, error: `รหัสนักศึกษา ${st_id} มีอยู่ในระบบแล้ว` };
  }
  if (!/^\d{8}$/.test(dob)) {
    return {
      ok: false,
      error: 'วันเดือนปีเกิดต้องเป็นตัวเลข 8 หลัก รูปแบบ ววดดปปปป (พ.ศ.) เช่น 29102534',
    };
  }

  const newMember: Member = {
    st_id,
    prefix: input.prefix,
    name: input.name.trim(),
    lname: input.lname.trim(),
    dob,
    email: input.email.trim(),
    course: input.course,
    profile_img: input.profileImgBase64 ?? '',
  };

  db.members.push(newMember);
  writeLocalDb(db);
  return { ok: true, member: sanitizeMember(newMember) };
}

export async function getMemberApi(st_id: string): Promise<PublicMember | null> {
  const remote = await tryFetchJson<{ member?: PublicMember }>(
    `/api/member/${encodeURIComponent(st_id)}`,
  );
  if (remote.reachable && remote.status >= 200 && remote.status < 300 && remote.data.member) {
    return remote.data.member;
  }

  const db = readLocalDb();
  const found = db.members.find((m) => m.st_id === st_id);
  return found ? sanitizeMember(found) : null;
}

export async function updateAvatarApi(
  st_id: string,
  profileImgBase64: string,
): Promise<{ ok: true; member: PublicMember } | { ok: false; error: string }> {
  const remote = await tryFetchJson<{ member?: PublicMember; error?: string }>(
    '/api/member/avatar',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ st_id, profileImgBase64 }),
    },
  );
  if (remote.reachable && remote.status >= 200 && remote.status < 300 && remote.data.member) {
    return { ok: true, member: remote.data.member };
  }

  const db = readLocalDb();
  const member = db.members.find((m) => m.st_id === st_id);
  if (!member) return { ok: false, error: 'ไม่พบข้อมูลนักศึกษา' };
  member.profile_img = profileImgBase64;
  writeLocalDb(db);
  return { ok: true, member: sanitizeMember(member) };
}

export async function getAssessmentsApi(st_id: string): Promise<AssessmentLog[]> {
  const remote = await tryFetchJson<{ logs?: AssessmentLog[] }>(
    `/api/assessments/${encodeURIComponent(st_id)}`,
  );
  if (remote.reachable && remote.status >= 200 && remote.status < 300 && remote.data.logs) {
    return remote.data.logs;
  }

  const db = readLocalDb();
  return db.assessmentLogs
    .filter((l) => l.st_id === st_id)
    .sort((a, b) => b.date_time.localeCompare(a.date_time));
}

export async function createAssessmentApi(input: {
  st_id: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
}): Promise<{ ok: true; log: AssessmentLog } | { ok: false; error: string }> {
  const remote = await tryFetchJson<{ log?: AssessmentLog; error?: string }>(
    '/api/assessments',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );
  if (remote.reachable) {
    if (remote.status >= 200 && remote.status < 300 && remote.data.log) {
      return { ok: true, log: remote.data.log };
    }
    if (remote.status >= 400 && remote.status < 500) {
      return {
        ok: false,
        error: remote.data.error ?? 'ไม่สามารถบันทึกผลการประเมินได้',
      };
    }
  }

  const db = readLocalDb();
  const total_score = input.q1 + input.q2 + input.q3 + input.q4 + input.q5;
  const log: AssessmentLog = {
    log_id: `LOG-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
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
  writeLocalDb(db);
  return { ok: true, log };
}
