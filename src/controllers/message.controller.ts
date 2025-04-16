import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import Message from '../models/Message';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const generateMessage = async (req: Request, res: Response) => {
  const { name, job_title, company, location, summary } = req.body;

  if (!name || !job_title || !company || !location || !summary) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const inputPrompt = `Generate a personalized outreach message for a person with the following details:
  - Name: ${name}
  - Job Title: ${job_title}
  - Company: ${company}
  - Location: ${location}
  - Summary: ${summary}
  
  Keep it short, friendly, and persuasive.`;

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

    let generatedMessage = '';
    for await (const chunk of response) {
      generatedMessage += chunk.text;
    }

    // Save to MongoDB
    const newMessage = new Message({
      name,
      job_title,
      company,
      location,
      summary,
      generated_message: generatedMessage,
    });

    await newMessage.save();

    return res.json({ message: generatedMessage });
  } catch (err) {
    console.error('Gemini error:', err);
    return res.status(500).json({ error: 'Failed to generate message' });
  }
};
