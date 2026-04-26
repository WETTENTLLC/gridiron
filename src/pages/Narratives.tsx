import { useState } from "react";
import { Link } from "react-router";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Brain,
  Sparkles,
  MonitorPlay,
  ChevronRight,
  Loader2,
  Copy,
  Check,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Narratives() {
  const { isAuthenticated } = useAuth();
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [tone, setTone] = useState<string>("analytical");
  const [focusAreas, setFocusAreas] = useState<string[]>(["scheme", "momentum"]);
  const [generatedNarrative, setGeneratedNarrative] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const { data: predictions, isLoading: gamesLoading } =
    trpc.nfl.predictions.useQuery({ week: 8, season: 2026 });

  const { data: existingNarratives, isLoading: narrativesLoading } =
    trpc.nfl.narratives.useQuery();

  const generateMutation = trpc.ai.generateNarrative.useMutation({
    onSuccess: (data) => {
      setGeneratedNarrative(data);
      toast.success("Narrative generated successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to generate narrative");
    },
  });

  const handleGenerate = () => {
    if (!selectedGame) {
      toast.error("Please select a game");
      return;
    }
    generateMutation.mutate({
      gameId: parseInt(selectedGame),
      narrativeType: "pregame",
      tone: tone as any,
      focusAreas: focusAreas as any,
    });
  };

  const toggleFocusArea = (area: string) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleCopy = () => {
    if (generatedNarrative?.content) {
      navigator.clipboard.writeText(generatedNarrative.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            AI Narrative Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate broadcast-ready storytelling content with AI-powered predictability analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generator Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/[0.03] border-white/10 p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-400" />
                Configure Narrative
              </h3>

              {!isAuthenticated && (
                <div className="mb-5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-amber-400">Authentication Required</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Sign in to generate AI narratives.
                      </p>
                      <Button
                        size="sm"
                        className="mt-2 bg-amber-500 hover:bg-amber-600 text-black text-xs"
                        asChild
                      >
                        <Link to="/login">Sign In</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                    Select Game
                  </label>
                  <Select value={selectedGame} onValueChange={setSelectedGame}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Choose a matchup..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f172a] border-white/10">
                      {gamesLoading ? (
                        <Skeleton className="h-8 w-full bg-white/10" />
                      ) : (
                        predictions?.map((p) => (
                          <SelectItem
                            key={p.game.id}
                            value={p.game.id.toString()}
                            className="text-white hover:bg-white/5 focus:bg-white/5"
                          >
                            {p.awayTeam?.abbreviation} @ {p.homeTeam?.abbreviation}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                    Narrative Tone
                  </label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f172a] border-white/10">
                      <SelectItem value="analytical" className="text-white hover:bg-white/5">Analytical</SelectItem>
                      <SelectItem value="dramatic" className="text-white hover:bg-white/5">Dramatic</SelectItem>
                      <SelectItem value="neutral" className="text-white hover:bg-white/5">Neutral</SelectItem>
                      <SelectItem value="contrarian" className="text-white hover:bg-white/5">Contrarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 block">
                    Focus Areas
                  </label>
                  <div className="space-y-2.5">
                    {[
                      { id: "scheme", label: "Scheme Analysis" },
                      { id: "momentum", label: "Momentum Indicators" },
                      { id: "line_movement", label: "Line Movement" },
                      { id: "weather", label: "Weather Impact" },
                      { id: "personnel", label: "Personnel Matchups" },
                    ].map((area) => (
                      <div
                        key={area.id}
                        className="flex items-center gap-2.5 cursor-pointer"
                        onClick={() => toggleFocusArea(area.id)}
                      >
                        <Checkbox
                          checked={focusAreas.includes(area.id)}
                          className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                        />
                        <span className="text-sm text-slate-400">{area.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold"
                  onClick={handleGenerate}
                  disabled={!isAuthenticated || generateMutation.isPending || !selectedGame}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Narrative
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-2 space-y-6">
            {generatedNarrative ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                <Card className="bg-white/[0.03] border-purple-500/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {generatedNarrative.title}
                        </h3>
                        <p className="text-xs text-purple-400">AI Generated · Confidence: 82%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <p className="text-sm leading-relaxed text-slate-300">
                      {generatedNarrative.content}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                      Key Talking Points
                    </h4>
                    <div className="space-y-2">
                      {generatedNarrative.talkingPoints.map((point: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm text-slate-400"
                        >
                          <ChevronRight className="h-3.5 w-3.5 text-purple-400" />
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                      <MonitorPlay className="h-3 w-3" />
                      16:9 Ready
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                      <MonitorPlay className="h-3 w-3" />
                      9:16 Ready
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-400">
                      <Brain className="h-3 w-3" />
                      gridiron-narrative-v2
                    </span>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="bg-white/[0.03] border-white/10 p-12 text-center">
                <Sparkles className="h-10 w-10 text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Generate Your First Narrative
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Select a game, choose your tone, and pick focus areas. Our AI will craft a broadcast-ready predictability narrative in seconds.
                </p>
              </Card>
            )}

            {/* Existing Narratives */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                Recent Narratives
              </h3>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="space-y-3"
              >
                {narrativesLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full bg-white/10" />
                    ))
                  : existingNarratives?.slice(0, 6).map((n) => (
                      <motion.div key={n.id} variants={fadeInUp}>
                        <Card className="bg-white/[0.03] border-white/10 p-5 hover:bg-white/[0.05] transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                    n.narrativeType === "pregame"
                                      ? "bg-blue-500/10 text-blue-400"
                                      : n.narrativeType === "live"
                                      ? "bg-red-500/10 text-red-400"
                                      : "bg-emerald-500/10 text-emerald-400"
                                  }`}
                                >
                                  {n.narrativeType}
                                </span>
                                {n.aiGenerated && (
                                  <span className="text-[10px] text-purple-400 flex items-center gap-1">
                                    <Brain className="h-3 w-3" />
                                    AI
                                  </span>
                                )}
                                {n.broadcastReady && (
                                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                    <MonitorPlay className="h-3 w-3" />
                                    Broadcast Ready
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-semibold text-white mb-1">
                                {n.title}
                              </h4>
                              <p className="text-sm text-slate-400 line-clamp-2">
                                {n.content}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
