import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, History, LayoutDashboard, LogOut } from 'lucide-react';
import { AuthSection } from './components/AuthSection';
import { AssessmentWorkspace } from './components/AssessmentWorkspace';
import { Avatar } from './components/Avatar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { PersonalHistory } from './components/PersonalHistory';
import {
  fetchDashboardApi,
  getAssessmentsApi,
  getMemberApi,
} from './services/apiClient';
import type { AssessmentLog, DashboardStats, PublicMember } from './types/st5';

const SESSION_STORAGE_KEY = 'st5_logged_in_stid';

type ActiveTab = 'assess' | 'history' | 'overview';

export default function App() {
  const [member, setMember] = useState<PublicMember | null>(null);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('assess');

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  const [personalLogs, setPersonalLogs] = useState<AssessmentLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError('');
    try {
      const data = await fetchDashboardApi();
      setDashboardStats(data);
    } catch {
      setDashboardError('ไม่สามารถโหลดข้อมูลสถิติภาพรวมได้ในขณะนี้');
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const fetchPersonalLogs = useCallback(async (st_id: string) => {
    setLogsLoading(true);
    try {
      const logs = await getAssessmentsApi(st_id);
      setPersonalLogs(logs);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const savedId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!savedId) {
      setSessionChecking(false);
      return;
    }

    getMemberApi(savedId)
      .then((found) => {
        if (found) {
          setMember(found);
          void fetchPersonalLogs(found.st_id);
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      })
      .catch(() => {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      })
      .finally(() => {
        setSessionChecking(false);
      });
  }, [fetchPersonalLogs]);

  const handleLoginSuccess = (loggedInMember: PublicMember) => {
    localStorage.setItem(SESSION_STORAGE_KEY, loggedInMember.st_id);
    setMember(loggedInMember);
    setActiveTab('assess');
    void fetchPersonalLogs(loggedInMember.st_id);
    void fetchDashboard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setMember(null);
    setPersonalLogs([]);
    setActiveTab('assess');
  };

  const handleAssessmentSaved = (newLog: AssessmentLog) => {
    setPersonalLogs((prev) => [newLog, ...prev]);
    void fetchDashboard();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFC] text-zinc-900">
      {/* Top Bar Contract: 3 zones (Wordmark — Nav Links — Primary Action) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-display text-lg font-bold tracking-tight text-pink-600 whitespace-nowrap shrink-0"
          >
            ST-5 Wellness
          </a>

          {!member ? (
            <nav
              aria-label="เมนูหลัก"
              className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600"
            >
              <a
                href="#auth-section"
                className="hover:text-pink-600 transition-colors whitespace-nowrap shrink-0"
              >
                เข้าสู่ระบบ
              </a>
              <a
                href="#overview-dashboard"
                className="hover:text-pink-600 transition-colors whitespace-nowrap shrink-0"
              >
                สถิติภาพรวม
              </a>
              <a
                href="#weekly-trend"
                className="hover:text-pink-600 transition-colors whitespace-nowrap shrink-0"
              >
                แนวโน้มรายสัปดาห์
              </a>
            </nav>
          ) : (
            <nav
              aria-label="เมนูผู้ใช้งาน"
              className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600"
            >
              <button
                type="button"
                onClick={() => setActiveTab('assess')}
                className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'assess'
                    ? 'text-pink-600 font-semibold'
                    : 'hover:text-pink-600'
                }`}
              >
                ทำแบบประเมิน
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'history'
                    ? 'text-pink-600 font-semibold'
                    : 'hover:text-pink-600'
                }`}
              >
                ประวัติของฉัน
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'text-pink-600 font-semibold'
                    : 'hover:text-pink-600'
                }`}
              >
                ภาพรวมสถิติ
              </button>
            </nav>
          )}

          <div className="flex items-center gap-3 shrink-0">
            {!member ? (
              <a
                href="#auth-section"
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-xs sm:text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0"
              >
                เริ่มทำแบบประเมิน
              </a>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2.5">
                  <Avatar
                    src={member.profile_img}
                    name={member.name}
                    lname={member.lname}
                    size="sm"
                  />
                  <div className="text-right">
                    <div className="text-xs font-semibold text-zinc-900 whitespace-nowrap max-w-[160px] truncate">
                      {member.prefix}
                      {member.name} {member.lname}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono-num whitespace-nowrap">
                      {member.st_id}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 hover:border-pink-300 bg-white text-xs font-semibold text-zinc-700 hover:text-pink-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="top" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {sessionChecking ? (
          <div className="h-64 bg-white border border-zinc-200 rounded-2xl animate-pulse" />
        ) : !member ? (
          <>
            {/* Login & Registration Section */}
            <AuthSection onLoginSuccess={handleLoginSuccess} />

            {/* Public Overview Dashboard directly below Login Box */}
            <OverviewDashboard
              stats={dashboardStats}
              loading={dashboardLoading}
              error={dashboardError}
              onRefresh={() => void fetchDashboard()}
            />
          </>
        ) : (
          <div className="space-y-6">
            {/* Authenticated Student Sub-Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-zinc-200/90 rounded-2xl p-3 sm:px-5">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={member.profile_img}
                  name={member.name}
                  lname={member.lname}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-zinc-900 truncate">
                    สวัสดีคุณ{member.name} {member.lname}
                  </div>
                  <div className="text-xs text-zinc-500 flex items-center gap-2 truncate">
                    <span className="font-mono-num">{member.st_id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{member.course}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl w-full sm:w-auto overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('assess')}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'assess'
                      ? 'bg-white text-pink-600 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>ทำแบบประเมิน ST-5</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-white text-pink-600 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>ประวัติย้อนหลัง ({personalLogs.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-white text-pink-600 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard ภาพรวม</span>
                </button>
              </div>
            </div>

            {activeTab === 'assess' && (
              <AssessmentWorkspace
                member={member}
                onAssessmentSaved={handleAssessmentSaved}
                onGoToHistory={() => setActiveTab('history')}
              />
            )}

            {activeTab === 'history' && (
              <PersonalHistory
                member={member}
                logs={personalLogs}
                loading={logsLoading}
                onStartAssessment={() => setActiveTab('assess')}
                onMemberUpdated={(updated) => setMember(updated)}
              />
            )}

            {activeTab === 'overview' && (
              <OverviewDashboard
                stats={dashboardStats}
                loading={dashboardLoading}
                error={dashboardError}
                onRefresh={() => void fetchDashboard()}
              />
            )}
          </div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-zinc-200/80 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div>
            ระบบประเมินตนเองเพื่อวัดระดับความสุขและความเครียด (ST-5) · สาขาวิชาเวชระเบียน
          </div>
          <div>
            สายด่วนสุขภาพจิต <span className="font-mono-num font-semibold text-pink-600">1323</span> (ฟรี ตลอด 24 ชั่วโมง)
          </div>
        </div>
      </footer>
    </div>
  );
}
