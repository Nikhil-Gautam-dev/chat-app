import Express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import {
  addUser,
  getUsername,
  removeUser,
  writeData,
} from "./dataHandeling.js";
import process from "process";

const App = Express();
const server = http.createServer(App);
const io = new Server(server);

io.on("connection", (client) => {
  console.log("A user is connected with id : ", client.id);

  client.on("register", ({ username }) => {
    const data = addUser(client.id, username);
    client.emit("welcome", data);
  });

  client.on("create-room", (roomName) => {
    client.join(roomName);
    client.emit("create-room-success", {
      success: true,
      message: "room created successfully !!",
    });
  });

  client.on("join-room", (roomName) => {
    let room = io.sockets.adapter.rooms.get(roomName);

    if (!room) {
      client.emit("join-room-failed", {
        success: false,
        message: "room doesn't exist !!",
        roomName: roomName,
      });
      return;
    }
    client.join(roomName);
    client.emit("join-room-success", {
      success: true,
      message: "you joined the room successfully !!",
      roomName: roomName,
    });
  });

  client.on("join-rooms", (rooms) => {
    client.join(rooms);
  });

  client.on("send_message", ({ roomName, message }) => {
    const username = getUsername(client.id);
    client.to(roomName).emit("recieve-message", { username, message });
  });

  client.on("disconnect", () => {
    removeUser(client.id);
  });
});

App.use(Express.static(path.resolve("./public")));

App.get("/test", (_, res) => {
  res.status(200).json({
    Status: true,
    message: "Working fine !!",
  });
});

App.get("/index", (_, res) => {
  res.sendFile(path.resolve("./public/index.html"));
});

server.listen(8000, () => {
  console.log(`Server running on port number : ${8000}`);
});

process.on("SIGINT", () => {
  writeData([]);
  server.close(() => {
    console.log("server is closed !!");
    process.exit(0);
  });
});
