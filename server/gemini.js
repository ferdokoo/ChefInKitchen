const { GoogleGenerativeAI } = require("@google/generative-ai");

// Lazy initialization to ensure env vars are available
let model = null;
const getModel = () => {
    if (!model) {
        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        const genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    }
    return model;
};

const generateRecipe = async (prompt) => {
    const result = await getModel().generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
    });
    return JSON.parse(result.response.text());
};

const adaptStep = async (currentStep, userConstraint) => {
    const prompt = `
    Given the current recipe step: "${currentStep}"
    The user has this constraint/issue: "${userConstraint}"
    Adapt the step to resolve the issue. Return a JSON object with { "adaptedStep": "..." }.
    `;
    const result = await getModel().generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
    });
    return JSON.parse(result.response.text());
};

const suggestSubstitution = async (ingredient) => {
    const prompt = `Suggest a substitute for "${ingredient}" in a general cooking context. Return JSON { "substitute": "...", "reason": "..." }`;
    const result = await getModel().generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
    });
    return JSON.parse(result.response.text());
};

module.exports = {
    generateRecipe,
    adaptStep,
    suggestSubstitution
};
