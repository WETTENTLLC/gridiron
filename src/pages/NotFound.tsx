import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex items-center justify-center">
      <div className="text-center px-4">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/20">
          <Activity className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-lg text-slate-400 mb-8">
          This page doesn't exist in the playbook.
        </p>
        <Button
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          asChild
        >
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
