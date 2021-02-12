const rs = require("./room-service");
let socketManager = require("./server-socket");

let sio;
let s;

exports.init = function(s_io, socket){
  sio = s_io;
  s = socket;

  s.on("message", message);

  s.on("questionSubmit", questionSubmit);
  s.on("answerSubmit", answerSubmit);
}

function message(data){
  sio.in(data.gameId).emit("messageUpdate", {
    username: data.username,
    message: data.message
  })
}


/*  game looks like this:
 *    reveal: this.state.checked,
 *    factor: this.state["SetupMenu-factor"],
 *    time: this.state["SetupMenu-time"],
 *    gameId: this.state.gameId,
 *    username: this.props.username
 *    uid: hostId
 *    started:true
 */

function questionSubmit(data){
  let gameId = data.gameId;
  let g = rs.getGame(gameId);
  console.log(`[${gameId}] received question ${data.question} from ${data.asker}`);

  if (Date.now() < g.timeout && g.expecting == "questionSubmit"){
    g.questions.push({
      question: data.question,
      asker: data.asker
    });

    if (rs.getMembers(gameId).length-1 <= g.questions.length){
      g.ended = true;
      console.log(`[${gameId}] everyone answered`);
      clearTimeout(g.qTimeout);
      answerStage(gameId, socketManager);
    }
  }
}


function answerSubmit(data){
  console.log("!!! answer received", data)
  let gameId = data.gameId;
  let g = rs.getGame(gameId);

  if (Date.now() < g.timeout && g.expecting == "answerSubmit"){
    g.answer = data.answer;
    clearTimeout(g.aTimeout);
    showdownStage(gameId, socketManager);
  }
}

questionStage = (gameId, smm) => {

  socketManager = smm;
  io = smm.getIo();

  let g = rs.getGame(gameId);

  if (!g){
    console.log(`[${gameId}] somehow no game when trying to start question stage`);
    return false;
  }

  let members = rs.getMembers(gameId);
  console.log(`[${gameId}] choosing answerer from ${members.length} members`);

  let answerer = members[Math.floor(Math.random() * members.length)];
  let answererSocket = socketManager.getSocketFromUserID(answerer.id);


  g.answerer = answerer;
  g.timeout = Date.now() + parseInt(g.qTime) * 1000;
  g.expecting = "questionSubmit";
  g.questions = Array();

  console.log(`[${gameId}] answerer is ${answerer.username}. broadcasting 'ask' prompts.`);
  answererSocket.to(gameId).emit("asking", {
    time: g.qTime,
    answerer: answerer.username,
  });
  
  console.log(`[${gameId}] telling ${answerer.username} to wait for questions`);
  io.to(answererSocket.id).emit("pending", {
    time: g.qTime,
    role: "answerer",
    answerer: answerer.username,
  });

  console.log(Date(), `[${gameId}] starting ${g.qTime}s question timer`)
  g.qTimeout = setTimeout(() => {
    if (!g.ended){
      console.log(Date(), 'times up for questions');
      answerStage(gameId, socketManager);
    }
  }, parseInt(g.qTime)*1000);
}


answerStage = (gameId, smm) => {

  socketManager = smm;
  io = smm.getIo();

  let g = rs.getGame(gameId);

  if (!g){
    console.log(`[${gameId}] somehow no game when trying to start answer stage`);
    return false;
  }

  if (!(g.questions && g.questions.length)){
    console.log(`[${gameId}] no questions found, returning to questionStage`);
    questionStage(gameId, socketManager);
  }
  else {
    let answerer = g.answerer
    let answererSocket = socketManager.getSocketFromUserID(answerer.id);

    let question_obj = g.questions[Math.floor(Math.random() * g.questions.length)];
    let question = question_obj.question;
    let asker = question_obj.asker;

    g.timeout = Date.now() + parseInt(g.aTime) * 1000;
    g.expecting = "answerSubmit";
    g.question = question;
    g.asker = asker;

    console.log(`[${gameId}] telling room to wait for ${answerer.username}'s answer`);
    answererSocket.to(gameId).emit("pending", {
      time: g.aTime,
      role: "asker",
      answerer: answerer.username
    });
    
    console.log(`[${gameId}] telling ${answerer.username} to answer`);
    io.to(answererSocket.id).emit("answering", {
      time: g.aTime,
      question: question,
    });

    console.log(Date(), `starting ${g.aTime}s answer timer`)
    g.aTimeout = setTimeout(() => {
      console.log(Date(), `times up for answering`)
      io.in(gameId).emit("failedToAnswer", g.answerer.username);
      console.log(`[${gameId}] ${g.answerer.username} failed to answer`);
      questionStage(gameId, socketManager);
    }, parseInt(g.aTime)*1000);  

  }
}

showdownStage = (gameId, smm) => {
  console.log("showdown time")
  let g = rs.getGame(gameId);

  if (!g){
    return false;
  }
  g.ended = false;

  let answerer = g.answerer;
  let asker = g.asker;
  let question = g.question;
  let answer = g.answer;

  let bernoulli = Math.max(0, Math.min(g.factor, 100))/100;
  bernoulli = 0.20 + 0.6 * bernoulli;
  bernoulli = Math.random() < bernoulli;

  if (!bernoulli){
    question = "[REDACTED]";
    asker = null;
  }

  if (!g.reveal){
    asker = null;
  }

  answerer = answerer.id;
  io.in(gameId).emit("showdown", {
    answerer, asker, question, answer
  });

  setTimeout(() => {
    questionStage(gameId, smm);
  }, 7.5*1000);

}

exports.questionStage = questionStage;
exports.answerStage = answerStage;
exports.showdownStage = showdownStage;
