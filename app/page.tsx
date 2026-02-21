"use client";

import { FormEvent, useState } from "react";
import ArticleForm from "./page/form";
import ArticleResult from "./page/result";

type ChatResponse = {
  question: string;
  answer: string;
};

export default function Home() {
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDate, setProjectDate] = useState("");
  const [club, setClub] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
  const [areaOfFocus, setAreaOfFocus] = useState("");
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
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
            <ArticleForm
              projectTitle={projectTitle}
              setProjectTitle={setProjectTitle}
              projectDate={projectDate}
              setProjectDate={setProjectDate}
              club={club}
              setClub={setClub}
              projectCategory={projectCategory}
              setProjectCategory={setProjectCategory}
              areaOfFocus={areaOfFocus}
              setAreaOfFocus={setAreaOfFocus}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onSubmit={onSubmit}
              isLoading={isLoading}
              error={error}
            />
          </div>
          <div>
            <ArticleResult
              result={result}
              imagePreview={imagePreview}
              projectTitle={projectTitle}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
