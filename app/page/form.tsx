"use client";

import { FormEvent, useRef } from "react";

type ArticleFormProps = {
  projectTitle: string;
  setProjectTitle: (v: string) => void;
  projectDate: string;
  setProjectDate: (v: string) => void;
  club: string;
  setClub: (v: string) => void;
  projectCategory: string;
  setProjectCategory: (v: string) => void;
  areaOfFocus: string;
  setAreaOfFocus: (v: string) => void;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  error: string | null;
};

export default function ArticleForm({
  projectTitle,
  setProjectTitle,
  projectDate,
  setProjectDate,
  club,
  setClub,
  projectCategory,
  setProjectCategory,
  areaOfFocus,
  setAreaOfFocus,
  imagePreview,
  onImageChange,
  onSubmit,
  isLoading,
  error,
}: ArticleFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="text-3xl font-semibold mb-4">
        Community Project Article Generator
      </div>

      <div className="space-y-1">
        <label htmlFor="projectTitle" className="block text-sm font-medium">
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
        <label htmlFor="projectDate" className="block text-sm font-medium">
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
        <label htmlFor="projectCategory" className="block text-sm font-medium">
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
        <label htmlFor="areaOfFocus" className="block text-sm font-medium">
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
        <label htmlFor="projectImage" className="block text-sm font-medium">
          Project Image
        </label>
        <input
          id="projectImage"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={onImageChange}
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
  );
}
