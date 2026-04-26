import { useParams, Link } from "react-router";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { trpc } from "@/providers/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Shield,
  TrendingUp,
  Zap,
  Brain,
  ArrowLeft,
  Wind,
  CloudRain,
  Thermometer,
  MapPin,
  ChevronRight,
  FileText,
  MonitorPlay,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const gameId = parseInt(id ?? "0", 10);

  const { data: game, isLoading } = trpc.nfl.gameById.useQuery({ id: gameId });
  const { data: narratives } = trpc.nfl.narratives.useQuery({ gameId });

  const p = game?.prediction;
  const ht = game?.homeTeam;
  const at = game?.awayTeam;

  const radarData =
    ht && at
      ? [
          { subject: "Pass Off", home: ht.passOffenseRank ?? 16, away: at.passOffenseRank ?? 16 },
          { subject: "Run Off", home: ht.runOffenseRank ?? 16, away: at.runOffenseRank ?? 16 },
          { subject: "Pass Def", home: ht.passDefenseRank ?? 16, away: at.passDefenseRank ?? 16 },
          { subject: "Run Def", home: ht.runDefenseRank ?? 16, away: at.runDefenseRank ?? 16 },
          { subject: "Scheme", home: ht.schemeComplexity ?? 50, away: at.schemeComplexity ?? 50 },
          { subject: "QB Vol", home: 100 - (ht.qbVolatility ?? 50), away: 100 - (at.qbVolatility ?? 50) },
        ]
      : [];

  const lineMovementData = [
    { label: "Public %", value: p?.publicBettingPercent ?? 50 },
    { label: "Sharp %", value: p?.sharpMoneyPercent ?? 50 },
    { label: "Analyst %", value: p?.analystConsensus ?? 50 },
  ];

  const chaosScore = p?.chaosScore ?? 50;
  const chaosLabel = chaosScore < 40 ? "Low Variance" : chaosScore < 70 ? "Moderate Chaos" : "High Chaos";
  const chaosColor = chaosScore < 40 ? "text-emerald-400" : chaosScore < 70 ? "text-amber-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 lg:px-6 py-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 bg-white/10" />
            <Skeleton className="h-64 w-full bg-white/10" />
            <Skeleton className="h-48 w-full bg-white/10" />
          </div>
        ) : !game ? (
          <div className="text-center py-20">
            <p className="text-slate-500">Game not found.</p>
            <Button variant="ghost" className="mt-4 text-amber-400" asChild>
              <Link to="/games">Back to games</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <Button
              variant="ghost"
              size="sm"
              className="mb-6 text-slate-400 hover:text-white -ml-2"
              asChild
            >
              <Link to="/games">
                <ArrowLeft className="h-4 w-4 mr-1" />
                All Games
              </Link>
            </Button>

            {/* Game Header */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="mb-8"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className="h-14 w-14 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-xl"
                    style={{ backgroundColor: at?.primaryColor ?? "#333" }}
                  >
                    {at?.abbreviation}
                  </div>
                  <div className="text-center px-3">
                    <p className="text-xs text-slate-500 mb-1">@</p>
                    <p className="text-sm font-mono text-slate-400">
                      {new Date(game.gameDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div
                    className="h-14 w-14 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-xl"
                    style={{ backgroundColor: ht?.primaryColor ?? "#333" }}
                  >
                    {ht?.abbreviation}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="h-4 w-4" />
                    {game.venue}
                  </div>
                  {game.primetime && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 uppercase">
                      <Zap className="h-3 w-3" />
                      Primetime
                    </span>
                  )}
                </div>
              </div>

              <h1 className="text-3xl font-bold text-white mt-6">
                {at?.name} at {ht?.name}
              </h1>
              <p className="text-slate-400 mt-2">
                Week {game.week}, {game.season} Season · Predictability Intelligence Report
              </p>
            </motion.div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="overview" className="text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="scheme" className="text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Scheme Analysis
                </TabsTrigger>
                <TabsTrigger value="line" className="text-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                  Line Movement
                </TabsTrigger>
                <TabsTrigger value="narratives" className="text-sm data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  Narratives
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Score Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-white/[0.03] border-white/10 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-red-400" />
                      <span className="text-xs text-slate-500 uppercase tracking-wider">Chaos Score</span>
                    </div>
                    <p className={`text-3xl font-bold ${chaosColor}`}>{chaosScore}</p>
                    <p className="text-xs text-slate-500 mt-1">{chaosLabel}</p>
                  </Card>

                  <Card className="bg-white/[0.03] border-white/10 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span className="text-xs text-slate-500 uppercase tracking-wider">Predictability</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-400">{p?.predictabilityIndex ?? 0}%</p>
                    <p className="text-xs text-slate-500 mt-1">Confidence in outcome</p>
                  </Card>

                  <Card className="bg-white/[0.03] border-white/10 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-amber-400" />
                      <span className="text-xs text-slate-500 uppercase tracking-wider">Home Win Prob</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-400">{p?.homeWinProbability ?? "50"}%</p>
                    <p className="text-xs text-slate-500 mt-1">{ht?.name}</p>
                  </Card>

                  <Card className="bg-white/[0.03] border-white/10 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs text-slate-500 uppercase tracking-wider">Confidence</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-400">{p?.confidenceScore ?? 0}%</p>
                    <p className="text-xs text-slate-500 mt-1">Model certainty</p>
                  </Card>
                </div>

                {/* Predicted Score & Weather */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="bg-white/[0.03] border-white/10 p-6 lg:col-span-2">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-amber-400" />
                      Predicted Outcome
                    </h3>
                    <div className="flex items-center justify-center gap-8 py-4">
                      <div className="text-center">
                        <div
                          className="h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white mx-auto mb-2 shadow-xl"
                          style={{ backgroundColor: at?.primaryColor ?? "#333" }}
                        >
                          {at?.abbreviation}
                        </div>
                        <p className="text-sm font-semibold text-white">{at?.name}</p>
                        <p className="text-3xl font-bold text-white mt-2">{p?.predictedAwayScore ?? "0"}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-slate-600 mb-2">PREDICTED</p>
                        <div className="h-px w-16 bg-white/20" />
                        <p className="text-xs text-slate-600 mt-2">Spread: {game.spread}</p>
                        <p className="text-xs text-slate-600">Total: {game.total}</p>
                      </div>

                      <div className="text-center">
                        <div
                          className="h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white mx-auto mb-2 shadow-xl"
                          style={{ backgroundColor: ht?.primaryColor ?? "#333" }}
                        >
                          {ht?.abbreviation}
                        </div>
                        <p className="text-sm font-semibold text-white">{ht?.name}</p>
                        <p className="text-3xl font-bold text-white mt-2">{p?.predictedHomeScore ?? "0"}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-white/[0.03] border-white/10 p-6">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <Wind className="h-4 w-4 text-blue-400" />
                      Weather Factors
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Thermometer className="h-4 w-4" />
                          Temperature
                        </div>
                        <span className="text-sm font-mono text-white">{game.weatherTemp ?? 68}°F</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Wind className="h-4 w-4" />
                          Wind Speed
                        </div>
                        <span className="text-sm font-mono text-white">{game.weatherWind ?? 8} mph</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <CloudRain className="h-4 w-4" />
                          Precipitation
                        </div>
                        <span className="text-sm font-mono text-white">{game.weatherPrecip ?? 0}%</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-xs text-blue-400">
                        {(game.weatherWind ?? 0) > 15 || (game.weatherPrecip ?? 0) > 30
                          ? "Weather volatility may increase chaos score significantly."
                          : "Favorable conditions. Minimal weather impact on predictability."}
                      </p>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Scheme Analysis */}
              <TabsContent value="scheme" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/[0.03] border-white/10 p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">
                      Team Comparison Radar
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <PolarRadiusAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} />
                        <Radar
                          name={ht?.name}
                          dataKey="home"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Radar
                          name={at?.name}
                          dataKey="away"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.2}
                          strokeWidth={2}
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
                      </RadarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        <span className="text-xs text-slate-400">{ht?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-400" />
                        <span className="text-xs text-slate-400">{at?.name}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-white/[0.03] border-white/10 p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">
                      Scheme Mismatch Breakdown
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          label: "Pass Game Advantage",
                          value: Math.abs(p?.passGameAdvantage ?? 0),
                          team: (p?.passGameAdvantage ?? 0) > 0 ? ht?.name : at?.name,
                          color: "bg-amber-400",
                        },
                        {
                          label: "Run Game Advantage",
                          value: Math.abs(p?.runGameAdvantage ?? 0),
                          team: (p?.runGameAdvantage ?? 0) > 0 ? ht?.name : at?.name,
                          color: "bg-blue-400",
                        },
                        {
                          label: "Scheme Complexity Gap",
                          value: p?.schemeMismatchScore ?? 0,
                          team: (ht?.schemeComplexity ?? 0) > (at?.schemeComplexity ?? 0) ? ht?.name : at?.name,
                          color: "bg-purple-400",
                        },
                      ].map((item, i) => (
                        <div key={i} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">{item.label}</span>
                            <span className="text-xs font-medium text-white">{item.team}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.color}`}
                              style={{ width: `${Math.min(100, (item.value / 32) * 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-600 mt-1">Score: {item.value}/32</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Line Movement */}
              <TabsContent value="line" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/[0.03] border-white/10 p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">
                      Market Consensus Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={lineMovementData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 100]} />
                        <YAxis dataKey="label" type="category" tick={{ fill: "#94a3b8", fontSize: 12 }} width={70} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card className="bg-white/[0.03] border-white/10 p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">
                      Signal Interpretation
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-semibold text-white">Line Movement Signal</span>
                        </div>
                        <p className="text-sm text-slate-400 capitalize">
                          {p?.lineMovementSignal?.replace("_", " ") ?? "Neutral"}
                        </p>
                        <p className="text-xs text-slate-600 mt-2">
                          {p?.lineMovementSignal?.includes("sharp")
                            ? "Sharp money is moving against the public. Consider the contrarian angle in your narrative."
                            : p?.lineMovementSignal?.includes("public")
                            ? "Public betting heavily on one side. Line may be inflated."
                            : "No significant signal detected. Market is balanced."}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4 text-amber-400" />
                          <span className="text-sm font-semibold text-white">Sharp vs Public Split</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-500">Sharp</span>
                              <span className="text-emerald-400">{p?.sharpMoneyPercent ?? 50}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-400"
                                style={{ width: `${p?.sharpMoneyPercent ?? 50}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-500">Public</span>
                              <span className="text-blue-400">{p?.publicBettingPercent ?? 50}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-400"
                                style={{ width: `${p?.publicBettingPercent ?? 50}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Narratives */}
              <TabsContent value="narratives" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    Generated Narratives
                  </h3>
                  <Button
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                    asChild
                  >
                    <Link to="/narratives">
                      Generate New
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {narratives && narratives.length > 0 ? (
                    narratives.map((n) => (
                      <Card
                        key={n.id}
                        className="bg-white/[0.03] border-white/10 p-6 hover:bg-white/[0.05] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                              n.narrativeType === "pregame"
                                ? "bg-blue-500/10 text-blue-400"
                                : n.narrativeType === "live"
                                ? "bg-red-500/10 text-red-400"
                                : n.narrativeType === "postgame"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-purple-500/10 text-purple-400"
                            }`}
                          >
                            {n.narrativeType}
                          </span>
                          {n.aiGenerated && (
                            <span className="text-[10px] text-slate-600 flex items-center gap-1">
                              <Brain className="h-3 w-3" />
                              AI Generated
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-2">
                          {n.title}
                        </h4>
                        <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                          {n.content}
                        </p>
                        <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
                          <span>Confidence: {n.confidenceRating}%</span>
                          {n.broadcastReady && (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <MonitorPlay className="h-3 w-3" />
                              Broadcast Ready
                            </span>
                          )}
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="lg:col-span-2 text-center py-12">
                      <p className="text-slate-500">No narratives yet for this game.</p>
                      <Button
                        variant="ghost"
                        className="mt-4 text-purple-400"
                        asChild
                      >
                        <Link to="/narratives">Generate your first narrative</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
