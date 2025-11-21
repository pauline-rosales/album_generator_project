// Frontend/server.js
require('dotenv').config();
const express = require('express');
const path = require('path');

const app  = express();
const PORT = process.env.PORT || 8080;

const PUBLIC_DIR = __dirname; // Frontend

// Cloudflare Workers AI config
const CF_ACCOUNT_ID  = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN   = process.env.CLOUDFLARE_API_TOKEN;
const CF_TEXT_MODEL  = process.env.CLOUDFLARE_TEXT_MODEL  || '@cf/meta/llama-3-8b-instruct';
const CF_IMAGE_MODEL = process.env.CLOUDFLARE_IMAGE_MODEL || '@cf/stabilityai/stable-diffusion-xl-base-1.0';

// Make sure JSON bodies are parsed for /api/generate
app.use(express.json({ limit: '2mb' }));

// Serve static assets (css/js/images) from /assets
app.use('/assets', express.static(path.join(PUBLIC_DIR, 'assets')));

// Serve HTML files
app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

// Pretty routes
app.get('/',          (_, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.get('/home',      (_, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.get('/generate',  (_, res) => res.sendFile(path.join(PUBLIC_DIR, 'generate.html')));
app.get('/customize', (_, res) => res.sendFile(path.join(PUBLIC_DIR, 'customize.html')));
app.get('/help',      (_, res) => res.sendFile(path.join(PUBLIC_DIR, 'help.html')));

//  Cloudflare AI helpers 

// ask LLM to analyze playlist & build prompt
async function cfText(prompt) {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN');
  }

 
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_TEXT_MODEL}`;

  console.log('cfText URL:', url);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content:
            'You are a music mood + cover art assistant. ' +
            'ONLY respond with a single JSON object, no explanation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  const data = await res.json();

  if (!data.success) {
    console.error('Cloudflare text error payload:', data);
    const msg =
      (data.errors && data.errors[0] && data.errors[0].message) ||
      'Cloudflare text model error';
    throw new Error(msg);
  }

  // Workers AI text models put string in result.response
  const raw = data.result.response;
  console.log('Raw LLM response:', raw);
  return raw;
}

// Image: generate PNG and return as Buffer
async function cfImage(prompt) {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN');
  }

  // image model 
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_IMAGE_MODEL}`;

  console.log('cfImage URL:', url);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Cloudflare image error: ${res.status} ${txt}`);
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}


// Frontend call when it generates 
app.post('/api/generate', async (req, res) => {
  try {
    const { title = ' ', subtitle = '', songs = [] } = req.body || {};

    const playlistText = [
      `Title: ${title}`,
      subtitle ? `Subtitle: ${subtitle}` : '',
      'Songs:',
      ...songs.map(s => `- ${s}`)
    ].join('\n');

    const moodPrompt = `
Given this playlist, respond ONLY with JSON in the following format:

{
  "mood": "a short phrase describing the emotional tone of the playlist (do NOT use 'neutral' or 'unknown')",
  "top10": ["up to 10 songs from the list that best match that mood"],
  "imagePrompt": "a visual description for an album cover image with NO text"
}

Rules for generating "mood":
- Look at the SONG TITLES and infer the overall emotional tone (e.g., calm, sad, hyped, dreamy, dark, upbeat).
- The mood must be more descriptive than "neutral" or "unknown". Do NOT use those words.
- Short and simple is good.

Rules for generating "imagePrompt":
- Describe a simple visual scene or abstract colors that match the playlist mood.
- The focus is matching the mood
- Use colors, lighting, shapes, scenery, or textures that feel like the songs.
- The cover must be purely visual:
  - NO text
  - NO letters
  - NO numbers
  - NO logos
  - NO symbols
  - NO captions
  - NO handwriting
- Do NOT mention the song titles or any lyrics inside the image description.

Playlist:
${playlistText}
    `.trim();

    // 1) Ask text model ONCE for overall mood + base imagePrompt
    const raw = await cfText(moodPrompt);

    let parsed;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : raw;
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.warn('Failed to parse JSON from text model, using fallback shape:', e);
      parsed = {
        mood: 'mixed but emotional',
        top10: songs.slice(0, 10),
        imagePrompt:
          `A simple album cover that visually matches the overall mood of the playlist. ` +
          `Use colors and lighting that feel like the songs (for example, calm and soft, bright and energetic, or dark and moody). ` +
          `Only use visual elements like shapes, colors, or a basic scene. No text, no letters, no numbers, no logos, no captions.`
      };
    }

    let mood = (parsed.mood || '').trim();
    if (!mood || /^neutral|unknown$/i.test(mood)) {
      mood = 'playlist-based mood';
    }

    const top10 = Array.isArray(parsed.top10) ? parsed.top10 : songs.slice(0, 10);

    let imagePrompt = parsed.imagePrompt;
    if (!imagePrompt || typeof imagePrompt !== 'string' || !imagePrompt.trim()) {
      imagePrompt =
        `A simple album cover whose colors and lighting match the overall mood of the playlist songs. ` +
        `Use only visual elements (shapes, gradients, or a basic scene) that fit the emotion of the songs. ` +
        `No text, no letters, no numbers, no symbols, no logos, no captions.`;
    }

    // 🔹 NEW: split the playlist into first half / second half
    let firstHalf = [];
    let secondHalf = [];

    if (songs.length > 0) {
      const mid = Math.ceil(songs.length / 2);
      firstHalf = songs.slice(0, mid);
      secondHalf = songs.slice(mid);
    }

    // Fallbacks in case playlist is tiny
    if (firstHalf.length === 0 && songs.length) firstHalf = songs;
    if (secondHalf.length === 0 && songs.length) secondHalf = songs;

    const firstHalfLines = firstHalf.map(s => `- ${s}`).join('\n');
    const secondHalfLines = secondHalf.map(s => `- ${s}`).join('\n');

    // 2) Build three distinct prompts for the image model
    const prompts = [
      // Image 1 – title / overall vibe
      `
${imagePrompt}

Variation 1 – Focus on the overall playlist title and vibe.
Playlist title: ${title}
Playlist subtitle: ${subtitle}

Do NOT include any text, letters, numbers, logos, or captions in the image itself.
      `.trim(),

      // Image 2 – first half of songs
      `
${imagePrompt}

Variation 2 – Focus on the opening half of the playlist.
These songs define the vibe for this cover:
${firstHalfLines}

Do NOT include any text, letters, numbers, logos, or captions in the image itself.
      `.trim(),

      // Image 3 – second half of songs
      `
${imagePrompt}

Variation 3 – Focus on the closing half of the playlist.
These songs define the vibe for this cover:
${secondHalfLines}

Do NOT include any text, letters, numbers, logos, or captions in the image itself.
      `.trim()
    ];

    // 3) Generate 3 images with Cloudflare SDXL (one per prompt)
    const buffers = await Promise.all(prompts.map(p => cfImage(p)));

    const images = buffers.map(buf => {
      const base64 = buf.toString('base64');
      return `data:image/png;base64,${base64}`;
    });

    // (Optional) store first one for Customize page like before
    if (images[0]) {
      // You'll still set this in the frontend; server just returns images[]
    }

    // 4) Send back mood + top10 + 3 different images
    res.json({
      mood,
      top10,
      images
    });
  } catch (err) {
    console.error('AI generation error:', err);
    res.status(500).json({
      error: 'AI generation failed',
      details: err.message
    });
  }
});


//404 fallback send Home
app.use((_, res) => res.status(404).sendFile(path.join(PUBLIC_DIR, 'index.html')));

app.listen(PORT, () => {
  console.log(`🎧 AI Album running at http://localhost:${PORT}`);
});
