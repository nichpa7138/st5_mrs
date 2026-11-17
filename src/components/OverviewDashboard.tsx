import { useState } from 'react';
import { RefreshCw, TrendingUp, Users, ClipboardCheck, HeartHandshake } from 'lucide-react';
import type { DashboardStats } from '../types/st5';

interface OverviewDashboardProps {
  stats: DashboardStats | null;
  loading: boolean;
  error: string;
  onRefresh: () => void;
}

function DonutChart({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: Array<{ label: string; percent: number; color: string }>;
  centerValue: string;
  centerLabel: string;
}) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="relative w-32 h-32 shrink-0">
      <svg viewBox="0 0 112 112" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="#F4F4F5"
          strokeWidth="14"
        />
        {segments.map((seg) => {
          const dashLength = (Math.max(0, seg.percent) / 100) * circumference;
          const dashOffset = -cumulative;
          cumulative += dashLength;
          return (
            <circle
              key={seg.label}
              cx="56"
              cy="56"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeDasharray={`${dashLength} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-lg font-bold text-zinc-900 font-mono-num leading-none">
          {centerValue}
        </span>
        <span className="text-[11px] text-zinc-500 mt-1">{centerLabel}</span>
      </div>
    </div>
  );
}

export function OverviewDashboard({
  stats,
  loading,
  error,
  onRefresh,
}: OverviewDashboardProps) {
  const [hoveredWeekIdx, setHoveredWeekIdx] = useState<number | null>(null);
  const [chartMetric, setChartMetric] = useState<'both' | 'score' | 'count'>('both');

  if (loading && !stats) {
    return (
      <section id="overview-dashboard" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 bg-white border border-zinc-200 rounded-2xl p-5 animate-pulse"
            >
              <div className="h-3 w-24 bg-zinc-200 rounded mb-4" />
              <div className="h-7 w-16 bg-zinc-200 rounded" />
            </div>
          ))}
        </div>
        <div className="h-72 bg-white border border-zinc-200 rounded-2xl animate-pulse" />
      </section>
    );
  }

  if (error && !stats) {
    return (
      <section
        id="overview-dashboard"
        className="bg-white border border-rose-200 rounded-2xl p-6 text-center"
      >
        <p className="text-sm text-rose-700 font-medium">{error}</p>
        <button
          type="button"
          onClick={onRefresh}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-medium hover:bg-pink-700 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>โหลดข้อมูลใหม่</span>
        </button>
      </section>
    );
  }

  if (!stats) return null;

  const courseColors: Record<string, string> = {
    'ปวส.เวชระเบียน': '#EC4899',
    'วทบ.เวชระเบียน': '#8B5CF6',
  };

  const genderColors: Record<string, string> = {
    ชาย: '#0EA5E9',
    หญิง: '#F43F5E',
  };

  const levelColors: Record<string, string> = {
    ความเครียดน้อย: '#10B981',
    ความเครียดปานกลาง: '#F59E0B',
    ความเครียดมาก: '#F97316',
    ความเครียดมากที่สุด: '#E11D48',
  };

  // Weekly SVG chart geometry
  const trend = stats.weeklyTrend;
  const chartW = 720;
  const chartH = 260;
  const padL = 42;
  const padR = 42;
  const padT = 24;
  const padB = 42;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const maxCount = Math.max(1, ...trend.map((t) => t.assessmentCount));

  const getX = (idx: number) => {
    if (trend.length <= 1) return padL + innerW / 2;
    return padL + (idx / (trend.length - 1)) * innerW;
  };
  const getScoreY = (score: number) => padT + innerH - (Math.min(15, Math.max(0, score)) / 15) * innerH;
  const getCountBarH = (count: number) => (count / maxCount) * (innerH * 0.72);

  const linePoints = trend.map((pt, idx) => `${getX(idx)},${getScoreY(pt.avgScore)}`).join(' ');
  const areaPoints =
    trend.length > 0
      ? `${getX(0)},${padT + innerH} ${linePoints} ${getX(trend.length - 1)},${padT + innerH}`
      : '';

  const activeWeekIdx =
    hoveredWeekIdx !== null && trend[hoveredWeekIdx]
      ? hoveredWeekIdx
      : trend.length > 0
      ? trend.length - 1
      : null;
  const activeWeek = activeWeekIdx !== null ? trend[activeWeekIdx] : null;

  return (
    <section id="overview-dashboard" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-pink-600">
            ข้อมูลสถิติจากฐานข้อมูล MEMBER และ ASSESSMENT_LOG
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1">
            Dashboard สรุปสถิติภาพรวมสุขภาพใจนักศึกษา
          </h2>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white border border-zinc-200 hover:border-pink-300 text-xs font-medium text-zinc-700 hover:text-pink-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>อัปเดตข้อมูลล่าสุด</span>
        </button>
      </div>

      {/* 4 KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-zinc-500">สมาชิกนักศึกษาทั้งหมด</div>
            <div className="text-2xl font-bold text-zinc-900 font-mono-num mt-2">
              {stats.totalMembers}
              <span className="text-sm font-normal text-zinc-500 ml-1.5">คน</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">จากทั้ง 2 หลักสูตร</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-zinc-500">จำนวนการประเมินสะสม</div>
            <div className="text-2xl font-bold text-zinc-900 font-mono-num mt-2">
              {stats.totalAssessments}
              <span className="text-sm font-normal text-zinc-500 ml-1.5">ครั้ง</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">บันทึกใน ASSESSMENT_LOG</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-zinc-500">คะแนนความเครียดเฉลี่ย</div>
            <div className="text-2xl font-bold text-zinc-900 font-mono-num mt-2">
              {stats.overallAvgScore.toFixed(2)}
              <span className="text-sm font-normal text-zinc-500 ml-1">/ 15</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {stats.overallAvgScore <= 4
                ? 'อยู่ในเกณฑ์ความเครียดน้อย'
                : stats.overallAvgScore <= 7
                ? 'อยู่ในเกณฑ์ความเครียดปานกลาง'
                : 'ควรเฝ้าระวังความเครียด'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-zinc-500">ผลประเมินความเครียดน้อย</div>
            <div className="text-2xl font-bold text-emerald-600 font-mono-num mt-2">
              {stats.lowStressRate.toFixed(1)}%
            </div>
            <div className="text-xs text-zinc-500 mt-1">กลุ่มคะแนน 0–4 คะแนน</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Course & Gender Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Course Breakdown */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                1. สถิติจำนวนและร้อยละ (%) แยกตามหลักสูตร
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                เปรียบเทียบระหว่าง ปวส.เวชระเบียน และ วทบ.เวชระเบียน
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <DonutChart
              segments={stats.courseStats.map((c) => ({
                label: c.course,
                percent: c.memberPercent,
                color: courseColors[c.course] ?? '#EC4899',
              }))}
              centerValue={String(stats.totalMembers)}
              centerLabel="นักศึกษา (คน)"
            />

            <div className="flex-1 w-full space-y-4">
              {stats.courseStats.map((item) => {
                const barColor = courseColors[item.course] ?? '#EC4899';
                return (
                  <div key={item.course} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 font-medium text-zinc-800">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: barColor }}
                        />
                        <span>{item.course}</span>
                      </div>
                      <div className="font-mono-num text-zinc-900 font-semibold">
                        {item.memberCount} คน{' '}
                        <span className="text-zinc-500 font-normal">
                          ({item.memberPercent.toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${item.memberPercent}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-500 font-mono-num">
                      <span>ประเมินแล้ว {item.assessmentCount} ครั้ง</span>
                      <span>คะแนนเฉลี่ย {item.avgScore.toFixed(2)} / 15</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Gender Breakdown */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                2. สถิติจำนวนและร้อยละ (%) แยกตามเพศ (ชาย / หญิง)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                วิเคราะห์จากคำนำหน้าชื่อ (นาย = ชาย · นางสาว / นาง = หญิง)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <DonutChart
              segments={stats.genderStats.map((g) => ({
                label: g.gender,
                percent: g.memberPercent,
                color: genderColors[g.gender] ?? '#F43F5E',
              }))}
              centerValue={String(stats.totalMembers)}
              centerLabel="แบ่งตามเพศ"
            />

            <div className="flex-1 w-full space-y-4">
              {stats.genderStats.map((item) => {
                const barColor = genderColors[item.gender] ?? '#F43F5E';
                return (
                  <div key={item.gender} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 font-medium text-zinc-800">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: barColor }}
                        />
                        <span>เพศ{item.gender}</span>
                      </div>
                      <div className="font-mono-num text-zinc-900 font-semibold">
                        {item.memberCount} คน{' '}
                        <span className="text-zinc-500 font-normal">
                          ({item.memberPercent.toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${item.memberPercent}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-500 font-mono-num">
                      <span>ประเมินแล้ว {item.assessmentCount} ครั้ง</span>
                      <span>คะแนนเฉลี่ย {item.avgScore.toFixed(2)} / 15</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Weekly Stress Trend Chart + Level Distribution */}
      <div id="weekly-trend" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Stress Trend Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-zinc-200/90 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                3. กราฟสรุปผลแนวโน้มความเครียดในแต่ละสัปดาห์
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                แสดงคะแนนเฉลี่ย ST-5 (0–15) และจำนวนการประเมินแยกตามสัปดาห์
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setChartMetric('both')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  chartMetric === 'both'
                    ? 'bg-white text-pink-600 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                แสดงทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('score')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  chartMetric === 'score'
                    ? 'bg-white text-pink-600 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                คะแนนเฉลี่ย
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('count')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  chartMetric === 'count'
                    ? 'bg-white text-pink-600 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                จำนวนผู้ประเมิน
              </button>
            </div>
          </div>

          {trend.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-sm text-zinc-500">
              ยังไม่มีข้อมูลการประเมินรายสัปดาห์
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  className="w-full min-w-[540px] h-auto select-none"
                  role="img"
                  aria-label="กราฟแนวโน้มความเครียดในแต่ละสัปดาห์"
                >
                  <defs>
                    <linearGradient id="pinkAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EC4899" stopOpacity="0.24" />
                      <stop offset="100%" stopColor="#EC4899" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Y-Axis grid lines (0, 5, 10, 15) */}
                  {[0, 5, 10, 15].map((tick) => {
                    const y = getScoreY(tick);
                    return (
                      <g key={tick}>
                        <line
                          x1={padL}
                          y1={y}
                          x2={chartW - padR}
                          y2={y}
                          stroke="#E4E4E7"
                          strokeDasharray={tick === 0 ? undefined : '4 4'}
                        />
                        <text
                          x={padL - 10}
                          y={y + 4}
                          textAnchor="end"
                          className="fill-zinc-400 text-[11px] font-mono-num"
                        >
                          {tick}
                        </text>
                      </g>
                    );
                  })}

                  {/* Threshold label for score 4 (low stress upper limit) */}
                  <line
                    x1={padL}
                    y1={getScoreY(4)}
                    x2={chartW - padR}
                    y2={getScoreY(4)}
                    stroke="#10B981"
                    strokeOpacity="0.45"
                    strokeDasharray="3 3"
                  />

                  {/* Bars for weekly assessment count */}
                  {chartMetric !== 'score' &&
                    trend.map((pt, idx) => {
                      const cx = getX(idx);
                      const barW = 26;
                      const barH = getCountBarH(pt.assessmentCount);
                      const isActive = activeWeekIdx === idx;
                      return (
                        <rect
                          key={`bar-${pt.weekKey}`}
                          x={cx - barW / 2}
                          y={padT + innerH - barH}
                          width={barW}
                          height={barH}
                          rx={6}
                          fill={isActive ? '#FBCFE8' : '#FCE7F3'}
                          stroke={isActive ? '#EC4899' : '#F9A8D4'}
                          strokeWidth={1}
                        />
                      );
                    })}

                  {/* Line & Area for weekly average score */}
                  {chartMetric !== 'count' && trend.length > 1 && (
                    <>
                      <polygon points={areaPoints} fill="url(#pinkAreaGrad)" />
                      <polyline
                        fill="none"
                        stroke="#DB2777"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={linePoints}
                      />
                    </>
                  )}

                  {/* Data points & X-axis labels */}
                  {trend.map((pt, idx) => {
                    const cx = getX(idx);
                    const cy = getScoreY(pt.avgScore);
                    const isActive = activeWeekIdx === idx;

                    return (
                      <g
                        key={pt.weekKey}
                        onMouseEnter={() => setHoveredWeekIdx(idx)}
                        onClick={() => setHoveredWeekIdx(idx)}
                        className="cursor-pointer"
                      >
                        {/* Invisible wide hit column */}
                        <rect
                          x={cx - 34}
                          y={padT}
                          width={68}
                          height={innerH + 28}
                          fill="transparent"
                        />

                        {chartMetric !== 'count' && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isActive ? 6.5 : 4.5}
                            fill={isActive ? '#DB2777' : '#FFFFFF'}
                            stroke="#DB2777"
                            strokeWidth={2.5}
                          />
                        )}

                        {chartMetric === 'count' && (
                          <text
                            x={cx}
                            y={padT + innerH - getCountBarH(pt.assessmentCount) - 8}
                            textAnchor="middle"
                            className="fill-pink-700 text-[11px] font-semibold font-mono-num"
                          >
                            {pt.assessmentCount}
                          </text>
                        )}

                        <text
                          x={cx}
                          y={chartH - 12}
                          textAnchor="middle"
                          className={`text-[11px] ${
                            isActive ? 'fill-pink-700 font-semibold' : 'fill-zinc-500'
                          }`}
                        >
                          {pt.weekLabel}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Active Week Summary Strip */}
              {activeWeek && (
                <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-zinc-700">
                    <span className="font-semibold text-zinc-900">
                      สัปดาห์เริ่มต้น {activeWeek.weekLabel}
                    </span>
                    <span aria-hidden="true" className="text-zinc-300">
                      |
                    </span>
                    <span>
                      คะแนนเฉลี่ย:{' '}
                      <strong className="font-mono-num text-pink-600">
                        {activeWeek.avgScore.toFixed(2)} / 15
                      </strong>
                    </span>
                    <span aria-hidden="true" className="text-zinc-300">
                      |
                    </span>
                    <span>
                      จำนวนผู้ประเมิน:{' '}
                      <strong className="font-mono-num text-zinc-900">
                        {activeWeek.assessmentCount} ครั้ง
                      </strong>
                    </span>
                  </div>
                  <span className="font-medium text-zinc-700">
                    ระดับภาพรวม: {activeWeek.dominantLevel}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stress Level Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-zinc-200/90 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              สัดส่วนระดับความเครียดทั้งหมด
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5 mb-5">
              สรุปจำนวนครั้งของการประเมินแยกตาม 4 เกณฑ์มาตรฐาน
            </p>

            <div className="space-y-4">
              {stats.levelDistribution.map((item) => {
                const barColor = levelColors[item.level] ?? '#EC4899';
                return (
                  <div key={item.level} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium text-zinc-800">{item.level}</span>
                      <span className="font-mono-num text-zinc-700">
                        <strong className="text-zinc-900">{item.count}</strong> ครั้ง ({item.percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.percent}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 text-xs text-zinc-500 leading-relaxed">
            หมายเหตุ: ข้อมูลสถิติคำนวณแบบเรียลไทม์จากข้อมูลสมาชิกและการประเมิน ST-5 ล่าสุดในระบบ
          </div>
        </div>
      </div>
    </section>
  );
}
