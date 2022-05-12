// Init socket.io on client
const socket = io();

socket.on("connect", () => {
  console.log("Connected to server");
  socket.emit("new_question");
});

socket.on("new_question", (question) => {
  console.log(question);
  document.querySelector("#question").innerHTML = question.question;
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
