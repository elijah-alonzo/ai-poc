## PoC for AI

Sample AI feature for input based article generation. Uses llama-3.1-8b-instant for AI model.

### Relevant Files

1. **.\app\page.tsx**
   - Client side user interface.
   - User form is recieved by _.\app\chat\route.ts_.
2. **.\app\chat\route.ts**
   - API endpoint for recieveing user input.
   - Combines user input from the different fields in to one good prompt.
   - Created prompt is used for querying in _.\lib\rag.ts_.
3. **.\lib\rag.ts**
   - RAG logic goes here. Copy-pasted from my other project that uses RAG.
   - Uses Upstash Vector Database for queries.
   - Configuration for AI personality and response style.

**Workflow:** _.\app\page.tsx → .\app\chat\route.ts → .\lib\rag.ts → .\app\page.tsx_
