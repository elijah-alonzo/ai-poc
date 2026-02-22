"use client";

import { useRouter } from "next/navigation";
import { useArticleStore } from "@/lib/article-store";
import FlipbookComponent from "@/components/Flipbook";

export default function FlipbookPage() {
  const router = useRouter();
  const articles = useArticleStore((state) => state.articles);

  const handleAddNewArticle = () => {
    router.push("/generate");
  };

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-black mb-4">
              Flipbok Page
            </h1>
          </div>
          <button
            onClick={handleAddNewArticle}
            className="bg-black text-white py-2 px-6 rounded hover:bg-neutral-800 transition-colors text-sm font-medium"
          >
            Add Page
          </button>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-black mb-2">
              No Articles Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first article to start building your flipbook
            </p>
          </div>
        ) : (
          <FlipbookComponent articles={articles} />
        )}
      </div>
    </div>
  );
}
