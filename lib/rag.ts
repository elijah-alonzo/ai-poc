// ==================Article Generation Logic================== //

import Groq from "groq-sdk";
import fs from "fs/promises";
import path from "path";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export type ProjectFields = {
  projectTitle: string;
  projectDate: string;
  club: string;
  projectCategory: string;
  areaOfFocus: string;
};

export type Project = {
  id: string;
  timestamp: string;
  fields: ProjectFields;
  generated_article: string;
};

export async function generateArticle(fields: ProjectFields): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional article writer specializing in community project documentation. Generate a complete, well-structured article based on the provided project information.

Article Structure Required:
1. **Title** - Create an engaging title for the project
2. **Introduction** - Opening paragraph introducing the project and its significance
3. **Body Paragraphs** - Develop the project details, objectives, and impact
4. **Conclusion** - Summarize the project's importance and outcomes

Writing Style:
- Professional and objective tone
- Clear, engaging paragraphs
- No bullet points or lists
- Focus on community impact and project significance
- Use the provided project details as the foundation

Generate a complete article (400-600 words) with proper paragraph structure.`,
        },
        {
          role: "user",
          content: `Generate a complete article for this community project:

Project Title: ${fields.projectTitle}
Date: ${fields.projectDate}
Organized by: ${fields.club}
Project Category: ${fields.projectCategory}
Area of Focus: ${fields.areaOfFocus}

Create a comprehensive article with title, introduction, body paragraphs, and conclusion.`,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const article =
      completion.choices[0]?.message?.content || "Unable to generate article.";
    return article;
  } catch (error) {
    console.error("Groq API error:", error);
    return "Error generating article. Please try again.";
  }
}

export async function saveProject(
  fields: ProjectFields,
  article: string,
): Promise<void> {
  const dataPath = path.join(process.cwd(), "data", "data.json");

  const project: Project = {
    id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    fields,
    generated_article: article,
  };

  try {
    let projects: Project[] = [];

    try {
      const fileContent = await fs.readFile(dataPath, "utf-8");
      const data = JSON.parse(fileContent);
      projects = data.projects || [];
    } catch {
      // File doesn't exist or is invalid, start with empty array
    }

    projects.push(project);

    await fs.writeFile(dataPath, JSON.stringify({ projects }, null, 2));
  } catch (error) {
    console.error("Error saving project:", error);
    throw error;
  }
}
