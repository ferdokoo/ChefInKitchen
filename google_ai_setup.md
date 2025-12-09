# Google AI Setup Guide

This project uses Google's Gemini models via the Google AI Studio (formerly MakerSuite) or Vertex AI. For the simplest setup, we recommend using Google AI Studio.

## Option 1: Google AI Studio (Recommended for Development)

This is the fastest way to get an API key for Gemini.

1.  **Go to Google AI Studio**:
    Visit [https://aistudio.google.com/](https://aistudio.google.com/) and sign in with your Google account.

2.  **Get API Key**:
    *   Click on the **"Get API key"** button in the top left or navigate to the API key section.
    *   Click **"Create API key"**.
    *   You can create a key in a new project or an existing Google Cloud project.

3.  **Copy the Key**:
    Copy the generated API key string.

## Option 2: Google Cloud Console (Vertex AI)

If you need enterprise features or are deploying to production on Google Cloud.

1.  **Create a Google Cloud Project**:
    *   Go to [console.cloud.google.com](https://console.cloud.google.com/).
    *   Create a new project.

2.  **Enable APIs**:
    *   Navigate to **"APIs & Services"** > **"Library"**.
    *   Search for **"Generative Language API"** (for Gemini API) or **"Vertex AI API"**.
    *   Click **Enable**.

3.  **Create Credentials**:
    *   Go to **"APIs & Services"** > **"Credentials"**.
    *   Click **"Create Credentials"** > **"API Key"**.
    *   Copy the key.

## Configure Your Project

Once you have your API key:

1.  Navigate to the `server/` directory in this project.
2.  Open (or create) the `.env` file.
3.  Paste your key:

```env
GEMINI_API_KEY=your_copied_api_key_here
```

4.  Restart your server:
    ```bash
    npm start
    ```

## Troubleshooting

*   **Quota Limits**: Free tier keys have rate limits. If you hit them, consider upgrading to a paid plan or adding billing to your Google Cloud project.
*   **Region Availability**: Ensure Gemini is available in your region.
