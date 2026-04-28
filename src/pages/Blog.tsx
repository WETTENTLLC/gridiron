import { Link } from "react-router";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { trpc } from "@/providers/trpc";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ChevronRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Blog() {
  const { data: posts, isLoading } = trpc.blog.list.useQuery();

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 lg:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-amber-400" />
            Insights
          </h1>
          <p className="text-slate-400 mt-2">
            Methodology breakdowns, broadcast strategy, and the analytics behind
            the platform.
          </p>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-6"
        >
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full bg-white/10" />
              ))
            : posts?.map((post) => {
                const tags = Array.isArray(post.tags)
                  ? post.tags
                  : typeof post.tags === "string"
                  ? JSON.parse(post.tags)
                  : [];

                return (
                  <motion.div key={post.id} variants={fadeInUp}>
                    <Link to={`/blog/${post.slug}`}>
                      <Card className="bg-white/[0.03] border-white/10 p-6 hover:bg-white/[0.05] hover:border-white/20 transition-all group">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              {tags.map((tag: string) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400 uppercase"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <h2 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors mb-2">
                              {post.title}
                            </h2>
                            <p className="text-sm text-slate-400 leading-relaxed">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center gap-4 mt-4 text-xs text-slate-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                              <span>{post.authorName}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-amber-400 transition-colors mt-1 shrink-0" />
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
