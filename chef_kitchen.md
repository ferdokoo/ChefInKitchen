# 🏗️ **SYSTEM ARCHITECTURE OVERVIEW**

Your app consists of **three layers**:

1. **Client (React + ElevenLabs SDK)** — captures voice, streams audio, plays the chef’s voice, maintains UI.
2. **Conversation Orchestrator (ElevenLabs Agent)** — manages turn-taking, emotion analysis, voice personas.
3. **Reasoning + Recipe Engine (Google Cloud Gemini / Vertex AI)** — handles recipe creation, substitutions, step transitions, timers, and adaptive logic.

You host the backend on **Cloud Run** or **Firebase Functions**.

---

# ⭐️ HIGH-LEVEL DIAGRAM

```
[User]
   ↓ (speech)
[React Client: mic → ElevenLabs Agent SDK]
   ↓
[ElevenLabs Voice Agent]
   - Voice → text
   - Detect intent/emotion
   - Maintain personality
   - Forward semantic queries to backend
   ↓ (JSON payload)
[Google Cloud Backend]
   - Gemini 2.0 Flash or Pro
   - Recipe generation
   - Step adaptation
   - Ingredient substitutions
   - Cooking flow state mgmt
   ↓
[Response text]
   ↓
[ElevenLabs Agent text → speech]
   ↓
[User hears chef’s voice]
```

---

# 🧩 **DETAILED COMPONENT DESIGN**

---

# 1️⃣ React Client (Voice UI)

### Responsibilities

* Microphone on/off
* Streaming user speech to ElevenLabs
* Playback of chef’s responses
* Optional on-screen step display
* Local state: current step, timers, minimal UI

### Key SDK:

`@elevenlabs/react`

### Functions

```
startVoiceSession()
stopVoiceSession()
renderChefVoiceOutput()
```

No heavy logic here — **keep the frontend dumb**.

---

# 2️⃣ ElevenLabs Voice Agent (Conversation Engine)

### Responsibilities

* Convert user speech → text
* Manage personality + tone
* Basic grounding (repeat, slow, faster, pause)
* Emotion cues (frustration, stress)
* Route “semantic” cooking tasks to Gemini backend

### Agent Behaviors

1. **Intent detection**

   * “I don’t have garlic” → “substitution_request”
   * “Repeat please” → “control_request”
   * “What’s next?” → “step_request”
2. **Emotional modulation**

   * If user stressed → slower, calm tone
3. **Voice**

   * Use expressive persona (e.g., Wise Italian Grandma)

### Integration:

Use ElevenLabs:

```
conversationAgent.callBackend({
  queryType: "substitution",
  payload: { missingIngredient: "garlic" }
})
```

---

# 3️⃣ Google Cloud Backend (Brain of the app)

Hosted on **Cloud Run** or **Firebase Cloud Functions**.

### Modules:

---

## **A. Recipe Generator (Gemini 2.0 Flash/Pro)**

Input:

* available ingredients (optional)
* time
* dietary rules
* cuisine preferences
* skill level

Output:

```json
{
  "title": "Quick Asparagus With Ricotta",
  "ingredients": [...],
  "steps": [
    {"id": 1, "text": "Slice asparagus into 2cm pieces."},
    {"id": 2, "text": "Heat pan over medium heat..."},
    ...
  ]
}
```

Stored in Firestore or in-memory hash (for hackathon: memory).

---

## **B. Cooking Flow Manager**

Maintains:

* current step index
* completed steps
* difficulty/speed modifier
* substitution history

APIs:

* GET next_step
* POST repeat_step
* POST modify_step
* POST apply_substitution
* POST slow_down
* POST skip_step

This is the **state machine** of the experience.

---

## **C. Step Adaptation Engine**

When the user says something like:

> “I don’t have onions.”

Backend calls Gemini:

**Prompt:**

```
Given the current recipe step:
"Saute onions in olive oil until soft."
Adapt this step for a user who does not have onions.
Return revised step only.
```

**Output:**

```
"Saute one chopped clove of garlic instead. Cook briefly until fragrant."
```

---

## **D. Ingredient Substitution Engine**

Gemini chain-of-thought (hidden) to suggest replacements:

* “don’t have garlic”
* “milk instead of cream”
* “replace soy sauce”

Output:

```
"Use 1 tsp lemon juice to add brightness instead of garlic."
```

---

# 4️⃣ ElevenLabs Agent → Voice Output

Backend returns a JSON:

```
{
  "assistant_reply": "No worries! Let's replace garlic with lemon juice..."
}
```

ElevenLabs synthesizes it:

* with emotion
* with chef persona
* and streams it back to user

---

# 🛠️ Cloud API Endpoints Summary

| Endpoint                        | Purpose                               |
| ------------------------------- | ------------------------------------- |
| **POST /recipe/new**            | Generate recipe from ingredients/time |
| **POST /step/next**             | Get next step                         |
| **POST /step/repeat**           | Return same step                      |
| **POST /step/adapt**            | Adapt step (slow, simplify)           |
| **POST /ingredient/substitute** | Suggest substitutions                 |
| **POST /flow/update**           | Update step index or flow control     |

All of these can be implemented in < 50 lines each.

---

# ⚙️ TECHNOLOGY CHOICES

* **Frontend:** React + ElevenLabs React SDK
* **Voice Agent:** ElevenLabs Agent
* **Backend:** Cloud Run (Node or Python)
* **AI Reasoning:** Gemini 2.0 Flash or Pro
* **State Storage:**

  * In-memory (fast prototype)
  * Firestore (production)

---

# 🚀 MVP FLOW (Judge-Ready)

1. User speaks → mic
2. ElevenLabs converts to text
3. Agent detects task
4. Sends semantic requests to backend
5. Gemini processes and returns step
6. ElevenLabs speaks reply with personality
7. Loop until meal is done

This produces a **smooth, magical cooking companion**.

---
