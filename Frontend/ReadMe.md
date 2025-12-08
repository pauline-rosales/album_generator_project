 README.md
 
⭐ Final Functional Prototype – Album Generator

🎯 Main Features 
Playlist Preview & Selection: 
Users can view a playlist and see song titles and metadata.

AI-Style Cover Generation: 
Three cover concepts are displayed on the Generate page, letting the user select one and begin customizing.

Advanced Cover Customization & Download: 
Users can edit titles, fonts, gradients, borders, effects, and export the final cover as a PNG.

Home Page:
Introduces the app and explains how it works
Buttons for Get Started or Connect Spotify/Apple Music 

Generate Page (Dashboard):
Shows a playlist preview 
Displays three AI-style cover options
Allows selecting a cover
Lets users modify title, font style, and colors
Apply & Download buttons 

Customize Page:
Advanced editing after a design is selected:
Change title & subtitle
Adjust font family, weight, spacing
Choose fabric art
Move text position
Change Opacity
Drag and drop stickers
Delete Stickers
Change filters
Change gradient colors & opacity
Enable/disable effects (shadow, glow, blur)
Reset to defaults
Save a design snapshot
Download the refined cover image


❓ Help Page
Simple FAQ + instructions 


🧠 Technologies Used
Frontend: HTML5, CSS3, JavaScript
Backend: Node.js + Express.js
Runtime: Localhost server
Design: Flex/Grid responsive layout + dark UI theme + light UI theme

⚙️ How to Run the Project

Install dependencies:

npm install

Start the server:

npm start

Open in browser:
Home → http://localhost:8080/
Generate → http://localhost:8080/generate
Customize → http://localhost:8080/customize
Help → http://localhost:8080/help

All pages are served with Express.

📦 package.json Summary
Uses Express v5
"start" script runs Frontend/server.js

🧩 How the Express Server Works
Serves static HTML pages from the Frontend folder
Routes /generate, /customize, /help → matching HTML files
Serves CSS/JS from /assets
Falls back to index.html if a path does not match

🎨 Design Notes
Dark purple/blue modern theme
Light theme if chosen
Soft gradients + pastel accents
Responsive layout

Reusable components across pages

🔐 Environment Variables (Required for Full Functionality)
This app uses external APIs (Cloudflare AI, Spotify), so a .env file is required locally.

Create a .env file in the project root with the following structure:

CF_API_KEY=your_cloudflare_key_here
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

IMPORTANT Note:
For security reasons, real API keys are not included in this repository.
Without valid keys, the UI loads fully, but AI cover generation and live Spotify playlist features will not function.