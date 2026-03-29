# Kate — VP Job Search Analysis Tool

A React web app for analyzing resumes and job descriptions from a hiring committee perspective.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions (Node.js)
- **AI**: Anthropic Claude API

## Project Structure

```
kate/
├── api/
│   ├── config.js           # Shared API configuration
│   ├── analyze-v1.js       # Initial resume + JD analysis
│   ├── analyze-q2.js       # Generate question 2
│   └── analyze-final.js     # Final comprehensive analysis
├── src/
│   ├── components/         # React components
│   ├── utils/             # PDF parsing utility
│   ├── App.jsx            # Main app with stage management
│   └── index.css          # Global styles
├── vercel.json            # Vercel routing configuration
└── .env.local             # Local environment variables
```

## Local Development Setup

### 1. Install Dependencies

```bash
cd kate
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

To get an Anthropic API key:
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Test API Functions Locally

The serverless functions run at `/api/*` endpoints. With `npm run dev`, these are handled by Vercel CLI or require a separate local server setup.

## Vercel Deployment

### 1. Install Vercel CLI (if not already)

```bash
npm install -g vercel
```

### 2. Deploy

```bash
cd kate
vercel
```

### 3. Add Environment Variable in Vercel

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Settings → Environment Variables
3. Add `ANTHROPIC_API_KEY` with your API key value

### 4. Redeploy

After adding the environment variable, redeploy your project:

```bash
vercel --prod
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze-v1` | POST | Initial analysis of resume and job description |
| `/api/analyze-q2` | POST | Generate second question based on first answer |
| `/api/analyze-final` | POST | Final comprehensive analysis |

### API Request/Response Formats

**POST /api/analyze-v1**
```json
{
  "resume": "string",
  "jobDescription": "string"
}
```

**POST /api/analyze-q2**
```json
{
  "resume": "string",
  "jobDescription": "string",
  "v1Analysis": {...},
  "q1Answer": "string"
}
```

**POST /api/analyze-final**
```json
{
  "resume": "string",
  "jobDescription": "string",
  "v1Analysis": {...},
  "q1Answer": "string",
  "q2Answer": "string"
}
```

## Configuration

The model name is stored in `/api/config.js`:

```javascript
const MODEL_NAME = 'claude-sonnet-4-7-latest';
```

Update this value to use a different Claude model.

## Rate Limiting

Rate limiting placeholders are included in each serverless function. To implement:

1. Add your rate limiting logic in the marked placeholder block
2. Check session tokens or IP addresses
3. Return 429 status when limit is exceeded

## Notes

- The PDF parser uses pdf.js to extract text client-side — no PDF data is sent to the server
- All API calls use temperature 0.3 for analysis endpoints and 0.5 for question generation
- JSON validation with one retry is implemented on all API responses
