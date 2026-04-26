import { useEffect } from "react";
import { useSearchParams } from "react-router";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

const tierIcons = { free: Zap, pro: Crown, analyst: Sparkles };
const tierColors = {
  free: "border-white/10",
  pro: "border-amber-500/40 ring-1 ring-amber-500/20",
  analyst: "border-cyan-500/40 ring-1 ring-cyan-500/20",
};

export default function Pricing() {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const { data: plans } = trpc.subscription.plans.useQuery();

  const checkoutMutation = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err) => toast.error(err.message),
  });

  const activateMutation = trpc.subscription.activateSubscription.useMutation({
    onSuccess: (data) => {
      toast.success(`Upgraded to ${data.tier}!`);
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelMutation = trpc.subscription.cancelSubscription.useMutation({
    onSuccess: () => toast.success("Subscription cancelled"),
    onError: (err) => toast.error(err.message),
  });

  // Handle PayPal return — activate the subscription
  const subscriptionId = searchParams.get("subscription_id");
  useEffect(() => {
    if (subscriptionId && isAuthenticated) {
      activateMutation.mutate({ subscriptionId });
    }
  }, [subscriptionId, isAuthenticated]);

  const currentTier = user?.subscriptionTier ?? "free";

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      <Navigation />
      <main className="mx-auto max-w-5xl px-4 lg:px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Choose Your Plan
          </h1>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Start free. Upgrade when you need deeper analytics, AI narratives,
            and broadcast-ready production tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.map((plan) => {
            const Icon = tierIcons[plan.tier as keyof typeof tierIcons];
            const isCurrentTier = currentTier === plan.tier;
            const isPaid = plan.tier !== "free";

            return (
              <Card
                key={plan.tier}
                className={`bg-white/[0.03] p-6 flex flex-col ${tierColors[plan.tier as keyof typeof tierColors]}`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="h-5 w-5 text-amber-400" />
                  <h3 className="text-lg font-semibold text-white">
                    {plan.name}
                  </h3>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">
                    ${plan.price}
                  </span>
                  {isPaid && (
                    <span className="text-sm text-slate-500">
                      /{plan.interval}
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-slate-400"
                    >
                      <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrentTier ? (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full border-white/20 text-slate-400"
                      disabled
                    >
                      Current Plan
                    </Button>
                    {isPaid && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => cancelMutation.mutate()}
                        disabled={cancelMutation.isPending}
                      >
                        {cancelMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                ) : !isAuthenticated ? (
                  isPaid ? (
                    <Button
                      className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                      asChild
                    >
                      <Link to="/login">Sign in to Subscribe</Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-white/20 text-slate-400"
                      disabled
                    >
                      Free Forever
                    </Button>
                  )
                ) : !isPaid ? (
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-slate-400"
                    disabled
                  >
                    Free Forever
                  </Button>
                ) : (
                  <Button
                    className={`w-full font-semibold ${
                      plan.tier === "analyst"
                        ? "bg-cyan-500 hover:bg-cyan-600 text-black"
                        : "bg-amber-500 hover:bg-amber-600 text-black"
                    }`}
                    onClick={() =>
                      checkoutMutation.mutate({
                        tier: plan.tier as "pro" | "analyst",
                      })
                    }
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Upgrade with PayPal
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
