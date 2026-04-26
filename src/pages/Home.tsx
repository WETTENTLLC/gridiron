import { Link } from "react-router";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Activity,
  Brain,
  TrendingUp,
  Zap,
  MonitorPlay,
  Users,
  ArrowRight,
  Shield,
  BarChart3,
  Radio,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero-bg.jpg"
            alt="Stadium analytics"
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1c]/60 via-[#0a0f1c]/80 to-[#0a0f1c]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 lg:px-6 py-24 lg:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-400 uppercase">
                <Zap className="h-3.5 w-3.5" />
                Phase 1: Predictor Score Paradigm
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight"
            >
              We don't predict.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                We explain predictability.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg leading-relaxed text-slate-400 max-w-2xl"
            >
              GridIron Intelligence is the analyst's secret weapon — built for
              content creators, not bettors. Our Variance/Chaos Score, Scheme
              Advantage quantification, and Line Movement Interpreter give you
              the analytical credibility to own the airwaves.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 h-12"
                asChild
              >
                <Link to="/dashboard">
                  Launch Platform
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 px-8 h-12"
                asChild
              >
                <Link to="/games">Explore Scores</Link>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-12 flex items-center gap-8 text-sm text-slate-500"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>32 NFL Teams Tracked</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-amber-400" />
                <span>AI Narrative Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-blue-400" />
                <span>Broadcast-Ready</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Metrics Preview */}
      <section className="relative py-20 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div variants={fadeInUp}>
              <Card className="bg-white/[0.03] border-white/10 p-6 hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Variance / Chaos Score
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  0–100 metric measuring game unpredictability. Weather volatility,
                  QB stability indices, and offensive scheme fragility combined into
                  a single credibility score for your broadcast narrative.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-red-400">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                  Live for Week 8 Matchups
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-white/[0.03] border-white/10 p-6 hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Scheme Advantage
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Quantified pass-game efficiency vs. pass-defense metrics
                  defining WR/CB advantages. Personnel-level mismatches flag
                  15+ carry win probabilities for running backs.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-400">
                  <ChevronRight className="h-3 w-3" />
                  10 Games Analyzed This Week
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-white/[0.03] border-white/10 p-6 hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Line Movement Interpreter
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Real-time consensus of sharp money movement with a fully
                  transparent timeline of public betting splits and analyst
                  consensus — built for on-air storytelling credibility.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-400">
                  <ChevronRight className="h-3 w-3" />
                  Sharp Signal Detection Active
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Built for the Analyst Workflow
              </h2>
              <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
                Three phases of differentiation — from predictability scoring
                to broadcast-ready content generation.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: "Narrative Generator",
                  desc: "Pre-game storytelling outlines, live probability update scripts, and post-game breakdown summaries — written by AI and ready to air.",
                  color: "text-purple-400",
                  bg: "bg-purple-500/10",
                },
                {
                  icon: MonitorPlay,
                  title: "Studio-Ready Visuals",
                  desc: "Built-in broadcast graphics for 16:9 and 9:16 video formats. Direct-use assets with clean rights clearances.",
                  color: "text-cyan-400",
                  bg: "bg-cyan-500/10",
                },
                {
                  icon: Zap,
                  title: "Producer Mode",
                  desc: "Second-screen broadcast feed for technical crews showing real-time analysis shifts during live production.",
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
                {
                  icon: Users,
                  title: "Analyst Network",
                  desc: "Exclusive vetted analysts adjust model weights pre-game, building a historical database of expert trend lines.",
                  color: "text-rose-400",
                  bg: "bg-rose-500/10",
                },
                {
                  icon: Shield,
                  title: "Strategic Partnerships",
                  desc: "Sports medicine and psychology databases detect hard-to-find morale and fatigue factors early.",
                  color: "text-indigo-400",
                  bg: "bg-indigo-500/10",
                },
                {
                  icon: TrendingUp,
                  title: "Network Effects",
                  desc: "Free analytics tiers publish exclusive creator discounts and win-rate leaderboards, gamifying quality prediction.",
                  color: "text-orange-400",
                  bg: "bg-orange-500/10",
                },
              ].map((feature, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <Card className="h-full bg-white/[0.02] border-white/10 p-6 hover:bg-white/[0.04] hover:border-white/20 transition-all group">
                    <div
                      className={`h-11 w-11 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {feature.desc}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/analytics-abstract.jpg"
            alt="Analytics abstract"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1c] via-[#0a0f1c]/90 to-[#0a0f1c]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 lg:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold text-white sm:text-4xl"
            >
              Ready to change how you cover football?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto"
            >
              Join the first intelligence platform built exclusively for sports
              content creators. No betting angles. Pure analytical credibility.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex justify-center gap-4"
            >
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 h-12"
                asChild
              >
                <Link to="/dashboard">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
