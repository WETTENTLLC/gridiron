import { Link } from "react-router";
import { Activity, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0f1c]">
      <div className="mx-auto max-w-7xl px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-none">GRIDIRON</span>
                <span className="text-[10px] font-medium tracking-widest text-amber-400 uppercase leading-none mt-0.5">Intelligence</span>
              </div>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              The analyst's secret weapon. Predictability intelligence for content creators who demand analytical credibility.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="text-sm text-slate-500 hover:text-amber-400 transition-colors">Dashboard</Link></li>
              <li><Link to="/games" className="text-sm text-slate-500 hover:text-amber-400 transition-colors">Predictor Scores</Link></li>
              <li><Link to="/narratives" className="text-sm text-slate-500 hover:text-amber-400 transition-colors">Narrative Generator</Link></li>
              <li><Link to="/studio" className="text-sm text-slate-500 hover:text-amber-400 transition-colors">Studio Mode</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Network</h4>
            <ul className="space-y-2">
              <li><Link to="/analysts" className="text-sm text-slate-500 hover:text-amber-400 transition-colors">Analyst Directory</Link></li>
              <li><Link to="/analysts" className="text-sm text-slate-500 hover:text-amber-400 transition-colors">Leaderboards</Link></li>
              <li><Link to="/analysts" className="text-sm text-slate-500 hover:text-amber-400 transition-colors">Verification</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">
            © 2026 GridIron Intelligence. All rights reserved. Not affiliated with the NFL.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Terms</a>
            <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Data Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
