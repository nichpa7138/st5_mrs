export type PrefixOption = 'นาย' | 'นางสาว' | 'นาง';

export type CourseOption = 'ปวส.เวชระเบียน' | 'วทบ.เวชระเบียน';

export type StressResultText =
  | 'ความเครียดน้อย'
  | 'ความเครียดปานกลาง'
  | 'ความเครียดมาก'
  | 'ความเครียดมากที่สุด';

export interface Member {
  st_id: string;
  prefix: PrefixOption;
  name: string;
  lname: string;
  dob: string; // 8 digits DDMMYYYY (BE), e.g., 29102534
  email: string;
  course: CourseOption;
  profile_img: string;
}

export type PublicMember = Omit<Member, 'dob'>;

export interface AssessmentLog {
  log_id: string;
  st_id: string;
  date_time: string; // YYYY-MM-DD HH:mm:ss
  q1: number; // 0-3
  q2: number; // 0-3
  q3: number; // 0-3
  q4: number; // 0-3
  q5: number; // 0-3
  total_score: number; // 0-15
  result_text: StressResultText;
}

export interface CourseStat {
  course: CourseOption;
  memberCount: number;
  memberPercent: number;
  assessmentCount: number;
  avgScore: number;
}

export interface GenderStat {
  gender: 'ชาย' | 'หญิง';
  memberCount: number;
  memberPercent: number;
  assessmentCount: number;
  avgScore: number;
}

export interface WeeklyTrendPoint {
  weekKey: string;
  weekLabel: string;
  avgScore: number;
  assessmentCount: number;
  dominantLevel: StressResultText;
}

export interface LevelDistribution {
  level: StressResultText;
  count: number;
  percent: number;
}

export interface DashboardStats {
  totalMembers: number;
  totalAssessments: number;
  overallAvgScore: number;
  lowStressRate: number;
  courseStats: CourseStat[];
  genderStats: GenderStat[];
  weeklyTrend: WeeklyTrendPoint[];
  levelDistribution: LevelDistribution[];
}

export interface St5Question {
  id: 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
  number: number;
  title: string;
  detail: string;
}

export const ST5_QUESTIONS: St5Question[] = [
  {
    id: 'q1',
    number: 1,
    title: 'มีปัญหาการนอน นอนไม่หลับหรือนอนมาก',
    detail: 'หลับยาก ตื่นกลางดึก หรือรู้สึกนอนเท่าไรก็ไม่เพียงพอ',
  },
  {
    id: 'q2',
    number: 2,
    title: 'มีสมาธิน้อยลง',
    detail: 'วอกแวกง่าย จดจ่อกับการเรียนหรือการอ่านหนังสือได้ลดลง',
  },
  {
    id: 'q3',
    number: 3,
    title: 'หงุดหงิด / กระวนกระวาย / ว้าวุ่นใจ',
    detail: 'ใจร้อน รู้สึกไม่สบายใจ หรือกังวลใจกับเรื่องรอบตัวได้ง่ายขึ้น',
  },
  {
    id: 'q4',
    number: 4,
    title: 'รู้สึกเบื่อ เซ็ง',
    detail: 'ขาดแรงจูงใจ ไม่อยากทำกิจกรรมที่เคยชอบหรือรู้สึกเหนื่อยหน่าย',
  },
  {
    id: 'q5',
    number: 5,
    title: 'ไม่อยากพบปะผู้คน',
    detail: 'อยากปลีกตัว ไม่อยากพูดคุยหรือเข้าสังคมกับเพื่อนและคนรอบข้าง',
  },
];

export const ST5_CHOICES: { value: number; label: string; hint: string }[] = [
  { value: 0, label: 'แทบไม่มี', hint: '0 คะแนน' },
  { value: 1, label: 'เป็นบางครั้ง', hint: '1 คะแนน' },
  { value: 2, label: 'บ่อยครั้ง', hint: '2 คะแนน' },
  { value: 3, label: 'เป็นประจำ', hint: '3 คะแนน' },
];

export interface StressInterpretation {
  level: StressResultText;
  happinessLabel: string;
  rangeLabel: string;
  emoji: string;
  summary: string;
  advice: string[];
  badgeTextClass: string;
  surfaceTintClass: string;
  borderTintClass: string;
  barColor: string;
}

