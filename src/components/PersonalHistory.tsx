import { ChangeEvent, useState } from 'react';
import { Camera, ClipboardPlus } from 'lucide-react';
import { updateAvatarApi } from '../services/apiClient';
import { AssessmentLog, interpretStressScore, PublicMember } from '../types/st5';
import { Avatar } from './Avatar';

interface PersonalHistoryProps {
  member: PublicMember;
  logs: AssessmentLog[];
  loading: boolean;
  onStartAssessment: () => void;
  onMemberUpdated: (updated: PublicMember) => void;
}

export function PersonalHistory({
  member,
  logs,
  loading,
  onStartAssessment,
  onMemberUpdated,
}: PersonalHistoryProps) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3.5 * 1024 * 1024) {
      setAvatarError('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 3.5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return;
      setUploadingAvatar(true);
      setAvatarError('');
      try {
        const result = await updateAvatarApi(member.st_id, reader.result);
        if (!result.ok) {
          setAvatarError(result.error);
          return;
        }
        onMemberUpdated(result.member);
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Logs are returned newest-first; reverse for chronological mini-trend
  const chronologicalLogs = [...logs].reverse();
  const latestLog = logs[0] ?? null;
  const personalAvg =
    logs.length > 0
      ? (logs.reduce((s, l) => s + l.total_score, 0) / logs.length).toFixed(2)
      : '—';

  return (
    <div className="space-y-6">
      {/* Personal Profile Card */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative self-start">
            <Avatar
              src={member.profile_img}
              name={member.name}
              lname={member.lname}
              size="xl"
            />
            <label
              htmlFor="update-profile-img"
              title="อัปเดตรูปโปรไฟล์"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-pink-600 hover:bg-pink-700 text-white border-2 border-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </label>
            <input
              id="update-profile-img"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
              className="sr-only"
            />
          </div>

          <div>
            <div className="text-xs text-zinc-500 flex flex-wrap items-center gap-2">
              <span className="font-mono-num">รหัสนักศึกษา {member.st_id}</span>
              <span aria-hidden="true">·</span>
              <span>{member.course}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1">
              {member.prefix}
              {member.name} {member.lname}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">{member.email}</p>
            {avatarError && (
              <p className="text-xs text-rose-600 mt-1.5 font-medium">{avatarError}</p>
            )}
          </div>
        </div>

        {/* Personal Summary Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-zinc-100 md:pl-6 shrink-0">
          <div>
            <div className="text-xs text-zinc-500">ประเมินทั้งหมด</div>
            <div className="text-xl font-bold text-zinc-900 font-mono-num mt-0.5">
              {logs.length} <span className="text-xs font-normal text-zinc-500">ครั้ง</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">คะแนนเฉลี่ย</div>
            <div className="text-xl font-bold text-pink-600 font-mono-num mt-0.5">
              {personalAvg}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">ครั้งล่าสุด</div>
            <div className="text-xl font-bold text-zinc-900 font-mono-num mt-0.5">
              {latestLog ? `${latestLog.total_score}/15` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Trend Mini Chart (when >= 2 logs) */}
      {chronologicalLogs.length >= 2 && (
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                แนวโน้มคะแนนความเครียดเฉพาะบุคคล
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                เปรียบเทียบพัฒนาการคะแนน ST-5 ของรหัส {member.st_id} ตามลำดับเวลา
              </p>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox="0 0 640 160" className="w-full min-w-[460px] h-auto">
              {[0, 5, 10, 15].map((tick) => {
                const y = 128 - (tick / 15) * 104;
                return (
                  <g key={tick}>
                    <line
                      x1="36"
                      y1={y}
                      x2="616"
                      y2={y}
                      stroke="#E4E4E7"
                      strokeDasharray={tick === 0 ? undefined : '4 4'}
                    />
                    <text
                      x="28"
                      y={y + 4}
                      textAnchor="end"
                      className="fill-zinc-400 text-[10px] font-mono-num"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              <polyline
                fill="none"
                stroke="#DB2777"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={chronologicalLogs
                  .map((l, idx) => {
                    const x =
                      chronologicalLogs.length === 1
                        ? 326
                        : 48 + (idx / (chronologicalLogs.length - 1)) * 556;
                    const y = 128 - (l.total_score / 15) * 104;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {chronologicalLogs.map((l, idx) => {
                const x =
                  chronologicalLogs.length === 1
                    ? 326
                    : 48 + (idx / (chronologicalLogs.length - 1)) * 556;
                const y = 128 - (l.total_score / 15) * 104;
                return (
                  <g key={l.log_id}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill="#FFFFFF"
                      stroke="#DB2777"
                      strokeWidth="2.5"
                    />
                    <text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      className="fill-zinc-700 text-[10px] font-semibold font-mono-num"
                    >
                      {l.total_score}
                    </text>
                    <text
                      x={x}
                      y={148}
                      textAnchor="middle"
                      className="fill-zinc-400 text-[10px] font-mono-num"
                    >
                      {l.date_time.slice(5, 10)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Personal History Table (Filtered strictly by st_id, sorted newest first) */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              ประวัติการประเมินความเครียดย้อนหลัง (เรียงจากครั้งล่าสุดอยู่บนสุด)
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              แสดงเฉพาะรายการจากชีท ASSESSMENT_LOG ของรหัสนักศึกษา {member.st_id}
            </p>
          </div>
          <button
            type="button"
            onClick={onStartAssessment}
            className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ClipboardPlus className="w-4 h-4" />
            <span>ทำแบบประเมินใหม่</span>
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 bg-zinc-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl mb-3" aria-hidden="true">
              📝
            </div>
            <h4 className="text-base font-semibold text-zinc-900">
              ยังไม่มีประวัติการทำแบบประเมิน
            </h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
              เริ่มต้นทำแบบประเมินความเครียด ST-5 ครั้งแรกของคุณ เพื่อติดตามระดับความสุขและแนวโน้มสุขภาพใจ
            </p>
            <button
              type="button"
              onClick={onStartAssessment}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <ClipboardPlus className="w-4 h-4" />
              <span>เริ่มทำแบบประเมินครั้งแรก</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-600">
                  <th className="py-3 px-4 whitespace-nowrap">วันที่และเวลา</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">ข้อ 1</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">ข้อ 2</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">ข้อ 3</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">ข้อ 4</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">ข้อ 5</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">คะแนนรวม</th>
                  <th className="py-3 px-4 whitespace-nowrap">ผลการประเมิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {logs.map((log, index) => {
                  const info = interpretStressScore(log.total_score);
                  return (
                    <tr
                      key={log.log_id}
                      className="hover:bg-pink-50/35 transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono-num text-xs text-zinc-900 font-medium">
                          {log.date_time}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono-num">
                          {log.log_id}
                          {index === 0 ? ' · ล่าสุด' : ''}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num text-zinc-600">
                        {log.q1}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num text-zinc-600">
                        {log.q2}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num text-zinc-600">
                        {log.q3}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num text-zinc-600">
                        {log.q4}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num text-zinc-600">
                        {log.q5}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-num font-bold text-zinc-900 whitespace-nowrap">
                        {log.total_score} / 15
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${info.badgeTextClass}`}>
                          <span aria-hidden="true">{info.emoji}</span>
                          <span>{log.result_text}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
