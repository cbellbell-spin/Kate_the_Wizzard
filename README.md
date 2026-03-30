# Kate — VP Job Search Analysis Tool

A React web app for analyzing resumes and job descriptions from a hiring committee perspective.

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions (Node.js)
- **AI**: Anthropic Claude API (claude-sonnet-4-6)

## Project Structure

```
kate/
├── api/
│   ├── config.js           # Shared API configuration
│   ├── analyze-v1.js       # Initial resume + JD analysis + Q1
│   ├── analyze-q2.js       # Generate question 2 based on Q1 answer
│   └── analyze-final.js     # Final comprehensive analysis
├── src/
│   ├── components/
│   │   ├── LandingInput.jsx    # Stage 1: Resume + JD input
│   │   ├── AnalysisV1.jsx      # Stage 2a: Initial analysis display
│   │   ├── Question.jsx        # Stage 2b/3: MC question + optional context
│   │   ├── FinalAnalysis.jsx   # Stage 4: Final analysis display
│   │   ├── Conversion.jsx      # Stage 5: Setup + handoff summary
│   │   └── Loading.jsx         # Loading spinner component
│   ├── utils/
│   │   └── pdfParser.js   # Client-side PDF parsing
│   ├── App.jsx            # Main app with stage management
│   └── index.css          # Tailwind + Spectral font
├── vercel.json            # Vercel routing configuration
└── tailwind.config.js     # Tailwind customization
```

## Environment Variables

Required environment variables in Vercel:

| Name | Description |
|------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude access |

To add/update environment variables:
```bash
vercel env add ANTHROPIC_API_KEY production
```

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (frontend only)
npm run dev
```

The app will be available at `http://localhost:5173`

Note: API functions require Vercel environment variables. Use `vercel env pull` to get local copies.

## Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod --force
```

The `vercel.json` configures:
- API functions: `api/**/*.js` → `@vercel/node`
- Frontend build: `package.json` → `@vercel/static-build` (distDir: `dist`)
- Routes: `/api/analyze-v1`, `/api/analyze-q2`, `/api/analyze-final`

## API Endpoints

### POST /api/analyze-v1

Initial analysis and first positioning question.

**Request Body:**
```json
{
  "resume": "string (max 8000 chars)",
  "jobDescription": "string (max 4000 chars)"
}
```

**Response Schema:**
```json
{
  "valid_input": boolean,
  "role_fit": "Uphill Battle | Positioning Play | Strong Fit",
  "level_inference": "string",
  "fit_tier": "string",
  "hiring_committee_read": "string",
  "gaps": [{"label": "string", "detail": "string", "severity": "string"}],
  "what_strong_looks_like": "string",
  "complement_skill": "string",
  "priority_action": "string",
  "question_1": {
    "question_text": "string",
    "context": "string",
    "dimension": "string",
    "options": [{"label": "A", "text": "string"}, ...]
  }
}
```

### POST /api/analyze-q2

Second question generation based on first answer.

**Request Body:**
```json
{
  "resume": "string",
  "jobDescription": "string",
  "v1Analysis": {},
  "q1Answer": "string | null",
  "q1QuestionText": "string",
  "additionalContext": "string | null (max 1000 chars)"
}
```

### POST /api/analyze-final

Final analysis with all accumulated context.

**Request Body:**
```json
{
  "resume": "string",
  "jobDescription": "string",
  "v1Analysis": {},
  "q2Data": {},
  "q1Answer": "string | null",
  "q2Answer": "string | null",
  "q1Context": "string | null",
  "q2Context": "string | null",
  "q1QuestionText": "string",
  "q2QuestionText": "string"
}
```

## Input Delimiter Pattern

All user-supplied inputs are wrapped in XML-style delimiters before injection into prompts:

```
<resume>{{resume_text}}</resume>
<job_description>{{jd_text}}</job_description>
<q1_answer>{{q1_answer_text}}</q1_answer>
<q2_answer>{{q2_answer_text}}</q2_answer>
<additional_context>{{context_text}}</additional_context>
```

Empty tags are omitted. Only relevant tags for each call are included.

## Character Limits

| Field | Limit |
|-------|-------|
| Resume | 12,000 characters |
| Job Description | 6,000 characters |
| Additional Context (per question) | 1,000 characters |

Limits are enforced both client-side and server-side (returns HTTP 400).

## Security Features

### Honeypot
A hidden honeypot field catches bots. If filled, the request is silently rejected (HTTP 200 with empty response, no API call fired).

### Input Validation
The `valid_input` boolean in the V1 response allows Kate to flag non-genuine inputs. Frontend displays an error state if `valid_input === false`.

### Rate Limiting
Rate limiting placeholders are included in each serverless function. Implement by adding logic in the marked placeholder block.

## App Stages

```
0: LANDING         → Resume + JD input
1: LOADING_V1      → Loading state
2: ANALYSIS_V1     → Initial analysis + Q1
3: LOADING_Q2      → Loading state
4: QUESTION_2      → Q2 + optional context
5: LOADING_FINAL    → Loading state
6: FINAL_ANALYSIS  → Final analysis display
7: CTA              → "Meet Kate" prompt
8: CONVERSION       → Setup steps + handoff summary
9: VALIDATION_ERROR → Error state with Try Again (preserves inputs)
```

## Design System

- **Background**: Off-white (`#FAF8F5`)
- **Text**: Black (`#1A1A1A`)
- **Accent**: Maroon (`#8B2635`)
- **Gold**: `#C9A84C` (role fit spectrum active state, counter warning)
- **Font**: Spectral (serif)

## Notes

- The PDF parser uses pdf.js to extract text client-side — no PDF data is sent to the server
- All API calls use temperature 0.3 for analysis endpoints and 0.5 for question generation
- JSON validation with one retry is implemented on all API responses
- Model name is stored in `/api/config.js` — update `MODEL_NAME` to use a different Claude model
