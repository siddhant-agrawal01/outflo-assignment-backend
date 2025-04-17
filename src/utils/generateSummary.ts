import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const generateLeadSummary = async (lead: {
  name: string;
  job_title: string;
  company: string;
  location: string;
}) => {
  const { name, job_title, company, location } = lead;

  const inputPrompt = `Summarize this LinkedIn profile:
  - Name: ${name}
  - Job Title: ${job_title}
  - Company: ${company}
  - Location: ${location}

  Write a short, professional summary (2-3 sentences) suitable for understanding this person's background.`;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      config: {
        responseMimeType: 'text/plain',
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: inputPrompt }],
        },
      ],
    });

    let generatedSummary = '';
    for await (const chunk of response) {
      generatedSummary += chunk.text;
    }

    return generatedSummary.trim();
  } catch (error) {
    console.error('Gemini summary generation error:', error);
    return 'Summary unavailable.';
  }
};
