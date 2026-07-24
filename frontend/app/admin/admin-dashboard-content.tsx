"use client";

import { apiRequest } from "../api";
import NoticeBanner, { type Notice } from "../notice-banner";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Cloud,
  FileDown,
  Filter,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

type DashboardData = {
  apiStatus: {
    connected: boolean;
    provider: string;
    lastSync: string | null;
    externalId: string;
  };
  stats: {
    activeTournaments: number;
    totalPlayers: number;
    upcomingMatches: number;
    attentionNeeded: number;
    pendingPredictions: number;
    warningMatches: number;
    inactivePlayers: number;
  };
  tournaments: TournamentRow[];
  upcomingSchedule: MatchRow[];
  recentActivity: ActivityRow[];
};

type TournamentRow = {
  id: number;
  name: string;
  status: string;
  players: number;
  matches: number;
  source: string;
};

type MatchRow = {
  id: number;
  encounter: string;
  tournamentName: string;
  scheduledTime: string;
  deadline: string;
  source: string;
  status: string;
};

type ActivityRow = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
};

const emptyDashboard: DashboardData = {
  apiStatus: {
    connected: false,
    provider: "Football Data API v4",
    lastSync: null,
    externalId: "LOCAL",
  },
  stats: {
    activeTournaments: 0,
    totalPlayers: 0,
    upcomingMatches: 0,
    attentionNeeded: 0,
    pendingPredictions: 0,
    warningMatches: 0,
    inactivePlayers: 0,
  },
  tournaments: [],
  upcomingSchedule: [],
  recentActivity: [],
};

