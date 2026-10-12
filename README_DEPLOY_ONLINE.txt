SPIKE ACROSS — HOSTED ONLINE MULTIPLAYER

WHY THE NETLIFY LINK DID NOT LET YOU PLAY WITH FRIENDS
The Netlify package contained only the HTML game. Multiplayer requires the Node.js + Socket.IO server in this project. Deploy THIS project as a web service instead of deploying only index.html.

FILES
- public/index.html: the game
- server.js: matchmaking / private rooms / multiplayer relay
- package.json: dependencies and start command
- render.yaml: suggested Render service configuration

PUBLISH WITH RENDER (requires a free GitHub account and Render account)
1. Create a new PUBLIC repository on GitHub named spike-across-online.
2. Upload the files and folder from this project to the repository root. Make sure server.js, package.json, render.yaml, and the public folder are at the root level (do not upload the ZIP itself).
3. Open https://dashboard.render.com/ and choose New > Web Service.
4. Connect/select your GitHub repository.
5. Set:
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
6. Click Create Web Service and wait until the deployment is live.
7. Open the Render URL ending in onrender.com. This same URL serves the game and the multiplayer Socket.IO server.
8. Share that URL with your friend. Both of you open it, choose ONLINE MULTIPLAYER, then either QUICK PLAY or one player creates a private room and shares the six-character code.

IMPORTANT
- Do not deploy only public/index.html to a static-site host.
- Render free services may sleep after inactivity and take a little time to wake up.
- This is an MVP relay: the host player's browser simulates the game, not a production server-authoritative anti-cheat game.
