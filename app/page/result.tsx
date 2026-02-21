"use client";

import { useState } from "react";
import { downloadArticlePDF } from "@/lib/pdf-generator";

type ChatResponse = {
  question: string;
  answer: string;
};

type ArticleResultProps = {
  result: ChatResponse | null;
  imagePreview: string | null;
  projectTitle: string;
  isLoading: boolean;
};

export default function ArticleResult({
  result,
  imagePreview,
  projectTitle,
  isLoading,
}: ArticleResultProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!result || !projectTitle) return;

    setIsDownloading(true);
    try {
      const success = await downloadArticlePDF(projectTitle, result.answer);
      if (!success) {
        alert("Failed to download PDF. Please try again.");
      }
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="border border-gray-300 rounded-sm text-sm min-h-[460px]">
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Project"
          className="w-full max-h-64 object-cover rounded-t-sm"
        />
      )}
      <div className="p-4">
        <div className="whitespace-pre-wrap">
          {isLoading ? (
            <div className="text-gray-500">Generating article...</div>
          ) : result ? (
            <div className="leading-relaxed">
              {projectTitle && (
                <h1 className="text-2xl font-bold mb-4 text-center">
                  {projectTitle}
                </h1>
              )}
              <p className="text-justify">{result.answer}</p>
            </div>
          ) : (
            <div className="text-gray-400">
              Complete the form and click &quot;Generate Article&quot; to create
              a comprehensive article about your community project.
            </div>
          )}
        </div>

        {/* Download PDF Button - Only show when article is successfully generated */}
        {result &&
          projectTitle &&
          !result.answer.includes("Error") &&
          !result.answer.includes("failed") && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                Generated Article
              </h2>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors duration-200"
              >
                {isDownloading ? "Generating PDF..." : "Download PDF"}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
