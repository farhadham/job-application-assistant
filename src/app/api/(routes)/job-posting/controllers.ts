import { GoogleGenerativeAI } from "@google/generative-ai";

import {
  geminiAnalyzeSystemPrompt,
  geminiAnalyzeUserPrompt,
} from "../../(constants)/gemini";
import { JobPostingAiResultType, jobPostingAiResultSchema } from "./validators";

export const getGeminiPredictResult = async (data: {
  title: string;
  jobDescription: string;
  cvText: string;
  aiKey: string;
  location: string;
}): Promise<JobPostingAiResultType> => {
  const { aiKey, cvText, jobDescription, location, title } = data;

  const genAI = new GoogleGenerativeAI(aiKey);
  const geminiPredictModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: geminiAnalyzeSystemPrompt,
  });

  const result = await geminiPredictModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: geminiAnalyzeUserPrompt({
              cvText,
              jobDescription,
              title,
              location,
            }),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
    },
  });

  // Parsing result from JSON
  const aiResult = result.response.text().replace(/^```\w*\n?|```$/g, "");
  const aiResultObject = JSON.parse(aiResult);

  return jobPostingAiResultSchema.parse(aiResultObject);
};
