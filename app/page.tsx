"use client";

import { FormEvent, useState } from "react";

type ChatResponse = {
  question: string;
  answer: string;
  evidence: string[];
};

export default function Home() {
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDate, setProjectDate] = useState("");
  const [club, setClub] = useState("");
  const [narrative, setNarrative] = useState("");
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (
      !projectTitle.trim() &&
      !projectDate.trim() &&
      !club.trim() &&
      !narrative.trim()
    ) {
      setError("Please fill in at least one field.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle: projectTitle.trim(),
          projectDate: projectDate.trim(),
          club: club.trim(),
          narrative: narrative.trim(),
        }),
      });

      const body = (await response.json()) as ChatResponse | { error?: string };

      if (!response.ok || "error" in body) {
        setError((body as { error?: string }).error ?? "Request failed.");
        return;
      }

      setResult(body as ChatResponse);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="text-xl font-semibold mb-4">
                Article Generator Test
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="projectTitle"
                  className="block text-sm font-medium"
                >
                  Project Title
                </label>
                <input
                  id="projectTitle"
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="projectDate"
                  className="block text-sm font-medium"
                >
                  Project Date
                </label>
                <input
                  id="projectDate"
                  type="text"
                  value={projectDate}
                  onChange={(e) => setProjectDate(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="club" className="block text-sm font-medium">
                  Club/Organization
                </label>
                <input
                  id="club"
                  type="text"
                  value={club}
                  onChange={(e) => setClub(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="narrative"
                  className="block text-sm font-medium"
                >
                  Project Narrative
                </label>
                <textarea
                  id="narrative"
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:border-blue-500 resize-vertical"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full border px-4 py-2 text-sm disabled:opacity-50 bg-black text-white transition-colors duration-200 hover:border-gray-700 disabled:hover:border-gray-300 disabled:hover:bg-transparent"
              >
                {isLoading ? "Generating Article..." : "Generate Article"}
              </button>
            </form>
            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>
          <div className="space-y-2">
            <div className="text-xl font-semibold">Article Generated</div>
            <div className="border border-gray-300 p-4 text-sm whitespace-pre-wrap min-h-[460px]">
              {isLoading ? (
                <div className="text-gray-300">Generating article...</div>
              ) : result ? (
                <div>{result.answer}</div>
              ) : (
                <div className="text-gray-300">Article is displayed here</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
