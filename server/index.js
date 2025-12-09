const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const axios = require('axios');

const { generateRecipe, adaptStep, suggestSubstitution } = require('./gemini');
const { getSession } = require('./state');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Middleware to get/create session
app.use((req, res, next) => {
    const sessionId = req.headers['x-session-id'] || 'default-session';
    req.session = getSession(sessionId);
    next();
});

// Generate a new recipe
app.post('/recipe/new', async (req, res) => {
    try {
        const { ingredients, time, preferences } = req.body;
        const prompt = `Create a recipe with these ingredients: ${ingredients || 'any'}. 
        Time available: ${time || 'any'}. 
        Preferences: ${preferences || 'none'}.
        Return JSON structure:
        {
            "title": "Recipe Title",
            "ingredients": ["item 1", "item 2"],
            "steps": [
                {"id": 1, "text": "Step 1 text"},
                {"id": 2, "text": "Step 2 text"}
            ]
        }`;

        const recipe = await generateRecipe(prompt);
        req.session.recipe = recipe;
        req.session.currentStepIndex = 0;

        res.json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate recipe" });
    }
});

// Get next step
app.post('/step/next', (req, res) => {
    if (!req.session.recipe) return res.status(400).json({ error: "No active recipe" });

    const steps = req.session.recipe.steps;
    if (req.session.currentStepIndex < steps.length) {
        const step = steps[req.session.currentStepIndex];
        req.session.currentStepIndex++;
        res.json({ step, isLast: req.session.currentStepIndex >= steps.length });
    } else {
        res.json({ message: "Recipe completed!", isLast: true });
    }
});

// Repeat current step (or previous if we just advanced? logic depends on how we define "current")
// Let's say currentStepIndex points to the NEXT step to be read. So "repeat" means read index-1.
app.post('/step/repeat', (req, res) => {
    if (!req.session.recipe) return res.status(400).json({ error: "No active recipe" });

    const index = Math.max(0, req.session.currentStepIndex - 1);
    const step = req.session.recipe.steps[index];
    res.json({ step });
});

// Adapt step
app.post('/step/adapt', async (req, res) => {
    try {
        const { constraint } = req.body;
        if (!req.session.recipe) return res.status(400).json({ error: "No active recipe" });

        // Get the step user is currently on (index-1)
        const index = Math.max(0, req.session.currentStepIndex - 1);
        const currentStep = req.session.recipe.steps[index];

        const adapted = await adaptStep(currentStep.text, constraint);

        // Update the step in the recipe? Or just return temporary adaptation?
        // Let's update it for continuity
        req.session.recipe.steps[index].text = adapted.adaptedStep;

        res.json({ step: req.session.recipe.steps[index] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to adapt step" });
    }
});

// Ingredient substitution
app.post('/ingredient/substitute', async (req, res) => {
    try {
        const { ingredient } = req.body;
        const suggestion = await suggestSubstitution(ingredient);
        res.json(suggestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get substitution" });
    }
});

// Get Signed URL for ElevenLabs Agent
app.get('/api/get-signed-url', async (req, res) => {
    try {
        // Trim to remove any trailing newlines from Secret Manager
        const agentId = (process.env.ELEVENLABS_AGENT_ID || '').trim();
        const apiKey = (process.env.ELEVENLABS_API_KEY || '').trim();

        if (!agentId || !apiKey) {
            return res.status(500).json({ error: "Missing ElevenLabs configuration on server" });
        }

        const response = await axios.get(
            `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
            {
                headers: {
                    'xi-api-key': apiKey
                }
            }
        );

        res.json({ signedUrl: response.data.signed_url });
    } catch (error) {
        console.error("Error getting signed URL:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to get signed URL" });
    }
});

// Get session status (for frontend polling)
app.get('/session/status', (req, res) => {
    if (!req.session.recipe) {
        return res.json({ status: 'idle' });
    }
    const currentStep = req.session.recipe.steps[req.session.currentStepIndex] || null;
    res.json({
        status: 'active',
        recipe: req.session.recipe,
        currentStepIndex: req.session.currentStepIndex,
        currentStep
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
