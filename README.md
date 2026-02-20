## Article Generator v.2

AI-powered article generator for community projects. Uses llama-3.1-8b-instant to create structured articles based solely on user input.

### Features

- **Direct Article Generation**: No RAG, no vector databases, no external data lookup
- **Structured Output**: Complete articles with title, introduction, body, and conclusion
- **Project Storage**: Each project is saved with input fields and generated article
- **Simple Workflow**: Input → Generate → Save

### Relevant Files

1. **[app/page.tsx](app/page.tsx)**
   - User interface for project form submission
   - Displays generated articles
2. **[app/api/chat/route.ts](app/api/chat/route.ts)**
   - API endpoint that receives form data
   - Generates articles using AI
   - Saves projects to data.json
3. **[lib/rag.ts](lib/rag.ts)**
   - Article generation logic using Groq SDK
   - Project storage functions
   - No RAG/retrieval logic
4. **[data/data.json](data/data.json)**
   - Storage for all generated projects
   - Contains input fields and generated articles

### Workflow

**Input → Generate → Save → Display**

1. User fills project form fields
2. System generates complete article using AI
3. Project (input + article) saved to data.json
4. Generated article displayed to user

### Article Structure

Each generated article includes:

- **Title** - Engaging project title
- **Introduction** - Project overview and significance
- **Body Paragraphs** - Detailed project information and impact
- **Conclusion** - Summary of importance and outcomes

### Data Storage Format

```json
{
  "projects": [
    {
      "id": "project-timestamp-id",
      "timestamp": "ISO-date",
      "fields": {
        "projectTitle": "...",
        "projectDate": "...",
        "club": "...",
        "projectCategory": "...",
        "areaOfFocus": "..."
      },
      "generated_article": "Complete AI-generated article..."
    }
  ]
}
```