export default function AdminDashboardContent({
  isAdmin,
  refreshKey,
}: {
  isAdmin: boolean;
  refreshKey: number;
}) {
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    void loadDashboard();
  }, [refreshKey]);

  async function loadDashboard() {
    setIsLoading(true);

    try {
      const data = await apiRequest<DashboardData>("/dashboard");
      setDashboard(data);
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Cannot load dashboard.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function showNotice(message: string, tone: Notice["tone"] = "info") {
    setNotice({ message, tone });
  }

  function showNotReady() {
    showNotice("this feature is not ready");
  }

  return (
    <div className="px-8 py-9">
      <NoticeBanner notice={notice} onClose={() => setNotice(null)} />
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <h2 className="text-[34px] font-black leading-none text-white">
            Dashboard
          </h2>
          <p className="mt-3 text-[16px] text-[#adbdc2]">
            Welcome back. System is running within optimal parameters.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap justify-end gap-4">
            <DashboardActionButton icon={<RefreshCw size={18} />} label="Reset API" onClick={showNotReady} />
            <DashboardActionButton icon={<FileDown size={18} />} label="Import API" onClick={showNotReady} />
            <button
              onClick={showNotReady}
              className="flex h-[62px] items-center gap-3 rounded bg-[#84d8e8] px-8 text-lg font-black text-[#06161b]"
            >
              <Plus size={22} />
              Create Tournament
            </button>
          </div>
        )}
      </div>

      <section className="mb-5 rounded border border-[#3a4d54] bg-[#0d252d] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center bg-[#143942] text-[#84d8e8]">
            <Cloud size={23} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black uppercase text-[#84d8e8]">
              API Status: {dashboard.apiStatus.connected ? "Connected" : "Offline"}
            </p>
            <p className="mt-1 text-sm text-[#9fb2b8]">
              {dashboard.apiStatus.provider} - Last sync: {formatRelative(dashboard.apiStatus.lastSync)}
            </p>
          </div>
          <div className="bg-[#14272e] px-4 py-2 text-xs font-black uppercase text-[#c4d3d8]">
            ID: {dashboard.apiStatus.externalId}
          </div>
          <button onClick={() => void loadDashboard()} title="Refresh dashboard" className="text-[#dce8eb]">
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-4 gap-6">
        <DashboardStatCard title="Active Tournaments" value={dashboard.stats.activeTournaments} note="Live in database" icon={<Trophy size={22} />} />
        <DashboardStatCard title="Total Players" value={dashboard.stats.totalPlayers} note="Registered players" icon={<Users size={22} />} />
        <DashboardStatCard title="Upcoming Matches" value={dashboard.stats.upcomingMatches} note="From now onward" icon={<CalendarDays size={22} />} />
        <DashboardStatCard tone="danger" title="Attention Needed" value={dashboard.stats.attentionNeeded} note={`${dashboard.stats.inactivePlayers} inactive, ${dashboard.stats.pendingPredictions} pending`} icon={<AlertTriangle size={24} />} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="overflow-hidden rounded border border-[#3a4d54] bg-[#0d252d]">
          <DashboardPanelTitle title="Tournament Management" icon={<Filter size={17} />} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed text-left">
              <thead className="h-[65px] border-b border-[#3a4d54] bg-[#14272e] text-xs uppercase tracking-[0.08em] text-[#d5e0e3]">
                <tr>
                  <th className="px-6 py-4">Tournament Name</th>
                  <th className="w-32 px-4 py-4">Status</th>
                  <th className="w-28 px-4 py-4">Players</th>
                  <th className="w-28 px-4 py-4">Matches</th>
                  <th className="w-28 px-4 py-4">Source</th>
                  <th className="w-28 px-4 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.tournaments.map((tournament) => (
                  <tr key={tournament.id} className="h-[73px] border-b border-[#243c43] text-sm last:border-b-0">
                    <td className="px-6 font-black text-white">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center bg-[#143942] text-[#84d8e8]">
                          <ShieldCheck size={17} />
                        </span>
                        {tournament.name}
                      </div>
                    </td>
                    <td className="px-4"><DashboardStatusBadge status={tournament.status} /></td>
                    <td className="px-4 text-white">{tournament.players.toLocaleString()}</td>
                    <td className="px-4 text-white">{tournament.matches.toLocaleString()}</td>
                    <td className="px-4"><DashboardSourceBadge source={tournament.source} /></td>
                    <td className="px-4">
                      <button onClick={showNotReady} className="text-sm font-black uppercase text-[#84d8e8]">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {dashboard.tournaments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="h-[120px] text-center text-[#9fb2b8]">
                      No tournaments found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="overflow-hidden rounded border border-[#3a4d54] bg-[#0d252d]">
          <DashboardPanelTitle title="Recent Activity" />
          <div className="min-h-[420px] space-y-6 p-6">
            {dashboard.recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#143942] text-[#84d8e8]">
                  <DashboardActivityIcon type={activity.type} />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#dce8eb]">{activity.message}</p>
                  <p className="mt-2 text-xs uppercase text-[#789098]">{formatRelative(activity.createdAt)}</p>
                </div>
              </div>
            ))}
            {dashboard.recentActivity.length === 0 && (
              <p className="pt-12 text-center text-[#9fb2b8]">No recent activity in database.</p>
            )}
          </div>
          <div className="border-t border-[#3a4d54] p-5">
            <button onClick={showNotReady} className="h-12 w-full bg-[#14272e] text-sm font-black uppercase text-[#dce8eb]">
              View Full Audit Log
            </button>
          </div>
        </aside>
      </div>

      <section className="mt-14 overflow-hidden rounded border border-[#3a4d54] bg-[#0d252d]">
        <DashboardPanelTitle title="Upcoming Schedule" right="View All Matches" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] table-fixed text-left">
            <thead className="h-[65px] border-b border-[#3a4d54] bg-[#14272e] text-xs uppercase tracking-[0.08em] text-[#d5e0e3]">
              <tr>
                <th className="px-6 py-4">Match Encounter</th>
                <th className="px-4 py-4">Tournament</th>
                <th className="px-4 py-4">Kick-off Time</th>
                <th className="px-4 py-4">Source</th>
                <th className="px-4 py-4">Deadline</th>
                <th className="px-4 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.upcomingSchedule.map((match) => (
                <tr key={match.id} className="h-[65px] border-b border-[#243c43] text-sm last:border-b-0">
                  <td className="px-6 font-black text-white">{match.encounter}</td>
                  <td className="px-4 text-white">{match.tournamentName}</td>
                  <td className="px-4 text-white">{formatDate(match.scheduledTime)}</td>
                  <td className="px-4"><DashboardSourceBadge source={match.source} /></td>
                  <td className="px-4 text-white">{formatDate(match.deadline)}</td>
                  <td className="px-4"><DashboardStatusBadge status={match.status} /></td>
                </tr>
              ))}
              {dashboard.upcomingSchedule.length === 0 && (
                <tr>
                  <td colSpan={6} className="h-[110px] text-center text-[#9fb2b8]">
                    No upcoming matches found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function DashboardActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex h-[62px] items-center gap-3 rounded border border-[#3a4d54] bg-[#0d252d] px-7 text-lg font-black text-[#dce8eb] transition hover:border-[#84d8e8] hover:text-[#84d8e8]">
      {icon}
      {label}
    </button>
  );
}

function DashboardStatCard({ title, value, note, icon, tone = "normal" }: { title: string; value: number; note: string; icon: React.ReactNode; tone?: "normal" | "danger" }) {
  return (
    <div className={`h-[144px] rounded border bg-[#0d252d] px-6 py-6 shadow-[0_2px_0_rgba(255,255,255,0.08)] ${tone === "danger" ? "border-[#6b4440]" : "border-[#3a4d54]"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className={`text-sm font-black uppercase tracking-[0.1em] ${tone === "danger" ? "text-[#ffab9e]" : "text-[#c8d6db]"}`}>{title}</h3>
          <p className={`mt-2 text-[36px] font-black leading-none ${tone === "danger" ? "text-[#ffab9e]" : "text-white"}`}>{value.toLocaleString()}</p>
          <p className="mt-4 text-xs font-bold text-white">{note}</p>
        </div>
        <div className="flex h-[54px] w-[49px] items-center justify-center rounded bg-[#213740] text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

function DashboardPanelTitle({ title, icon, right }: { title: string; icon?: React.ReactNode; right?: string }) {
  return (
    <div className="flex h-[65px] items-center justify-between border-b border-[#3a4d54] bg-[#14272e] px-6">
      <h2 className="text-sm font-black uppercase tracking-[0.08em] text-[#d5e0e3]">{title}</h2>
      {icon && <div className="text-[#dce8eb]">{icon}</div>}
      {right && <button className="text-xs font-black uppercase text-[#84d8e8]">{right}</button>}
    </div>
  );
}

function DashboardStatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const className =
    normalized === "ACTIVE" || normalized === "LIVE"
      ? "border-l-2 border-white bg-[#162b32] text-white"
      : normalized === "UPCOMING" || normalized === "PENDING"
        ? "bg-[#1c3037] text-[#dce8eb]"
        : normalized === "COMPLETED" || normalized === "FINISHED"
          ? "bg-[#183229] text-[#a7e8c0]"
          : "bg-[#2b1414] text-[#ffab9e]";

  return <span className={`inline-flex h-[27px] items-center px-3 text-xs font-black uppercase ${className}`}>{normalized}</span>;
}

function DashboardSourceBadge({ source }: { source: string }) {
  return <span className="inline-flex h-6 items-center bg-[#203940] px-2 text-xs font-black uppercase text-[#dce8eb]">{source || "MANUAL"}</span>;
}

function DashboardActivityIcon({ type }: { type: string }) {
  if (type === "user") {
    return <Users size={14} />;
  }

  if (type === "match") {
    return <Zap size={14} />;
  }

  return <Trophy size={14} />;
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRelative(value: string | null) {
  if (!value) {
    return "No sync yet";
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs)) {
    return "Unknown";
  }

  const minutes = Math.max(1, Math.round(diffMs / 60000));

  if (minutes < 60) {
    return `${minutes} minutes ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours} hours ago`;
  }

  return `${Math.round(hours / 24)} days ago`;
}




