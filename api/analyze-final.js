const { API_CONFIG } = require('./config');

/**
 * Analyze Final - Complete analysis with all context
 * Returns comprehensive final analysis with handoff summary
 */
module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resume, jobDescription, v1Analysis, q1Answer, q2Answer } = req.body;

  if (!resume || !jobDescription || !v1Analysis ||
      q1Answer === undefined || q2Answer === undefined) {
    return res.status(400).json({
      error: 'All context (resume, JD, v1, q1, q2) is required'
    });
  }

  // ============================================
  // RATE LIMITING PLACEHOLDER
  // ============================================
  // Add per-session rate limiting logic here before the API call
  // Example: Check session tokens, implement cooldown, etc.
  // const rateLimitResult = await checkRateLimit(req, 'analyze-final');
  // if (!rateLimitResult.allowed) {
  //   return res.status(429).json({ error: 'Rate limit exceeded' });
  // }
  // ============================================

  const SYSTEM_PROMPT = `<!-- SYSTEM PROMPT PLACEHOLDER -->
<!-- Inject the system prompt for final analysis here -->
<!-- This should instruct the model to generate comprehensive final analysis -->`

  const USER_PROMPT = `<!-- USER PROMPT PLACEHOLDER -->
<!-- Inject the user prompt for final analysis here -->
<!-- Should request: level_inference, hiring_committee_read, gaps, what_strong_looks_like, priority_action, handoff_summary -->

Resume:
${resume}

Job Description:
${jobDescription}

V1 Analysis:
${JSON.stringify(v1Analysis, null, 2)}

Question 1 Answer:
${q1Answer}

Question 2 Answer:
${q2Answer}`;

  const maxTokens = 2500;
  const temperature = 0.3;

  try {
    let response = await callAnthropicAPI(SYSTEM_PROMPT, USER_PROMPT, maxTokens, temperature);

    // Validate and retry once if needed
    const parsed = validateAndParse(response);
    if (!parsed) {
      console.log('First response not valid JSON, retrying...');
      const retryPrompt = USER_PROMPT + '\n\nYour previous response was not valid JSON. Return ONLY a JSON object matching the specified schema, with no additional text.';
      response = await callAnthropicAPI(SYSTEM_PROMPT, retryPrompt, maxTokens, temperature);
      const retryParsed = validateAndParse(response);
      if (!retryParsed) {
        return res.status(500).json({
          error: 'Failed to generate valid analysis after retry. Please try again.'
        });
      }
      return res.status(200).json(retryParsed);
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Anthropic API error:', error);
    return res.status(500).json({ error: 'Final analysis failed. Please try again.' });
  }
};

async function callAnthropicAPI(systemPrompt, userPrompt, maxTokens, temperature) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': API_CONFIG.anthropicVersion,
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      max_tokens: maxTokens,
      temperature: temperature,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function validateAndParse(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate expected schema
    const isValid =
      typeof parsed.level_inference === 'string' &&
      typeof parsed.hiring_committee_read === 'string' &&
      Array.isArray(parsed.gaps) &&
      parsed.gaps.length > 0 &&
      parsed.gaps.every(g => typeof g.label === 'string' && typeof g.detail === 'string') &&
      typeof parsed.what_strong_looks_like === 'string' &&
      typeof parsed.priority_action === 'string' &&
      typeof parsed.handoff_summary === 'string';

    return isValid ? parsed : null;
  } catch {
    return null;
  }
}
