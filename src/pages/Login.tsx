import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Activity } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      toast.success("Welcome back!");
      navigate("/dashboard");
    },
    onError: (err) => toast.error(err.message),
  });

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      toast.success("Account created!");
      navigate("/dashboard");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] px-4">
      <Card className="w-full max-w-sm bg-white/[0.03] border-white/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </div>
          <CardTitle className="text-white">GridIron Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="w-full bg-white/5 border border-white/10">
              <TabsTrigger
                value="login"
                className="flex-1 text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-black"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="flex-1 text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-black"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <div>
                <Label className="text-slate-400 text-xs">Email</Label>
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label className="text-slate-400 text-xs">Password</Label>
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  placeholder="••••••••"
                />
              </div>
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                onClick={() =>
                  loginMutation.mutate({
                    email: loginEmail,
                    password: loginPassword,
                  })
                }
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Sign In
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <div>
                <Label className="text-slate-400 text-xs">Name</Label>
                <Input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label className="text-slate-400 text-xs">Email</Label>
                <Input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label className="text-slate-400 text-xs">Password</Label>
                <Input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  placeholder="Min 8 characters"
                />
              </div>
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                onClick={() =>
                  signupMutation.mutate({
                    email: signupEmail,
                    password: signupPassword,
                    name: signupName || undefined,
                  })
                }
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Create Account
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
