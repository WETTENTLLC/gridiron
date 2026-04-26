import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { trpc } from "@/providers/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Shield,
  Star,
  Award,
  Zap,
  ChevronRight,
  Medal,
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

const tierConfig = {
  bronze: { color: "text-amber-700", bg: "bg-amber-900/20", border: "border-amber-900/30", icon: Medal },
  silver: { color: "text-slate-300", bg: "bg-slate-700/20", border: "border-slate-700/30", icon: Award },
  gold: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Trophy },
  platinum: { color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: Star },
};

const specConfig = {
  offense: { label: "Offense", color: "text-orange-400", bg: "bg-orange-500/10" },
  defense: { label: "Defense", color: "text-blue-400", bg: "bg-blue-500/10" },
  special_teams: { label: "Special Teams", color: "text-purple-400", bg: "bg-purple-500/10" },
  betting: { label: "Betting", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  general: { label: "General", color: "text-slate-400", bg: "bg-slate-500/10" },
};

export default function Analysts() {
  const [filter, setFilter] = useState<"all" | "verified" | "top">("all");

  const { data: analysts, isLoading } = trpc.nfl.analysts.useQuery();

  const filteredAnalysts = analysts?.filter((a) => {
    if (filter === "verified") return a.verified;
    if (filter === "top") return a.tier === "platinum" || a.tier === "gold";
    return true;
  });

  const sortedAnalysts = filteredAnalysts?.sort((a, b) => {
    const aScore = parseFloat(a.accuracyScore ?? "0");
    const bScore = parseFloat(b.accuracyScore ?? "0");
    return bScore - aScore;
  });

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-rose-400" />
              Analyst Network
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Vetted experts adjusting model weights and building historical trend databases
            </p>
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="all" className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                All
              </TabsTrigger>
              <TabsTrigger value="verified" className="text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Verified
              </TabsTrigger>
              <TabsTrigger value="top" className="text-xs data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                Top Tier
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Total Analysts",
              value: analysts?.length ?? 0,
              icon: Users,
              color: "text-rose-400",
              bg: "bg-rose-500/10",
            },
            {
              label: "Verified",
              value: analysts?.filter((a) => a.verified).length ?? 0,
              icon: Shield,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              label: "Platinum Tier",
              value: analysts?.filter((a) => a.tier === "platinum").length ?? 0,
              icon: Star,
              color: "text-cyan-400",
              bg: "bg-cyan-500/10",
            },
            {
              label: "Avg Accuracy",
              value: analysts && analysts.length > 0
                ? (analysts.reduce((sum, a) => sum + parseFloat(a.accuracyScore ?? "0"), 0) / analysts.length).toFixed(1)
                : "0.0",
              suffix: "%",
              icon: Target,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
            },
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card className="bg-white/[0.03] border-white/10 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-9 w-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {stat.value}
                    <span className="text-sm font-normal text-slate-500">{stat.suffix}</span>
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Leaderboard */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Accuracy Leaderboard
          </h2>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-3"
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full bg-white/10" />
              ))
            : sortedAnalysts?.map((analyst, index) => {
                const tier = tierConfig[analyst.tier ?? "bronze"];
                const spec = specConfig[analyst.specialization ?? "general"];
                const streak = analyst.streak ?? 0;
                const accuracy = parseFloat(analyst.accuracyScore ?? "0");

                return (
                  <motion.div key={analyst.id} variants={fadeInUp}>
                    <Card
                      className={`bg-white/[0.03] border-white/10 p-5 hover:bg-white/[0.05] transition-all group ${
                        index < 3 ? tier.border : ""
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        {/* Rank */}
                        <div className="flex flex-col items-center justify-center w-10">
                          {index < 3 ? (
                            <tier.icon className={`h-6 w-6 ${tier.color}`} />
                          ) : (
                            <span className="text-lg font-bold text-slate-600">
                              {index + 1}
                            </span>
                          )}
                          <span className="text-[9px] text-slate-600 uppercase mt-0.5">
                            {index < 3 ? "TOP" : ""}
                          </span>
                        </div>

                        {/* Avatar / Tier Badge */}
                        <div
                          className={`h-12 w-12 rounded-xl ${tier.bg} flex items-center justify-center border ${tier.border}`}
                        >
                          <span className={`text-lg font-bold ${tier.color}`}>
                            {analyst.displayName.charAt(0)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-white truncate">
                              {analyst.displayName}
                            </h3>
                            {analyst.verified && (
                              <Shield className="h-3.5 w-3.5 text-blue-400" />
                            )}
                            <span
                              className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${spec.bg} ${spec.color}`}
                            >
                              {spec.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {analyst.bio ?? "No bio provided"}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {analyst.totalPredictions ?? 0} predictions
                            </span>
                            <span className="flex items-center gap-1">
                              {streak >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-400" />
                              )}
                              <span className={streak >= 0 ? "text-emerald-400" : "text-red-400"}>
                                {streak >= 0 ? "+" : ""}
                                {streak} streak
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Accuracy Score */}
                        <div className="text-right">
                          <p
                            className={`text-2xl font-bold ${
                              accuracy >= 70
                                ? "text-emerald-400"
                                : accuracy >= 60
                                ? "text-amber-400"
                                : "text-slate-400"
                            }`}
                          >
                            {accuracy.toFixed(1)}%
                          </p>
                          <p className="text-[10px] text-slate-600 uppercase tracking-wider mt-0.5">
                            Accuracy
                          </p>
                        </div>

                        <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-white transition-colors" />
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
        </motion.div>

        {/* How to Join */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-amber-500/5 to-cyan-500/5 border-amber-500/10 p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-amber-400" />
                  Join the Analyst Network
                </h3>
                <p className="text-sm text-slate-400 max-w-xl">
                  Vetted analysts can adjust model weights pre-game, building a growing historical 
                  database that establishes expert trend lines exclusive to the platform. Apply for 
                  verification and start contributing to predictability intelligence.
                </p>
              </div>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6"
              >
                Apply for Verification
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
