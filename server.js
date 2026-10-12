const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true } });

app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_req, res) => res.json({ ok: true, game: "SPIKE ACROSS" }));

const waitingPlayers = [];
const rooms = new Map();
const allowedKeys = new Set(["left", "right", "jump", "spike", "bump", "set", "diveLeft", "diveRight"]);

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code;
  do {
    code = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  } while (rooms.has(code));
  return code;
}
function removeFromQueue(socketId) {
  const index = waitingPlayers.indexOf(socketId);
  if (index !== -1) waitingPlayers.splice(index, 1);
}
function roomForSocket(socketId) {
  for (const room of rooms.values()) {
    if (room.hostId === socketId || room.guestId === socketId) return room;
  }
  return null;
}
function pairPlayers(room, guestSocket) {
  room.guestId = guestSocket.id;
  room.started = true;
  guestSocket.join(room.code);
  const hostSocket = io.sockets.sockets.get(room.hostId);
  if (!hostSocket) {
    rooms.delete(room.code);
    guestSocket.emit("room:error", { message: "The room creator disconnected. Try another room." });
    return;
  }
  hostSocket.emit("match:found", { role: "host", roomCode: room.code });
  guestSocket.emit("match:found", { role: "guest", roomCode: room.code });
}
io.on("connection", (socket) => {
  socket.on("matchmaking:join", () => {
    removeFromQueue(socket.id);
    if (roomForSocket(socket.id)) return;
    let opponentId = null;
    while (waitingPlayers.length && !opponentId) {
      const candidate = waitingPlayers.shift();
      if (candidate !== socket.id && io.sockets.sockets.has(candidate) && !roomForSocket(candidate)) opponentId = candidate;
    }
    if (!opponentId) {
      waitingPlayers.push(socket.id);
      socket.emit("matchmaking:waiting");
      return;
    }
    const opponent = io.sockets.sockets.get(opponentId);
    const code = makeCode();
    const room = { code, hostId: opponentId, guestId: null, custom: false, started: false };
    rooms.set(code, room);
    opponent.join(code);
    pairPlayers(room, socket);
  });

  socket.on("matchmaking:cancel", () => {
    removeFromQueue(socket.id);
    socket.emit("matchmaking:cancelled");
  });

  socket.on("room:create", () => {
    if (roomForSocket(socket.id)) {
      socket.emit("room:error", { message: "Leave your current room before creating another." });
      return;
    }
    removeFromQueue(socket.id);
    const code = makeCode();
    const room = { code, hostId: socket.id, guestId: null, custom: true, started: false };
    rooms.set(code, room);
    socket.join(code);
    socket.emit("room:created", { code });
  });

  socket.on("room:join", (payload = {}) => {
    const code = String(payload.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const room = rooms.get(code);
    if (!room || room.guestId || room.hostId === socket.id) {
      socket.emit("room:error", { message: "Room not found or already full. Check the code and try again." });
      return;
    }
    if (roomForSocket(socket.id)) {
      socket.emit("room:error", { message: "Leave your current room or queue before joining another." });
      return;
    }
    removeFromQueue(socket.id);
    pairPlayers(room, socket);
  });

  socket.on("player:skin", (payload = {}) => {
    const room = roomForSocket(socket.id);
    if (!room || !room.started) return;
    const skinId = String(payload.skinId || "").slice(0, 40);
    const otherId = room.hostId === socket.id ? room.guestId : room.hostId;
    if (otherId) io.to(otherId).emit("opponent:skin", { skinId });
  });

  socket.on("player:input", (payload = {}) => {
    const room = roomForSocket(socket.id);
    if (!room || !room.started || room.guestId !== socket.id) return;
    const keys = Array.isArray(payload.keys) ? payload.keys.filter(key => allowedKeys.has(key)).slice(0, 8) : [];
    io.to(room.hostId).emit("remote:input", { keys });
  });

  socket.on("game:state", (state) => {
    const room = roomForSocket(socket.id);
    if (!room || !room.started || room.hostId !== socket.id || !state || typeof state !== "object") return;
    // This MVP uses the left-side player's client as the simulation authority.
    // State is transient: if a client is congested, skip stale frames instead of queuing them.
    io.to(room.guestId).volatile.emit("game:state", state);
  });

  socket.on("match:leave", () => leaveRoom(socket, true));
  socket.on("disconnect", () => {
    removeFromQueue(socket.id);
    leaveRoom(socket, true);
  });
});

function leaveRoom(socket, notifyOpponent) {
  const room = roomForSocket(socket.id);
  if (!room) return;
  rooms.delete(room.code);
  socket.leave(room.code);
  const otherId = room.hostId === socket.id ? room.guestId : room.hostId;
  if (notifyOpponent && otherId && io.sockets.sockets.has(otherId)) {
    const other = io.sockets.sockets.get(otherId);
    other.leave(room.code);
    other.emit("opponent:left");
  }
  if (room.hostId !== socket.id) {
    const host = io.sockets.sockets.get(room.hostId);
    if (host) host.emit("room:closed");
  }
}

const port = Number(process.env.PORT) || 3000;
server.listen(port, "0.0.0.0", () => {
  console.log(`SPIKE ACROSS multiplayer server running at http://localhost:${port}`);
  console.log("For a friend on the same Wi-Fi, use this computer's local IP address and port 3000.");
});
