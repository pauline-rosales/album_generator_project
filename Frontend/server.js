// Frontend/server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

const PUBLIC_DIR = __dirname; // Frontend/ (where the html is)

// Serve static assets (css/js/images) from /assets
app.use('/assets', express.static(path.join(PUBLIC_DIR, 'assets')));


app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

// Pretty routes -> specific pages
app.get('/',        (_, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.get('/home',    (_, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.get('/generate',(_, res) => res.sendFile(path.join(PUBLIC_DIR, 'generate.html')));
app.get('/customize',(_, res) => res.sendFile(path.join(PUBLIC_DIR, 'customize.html')));
app.get('/help',    (_, res) => res.sendFile(path.join(PUBLIC_DIR, 'help.html')));

// Optional 404 fallback: send Home (or a custom 404 page)
app.use((_, res) => res.status(404).sendFile(path.join(PUBLIC_DIR, 'index.html')));

app.listen(PORT, () => {
  console.log(`🎧 AI Album running at http://localhost:${PORT}`);
});
