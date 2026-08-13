const users = [
  { id: "P", password: "1111", name: "P" },
  { id: "M", password: "2222", name: "M" },
  { id: "J", password: "3333", name: "J" },
  { id: "D", password: "4444", name: "D" }
];

// LOGIN
function login() {
  const id = document.getElementById("userid").value.trim();
  const pass = document.getElementById("password").value.trim();

  const user = users.find(
    u => u.id === id && u.password === pass
  );

  if (user) {
    localStorage.setItem(
      "currentUser",
      JSON.stringify(user)
    );

    window.location.href = "./chat.html";
  } else {
    document.getElementById("msg").innerText =
      "Invalid ID or Password";
  }
}

// LOAD MESSAGES
function loadMessages() {
  const user = JSON.parse(
    localStorage.getItem("currentUser")
  );

  if (!user) {
    window.location.href = "./index.html";
    return;
  }

  const box = document.getElementById("chatBox");

  if (!box) return;

  const messages = JSON.parse(
    localStorage.getItem("messages") || "[]"
  );

  box.innerHTML = "";

  messages.forEach(msg => {
    box.innerHTML += `
      <p>
        <strong>${msg.sender}</strong>:
        ${msg.text}
      </p>
    `;
  });

  box.scrollTop = box.scrollHeight;
}

// SEND MESSAGE
function sendMessage() {
  const user = JSON.parse(
    localStorage.getItem("currentUser")
  );

  const input = document.getElementById("message");

  if (!input) return;

  const text = input.value.trim();

  if (text === "") return;

  const messages = JSON.parse(
    localStorage.getItem("messages") || "[]"
  );

  messages.push({
    sender: user.name,
    text: text,
    time: new Date().toLocaleString()
  });

  localStorage.setItem(
    "messages",
    JSON.stringify(messages)
  );

  input.value = "";

  loadMessages();
}

// LOGOUT
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "./index.html";
}

// AUTO REFRESH CHAT EVERY SECOND
if (window.location.pathname.includes("chat.html")) {
  setInterval(loadMessages, 1000);
}
