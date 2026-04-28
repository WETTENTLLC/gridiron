import { useParams, Link } from "react-router";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User } from "lucide-react";

function renderContent(content: string) {
  return content.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="text-xl font-bold text-white mt-8 mb-4"
        >
          {line.replace("## ", "")}
        </h2>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h3
          key={i}
          className="text-lg font-semibold text-white mt-6 mb-3"
        >
          {line.replace("### ", "")}
        </h3>
      );
    }
    if (line.startsWith("- **")) {
      const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
      if (match) {
        return (
          <li key={i} className="text-sm text-slate-400 leading-relaxed ml-4 mb-2">
            <span className="font-semibold text-white">{match[1]}</span>: {match[2]}
          </li>
        );
      }
    }
    if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ") || line.startsWith("4. ")) {
      return (
        <li key={i} className="text-sm text-slate-400 leading-relaxed ml-4 mb-2 list-decimal">
          {line.replace(/^\d+\.\s/, "").replace(/\*\*(.+?)\*\*/g, "$1")}
        </li>
      );
    }
    if (line.trim() === "") {
      return <div key={i} className="h-3" />;
    }
    return (
      <p key={i} className="text-sm text-slate-400 leading-relaxed mb-3">
        {line}
      </p>
    );
  });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = trpc.blog.bySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug },
  );

  const tags = post
    ? Array.isArray(post.tags)
      ? post.tags
      : typeof post.tags === "string"
      ? JSON.parse(post.tags)
      : []
    : [];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      <Navigation />
      <main className="mx-auto max-w-3xl px-4 lg:px-6 py-12">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 bg-white/10" />
            <Skeleton className="h-4 w-48 bg-white/10" />
            <Skeleton className="h-96 w-full bg-white/10" />
          </div>
        ) : !post ? (
          <div className="text-center py-20">
            <p className="text-slate-500">Post not found.</p>
            <Button variant="ghost" className="mt-4 text-amber-400" asChild>
              <Link to="/blog">Back to Insights</Link>
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="mb-6 text-slate-400 hover:text-white -ml-2"
              asChild
            >
              <Link to="/blog">
                <ArrowLeft className="h-4 w-4 mr-1" />
                All Insights
              </Link>
            </Button>

            <div className="flex items-center gap-3 mb-4">
              {tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400 uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 pb-8 border-b border-white/10">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {post.authorName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <article>{renderContent(post.content)}</article>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
