# SPIKE ACROSS — Stage 2 Multiplayer

This project preserves the uploaded SPIKE ACROSS HTML game and adds a first online multiplayer prototype with:
- Random matchmaking queue
- Private six-character room codes
- Real-time player input relay and match-state synchronization
- Existing single-player mode, skins, difficulty screen, and scoreboard

## Run it on your computer

1. Install Node.js LTS (you downloaded v24, which is fine).
2. Extract this ZIP.
3. Open the extracted `SPIKE_ACROSS_Multiplayer` folder in Visual Studio Code.
4. In VS Code choose **Terminal → New Terminal**.
5. Run these commands, one at a time:

   ```powershell
   npm install
   npm start
   ```

6. Open **http://localhost:3000** in your browser. Do not double-click `index.html` for online play; open it through the server URL.

## Test two players

- Open `http://localhost:3000` in two browser tabs (or two separate browsers).
- In both, choose **ONLINE MULTIPLAYER → QUICK PLAY**.
- One tab waits in queue; the other should match it.
- Or choose **CREATE ROOM** in one tab, copy the six-character code, then enter it in the other tab under **JOIN A FRIEND'S ROOM**.

## Test on another computer on the same Wi-Fi

Use the host computer's local IPv4 address, for example `http://192.168.1.25:3000`, in the other computer's browser. Windows Firewall may ask permission for Node.js; allow private-network access if you trust the network.

## Play with friends over the public internet

`localhost` is only your computer. To invite friends outside your Wi-Fi, deploy this Node.js project to a host that supports long-lived WebSocket connections, then use the deployed HTTPS URL. The game and server must be hosted; sending the HTML file alone does not create internet matchmaking.

## Current prototype notes

- The left player's browser simulates the match and sends state snapshots to the right player. This is a practical first multiplayer prototype, not a cheat-resistant production server-authoritative simulation.
- Both players should test serve, movement, bump, set, spike, diving, scoring, and rematch behavior. Multiplayer physics and lag need real playtesting.
- The original single-player mode remains available.
- For an App Store / Google Play release, we will later add mobile packaging, touch-control review, reconnect handling, production hosting, and additional testing.

## Easiest Windows setup

1. Extract the ZIP completely.
2. Double-click `START_MULTIPLAYER.bat`.
3. On the first run, it installs the required packages automatically. Allow it to finish.
4. Leave the black terminal window open while playing. The game opens at `http://localhost:3000`.
5. To stop the server, focus the terminal window and press `Ctrl+C`.

You must have Node.js installed. If the launcher says Node.js was not found, install it from https://nodejs.org, then double-click the launcher again.
