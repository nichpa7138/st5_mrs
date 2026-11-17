import { ChangeEvent, FormEvent, useState } from 'react';
import { Camera, CheckCircle2, Eye, EyeOff, LogIn, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { loginApi, registerApi } from '../services/apiClient';
import type { CourseOption, PrefixOption, PublicMember } from '../types/st5';

interface AuthSectionProps {
  onLoginSuccess: (member: PublicMember) => void;
  initialMode?: 'login' | 'register';
}

export function AuthSection({ onLoginSuccess, initialMode = 'login' }: AuthSectionProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [loginStId, setLoginStId] = useState('');
  const [loginDob, setLoginDob] = useState('');
  const [showDob, setShowDob] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regStId, setRegStId] = useState('');
  const [regPrefix, setRegPrefix] = useState<PrefixOption>('นางสาว');
  const [regName, setRegName] = useState('');
  const [regLname, setRegLname] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCourse, setRegCourse] = useState<CourseOption>('วทบ.เวชระเบียน');
  const [regPreview, setRegPreview] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const handleFillDemo = () => {
    setMode('login');
    setLoginStId('64010001');
    setLoginDob('29102534');
    setLoginError('');
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginStId.trim() || !loginDob.trim()) {
      setLoginError('กรุณากรอกรหัสนักศึกษาและวันเดือนปีเกิดให้ครบถ้วน');
      return;
    }

    setLoginLoading(true);
    try {
      const result = await loginApi(loginStId.trim(), loginDob.trim());
      if (!result.ok) {
        setLoginError(result.error);
        return;
      }
      onLoginSuccess(result.member);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3.5 * 1024 * 1024) {
      setRegError('ขนาดไฟล์รูปภาพต้องไม่เกิน 3.5 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRegPreview(reader.result);
        setRegError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regStId.trim()) {
      setRegError('กรุณากรอกรหัสนักศึกษา');
      return;
    }
    if (!/^\d{8}$/.test(regDob.trim())) {
      setRegError('วันเดือนปีเกิดต้องเป็นตัวเลข 8 หลัก ววดดปปปป (พ.ศ.) เช่น 29102534');
      return;
    }
    if (!regName.trim() || !regLname.trim()) {
      setRegError('กรุณากรอกชื่อและนามสกุลภาษาไทย');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    setRegLoading(true);
    try {
      const result = await registerApi({
        st_id: regStId.trim(),
        prefix: regPrefix,
        name: regName.trim(),
        lname: regLname.trim(),
        dob: regDob.trim(),
        email: regEmail.trim(),
        course: regCourse,
        profileImgBase64: regPreview || undefined,
      });
      if (!result.ok) {
        setRegError(result.error);
        return;
      }
      onLoginSuccess(result.member);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <section
      id="auth-section"
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
    >
      {/* Left Column: Editorial Introduction & Assessment Highlights */}
      <div className="lg:col-span-6 bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div className="text-xs font-medium text-pink-600 mb-3 flex items-center gap-2">
            <span>แบบประเมินความเครียดกรมสุขภาพจิต (ST-5)</span>
            <span aria-hidden="true">·</span>
            <span>สาขาวิชาเวชระเบียน</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight leading-[1.25] text-balance">
            ดูแลสุขภาพใจและวัดระดับความสุขและความเครียดด้วยตนเอง
          </h1>

          <p className="mt-4 text-sm sm:text-base text-zinc-600 leading-relaxed">
            ระบบประเมินตนเอง 5 ข้อมาตรฐานกรมสุขภาพจิตสำหรับนักศึกษาหลักสูตร ปวส.เวชระเบียน และ
            วทบ.เวชระเบียน ช่วยประมวลผลคะแนนทันที พร้อมบันทึกประวัติย้อนหลังเฉพาะบุคคลและสรุปแนวโน้มรายสัปดาห์
          </p>

          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-pink-50/60 border border-pink-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0" />
                <span>ประมวลผลแม่นยำ 4 ระดับ</span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">
                คำนวณคะแนน 0–15 คะแนน พร้อมแปลผลความเครียดและคำแนะนำการดูแลตนเองที่เหมาะสม
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <ShieldCheck className="w-4 h-4 text-pink-600 shrink-0" />
                <span>ข้อมูลส่วนตัวปลอดภัย</span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">
                ยืนยันตัวตนด้วยรหัสนักศึกษาและวันเดือนปีเกิด ดูประวัติย้อนหลังได้เฉพาะเจ้าของบัญชี
              </p>
            </div>
          </div>
        </div>

        {/* Clean 4-level scoring legend strip */}
        <div className="mt-8 pt-6 border-t border-zinc-100">
          <div className="text-xs font-medium text-zinc-500 mb-3">
            เกณฑ์การแปลผลคะแนนรวม ST-5 (เต็ม 15 คะแนน)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
              <div className="font-mono-num font-semibold text-emerald-700">0 – 4</div>
              <div className="text-zinc-700 mt-0.5 font-medium">ความเครียดน้อย</div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80">
              <div className="font-mono-num font-semibold text-amber-700">5 – 7</div>
              <div className="text-zinc-700 mt-0.5 font-medium">ความเครียดปานกลาง</div>
            </div>
            <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200/80">
              <div className="font-mono-num font-semibold text-orange-700">8 – 9</div>
              <div className="text-zinc-700 mt-0.5 font-medium">ความเครียดมาก</div>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50/80 border border-rose-200/80">
              <div className="font-mono-num font-semibold text-rose-700">10 – 15</div>
              <div className="text-zinc-700 mt-0.5 font-medium">ความเครียดมากที่สุด</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Login & Registration Card */}
      <div className="lg:col-span-6 bg-white border border-pink-200/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
        <div>
          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-zinc-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginError('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-pink-600 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span>เข้าสู่ระบบ</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRegError('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-pink-600 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>ลงทะเบียนนักศึกษาใหม่</span>
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">เข้าสู่ระบบประเมินตนเอง</h2>
                <p className="text-xs text-zinc-500 mt-1">
                  ใช้รหัสนักศึกษาและวันเดือนปีเกิด (พ.ศ. 8 หลัก) เพื่อทำแบบประเมินและดูประวัติย้อนหลัง
                </p>
              </div>

              <div>
                <label
                  htmlFor="login-stid"
                  className="block text-sm font-medium text-zinc-700 mb-1.5"
                >
                  รหัสนักศึกษา (Username)
                </label>
                <input
                  id="login-stid"
                  type="text"
                  inputMode="numeric"
                  placeholder="เช่น 64010001"
                  value={loginStId}
                  onChange={(e) => setLoginStId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/15 transition-colors font-mono-num"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-dob" className="block text-sm font-medium text-zinc-700">
                    วันเดือนปีเกิด 8 หลัก พ.ศ. (Password)
                  </label>
                  <span className="text-xs text-zinc-400 font-mono-num">ววดดปปปป</span>
                </div>
                <div className="relative">
                  <input
                    id="login-dob"
                    type={showDob ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="เช่น 29102534"
                    value={loginDob}
                    onChange={(e) => setLoginDob(e.target.value)}
                    className="w-full h-11 pl-3.5 pr-11 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/15 transition-colors font-mono-num"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowDob((v) => !v)}
                    aria-label={showDob ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  >
                    {showDob ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium"
                >
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full h-11 rounded-xl bg-pink-600 hover:bg-pink-700 active:bg-pink-800 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{loginLoading ? 'กำลังตรวจสอบข้อมูล...' : 'เข้าสู่ระบบ'}</span>
              </button>

              <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                <span>ต้องการทดลองใช้งานระบบทันที?</span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 font-medium cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>กรอกบัญชีตัวอย่าง (64010001)</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">ลงทะเบียนสมาชิกนักศึกษา</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  ข้อมูลจะถูกบันทึกในฐานข้อมูลสมาชิก (MEMBER) เพื่อใช้เข้าสู่ระบบและติดตามผล
                </p>
              </div>

              {/* Profile Photo Upload */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-pink-50/50 border border-pink-100">
                <div className="w-14 h-14 rounded-full bg-white border border-pink-200 flex items-center justify-center overflow-hidden shrink-0">
                  {regPreview ? (
                    <img
                      src={regPreview}
                      alt="ตัวอย่างรูปโปรไฟล์"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-5 h-5 text-pink-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="reg-avatar"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-pink-200 text-xs font-medium text-pink-700 hover:bg-pink-50 cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{regPreview ? 'เปลี่ยนรูปโปรไฟล์' : 'อัปโหลดรูปโปรไฟล์'}</span>
                  </label>
                  <input
                    id="reg-avatar"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1 truncate">
                    รองรับไฟล์ PNG, JPG หรือ WEBP (ไม่บังคับ)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-stid" className="block text-xs font-medium text-zinc-700 mb-1">
                    รหัสนักศึกษา *
                  </label>
                  <input
                    id="reg-stid"
                    type="text"
                    inputMode="numeric"
                    placeholder="เช่น 67010025"
                    value={regStId}
                    onChange={(e) => setRegStId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:border-pink-500 focus:bg-white font-mono-num"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="reg-dob" className="block text-xs font-medium text-zinc-700 mb-1">
                    วันเดือนปีเกิด 8 หลัก (ววดดปปปป พ.ศ.) *
                  </label>
                  <input
                    id="reg-dob"
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="เช่น 29102547"
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:border-pink-500 focus:bg-white font-mono-num"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label htmlFor="reg-prefix" className="block text-xs font-medium text-zinc-700 mb-1">
                    คำนำหน้า *
                  </label>
                  <select
                    id="reg-prefix"
                    value={regPrefix}
                    onChange={(e) => setRegPrefix(e.target.value as PrefixOption)}
                    className="w-full h-10 px-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:border-pink-500 focus:bg-white"
                  >
                    <option value="นาย">นาย</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="นาง">นาง</option>
                  </select>
                </div>
                <div className="sm:col-span-4">
                  <label htmlFor="reg-name" className="block text-xs font-medium text-zinc-700 mb-1">
                    ชื่อ (ภาษาไทย) *
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="เช่น ปรียานุช"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:border-pink-500 focus:bg-white"
                    required
                  />
                </div>
                <div className="sm:col-span-4">
                  <label htmlFor="reg-lname" className="block text-xs font-medium text-zinc-700 mb-1">
                    นามสกุล (ภาษาไทย) *
                  </label>
                  <input
                    id="reg-lname"
                    type="text"
                    placeholder="เช่น สุขใจ"
                    value={regLname}
                    onChange={(e) => setRegLname(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:border-pink-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-medium text-zinc-700 mb-1">
                    อีเมล *
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="student@kmpht.ac.th"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:border-pink-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="reg-course" className="block text-xs font-medium text-zinc-700 mb-1">
                    หลักสูตร / สาขาวิชา *
                  </label>
                  <select
                    id="reg-course"
                    value={regCourse}
                    onChange={(e) => setRegCourse(e.target.value as CourseOption)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:border-pink-500 focus:bg-white"
                  >
                    <option value="ปวส.เวชระเบียน">ปวส.เวชระเบียน</option>
                    <option value="วทบ.เวชระเบียน">วทบ.เวชระเบียน</option>
                  </select>
                </div>
              </div>

              {regError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium"
                >
                  {regError}
                </div>
              )}

              <button
                type="submit"
                disabled={regLoading}
                className="w-full h-11 rounded-xl bg-pink-600 hover:bg-pink-700 active:bg-pink-800 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{regLoading ? 'กำลังบันทึกข้อมูล...' : 'ลงทะเบียนและเข้าสู่ระบบ'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
