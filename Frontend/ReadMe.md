    Read Me

    Home Page: 
    Introduces the app and explains how it works
    Buttons to “Get Started” or “Connect Spotify/Apple Music” (mocked navigation)

    Generate Page (Dashboard): 
    Shows a playlist preview (mock data)
    Displays three AI-style cover options
    Allows selecting a cover, changing text, font style, and colors
    Apply & Download buttons (front-end only, no real AI yet)

    Customize Page:  
    Used for advanced cover editing after a design is chosen. Users can fine-tune the title and subtitle, adjust font family, weight, and text position, change gradient background colors and opacity, toggle visual effects (shadow, glow, blur), reset to defaults, save a design snapshot, and download the refined cover image.


    Help Page: 
    Simple help/FAQ section (placeholder)

    🗂️ Project Structure
    album_generator_project/
    ├── Frontend/
    │ ├── index.html (Home)
    │ ├── generate.html (Dashboard)
    │ ├── customize.html
    │ ├── help.html
    │ ├── server.js (Express server)
    │ └── assets/
    │ ├── styles.css
    │ └── app.js
    ├── package.json
    └── README.md

    🧠 Technologies Used
    Frontend: HTML5, CSS3, JavaScript
    Backend: Node.js + Express.js
    Runtime: Localhost server
    Design: Responsive layout with flex/grid, dark UI theme


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

    Everything is served through Express and works as separate pages.

    📦 package.json Summary

    Uses Express 5
    “start” script runs Frontend/server.js

    🧩 How the Express Server Works

    The server:
    Serves all static HTML pages in your Frontend folder
    Maps routes (/generate, /customize, /help) to the matching HTML files
    Serves your assets (CSS, JS) from the assets folder
    Falls back to index.html when a path is not found

    🎨 Design Notes

    Dark purple/blue theme
    Modern gradients and pastel accents
    Responsive layout for small screens
    Reusable UI components for both home page and dashboard

    🧩 Future Enhancements

    Spotify real OAuth login (PKCE)
    Image generation backend
    Downloading custom covers as PNG
    Saving user preferences
    Full customization tools