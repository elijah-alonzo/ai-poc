/**
 * API endpoint that receives form submissions and generates articles
 */

import { generateArticle, saveProject, type ProjectFields } from "@/lib/rag";

type ChatRequest = {
  projectTitle?: string;
  projectDate?: string;
  club?: string;
  projectCategory?: string;
  areaOfFocus?: string;
};

export async function POST(request: Request) {
  let payload: ChatRequest;

  try {
    payload = (await request.json()) as ChatRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Extract and validate user input
  const projectTitle = payload.projectTitle?.trim() || "";
  const projectDate = payload.projectDate?.trim() || "";
  const club = payload.club?.trim() || "";
  const projectCategory = payload.projectCategory?.trim() || "";
  const areaOfFocus = payload.areaOfFocus?.trim() || "";

  if (
    !projectTitle &&
    !projectDate &&
    !club &&
    !projectCategory &&
    !areaOfFocus
  ) {
    return Response.json(
      { error: "At least one field is required." },
      { status: 400 },
    );
  }

  const fields: ProjectFields = {
    projectTitle,
    projectDate,
    club,
    projectCategory,
    areaOfFocus,
  };

  try {
    // Generate article based solely on user input
    const article = await generateArticle(fields);

    // Save project to data.json
    await saveProject(fields, article);

    // Return generated article
    return Response.json({
      question: `Project: ${projectTitle || "Untitled"}`,
      answer: article,
    });
  } catch (error: any) {
    console.error("Article generation error:", error);
    // Return the specific error message instead of generic "Internal server error"
    return Response.json(
      {
        error: error.message || "Failed to generate article",
      },
      { status: 500 },
    );
  }
}
