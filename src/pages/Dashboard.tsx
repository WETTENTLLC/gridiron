import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { trpc } from "@/providers/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router";
import {
  Activity,
  BarChart3,
  TrendingUp,
  Zap,
  Gamepad2,
  FileText,
  ArrowRight,
  Shield,
  Target,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } =
    trpc.nfl.analyticsDashboard.useQuery();
  const { data: predictions, isLoading: predictionsLoading } =
    trpc.nfl.predictions.useQuery({ week: 8, season: 2026 });

  const chaosDistribution = predictions
    ? [
        { name: "Low (<40)", value: predictions.filter((p) => (p.chaosScore ?? 0) < 40).length, color: "#10b981" },
        { name: "Moderate (40-70)", value: predictions.filter((p) => {
          const s = p.chaosScore ?? 0;
          return s >= 40 && s <= 70;
        }).length, color: "#f59e0b" },
        { name: "High (>70)", value: predictions.filter((p) => (p.chaosScore ?? 0) > 70).length, color: "#ef4444" },
      ]
    : [];

  const schemeAdvantageData = predictions?.slice(0, 8).map((p) => ({
    name: `${p.awayTeam?.abbreviation} @ ${p.homeTeam?.abbreviation}`,
    passAdvantage: Math.abs(p.passGameAdvantage ?? 0),
    runAdvantage: Math.abs(p.runGameAdvantage ?? 0),
  })) ?? [];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Week 8, 2026 Season · Predictability Intelligence Overview
          </p>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Total Games",
              value: analytics?.totalGames ?? 0,
              icon: Gamepad2,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              loading: analyticsLoading,
            },
            {
              label: "Predictions",
              value: analytics?.totalPredictions ?? 0,
              icon: Target,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
              loading: analyticsLoading,
            },
            {
              label: "Avg Chaos Score",
              value: analytics?.avgChaosScore ?? 0,
              suffix: "/100",
              icon: AlertTriangle,
              color: "text-red-400",
              bg: "bg-red-500/10",
              loading: analyticsLoading,
            },
            {
              label: "Predictability",
              value: analytics?.avgPredictabilityIndex ?? 0,
              suffix: "%",
              icon: Shield,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
              loading: analyticsLoading,
            },
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card className="bg-white/[0.03] border-white/10 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-9 w-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  {stat.loading ? (
                    <Skeleton className="h-8 w-12 bg-white/10" />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {stat.value}
                      <span className="text-sm font-normal text-slate-500">{stat.suffix}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chaos Distribution */}
          <Card className="bg-white/[0.03] border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-red-400" />
                Chaos Score Distribution
              </h3>
            </div>
            {predictionsLoading ? (
              <Skeleton className="h-48 w-full bg-white/10" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={chaosDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chaosDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="flex justify-center gap-4 mt-2">
              {chaosDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-slate-400">{item.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Scheme Advantage */}
          <Card className="bg-white/[0.03] border-white/10 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-400" />
                Scheme Advantage by Matchup
              </h3>
            </div>
            {predictionsLoading ? (
              <Skeleton className="h-48 w-full bg-white/10" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={schemeAdvantageData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="passAdvantage" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pass" />
                  <Bar dataKey="runAdvantage" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Run" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Quick Actions + Recent Games */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <Card className="bg-white/[0.03] border-white/10 p-6 h-full">
              <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: "Generate Narrative",
                    desc: "AI-powered broadcast script",
                    icon: FileText,
                    to: "/narratives",
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                  },
                  {
                    label: "View All Games",
                    desc: "Week 8 predictor scores",
                    icon: Gamepad2,
                    to: "/games",
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                  },
                  {
                    label: "Studio Producer",
                    desc: "Broadcast graphics & feeds",
                    icon: TrendingUp,
                    to: "/studio",
                    color: "text-cyan-400",
                    bg: "bg-cyan-500/10",
                  },
                ].map((action, i) => (
                  <motion.div key={i} variants={fadeInUp}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto py-3 px-3 hover:bg-white/5 group"
                      asChild
                    >
                      <Link to={action.to}>
                        <div className={`h-9 w-9 rounded-lg ${action.bg} flex items-center justify-center mr-3`}>
                          <action.icon className={`h-4 w-4 ${action.color}`} />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                            {action.label}
                          </p>
                          <p className="text-xs text-slate-500">{action.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Games Preview */}
          <div className="lg:col-span-2">
            <Card className="bg-white/[0.03] border-white/10 p-6 h-full">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-blue-400" />
                  This Week's Matchups
                </h3>
                <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300" asChild>
                  <Link to="/games">
                    View all
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {predictionsLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full bg-white/10" />
                    ))
                  : predictions?.slice(0, 5).map((p) => (
                      <Link
                        key={p.id}
                        to={`/games/${p.game.id}`}
                        className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/5 px-4 py-3 hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{p.awayTeam?.abbreviation}</span>
                            <span className="text-xs text-slate-600">@</span>
                            <span className="text-sm font-bold text-white">{p.homeTeam?.abbreviation}</span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(p.game.gameDate).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Chaos</span>
                            <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400"
                                style={{ width: `${p.chaosScore ?? 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono text-slate-400 w-6">{p.chaosScore}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                      </Link>
                    ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
