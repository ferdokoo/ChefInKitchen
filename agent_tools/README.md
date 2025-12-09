# ElevenLabs Agent Tools Configuration

This directory contains the complete JSON configurations for all 5 tools needed for the ChefInKitchen agent.

## Setup Instructions

### 1. Start Your Backend
```bash
cd server
npm start
# Server runs on http://localhost:3000
```

### 2. Expose with ngrok
```bash
ngrok http 3000
```
Copy the ngrok URL (e.g., `https://abcd-1234.ngrok-free.app`)

### 3. Update Tool Configurations
Replace `YOUR_NGROK_URL.ngrok-free.app` with your actual ngrok URL in all 5 JSON files:
- `generate_recipe.json`
- `get_next_step.json`
- `repeat_step.json`
- `adapt_step.json`
- `suggest_substitution.json`

### 4. Import to ElevenLabs Dashboard
For each tool:
1. Go to your ElevenLabs Agent Dashboard → **Tools** section
2. Click **Add Tool** → **Webhook**
3. Copy the entire JSON content from the corresponding file
4. Paste into the JSON configuration editor
5. Save

## Tool Descriptions

| Tool | Purpose | Parameters |
|------|---------|------------|
| `generate_recipe` | Create a new recipe | `ingredients` (required), `time`, `preferences` |
| `get_next_step` | Get next cooking step | None |
| `repeat_step` | Repeat current step | None |
| `adapt_step` | Modify step for constraints | `constraint` (required) |
| `suggest_substitution` | Find ingredient replacement | `ingredient` (required) |

## System Prompt Example

Add this to your Agent's system prompt:

```
You are a helpful Chef Assistant guiding users through cooking.

WORKFLOW:
1. When user starts, ask what they want to cook or what ingredients they have
2. Use generate_recipe to create a recipe plan
3. Read steps one by one, waiting for user to say "next" or ask questions
4. Use get_next_step to proceed through the recipe
5. If user asks to repeat, use repeat_step
6. If user has issues (missing tools, burning food, etc), use adapt_step
7. If user is missing an ingredient, use suggest_substitution

PERSONALITY:
- Be warm, encouraging, and patient
- Use simple, clear language
- Celebrate small wins ("Great job!")
- Stay calm if things go wrong
```

## Troubleshooting

**Tool not working?**
- Verify ngrok is running and URL is correct
- Check server logs for errors
- Ensure `x-session-id` header is being sent (or use default session)

**Timeout errors?**
- Increase `response_timeout_secs` if Gemini is slow
- Check your Gemini API quota
