import { FormEvent, useState } from 'react';
import { CheckCircle2, History, RotateCcw, Send } from 'lucide-react';
import {
  AssessmentLog,
  interpretStressScore,
  PublicMember,
  ST5_CHOICES,
  ST5_QUESTIONS,
} from '../types/st5';

interface AssessmentWorkspaceProps {
  member: PublicMember;
  onAssessmentSaved: (newLog: AssessmentLog) => void;
  onGoToHistory: () => void;
}

type AnswersState = Record<'q1' | 'q2' | 'q3' | 'q4' | 'q5', number | null>;

const INITIAL_ANSWERS: AnswersState = {
  q1: null,
  q2: null,
  q3: null,
  q4: null,
  q5: null,
};

export function AssessmentWorkspace({
  member,
  onAssessmentSaved,
  onGoToHistory,
}: AssessmentWorkspaceProps) {
  const [answers, setAnswers] = useState<AnswersState>(INITIAL_ANSWERS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedLog, setSubmittedLog] = useState<AssessmentLog | null>(null);

  const answeredCount = Object.values(answers).filter((v) => v !== null).length;
  const allAnswered = answeredCount === 5;

  const handleSelect = (qId: keyof AnswersState, value: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
    setError('');
  };

  const handleReset = () => {
    setAnswers(INITIAL_ANSWERS);
    setSubmittedLog(null);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!allAnswered) {
      setError('กรุณาเลือกคำตอบให้ครบทั้ง 5 ข้อก่อนประมวลผลคะแนน');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          st_id: member.st_id,
          q1: answers.q1,
          q2: answers.q2,
          q3: answers.q3,
          q4: answers.q4,
          q5: answers.q5,
        }),
      });
      const data = (await res.json()) as { log?: AssessmentLog; error?: string };
      if (!res.ok || !data.log) {
        setError(data.error ?? 'ไม่สามารถบันทึกผลการประเมินได้');
        return;
      }
      setSubmittedLog(data.log);
      onAssessmentSaved(data.log);
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedLog) {
    const info = interpretStressScore(submittedLog.total_score);
    const scorePercent = Math.round((submittedLog.total_score / 15) * 100);

    return (
      <div className="bg-white border border-pink-200/90 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-zinc-100">
          <div>
            <div className="text-xs font-medium text-pink-600">
              บันทึกผลการประเมินเรียบร้อยแล้ว · รหัสอ้างอิง {submittedLog.log_id}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1">
              สรุปผลการประเมินความสุขและความเครียด (ST-5)
            </h2>
          </div>
          <span className="text-xs font-mono-num text-zinc-500">
            {submittedLog.date_time}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Emoji + Score Hero Panel */}
          <div
            className={`lg:col-span-5 rounded-2xl border p-6 flex flex-col items-center justify-center text-center ${info.surfaceTintClass} ${info.borderTintClass}`}
          >
            <div
              className="text-7xl sm:text-8xl leading-none select-none mb-4"
              role="img"
              aria-label={info.level}
            >
              {info.emoji}
            </div>

            <div className="text-xs font-medium text-zinc-500">คะแนนรวมทั้งหมด</div>
            <div className="mt-1 flex items-baseline justify-center gap-1.5 font-mono-num">
              <span className="text-5xl font-bold text-zinc-900">
                {submittedLog.total_score}
              </span>
              <span className="text-lg text-zinc-500">/ 15 คะแนน</span>
            </div>

            <div className="w-full max-w-xs mt-4">
              <div className="h-2.5 w-full rounded-full bg-white/80 border border-zinc-200/70 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${scorePercent}%`, backgroundColor: info.barColor }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500 font-mono-num mt-1">
                <span>0</span>
                <span>เกณฑ์ {info.rangeLabel}</span>
                <span>15</span>
              </div>
            </div>

            <div className={`mt-5 text-lg font-bold ${info.badgeTextClass}`}>
              {info.level}
            </div>
            <div className="text-xs font-medium text-zinc-700 mt-1">
              {info.happinessLabel}
            </div>
          </div>

          {/* Care Guidance & Question Breakdown */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                คำแนะนำในการดูแลสุขภาพใจสำหรับคุณ
              </h3>
              <p className="text-sm text-zinc-600 mt-1.5 leading-relaxed">
                {info.summary}
              </p>

              <ul className="mt-4 space-y-2.5">
                {info.advice.map((tip, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-zinc-700 bg-zinc-50 border border-zinc-200/70 rounded-xl p-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Individual Score Summary */}
            <div className="pt-4 border-t border-zinc-100">
              <div className="text-xs font-medium text-zinc-500 mb-2.5">
                รายละเอียดคะแนนรายข้อ (0–3 คะแนน)
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                {(['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((key, idx) => (
                  <div
                    key={key}
                    className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80"
                  >
                    <div className="text-[11px] text-zinc-500">ข้อที่ {idx + 1}</div>
                    <div className="text-base font-bold text-zinc-900 font-mono-num mt-0.5">
                      {submittedLog[key]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Required Action Buttons: คำนวณใหม่ & ดูประวัติย้อนหลัง */}
        <div className="pt-5 border-t border-zinc-100 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-zinc-300 hover:border-pink-400 text-sm font-semibold text-zinc-700 hover:text-pink-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>คำนวณใหม่</span>
          </button>
          <button
            type="button"
            onClick={onGoToHistory}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-sm font-semibold text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <History className="w-4 h-4" />
            <span>ดูประวัติย้อนหลัง</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 space-y-6"
    >
      {/* Form Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
        <div>
          <div className="text-xs font-medium text-pink-600">
            แบบประเมินความเครียดมาตรฐานกรมสุขภาพจิต (ST-5)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1">
            ในช่วง 2–4 สัปดาห์ที่ผ่านมา ท่านมีอาการเหล่านี้บ่อยเพียงใด
          </h2>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-zinc-500">ความคืบหน้า</div>
            <div className="text-sm font-bold text-zinc-900 font-mono-num">
              {answeredCount} / 5 ข้อ
            </div>
          </div>
          <div className="w-24 h-2.5 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full bg-pink-600 rounded-full transition-all duration-200"
              style={{ width: `${(answeredCount / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5 Questions */}
      <div className="space-y-4">
        {ST5_QUESTIONS.map((q) => {
          const selected = answers[q.id];
          return (
            <div
              key={q.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
                selected !== null
                  ? 'border-pink-200 bg-pink-50/25'
                  : 'border-zinc-200 bg-zinc-50/40'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="max-w-xl">
                  <div className="text-sm sm:text-base font-semibold text-zinc-900">
                    <span className="font-mono-num text-pink-600 mr-2">0{q.number}.</span>
                    {q.title}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{q.detail}</p>
                </div>

                <div
                  role="radiogroup"
                  aria-label={q.title}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0"
                >
                  {ST5_CHOICES.map((choice) => {
                    const isChecked = selected === choice.value;
                    return (
                      <button
                        key={choice.value}
                        type="button"
                        role="radio"
                        aria-checked={isChecked}
                        onClick={() => handleSelect(q.id, choice.value)}
                        className={`px-3.5 py-2.5 rounded-xl border text-left transition-colors cursor-pointer min-w-[104px] ${
                          isChecked
                            ? 'bg-pink-600 border-pink-600 text-white'
                            : 'bg-white border-zinc-200 text-zinc-700 hover:border-pink-300 hover:bg-pink-50/40'
                        }`}
                      >
                        <div className="text-xs font-semibold whitespace-nowrap">
                          {choice.label}
                        </div>
                        <div
                          className={`text-[11px] font-mono-num mt-0.5 ${
                            isChecked ? 'text-pink-100' : 'text-zinc-400'
                          }`}
                        >
                          {choice.hint}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700"
        >
          {error}
        </div>
      )}

      <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>ล้างคำตอบทั้งหมด</span>
        </button>

        <button
          type="submit"
          disabled={submitting || !allAnswered}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 active:bg-pink-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span>{submitting ? 'กำลังประมวลผล...' : 'ส่งแบบประเมินและดูผลลัพธ์'}</span>
        </button>
      </div>
    </form>
  );
}
