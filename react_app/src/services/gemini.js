
import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

export async function solveMathProblem(text) {
    console.log("Attempting to solve with AI. API Key present:", !!API_KEY);

    if (!model) {
        if (!API_KEY) {
            console.error("API Key is missing in gemini.js");
            throw new Error("API Key not found. Please set VITE_GEMINI_API_KEY in .env file.");
        }
        try {
            genAI = new GoogleGenerativeAI(API_KEY);
            model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        } catch (initError) {
            console.error("Failed to initialize Gemini:", initError);
            throw initError;
        }
    }

    try {
        console.log("Using API Key starting with:", API_KEY ? API_KEY.substring(0, 5) + "..." : "None");

        const prompt = `
        You are a calculator assistant. Solve the following math problem or word problem.
        Return ONLY the numerical answer or the mathematical expression. 
        Do not include any explanation, text, or markdown formatting like \`\`\`.
        
        Examples:
        Input: "What is 2 plus 2?"
        Output: 4
        
        Input: "If I have 5 apples and eat 2, how many left?"
        Output: 3
        
        Input: "15% of 80"
        Output: 12

        Input: "Complete the series 2, 4, 8, 16"
        Output: 32

        Input: "${text}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResult = response.text();
        console.log("AI Response:", textResult);

        return textResult.trim();
    } catch (error) {
        console.error("Gemini API Error Details:", error);
        throw new Error(error.message || "AI Request Failed");
    }
}