export function interpretStressScore(score: number): StressInterpretation {
  if (score <= 4) {
    return {
      level: 'ความเครียดน้อย',
      happinessLabel: 'ความสุขอยู่ในเกณฑ์ดีมาก',
      rangeLabel: '0 – 4 คะแนน',
      emoji: '😊',
      summary: 'สภาพจิตใจของคุณสมดุลและรับมือกับความท้าทายในชีวิตประจำวันได้ดี',
      advice: [
        'รักษาสมดุลเวลาเรียน การพักผ่อน และการทำกิจกรรมที่ชื่นชอบอย่างต่อเนื่อง',
        'นอนหลับให้เพียงพอวันละ 7–8 ชั่วโมง และออกกำลังกายสม่ำเสมอ',
        'แบ่งปันพลังบวกและดูแลรับฟังเพื่อนร่วมชั้นเรียนรอบตัว',
      ],
      badgeTextClass: 'text-emerald-700',
      surfaceTintClass: 'bg-emerald-50/70',
      borderTintClass: 'border-emerald-200',
      barColor: '#10B981',
    };
  }
  if (score <= 7) {
    return {
      level: 'ความเครียดปานกลาง',
      happinessLabel: 'ความสุขอยู่ในเกณฑ์ปกติ (ควรผ่อนคลายเพิ่ม)',
      rangeLabel: '5 – 7 คะแนน',
      emoji: '🙂',
      summary: 'เริ่มมีความตึงเครียดสะสมเล็กน้อยจากการเรียนหรือภารกิจประจำวัน แต่ยังจัดการได้',
      advice: [
        'จัดตารางอ่านหนังสือและพักเบรกสั้นๆ 10 นาทีทุกชั่วโมง เพื่อลดความล้าทางสมอง',
        'ฝึกหายใจลึกๆ (Deep Breathing) หรือฟังเพลงผ่อนคลายก่อนเข้านอน',
        'พูดคุยแลกเปลี่ยนความรู้สึกกับเพื่อนสนิทหรือครอบครัวเมื่อรู้สึกกังวล',
      ],
      badgeTextClass: 'text-amber-700',
      surfaceTintClass: 'bg-amber-50/70',
      borderTintClass: 'border-amber-200',
      barColor: '#F59E0B',
    };
  }
  if (score <= 9) {
    return {
      level: 'ความเครียดมาก',
      happinessLabel: 'ความสุขลดลง (ควรได้รับการดูแลและพักผ่อน)',
      rangeLabel: '8 – 9 คะแนน',
      emoji: '😟',
      summary: 'คุณกำลังเผชิญความเครียดในระดับสูง ซึ่งอาจส่งผลต่อการนอน สมาธิ และอารมณ์',
      advice: [
        'ลดภาระงานหรือกิจกรรมเสริมที่ไม่เร่งด่วนชั่วคราว และให้เวลากับการพักผ่อนมากขึ้น',
        'หลีกเลี่ยงคาเฟอีนช่วงบ่าย-เย็น และงดใช้หน้าจอก่อนนอนอย่างน้อย 30 นาที',
        'ปรึกษาอาจารย์ที่ปรึกษา หรือศูนย์ให้คำปรึกษาสุขภาพจิตนักศึกษาเพื่อหาทางผ่อนคลายร่วมกัน',
      ],
      badgeTextClass: 'text-orange-700',
      surfaceTintClass: 'bg-orange-50/70',
      borderTintClass: 'border-orange-200',
      barColor: '#F97316',
    };
  }
  return {
    level: 'ความเครียดมากที่สุด',
    happinessLabel: 'ต้องการการดูแลสุขภาพใจอย่างเร่งด่วน',
    rangeLabel: '10 – 15 คะแนน',
    emoji: '🥺',
    summary: 'ระดับความเครียดอยู่ในเกณฑ์สูงมาก ควรได้รับการรับฟังและคำแนะนำจากผู้เชี่ยวชาญโดยเร็ว',
    advice: [
      'ติดต่ออาจารย์ที่ปรึกษา หรือทีมแนะแนว/นักจิตวิทยาประจำสถานศึกษาเพื่อขอรับการดูแล',
      'อย่าเก็บความกังวลไว้คนเดียว พูดคุยกับผู้ที่ไว้วางใจได้ทันทีวันนี้',
      'สามารถโทรสายด่วนสุขภาพจิต 1323 (ฟรี ตลอด 24 ชั่วโมง) เพื่อรับคำปรึกษาจากผู้เชี่ยวชาญ',
    ],
    badgeTextClass: 'text-rose-700',
    surfaceTintClass: 'bg-rose-50/80',
    borderTintClass: 'border-rose-200',
    barColor: '#E11D48',
  };
}
