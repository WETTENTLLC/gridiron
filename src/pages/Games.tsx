import { useState } from "react";
import { Link } from "react-router";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { trpc } from "@/providers/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  TrendingUp,
  Shield,
  Zap,
  ChevronRight,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

function GameCard({ prediction }: { prediction: any }) {
  const p = prediction;
  const chaos = p.chaosScore ?? 50;
  const predictability = p.predictabilityIndex ?? 50;
  const homeProb = parseFloat(p.homeWinProbability ?? "50");
  const awayProb = 100 - homeProb;

  const chaosColor =
    chaos < 40 ? "text-emerald-400" : chaos < 70 ? "text-amber-400" : "text-red-400";
  const chaosBg =
    chaos < 40 ? "bg-emerald-500/10" : chaos < 70 ? "bg-amber-500/10" : "bg-red-500/10";

  return (
    <Link to={`/games/${p.game.id}`}>
      <Card className="bg-white/[0.03] border-white/10 hover:bg-white/[0.05] hover:border-white/20 transition-all group overflow-hidden">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Week {p.game.week}
              </span>
              {p.game.primetime && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 uppercase">
                  <Zap className="h-3 w-3" />
                  Primetime
                </span>
              )}
            </div>
            <span className="text-xs text-slate-600">
              {new Date(p.game.gameDate).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Teams */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-lg"
                style={{ backgroundColor: p.awayTeam?.primaryColor ?? "#333" }}
              >
                {p.awayTeam?.abbreviation}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{p.awayTeam?.name}</p>
                <p className="text-xs text-slate-500">Away</p>
              </div>
            </div>

            <div className="text-center px-4">
              <span className="text-xs text-slate-600">@</span>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xs font-mono text-slate-500">{awayProb.toFixed(0)}%</span>
                <span className="text-xs text-slate-700">vs</span>
                <span className="text-xs font-mono text-amber-400">{homeProb.toFixed(0)}%</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-sm font-semibold text-white">{p.homeTeam?.name}</p>
                <p className="text-xs text-slate-500">Home</p>
              </div>
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-lg"
                style={{ backgroundColor: p.homeTeam?.primaryColor ?? "#333" }}
              >
                {p.homeTeam?.abbreviation}
              </div>
            </div>
          </div>

          {/* Predictor Scores */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className={`rounded-lg ${chaosBg} p-3`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  Chaos
                </span>
              </div>
              <p className={`text-lg font-bold ${chaosColor}`}>{chaos}</p>
            </div>

            <div className="rounded-lg bg-blue-500/10 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Shield className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  Predictability
                </span>
              </div>
              <p className="text-lg font-bold text-blue-400">{predictability}%</p>
            </div>

            <div className="rounded-lg bg-amber-500/10 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  Confidence
                </span>
              </div>
              <p className="text-lg font-bold text-amber-400">
                {p.confidenceScore ?? 0}%
              </p>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>
                Pass Adv:{" "}
                <span className={p.passGameAdvantage && p.passGameAdvantage > 0 ? "text-emerald-400" : "text-red-400"}>
                  {p.passGameAdvantage && p.passGameAdvantage > 0 ? "Home" : "Away"}
                </span>
              </span>
              <span>
                Scheme Mismatch:{" "}
                <span className="text-amber-400">{p.schemeMismatchScore ?? 0}</span>
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-white transition-colors" />
          </div>
        </div>

        {/* Line Movement Signal Bar */}
        {p.lineMovementSignal && p.lineMovementSignal !== "neutral" && (
          <div
            className={`px-5 py-2 text-xs font-medium ${
              p.lineMovementSignal.includes("sharp")
                ? "bg-emerald-500/10 text-emerald-400"
                : p.lineMovementSignal.includes("public")
                ? "bg-blue-500/10 text-blue-400"
                : "bg-amber-500/10 text-amber-400"
            }`}
          >
            <TrendingUp className="h-3 w-3 inline mr-1" />
            {p.lineMovementSignal.replace("_", " ").toUpperCase()} SIGNAL DETECTED
          </div>
        )}
      </Card>
    </Link>
  );
}

export default function Games() {
  const [filter, setFilter] = useState<"all" | "high-chaos" | "low-chaos" | "sharp">("all");

  const { data: predictions, isLoading } = trpc.nfl.predictions.useQuery({
    week: 8,
    season: 2026,
  });

  const filteredPredictions = predictions?.filter((p) => {
    if (filter === "high-chaos") return (p.chaosScore ?? 0) > 60;
    if (filter === "low-chaos") return (p.chaosScore ?? 0) < 40;
    if (filter === "sharp") return p.lineMovementSignal?.includes("sharp");
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Predictor Scores</h1>
            <p className="text-sm text-slate-400 mt-1">
              Week 8, 2026 · Variance, Chaos & Predictability Intelligence
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="all" className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                  All
                </TabsTrigger>
                <TabsTrigger value="high-chaos" className="text-xs data-[state=active]:bg-red-500 data-[state=active]:text-white">
                  High Chaos
                </TabsTrigger>
                <TabsTrigger value="low-chaos" className="text-xs data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                  Low Chaos
                </TabsTrigger>
                <TabsTrigger value="sharp" className="text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Sharp Signal
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Games Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full bg-white/10" />
              ))
            : filteredPredictions?.map((prediction) => (
                <motion.div key={prediction.id} variants={fadeInUp}>
                  <GameCard prediction={prediction} />
                </motion.div>
              ))}
        </motion.div>

        {!isLoading && filteredPredictions?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500">No games match the selected filter.</p>
            <Button
              variant="ghost"
              className="mt-4 text-amber-400"
              onClick={() => setFilter("all")}
            >
              Clear filter
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
