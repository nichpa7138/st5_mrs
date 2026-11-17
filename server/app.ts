import express from 'express';
import {
  authenticateMember,
  createAssessmentLog,
  getDashboardStats,
  getMemberAssessments,
  getMemberById,
  getUploadsDir,
  registerMember,
  updateMemberAvatar,
} from './db';
import type { CourseOption, PrefixOption } from '../src/types/st5';

export function createApiApp() {
  const app = express();

  app.use(express.json({ limit: '5mb' }));

  try {
    app.use('/uploads', express.static(getUploadsDir()));
  } catch {
    // Ignore if filesystem is unavailable
  }

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/dashboard', (_req, res) => {
    try {
      const stats = getDashboardStats();
      res.json(stats);
    } catch (err) {
      console.error('Error building dashboard stats:', err);
      res.status(500).json({ error: 'ไม่สามารถโหลดข้อมูลสรุปสถิติได้' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { st_id, dob } = req.body as { st_id?: string; dob?: string };
    if (!st_id || !dob) {
      return res.status(400).json({ error: 'กรุณากรอกรหัสนักศึกษาและวันเดือนปีเกิด' });
    }

    const member = authenticateMember(st_id, dob);
    if (!member) {
      return res.status(401).json({
        error: 'รหัสนักศึกษาหรือวันเดือนปีเกิด (ววดดปปปป พ.ศ.) ไม่ถูกต้อง',
      });
    }
    return res.json({ member });
  });

  app.post('/api/auth/register', (req, res) => {
    const body = req.body as {
      st_id?: string;
      prefix?: PrefixOption;
      name?: string;
      lname?: string;
      dob?: string;
      email?: string;
      course?: CourseOption;
      profileImgBase64?: string;
    };

    const allowedPrefixes: PrefixOption[] = ['นาย', 'นางสาว', 'นาง'];
    const allowedCourses: CourseOption[] = ['ปวส.เวชระเบียน', 'วทบ.เวชระเบียน'];

    if (!body.prefix || !allowedPrefixes.includes(body.prefix)) {
      return res.status(400).json({ error: 'กรุณาเลือกคำนำหน้าชื่อ' });
    }
    if (!body.course || !allowedCourses.includes(body.course)) {
      return res.status(400).json({ error: 'กรุณาเลือกหลักสูตร / สาขาวิชา' });
    }

    const result = registerMember({
      st_id: body.st_id ?? '',
      prefix: body.prefix,
      name: body.name ?? '',
      lname: body.lname ?? '',
      dob: body.dob ?? '',
      email: body.email ?? '',
      course: body.course,
      profileImgBase64: body.profileImgBase64,
    });

    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json({ member: result.member });
  });

  app.post('/api/member/avatar', (req, res) => {
    const { st_id, profileImgBase64 } = req.body as {
      st_id?: string;
      profileImgBase64?: string;
    };
    if (!st_id || !profileImgBase64) {
      return res.status(400).json({ error: 'ข้อมูลรูปภาพไม่สมบูรณ์' });
    }
    const updated = updateMemberAvatar(st_id, profileImgBase64);
    if (!updated) {
      return res.status(400).json({
        error: 'ไม่สามารถอัปโหลดรูปภาพได้ (รองรับ PNG/JPG/WEBP ขนาดไม่เกิน 4MB)',
      });
    }
    return res.json({ member: updated });
  });

  app.get('/api/member/:st_id', (req, res) => {
    const member = getMemberById(req.params.st_id);
    if (!member) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลนักศึกษา' });
    }
    return res.json({ member });
  });

  app.get('/api/assessments/:st_id', (req, res) => {
    const logs = getMemberAssessments(req.params.st_id);
    res.json({ logs });
  });

  app.post('/api/assessments', (req, res) => {
    const body = req.body as {
      st_id?: string;
      q1?: number;
      q2?: number;
      q3?: number;
      q4?: number;
      q5?: number;
    };

    if (!body.st_id) {
      return res.status(400).json({ error: 'กรุณาเข้าสู่ระบบก่อนส่งแบบประเมิน' });
    }

    const result = createAssessmentLog({
      st_id: body.st_id,
      q1: Number(body.q1),
      q2: Number(body.q2),
      q3: Number(body.q3),
      q4: Number(body.q4),
      q5: Number(body.q5),
    });

    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json({ log: result.log });
  });

  return app;
}
