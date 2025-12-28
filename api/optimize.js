// api/optimize.js
// This is your Vercel serverless function

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jobDescription } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }

  const prompt = `You are an expert HR copywriter and job description optimizer. Analyze and rewrite the following job description to make it more effective at attracting top talent.

Your rewrite should:
1. Lead with the impact and opportunity, not just requirements
2. Use clear, jargon-free language
3. Remove unnecessary requirements (like "10+ years" when 5 would do)
4. Use inclusive language that doesn't discourage qualified candidates
5. Highlight benefits and growth opportunities
6. Make it scannable with clear sections
7. End with a compelling call-to-action

Format your response with clear sections like:
- Role Overview (2-3 sentences about the opportunity)
- What You'll Do (4-6 bullet points)
- What You Bring (skills/experience, be realistic)
- Why Join Us (benefits, culture, growth)
- Call to Action

Original Job Description:
${jobDescription}

Provide ONLY the optimized job description, no preamble or explanation.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Groq API request failed');
    }

    const data = await response.json();
    const optimizedText = data.choices[0].message.content;

    return res.status(200).json({ optimized: optimizedText });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
