// frontend/server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve the current folder (where index.html lives)
app.use(express.static(__dirname, { extensions: ['html'] }));

// Explicit index route (helps avoid “Cannot GET /”)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AI Album running at http://localhost:${PORT}`);
});
