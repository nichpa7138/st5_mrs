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
import { callGasGet, callGasPost, isGasEnabled } from './gasBridge';
import type {
  AssessmentLog,
  CourseOption,
  DashboardStats,
  PrefixOption,
  PublicMember,
} from '../src/types/st5';

interface GasBaseResponse {
  ok: boolean;
  status?: number;
  error?: string;
}

export function createApiApp() {
  const app = express();

  app.use(express.json({ limit: '5mb' }));

  try {
    app.use('/uploads', express.static(getUploadsDir()));
  } catch {
    // Ignore if filesystem is unavailable
  }

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, backend: isGasEnabled() ? 'google-apps-script' : 'local' });
  });

  app.get('/api/dashboard', async (_req, res) => {
    try {
      if (isGasEnabled()) {
        const gasRes = await callGasGet<GasBaseResponse & { data?: DashboardStats }>({
          action: 'dashboard',
        });
        if (!gasRes.ok || !gasRes.data) {
          return res.status(gasRes.status ?? 502).json({
            error: gasRes.error ?? 'ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้',
          });
        }
        return res.json(gasRes.data);
      }

      const stats = getDashboardStats();
      return res.json(stats);
    } catch (err) {
      console.error('Error building dashboard stats:', err);
      return res.status(500).json({ error: 'ไม่สามารถโหลดข้อมูลสรุปสถิติได้' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { st_id, dob } = req.body as { st_id?: string; dob?: string };
    if (!st_id || !dob) {
      return res.status(400).json({ error: 'กรุณากรอกรหัสนักศึกษาและวันเดือนปีเกิด' });
    }

    try {
      if (isGasEnabled()) {
        const gasRes = await callGasPost<GasBaseResponse & { member?: PublicMember }>({
          action: 'login',
          st_id: st_id.trim(),
          dob: dob.trim(),
        });
        if (!gasRes.ok || !gasRes.member) {
          return res.status(gasRes.status ?? 401).json({
            error: gasRes.error ?? 'รหัสนักศึกษาหรือวันเดือนปีเกิด (ววดดปปปป พ.ศ.) ไม่ถูกต้อง',
          });
        }
        return res.json({ member: gasRes.member });
      }

      const member = authenticateMember(st_id, dob);
      if (!member) {
        return res.status(401).json({
          error: 'รหัสนักศึกษาหรือวันเดือนปีเกิด (ววดดปปปป พ.ศ.) ไม่ถูกต้อง',
        });
      }
      return res.json({ member });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'ไม่สามารถเชื่อมต่อระบบยืนยันตัวตนได้' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
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

    try {
      if (isGasEnabled()) {
        const gasRes = await callGasPost<GasBaseResponse & { member?: PublicMember }>({
          action: 'register',
          st_id: body.st_id ?? '',
          prefix: body.prefix,
          name: body.name ?? '',
          lname: body.lname ?? '',
          dob: body.dob ?? '',
          email: body.email ?? '',
          course: body.course,
          profileImgBase64: body.profileImgBase64 ?? '',
        });
        if (!gasRes.ok || !gasRes.member) {
          return res.status(gasRes.status ?? 400).json({
            error: gasRes.error ?? 'ลงทะเบียนไม่สำเร็จ กรุณาตรวจสอบข้อมูล',
          });
        }
        return res.status(201).json({ member: gasRes.member });
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
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ error: 'ไม่สามารถบันทึกข้อมูลสมาชิกได้' });
    }
  });

  app.post('/api/member/avatar', async (req, res) => {
    const { st_id, profileImgBase64 } = req.body as {
      st_id?: string;
      profileImgBase64?: string;
    };
    if (!st_id || !profileImgBase64) {
      return res.status(400).json({ error: 'ข้อมูลรูปภาพไม่สมบูรณ์' });
    }

    try {
      if (isGasEnabled()) {
        const gasRes = await callGasPost<GasBaseResponse & { member?: PublicMember }>({
          action: 'updateAvatar',
          st_id,
          profileImgBase64,
        });
        if (!gasRes.ok || !gasRes.member) {
          return res.status(gasRes.status ?? 400).json({
            error: gasRes.error ?? 'ไม่สามารถอัปโหลดรูปภาพลง Google Drive ได้',
          });
        }
        return res.json({ member: gasRes.member });
      }

      const updated = updateMemberAvatar(st_id, profileImgBase64);
      if (!updated) {
        return res.status(400).json({
          error: 'ไม่สามารถอัปโหลดรูปภาพได้ (รองรับ PNG/JPG/WEBP ขนาดไม่เกิน 4MB)',
        });
      }
      return res.json({ member: updated });
    } catch (err) {
      console.error('Avatar upload error:', err);
      return res.status(500).json({ error: 'ไม่สามารถอัปโหลดรูปภาพได้' });
    }
  });

  app.get('/api/member/:st_id', async (req, res) => {
    try {
      if (isGasEnabled()) {
        const gasRes = await callGasGet<GasBaseResponse & { member?: PublicMember }>({
          action: 'member',
          st_id: req.params.st_id,
        });
        if (!gasRes.ok || !gasRes.member) {
          return res.status(gasRes.status ?? 404).json({
            error: gasRes.error ?? 'ไม่พบข้อมูลนักศึกษา',
          });
        }
        return res.json({ member: gasRes.member });
      }

      const member = getMemberById(req.params.st_id);
      if (!member) {
        return res.status(404).json({ error: 'ไม่พบข้อมูลนักศึกษา' });
      }
      return res.json({ member });
    } catch (err) {
      console.error('Get member error:', err);
      return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลนักศึกษาได้' });
    }
  });

  app.get('/api/assessments/:st_id', async (req, res) => {
    try {
      if (isGasEnabled()) {
        const gasRes = await callGasGet<GasBaseResponse & { logs?: AssessmentLog[] }>({
          action: 'assessments',
          st_id: req.params.st_id,
        });
        if (!gasRes.ok) {
          return res.status(gasRes.status ?? 502).json({
            error: gasRes.error ?? 'ไม่สามารถดึงประวัติการประเมินได้',
          });
        }
        return res.json({ logs: gasRes.logs ?? [] });
      }

      const logs = getMemberAssessments(req.params.st_id);
      return res.json({ logs });
    } catch (err) {
      console.error('Get assessments error:', err);
      return res.status(500).json({ error: 'ไม่สามารถดึงประวัติการประเมินได้' });
    }
  });

  app.post('/api/assessments', async (req, res) => {
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

    try {
      if (isGasEnabled()) {
        const gasRes = await callGasPost<GasBaseResponse & { log?: AssessmentLog }>({
          action: 'createAssessment',
          st_id: body.st_id,
          q1: Number(body.q1),
          q2: Number(body.q2),
          q3: Number(body.q3),
          q4: Number(body.q4),
          q5: Number(body.q5),
        });
        if (!gasRes.ok || !gasRes.log) {
          return res.status(gasRes.status ?? 400).json({
            error: gasRes.error ?? 'ไม่สามารถบันทึกผลการประเมินลง Google Sheet ได้',
          });
        }
        return res.status(201).json({ log: gasRes.log });
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
    } catch (err) {
      console.error('Create assessment error:', err);
      return res.status(500).json({ error: 'ไม่สามารถบันทึกผลการประเมินได้' });
    }
  });

  return app;
}
