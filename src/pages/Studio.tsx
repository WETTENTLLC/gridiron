import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { trpc } from "@/providers/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  MonitorPlay,
  Tv,
  Smartphone,
  Layout,
  Copy,
  Check,
  Clock,
  ChevronRight,
  Loader2,
  FileText,
  Radio,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Studio() {
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [segmentLength, setSegmentLength] = useState<string>("90s");
  const [scriptOutline, setScriptOutline] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const { data: predictions, isLoading: gamesLoading } =
    trpc.nfl.predictions.useQuery({ week: 8, season: 2026 });

  const scriptMutation = trpc.ai.generateScriptOutline.useMutation({
    onSuccess: (data) => {
      setScriptOutline(data);
      toast.success("Script outline generated!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to generate script");
    },
  });

  const handleGenerate = () => {
    if (!selectedGame) {
      toast.error("Please select a game");
      return;
    }
    scriptMutation.mutate({
      gameId: parseInt(selectedGame),
      segmentLength: segmentLength as any,
    });
  };

  const handleCopy = () => {
    if (scriptOutline) {
      const text = `${scriptOutline.runtime} SEGMENT OUTLINE\n\n${scriptOutline.segments
        .map((s: any) => `[${s.timestamp}] ${s.role}: ${s.content}`)
        .join("\n")}\n\nLOWER THIRDS:\n${scriptOutline.lowerThirds
        .map((l: any) => `[${l.time}] ${l.text}`)
        .join("\n")}`;
      navigator.clipboard.writeText(text);
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
            <MonitorPlay className="h-6 w-6 text-cyan-400" />
            Studio Producer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Broadcast-ready script outlines, lower thirds, and production feeds for content creators
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1">
            <Card className="bg-white/[0.03] border-white/10 p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                <Layout className="h-4 w-4 text-cyan-400" />
                Production Config
              </h3>

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
                            className="text-white hover:bg-white/5"
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
                    Segment Length
                  </label>
                  <Select value={segmentLength} onValueChange={setSegmentLength}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f172a] border-white/10">
                      <SelectItem value="30s" className="text-white hover:bg-white/5">30 Seconds</SelectItem>
                      <SelectItem value="60s" className="text-white hover:bg-white/5">60 Seconds</SelectItem>
                      <SelectItem value="90s" className="text-white hover:bg-white/5">90 Seconds</SelectItem>
                      <SelectItem value="3min" className="text-white hover:bg-white/5">3 Minutes</SelectItem>
                      <SelectItem value="5min" className="text-white hover:bg-white/5">5 Minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Tv className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-medium text-white">Output Formats</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center gap-1 rounded bg-cyan-500/10 px-2 py-1 text-[10px] font-medium text-cyan-400">
                      <Tv className="h-3 w-3" />
                      16:9
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-cyan-500/10 px-2 py-1 text-[10px] font-medium text-cyan-400">
                      <Smartphone className="h-3 w-3" />
                      9:16
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                  onClick={handleGenerate}
                  disabled={scriptMutation.isPending || !selectedGame}
                >
                  {scriptMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Radio className="mr-2 h-4 w-4" />
                      Generate Script
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Script Output */}
          <div className="lg:col-span-2">
            {scriptOutline ? (
              <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                <Card className="bg-white/[0.03] border-cyan-500/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          Broadcast Script Outline
                        </h3>
                        <p className="text-xs text-cyan-400">
                          {scriptOutline.runtime} segment · {scriptOutline.segments.length} parts
                        </p>
                      </div>
                    </div>
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

                  {/* Segments */}
                  <div className="space-y-3 mb-8">
                    {scriptOutline.segments.map((segment: any, i: number) => (
                      <div
                        key={i}
                        className="flex gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex flex-col items-center gap-1 pt-1">
                          <Clock className="h-4 w-4 text-slate-600" />
                          <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                            {segment.timestamp}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                                segment.role === "Anchor"
                                  ? "bg-amber-500/10 text-amber-400"
                                  : segment.role === "Analyst"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-purple-500/10 text-purple-400"
                              }`}
                            >
                              {segment.role}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">{segment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Lower Thirds */}
                  <div className="pt-6 border-t border-white/10">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Tv className="h-4 w-4 text-cyan-400" />
                      Lower Thirds / Chyrons
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {scriptOutline.lowerThirds.map((lt: any, i: number) => (
                        <div
                          key={i}
                          className="relative p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
                        >
                          <span className="absolute top-2 right-2 text-[9px] font-mono text-cyan-500/50 uppercase">
                            {lt.time}
                          </span>
                          <p className="text-xs font-semibold text-white mt-3">{lt.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Production Notes */}
                  <div className="mt-6 p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                      Producer Notes
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 text-amber-400 mt-0.5" />
                        All lower thirds are pre-formatted for 16:9 and 9:16 aspect ratios
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 text-amber-400 mt-0.5" />
                        Analyst segments can be extended with live probability updates during broadcast
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 text-amber-400 mt-0.5" />
                        Contrarian angles should be saved for final segment to maximize audience retention
                      </li>
                    </ul>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="bg-white/[0.03] border-white/10 p-12 text-center">
                <MonitorPlay className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Studio Producer Mode
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Select a game and segment length to generate a complete broadcast script outline with lower thirds, role assignments, and timing cues.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
