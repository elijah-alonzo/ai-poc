import data from "@/data/data.json";
import {
  initializeVectorStore,
  retrieveRelevant,
  generateArticle,
} from "@/lib/rag";

// Type definition for the incoming request payload
// Contains all the form fields from the frontend
type ChatRequest = {
  projectTitle?: string;
  projectDate?: string;
  club?: string;
  narrative?: string;
};

// Track if the vector store has been initialized
// This only needs to happen once when the server starts
let isInitialized = false;

export async function POST(request: Request) {
  let payload: ChatRequest;

  try {
    payload = (await request.json()) as ChatRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Extract and clean all input fields
  const projectTitle = payload.projectTitle?.trim() || "";
  const projectDate = payload.projectDate?.trim() || "";
  const club = payload.club?.trim() || "";
  const narrative = payload.narrative?.trim() || "";

  // Validate that at least one field has content
  if (!projectTitle && !projectDate && !club && !narrative) {
    return Response.json(
      { error: "At least one field is required." },
      { status: 400 },
    );
  }

  // Build a structured prompt from all the provided fields
  // This combines all user inputs into a coherent query for the AI
  const structuredPrompt = buildPromptFromFields({
    projectTitle,
    projectDate,
    club,
    narrative,
  });

  try {
    // Initialize vector store on first request
    // This loads the data.json into the vector database for semantic search
    if (!isInitialized) {
      await initializeVectorStore(data);
      isInitialized = true;
    }

    // Search the vector database for relevant context
    // Uses semantic similarity to find related information
    const matches = await retrieveRelevant(structuredPrompt, 6);

    // Generate the article using the AI
    // Combines user input with retrieved context to create a comprehensive article
    const result = await generateArticle(structuredPrompt, matches);

    return Response.json({
      question: structuredPrompt, // Return the combined prompt for reference
      answer: result.answer,
      evidence: result.evidence,
      matches,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Combines all form fields into a structured prompt for the AI
 * Each field adds specific context to guide article generation
 */
function buildPromptFromFields(fields: {
  projectTitle: string;
  projectDate: string;
  club: string;
  narrative: string;
}): string {
  const parts: string[] = [];

  // Add each field to the prompt if it has content
  if (fields.projectTitle) {
    parts.push(`Project Title: ${fields.projectTitle}`);
  }
  if (fields.projectDate) {
    parts.push(`Date: ${fields.projectDate}`);
  }
  if (fields.club) {
    parts.push(`Organized by: ${fields.club}`);
  }
  if (fields.narrative) {
    parts.push(`Project Details: ${fields.narrative}`);
  }

  // Combine all parts into a single prompt
  // This gives the AI all the context it needs
  return parts.join("\n\n");
}
