const rs = require("./room-service");
const socketManager = require("./server-socket");

let sio;
let s;

exports.init = function(s_io, socket){
  io = s_io;
  s = socket;

  s.on("questionSubmit", questionSubmit);
  s.on("answerSubmit", answerSubmit);
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

  if (Date.now() < g.timeout && g.expecting == "questionSubmit"){
    g.questions.push({
      question: data.question,
      asker: rs.getMembers(gameId).filter((i) => i.id == socketManager.socketToUserMap(this)).username
    });

    if (rs.getMembers(gameId).length <= g.questions.length){
      g.ended = true;
      answerStage(gameId);
    }
  }
}


function answerSubmit(data){
  let gameId = data.gameId;
  let g = rs.getGame(gameId);

  if (Date.now() < g.timeout && g.expecting == "answerSubmit" && 
      g.answerer.id == socketManager.socketToUserMap(this)){
    
    g.answer = data.answer;
    g.ended = true;
    showdownStage(gameId);
  }
}

questionStage = (gameId) => {

  let g = rs.getGame(gameId);

  if (!g){
    return false;
  }

  if (g.flag){
    io.in(gameId).emit("failedToAnswer", g.answerer.username);
  }

  let members = rs.getMembers(gameId);

  g.ended = false;
  let answerer = members[Math.floor(Math.random() * members.length)];
  let answererSocket = socketManager.userToSocketMap(answerer.id);

  g.answerer = answerer;
  g.timeout = Date.now() + g.qTime * 1000;
  g.expecting = "questionSubmit";
  g.questions = Array();

  answererSocket.to(gameId).emit("asking", {
    time: g.qTime,
    answerer: answerer.username,
  });
  
  io.to(answererSocket).emit("pending", {
    time: g.qTime,
    role: "answerer",
  });

  setTimeout(() => {
    if (!g.ended){
      answerStage();
    }
  }, g.qTime*1000);
}


answerStage = (gameId) => {

  let g = rs.getGame(gameId);

  if (!g){
    return false;
  }
  g.ended = false;
  g.flag = false;

  let answerer = g.answerer
  let answererSocket = socketManager.userToSocketMap(answerer.id);

  let question_obj = g.questions[Math.floor(Math.random() * g.questions.length)];
  let question = question_obj.question;
  let asker = question_obj.asker;

  g.timeout = Date.now() + g.aTime * 1000;
  g.expecting = "answerSubmit";
  g.question = question;
  q.asker = asker;

  answererSocket.to(gameId).emit("pending", {
    time: g.aTime,
    role: "asker",
  });
  
  io.to(answererSocket).emit("answering", {
    time: g.aTime,
    question: question,
  });

  setTimeout(() => {
    if (!g.ended){
      g.flag = true;
      questionStage();
    }
  }, g.aTime*1000);
}

showdownStage = (gameId) => {

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

  if (!reveal){
    asker = null;
  }

  io.in(gameId).emit("showdown", {
    answerer, asker, question, answer
  });

  setTimeout(() => {
    questionStage();
  }, 7.5*1000);

}

exports.questionStage = questionStage;
exports.answerStage = answerStage;
exports.showdownStage = showdownStage;
