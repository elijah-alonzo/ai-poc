import { Index } from "@upstash/vector";
import Groq from "groq-sdk";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type RetrievedChunk = {
  path: string;
  text: string;
  score: number;
  id: string;
};

const vector = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

function flattenJson(
  value: JsonValue,
  basePath = "",
): Array<{ path: string; text: string; id: string }> {
  if (value === null) {
    return [];
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    const path = basePath || "root";
    return [
      {
        path,
        text: String(value),
        id: `${path}-${Date.now()}-${Math.random()}`,
      },
    ];
  }

  if (Array.isArray(value)) {
    const primitiveValues = value.filter(
      (item) =>
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean",
    );

    const combined =
      primitiveValues.length > 0
        ? [
            {
              path: basePath || "root",
              text: primitiveValues.map(String).join(" | "),
              id: `${basePath || "root"}-array-${Date.now()}-${Math.random()}`,
            },
          ]
        : [];

    const nested = value.flatMap((item, index) => {
      if (typeof item === "object" && item !== null) {
        return flattenJson(item as JsonValue, `${basePath}[${index}]`);
      }
      return [];
    });

    return [...combined, ...nested];
  }

  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const nextPath = basePath ? `${basePath}.${key}` : key;
    return flattenJson(nestedValue, nextPath);
  });
}

// Initialize vector store with data
export async function initializeVectorStore(jsonData: JsonValue) {
  const chunks = flattenJson(jsonData);

  // Upsert chunks to vector store
  const vectors = chunks.map((chunk) => ({
    id: chunk.id,
    data: `${chunk.path}: ${chunk.text}`,
    metadata: {
      path: chunk.path,
      text: chunk.text,
    },
  }));

  await vector.upsert(vectors);
  return chunks.length;
}

export async function retrieveRelevant(
  question: string,
  limit = 6,
): Promise<RetrievedChunk[]> {
  try {
    const results = await vector.query({
      data: question,
      topK: limit,
      includeMetadata: true,
    });

    return results.map((result) => ({
      id: result.id as string,
      path: result.metadata?.path as string,
      text: result.metadata?.text as string,
      score: result.score,
    }));
  } catch (error) {
    console.error("Vector search failed:", error);
    return [];
  }
}

export async function summarizeAnswer(
  question: string,
  chunks: RetrievedChunk[],
): Promise<{
  answer: string;
  confidence: "high" | "medium" | "low";
  evidence: string[];
}> {
  if (chunks.length === 0) {
    return {
      answer:
        "I could not find relevant information for that question in the provided profile data. Please ask about experience, skills, projects, salary/location, or interview preparation.",
      confidence: "low",
      evidence: [],
    };
  }

  const top = chunks.slice(0, 3);
  const evidence = top.map((chunk) => chunk.path);
  const context = top.map((chunk) => `${chunk.path}: ${chunk.text}`).join("\n");

  const confidence: "high" | "medium" | "low" =
    top[0].score >= 0.8 ? "high" : top[0].score >= 0.6 ? "medium" : "low";

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping with career/interview preparation. Answer questions based ONLY on the provided context from a professional profile. Be concise and practical.

Rules:
- Only use information from the provided context
- If information is missing, say so clearly
- Focus on interview preparation, achievements, technical skills, and career goals
- Be direct and actionable`,
        },
        {
          role: "user",
          content: `Question: ${question}\n\nContext from profile:\n${context}\n\nAnswer the question based only on the provided context:`,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 500,
    });

    const answer =
      completion.choices[0]?.message?.content || "Unable to generate response.";

    return {
      answer,
      confidence,
      evidence,
    };
  } catch (error) {
    console.error("Groq API error:", error);
    return {
      answer: "Error generating response. Please try again.",
      confidence: "low",
      evidence,
    };
  }
}

/**
 * Generates a comprehensive narrative article based on project information
 *
 * @param topic - Structured prompt containing project details (title, date, club, narrative)
 * @param chunks - Related content retrieved from the vector database via semantic search
 * @returns Object containing the generated article, confidence level, and evidence sources
 *
 * How it works:
 * 1. Takes the structured prompt (with all project fields combined)
 * 2. Retrieves relevant context from the vector database (if available)
 * 3. Sends both to the AI model (Groq with Llama 3.1)
 * 4. AI generates a full article with title, introduction, body, and conclusion
 */
export async function generateArticle(
  topic: string,
  chunks: RetrievedChunk[],
): Promise<{
  answer: string;
  confidence: "high" | "medium" | "low";
  evidence: string[];
}> {
  // Select top 3 most relevant chunks from vector search
  const top = chunks.slice(0, 3);

  // Extract the paths/sources of the evidence for reference
  const evidence = top.map((chunk) => chunk.path);

  // Combine the retrieved chunks into a context string
  // This provides additional background information to the AI
  const context =
    chunks.length > 0
      ? top.map((chunk) => `${chunk.path}: ${chunk.text}`).join("\n")
      : "No specific context available.";

  // Calculate confidence level based on semantic similarity scores
  // Higher scores mean the vector DB found more relevant information
  const confidence: "high" | "medium" | "low" =
    chunks.length === 0
      ? "low"
      : top[0].score >= 0.8
        ? "high"
        : top[0].score >= 0.6
          ? "medium"
          : "low";

  try {
    // Call the Groq API to generate the article
    const completion = await groq.chat.completions.create({
      messages: [
        {
          // System message: Defines the AI's role and guidelines
          role: "system",
          content: `You are an expert article writer specializing in project narratives. Generate complete, well-structured articles based on the project information provided. Each article must include:

- A clear, compelling title that captures the essence of the project
- An engaging introduction that provides context and sets the stage
- Multiple well-developed body paragraphs that:
  * Describe the project's goals and objectives
  * Explain the activities and methods used
  * Highlight key outcomes and achievements
  * Discuss the impact and significance
- A thoughtful conclusion that summarizes key points and offers final insights

Style requirements:
- Use a professional yet engaging narrative tone
- Write clearly and make the content accessible
- Expand on all provided details with relevant elaboration
- Ensure logical flow and organization
- Create a cohesive story that brings the project to life${chunks.length > 0 ? "\n- Use the provided context as additional reference when relevant" : ""}`,
        },
        {
          // User message: Contains the actual project information to write about
          role: "user",
          content:
            chunks.length > 0
              ? `Please write a comprehensive narrative article based on the following project information:\n\n${topic}\n\nAdditional context from database:\n${context}\n\nGenerate a detailed, well-structured article that tells the complete story of this project.`
              : `Please write a comprehensive narrative article based on the following project information:\n\n${topic}\n\nGenerate a detailed, well-structured article that tells the complete story of this project.`,
        },
      ],
      model: "llama-3.1-8b-instant", // The AI model to use
      temperature: 0.7, // Controls creativity (0 = deterministic, 1 = very creative)
      max_tokens: 1200, // Maximum length of the generated article
    });

    // Extract the generated article from the API response
    const answer =
      completion.choices[0]?.message?.content || "Unable to generate article.";

    // Return the article along with metadata
    return {
      answer, // The generated article text
      confidence, // How confident we are in the relevance
      evidence, // Sources used from the database
    };
  } catch (error) {
    // Handle any errors that occur during article generation
    console.error("Groq API error:", error);
    return {
      answer: "Error generating article. Please try again.",
      confidence: "low",
      evidence,
    };
  }
}
