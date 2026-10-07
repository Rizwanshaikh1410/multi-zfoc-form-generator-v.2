<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bd0a34f5-932b-4ec7-8c68-761dc2d2a1ee

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## ElevenLabs Voice Assistant Setup

The assistant's browser `SpeechSynthesis` voice has been replaced with ElevenLabs TTS.

Set these server-side environment variables:

```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_elevenlabs_voice_id
```

For Netlify, add both variables under **Site configuration → Environment variables** and redeploy.

The frontend calls `/api/elevenlabs`; the ElevenLabs API key is never exposed to browser JavaScript. The project uses the `eleven_multilingual_v2` model so Hindi/Hinglish responses can be spoken using the selected ElevenLabs Voice ID.
