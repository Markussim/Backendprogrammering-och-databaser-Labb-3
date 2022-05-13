// Init socket.io on client
const socket = io();

socket.on("connect", () => {
  console.log("Connected to server");
  socket.emit("new_question");
});

socket.on("new_question", (question) => {
  document.querySelector("#question").innerHTML = question.question;
});

socket.on("top_list", (topList) => {
  console.log(topList);
  document.querySelector("#top_list").innerHTML = "";
  topList.forEach((element) => {
    const li = document.createElement("li");
    li.innerHTML = element.userName + ": " + element.numberOfCorrectAnswers;
    document.querySelector("#top_list").appendChild(li);
  });
});

socket.on("wrong_answer", (userName) => {
  if (userName == localStorage.getItem("userName")) {
    alert("Wrong answer");
  }
});

socket.on("chat_message", (message) => {
  document.querySelector("#chat").innerText += message.message + "\n";
});

// When user clicks on the button
document.querySelector("#submit").addEventListener("click", () => {
  const answer = {
    answer: document.querySelector("#answer").value,
    userName: localStorage.getItem("userName"),
  };
  console.log(answer);
  socket.emit("answer", answer);
  document.querySelector("#answer").value = "";
});

// On input for the answer
document.querySelector("#answer").addEventListener("input", () => {
  if (document.querySelector("#answer").value.length > 0) {
    document.querySelector("#submit").disabled = false;
  } else {
    document.querySelector("#submit").disabled = true;
  }
});

// Check if user has name
const userName = localStorage.getItem("userName");
if (!userName) {
  const nameInput = prompt("What is your name?");
  localStorage.setItem("userName", nameInput);
}

// When user clicks send message
document.querySelector("#send").addEventListener("click", () => {
  const message = {
    message: document.querySelector("#message").value,
    userName: localStorage.getItem("userName"),
  };
  socket.emit("chat_message", message);
  document.querySelector("#message").value = "";
});
