// ==================Article Generation Logic================== //

import fs from "fs/promises";
import path from "path";

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

// Article generation with mock content for reliable functionality
export async function generateArticle(fields: ProjectFields): Promise<string> {
  // Mock article generation while API is having issues
  const mockArticle = `**${fields.projectTitle || "Community Project"}**

This remarkable initiative, organized by ${fields.club || "our community organization"} on ${fields.projectDate || "recently"}, represents a significant step forward in ${fields.areaOfFocus || "community development"}. 

The project falls under the ${fields.projectCategory || "Community"} category, demonstrating our commitment to making a positive impact in our local area. Through collaborative efforts and dedicated planning, this initiative has brought together community members to address important needs and create lasting change.

The success of this project highlights the power of community engagement and the importance of organized efforts in creating meaningful social impact. By focusing on ${fields.areaOfFocus || "key community needs"}, this initiative serves as a model for future projects and demonstrates the value of sustained community involvement.

This project exemplifies how dedicated individuals and organizations can work together to create positive change, fostering stronger community bonds and addressing critical needs in our area.`;

  return mockArticle;
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
