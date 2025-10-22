
🎵 AI Album Generator —  Frontend Setup ReadMe

🪄 How I Set It Up (Step-by-Step)

🧩 Step 1 — Go to the project folder
ex: cd "/Users/paulinerosales/Desktop/Human Centered Computing/album_generator_project/album_generator_project"

📦 Step 2 — Initialize npm
npm init -y

This created a package.json file.
⚙️ Step 3 — Install Express
npm install express
Express is installed in the parent folder, one level above Frontend/.

🗂️ Step 4 — Navigate into Frontend/
cd Frontend

🧠 Step 5 — Make sure these two files exist
Frontend/
├── index.html     ✅  (the single HTML file you already have)
└── server.js      ✅  (your Express server)

🖥️ Step 6 — Run the server
node server.js
You’ll see:
🎧 AI Album running at http://localhost:8080

🌐 Step 7 — Open in your browser
👉 Go to http://localhost:8080

That’s it! 🎉 Your frontend now runs on your own local server.

⚡ New: Run Easily with npm Start

Now that your package.json includes a start script, you can launch the server from the project root instead of going into the Frontend folder.

🚀 Quick Start (After Cloning or Pulling)
cd album_generator_project/album_generator_project
npm install       # installs express from package.json
npm start         # runs node ./Frontend/server.js
Then open 👉 http://localhost:8080


🩶 Troubleshooting
⚠️ If you see “Cannot GET /”
Make sure index.html is inside the Frontend folder.
Make sure your script path matches the folder name (Frontend, not frontend).
Start the server from the project root with npm start.
🔥 If port 8080 is busy
PORT=8081 npm start
Then visit http://localhost:8081.


💾 Folder Structure
album_generator_project/
└── album_generator_project/
    ├── Frontend/
    │   ├── index.html
    │   └── server.js
    ├── package.json
    ├── package-lock.json
    └── .gitignore

    
🧰 Teammate Setup
When someone clones this repo:
git clone <your-repo-url>
cd album_generator_project/album_generator_project
npm install
npm start