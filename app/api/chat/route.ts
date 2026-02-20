/**
 * - API endpoint na nagrerecieve ng form submissions sa frontend
 */

import data from "@/data/data.json";
import {
  initializeVectorStore,
  retrieveRelevant,
  generateArticle,
} from "@/lib/rag";

// ==================recieve user input sect================== //
type ChatRequest = {
  projectTitle?: string;
  projectDate?: string;
  club?: string;
  projectCategory?: string;
  areaOfFocus?: string;
};

// ==================init vector db pag start ng server================== //
let isInitialized = false;

export async function POST(request: Request) {
  let payload: ChatRequest;

  try {
    payload = (await request.json()) as ChatRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // ==================embed user input sect================== //
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

  const structuredPrompt = buildPromptFromFields({
    projectTitle,
    projectDate,
    club,
    projectCategory,
    areaOfFocus,
  });

  // check db
  try {
    if (!isInitialized) {
      await initializeVectorStore(data);
      isInitialized = true;
    }

    const matches = await retrieveRelevant(structuredPrompt, 3); // search
    const result = await generateArticle(structuredPrompt, matches); // generate

    // return to ui
    return Response.json({
      question: structuredPrompt,
      answer: result.answer,
      evidence: result.evidence, //  note to self: remove this after demo.
      matches,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ==================fix retrieved data for ui================== //
function buildPromptFromFields(fields: {
  projectTitle: string;
  projectDate: string;
  club: string;
  projectCategory: string;
  areaOfFocus: string;
}): string {
  const parts: string[] = [];
  if (fields.projectTitle) {
    parts.push(`Project Title: ${fields.projectTitle}`);
  }
  if (fields.projectDate) {
    parts.push(`Date: ${fields.projectDate}`);
  }
  if (fields.club) {
    parts.push(`Organized by: ${fields.club}`);
  }
  if (fields.projectCategory) {
    parts.push(`Project Category: ${fields.projectCategory}`);
  }
  if (fields.areaOfFocus) {
    parts.push(`Area of Focus: ${fields.areaOfFocus}`);
  }
  return parts.join("\n\n");
}
