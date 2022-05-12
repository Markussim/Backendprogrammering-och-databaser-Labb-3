const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const ip = require("ip");
const http = require("http");

const server = http.createServer(app);

const io = require("socket.io")(server);

let question = generateQuestion();

let answers = [];

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
  socket.on("new_question", () => {
    console.log("New question");
    io.emit("new_question", question);
  });

  socket.on("answer", (answer) => {
    if (answer.answer == question.answer) {
      answers.push(answer);
      question = generateQuestion();
      io.emit("new_question", question);
      console.log(getNumberOfEntries(answers));
    }
  });
});

app.use(cors());

// Serve static files
app.use(express.static("../frontend"));

server.listen(port, () => {
  console.log(
    `\nApp running at:\n- Local: \x1b[36mhttp://localhost:${port}/\x1b[0m\n- Network \x1b[36mhttp://${ip.address()}:${port}/\x1b[0m\n\nTo run for production, run \x1b[36mnpm run start\x1b[0m`
  );
});

function generateQuestion() {
  const randomOperator = Math.floor(Math.random() * 3);
  let operator;
  switch (randomOperator) {
    case 0:
      operator = "+";
      break;
    case 1:
      operator = "-";
      break;
    case 2:
      operator = "*";
      break;
    default:
      operator = "+";
      break;
  }

  const randomNumber1 = randomNumber(1, 10);
  const randomNumber2 = randomNumber(1, 10);
  return {
    question: `${randomNumber1} ${operator} ${randomNumber2}`,
    answer: eval(`${randomNumber1} ${operator} ${randomNumber2}`),
  };
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Calculate number of entries for each user
function getNumberOfEntries(answers) {
  const userNames = answers.map((answer) => answer.userName);
  const uniqueUserNames = [...new Set(userNames)];
  const numberOfEntries = uniqueUserNames.map((userName) => {
    const userAnswers = answers.filter(
      (answer) => answer.userName === userName
    );
    return userAnswers.length;
  });
  return numberOfEntries;
}
