import fs from "fs";
import path from "path";

// src="/socket.io/socket.io.js"

export const getData = () => {
  const data = fs.readFileSync(path.resolve("./src/data.json"), "utf8");
  return JSON.parse(data);
};

export const writeData = (filedata) => {
  fs.writeFileSync(
    path.resolve("./src/data.json"),
    JSON.stringify(filedata, null, 2),
    "utf8"
  );
};

export const getUsername = (id) => {
  return getData().find((element) => element.socketId == id)?.username;
};

export const addUser = (id = "", username = "") => {
  const newUser = {
    socketId: id,
    username: username,
  };
  const filedata = getData();
  filedata.push(newUser);
  writeData(filedata);
  return filedata;
};

export const removeUser = (id) => {
  const data = getData();
  for (let i = 0; i < data.length; i++) {
    if (data[i].socketId == id) {
      data.splice(i, 1);
      writeData(data);
      return;
    }
  }
  return;
};
