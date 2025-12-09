# Deploy Server to Google Cloud Run

## Prerequisites
1. Install [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)
2. Have a Google Cloud project with billing enabled

## Steps

### 1. Authenticate & Set Project
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 2. Enable APIs
```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com
```

### 3. Create Secrets in Secret Manager
```bash
# Create each secret
echo -n "your_gemini_api_key" | gcloud secrets create GEMINI_API_KEY --data-file=-
echo -n "your_elevenlabs_agent_id" | gcloud secrets create ELEVENLABS_AGENT_ID --data-file=-
echo -n "your_elevenlabs_api_key" | gcloud secrets create ELEVENLABS_API_KEY --data-file=-
```

### 4. Grant Cloud Run Access to Secrets
```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)')

# Grant access
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding ELEVENLABS_AGENT_ID \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding ELEVENLABS_API_KEY \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 5. Deploy (from `server/` directory)
```bash
cd server
gcloud run deploy chef-kitchen-server \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest,ELEVENLABS_AGENT_ID=ELEVENLABS_AGENT_ID:latest,ELEVENLABS_API_KEY=ELEVENLABS_API_KEY:latest"
```

### 6. Get Your URL
After deployment, you'll get a URL like:
```
https://chef-kitchen-server-xxxxx-uc.a.run.app
```

### 7. Update ElevenLabs Agent Tools
Replace `YOUR_NGROK_URL` in your agent tool configs with the Cloud Run URL.

### 8. Update Client
In `client/src/components/VoiceWidget.jsx`, change the fetch URL to your Cloud Run URL.

## Updating Secrets
```bash
echo -n "new_value" | gcloud secrets versions add SECRET_NAME --data-file=-
```
Then redeploy or restart the Cloud Run service.
