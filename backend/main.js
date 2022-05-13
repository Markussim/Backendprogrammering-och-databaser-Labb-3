const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const ip = require("ip");
const http = require("http");
const { MongoClient } = require("mongodb");

const server = http.createServer(app);

const io = require("socket.io")(server);

let question = generateQuestion();

const client = new MongoClient("mongodb://localhost:27017");
client.connect();
const db = client.db("quiz");

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
  socket.on("new_question", async () => {
    console.log("New question");
    io.emit("new_question", question);
    let numberOfEntries = await getNumberOfEntries();
    console.log(numberOfEntries);
    io.emit("top_list", numberOfEntries);
  });

  socket.on("answer", async (answer) => {
    if (answer.answer == question.answer) {
      question = generateQuestion();
      io.emit("new_question", question);
      await db.collection("answers").insertOne(answer);
      let numberOfEntries = await getNumberOfEntries();
      console.log(numberOfEntries);
      io.emit("top_list", numberOfEntries);
    } else {
      io.emit("wrong_answer", answer.userName);
    }
  });

  socket.on("chat_message", (message) => {
    io.emit("chat_message", message);
    // Save message to database
    db.collection("messages").insertOne(message);
  });
});

app.use(cors());

// Serve static files
app.use(express.static("../frontend"));

// Route to get all messages from database
app.get("/messages", async (req, res) => {
  const messages = await getMessages();
  res.send(messages);
});

// Route to get all answers from database
app.get("/answers", async (req, res) => {
  const answers = await getAnswers();
  res.send(answers);
});

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

// Creates an object with the name and number of correct answers for each player
async function getNumberOfEntries() {
  // Ser answers to all answers in database
  let answers = await db.collection("answers").find({}).toArray();
  let numberOfEntries = [];
  // Get unique names
  let uniqueNames = answers
    .map((answer) => answer.userName)
    .filter((name, index, self) => self.indexOf(name) === index);
  // Loop through unique names
  for (let i = 0; i < uniqueNames.length; i++) {
    // Get number of correct answers for each name
    let numberOfCorrectAnswers = answers.filter(
      (answer) => answer.userName === uniqueNames[i]
    ).length;
    // Create object with name and number of correct answers
    numberOfEntries.push({
      userName: uniqueNames[i],
      numberOfCorrectAnswers: numberOfCorrectAnswers,
    });
  }

  // Sort the array by number of correct answers
  numberOfEntries.sort(
    (a, b) => b.numberOfCorrectAnswers - a.numberOfCorrectAnswers
  );

  return numberOfEntries;
}

// Get all messages
async function getMessages() {
  const messages = await db.collection("messages").find({}).toArray();
  return messages;
}

// Get all answers
async function getAnswers() {
  const answers = await db.collection("answers").find({}).toArray();
  return answers;
}
