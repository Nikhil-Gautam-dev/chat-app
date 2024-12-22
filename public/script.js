const socket = io();

// Elements
const registerSection = document.getElementById("register");
const mainSection = document.getElementById("main");

const registerBtn = document.getElementById("registerBtn");
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const sendMessageBtn = document.getElementById("sendMessageBtn");

const usernameInput = document.getElementById("username");
const newRoomNameInput = document.getElementById("newRoomName");
const messageInput = document.getElementById("message");
const messagesDiv = document.getElementById("messages");
const roomList = document.getElementById("roomList");

// State
let username = "";
let currentRoom = "";

// Register User
registerBtn.addEventListener("click", () => {
  const usernameText = document.getElementById("title-username");
  const username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter a username");
    return;
  }

  socket.emit("register", { username });
  socket.on("welcome", () => {
    registerSection.classList.add("hidden");
    mainSection.classList.remove("hidden");
    usernameText.innerText = "Hi, " + username;
    setCookie("username", username);
  });
});

// Create a Room
createRoomBtn.addEventListener("click", () => {
  if (document.getElementsByTagName("ul")[0].children.length == 5) {
    alert("you can only have 5 rooms only !!");
    return;
  }
  const roomName = newRoomNameInput.value.trim();
  if (!roomName) {
    alert("Please enter a room name");
    return;
  }

  if (!getCookieArray("rooms")?.length) {
    setCookieArray("rooms", [roomName]);
  } else {
    addToCookieArray("rooms", roomName);
  }

  socket.emit("create-room", roomName);

  addRoomToSidebar(roomName);
  switchRoom(roomName);
  newRoomNameInput.value = "";
});

// join room
joinRoomBtn.addEventListener("click", () => {
  if (document.getElementsByTagName("ul")[0].children.length == 5) {
    alert("you can only have 5 rooms only !!");
    return;
  }
  const roomName = newRoomNameInput.value.trim();
  if (!roomName) {
    alert("Please enter a room name");
    return;
  }

  joinRoom(roomName);
  newRoomNameInput.value = "";
});

// Send Message
sendMessageBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (!message || !currentRoom) {
    alert("Select a room and enter a message");
    return;
  }

  socket.emit("send_message", { roomName: currentRoom, message });
  addMessage("You", message);
  messageInput.value = "";
});

// Receive Message
socket.on("recieve-message", ({ username, message }) => {
  addMessage(username, message);
});

// join room utility function

function joinRoom(roomName) {
  socket.emit("join-room", roomName);

  socket.on("join-room-failed", () => {
    alert("No room found to join !!");
  });

  socket.on("join-room-success", (data) => {
    if (roomName == data?.roomName) {
      if (!getCookieArray("rooms")?.length) {
        setCookieArray("rooms", [roomName]);
      } else {
        addToCookieArray("rooms", roomName);
      }

      addRoomToSidebar(roomName);
      switchRoom(roomName);
      return;
    }
  });
  return;
}

// Add Room to Sidebar
function addRoomToSidebar(roomName) {
  document.getElementById("no-room-found").classList.add("hidden");
  const roomElement = document.createElement("li");
  const roomNameElement = document.createElement("div");
  const inviteBtnElement = document.createElement("div");
  roomNameElement.classList.add("room-name");
  inviteBtnElement.classList.add("invite-btn");
  roomNameElement.textContent = roomName;
  inviteBtnElement.textContent = "invite";

  inviteBtnElement.addEventListener("click", () => inviteUser(roomName));
  roomElement.addEventListener("click", () => switchRoom(roomName));

  roomElement.appendChild(roomNameElement);
  roomElement.appendChild(inviteBtnElement);
  roomList.appendChild(roomElement);
}

// Switch Room
function switchRoom(roomName) {
  const roomList = document.getElementById("roomList");
  currentRoom = roomName;

  // Highlight the active room
  Array.from(roomList.children).forEach((room) => {
    room.classList.remove("active");
    if (room.children[0].textContent === roomName) {
      room.classList.add("active");
    }
  });

  // Clear previous messages
  messagesDiv.innerHTML = "";
}

// invite user
function inviteUser(roomName) {
  const inviteLink =
    document.location.href.split("?")[0] + "?roomId=" + roomName;
  navigator.clipboard.writeText(inviteLink).then(() => {
    alert(
      "Link copied to your clipboard sent it to invite some one to join your room\n\nlink: " +
        inviteLink
    );
  });
}

// Utility Function to Add Message
function addMessage(user, message) {
  const messageElement = createMessageElement(
    user,
    message,
    user == "You" ? "right" : "left"
  );
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function createMessageElement(name, messageText, placement) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", placement);
  messageDiv.innerHTML = `
    <div class="sender-name">${name}</div>
    <div class="text">${messageText}</div>
  `;
  return messageDiv;
}

document.addEventListener("DOMContentLoaded", () => {
  const username = getCookie("username");
  const roomName = document.location.href.split("?")[1]?.split("=")[1].trim();

  if (username?.trim()) {
    usernameInput.value = username;
    registerBtn.click();
    const roomInCookie = getCookieArray("rooms");
    if (roomInCookie?.length > 0) {
      socket.emit("join-rooms", roomInCookie);
      roomInCookie.forEach((room) => {
        addRoomToSidebar(room);
      });
      switchRoom(roomInCookie[0]);
    }
  }

  if (roomName && !getCookieArray("rooms")?.find((room) => room == roomName)) {
    joinRoom(roomName);
    switchRoom(roomName);
  }
});
