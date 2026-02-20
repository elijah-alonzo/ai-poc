"use client";

import { FormEvent, useState, useRef } from "react";

type ChatResponse = {
  question: string;
  answer: string;
};

export default function ArticleForm() {
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDate, setProjectDate] = useState("");
  const [club, setClub] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
  const [areaOfFocus, setAreaOfFocus] = useState("");
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (
      !projectTitle.trim() &&
      !projectDate.trim() &&
      !club.trim() &&
      !projectCategory.trim() &&
      !areaOfFocus.trim()
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
          projectCategory: projectCategory.trim(),
          areaOfFocus: areaOfFocus.trim(),
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
              <div className="text-3xl font-semibold mb-4">
                Community Project Article Generator
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
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-black rounded-sm focus:outline-none focus:border-black"
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
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-black rounded-sm focus:outline-none focus:border-black"
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
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-black rounded-sm focus:outline-none focus:border-black"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="projectCategory"
                  className="block text-sm font-medium"
                >
                  Project Category
                </label>
                <select
                  id="projectCategory"
                  value={projectCategory}
                  onChange={(e) => setProjectCategory(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-black rounded-sm focus:outline-none focus:border-black"
                >
                  <option value="">Select category...</option>
                  <option value="Community">Community</option>
                  <option value="International">International</option>
                  <option value="Vocational">Vocational</option>
                  <option value="Youth">Youth</option>
                </select>
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="areaOfFocus"
                  className="block text-sm font-medium"
                >
                  Area of Focus
                </label>
                <select
                  id="areaOfFocus"
                  value={areaOfFocus}
                  onChange={(e) => setAreaOfFocus(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-black rounded-sm focus:outline-none focus:border-black"
                >
                  <option value="">Select area of focus...</option>
                  <option value="Basic Education and Literacy">
                    Basic Education and Literacy
                  </option>
                  <option value="Environment">Environment</option>
                  <option value="Maternal and Child Health">
                    Maternal and Child Health
                  </option>
                  <option value="Peace Building and Conflict Prevention">
                    Peace Building and Conflict Prevention
                  </option>
                </select>
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="projectImage"
                  className="block text-sm font-medium"
                >
                  Project Image
                </label>
                <input
                  id="projectImage"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-black rounded-sm focus:outline-none focus:border-black file:mr-3 file:py-1 file:px-3 file:rounded-sm file:border-0 file:text-sm file:bg-black file:text-white hover:file:bg-neutral-800 cursor-pointer"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 w-full max-h-48 object-cover rounded-sm border border-gray-300"
                  />
                )}
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <button
                type="submit"
                className="w-full bg-black text-white py-2 px-4 rounded-sm hover:bg-neutral-800 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Generating..." : "Generate Article"}
              </button>
            </form>
          </div>
          <div className="space-y-2">
            <div className="border border-gray-300 rounded-sm text-sm min-h-[460px]">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Project"
                  className="w-full max-h-64 object-cover rounded-t-sm"
                />
              )}
              <div className="p-4 whitespace-pre-wrap">
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
                    Complete the form and click &quot;Generate Article&quot; to
                    create a comprehensive article about your community project.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
