const rs = require("./room-service");
let socketManager = require("./server-socket");

let sio;
let s;

function Timer(callback, time) {
    this.setTimeout(callback, time);
}

Timer.prototype.setTimeout = function(callback, time) {
    var self = this;
    if(this.timer) {
        clearTimeout(this.timer);
    }
    this.finished = false;
    this.callback = callback;
    this.time = time;
    this.timer = setTimeout(function() {
         self.finished = true;
        callback();
    }, time);
    this.start = Date.now();
}

Timer.prototype.add = function(time) {
   if(!this.finished) {
       // add time to time left
       time = this.time - (Date.now() - this.start) + time;
       this.setTimeout(this.callback, time);
   }
}


exports.init = function(s_io, socket){
  sio = s_io;
  s = socket;

  s.on("message", message);

  s.on("questionSubmit", questionSubmit);
  s.on("answerSubmit", answerSubmit);
  s.on("tokenUse", tokenUse);
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
 *    answerer: 
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

function tokenUse(data){
  let gameId = data.gameId;
  let g = rs.getGame(gameId);

  if (!g.tokenLock){
    g.sTimeout.add(3000);
    let prevholder = g.tokenHolder.username
    socketManager.getSocketFromUserID(g.tokenHolder.id).in(gameId).emit("notice", {
      message: `${prevholder} chose to reveal the question!`,
      color: "yellow"
    });
    socketManager.getIo().in(gameId).emit("tokenReveal", {
      question: g.question,
      asker: g.reveal ? g.asker : null
    });

    g.tokenHolder = g.answerer;
    console.log(`[${gameId}] token holder is ${g.tokenHolder.username}`);

    let m = rs.getMembers(gameId);
    socketManager.getIo().in(gameId).emit("attendees", {
      attendees: m.map((e) => ( e.username )),
      tokens: m.map((e) => (e.id === g.tokenHolder.id))
    });

    socketManager.getIo().to(socketManager.getSocketFromUserID(g.tokenHolder.id).id).emit("tokenNotify", {
      hasToken: true
    });

    socketManager.getSocketFromUserID(g.tokenHolder.id).in(gameId).emit("tokenNotify", {
      hasToken: false
    });
  }

}

questionStage = (gameId, smm) => {

  socketManager = smm;
  io = smm.getIo();

  let g = rs.getGame(gameId);
  

  if (!g.roundMap){
    g.roundMap = new Map();
    rs.getMembers(gameId).map((e) => e.id).forEach((id) => {
      g.roundMap.set(id, 0);
    });
  }
  
  if (typeof g.maxrounds !== 'number' || Math.min(...g.roundMap.values()) >= g.maxrounds){
    io.in(gameId).emit("notice", {message:`all ${g.maxrounds} rounds complete!`, color: 'yellow'});
    io.in(gameId).emit("404");
    for (let m of rs.getMembers(gameId)){
      socketManager.getSocketFromUserID(m.id).disconnect();
    }
  }

  // deal with new users' roundcounts
  let members = rs.getMembers(gameId);
  let memberids = members.map((e) => e.id);
  let roundcounts = Array.from(g.roundMap.values()).filter(i => {return Number.isInteger(i)});
  memberids.forEach((id) => {
    if (!g.roundMap.has(id)){
      g.roundMap.set(id, Math.min(...roundcounts))
    }
  }); 

  if (!g.tokenHolder || !rs.getMembers(gameId).map((m) => m.id).includes(g.tokenHolder.id)){
    // assign token
    let m = rs.getMembers(gameId);
    g.tokenHolder = m[Math.floor(Math.random() * m.length)];
    socketManager.getIo().in(gameId).emit("attendees", {
      attendees: m.map((e) => ( e.username )),
      tokens: m.map((e) => (e.id === g.tokenHolder.id))
    });

    io.in(socketManager.getSocketFromUserID(g.tokenHolder.id).id).emit("tokenNotify", {
      hasToken: true
    });

    socketManager.getSocketFromUserID(g.tokenHolder.id).in(gameId).emit("tokenNotify", {
      hasToken: false
    });
    console.log(`[${gameId}] token holder is ${g.tokenHolder.username}`);
  }

  if (!g){
    console.log(`[${gameId}] somehow no game when trying to start question stage`);
    return false;
  }

  console.log(`[${gameId}] members`, members)
  console.log(`[${gameId}] choosing answerer from ${members.length} members`);

  let chosenmid = memberids.sort((a, b) => g.roundMap.get(a) - g.roundMap.get(b))[0];
  let answerer = members.find((e) => e.id === chosenmid);
  let answererSocket = socketManager.getSocketFromUserID(answerer.id);


  g.answerer = answerer;
  g.timeout = Date.now() + parseInt(g.qTime) * 1000;
  g.expecting = "questionSubmit";
  g.questions = Array();

  if (g.dcFlag || !answererSocket){
    g.dcFlag = false;
    questionStage(gameId, socketManager);
  } else {

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
    console.log(Date(), 'times up for questions');
    answerStage(gameId, socketManager);
  }, parseInt(g.qTime)*1000);

  }  
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
    io.in(gameId).emit("notice", {message: "nobody asked a question", color: "red"});
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
    
    if (g.dcFlag || !answererSocket){
      g.dcFlag = false;
      questionStage(gameId, socketManager);
    } else {

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

    console.log(Date(), `starting ${g.aTime}s answer timer`);
    g.aTimeout = setTimeout(() => {
      console.log(Date(), `times up for answering`);
      console.log(`[${gameId}] ${g.answerer.username} failed to answer`);
      io.in(gameId).emit("mainmessage", {
        question: g.question,
        answerer: g.answerer.username
      });
      setTimeout(() => { questionStage(gameId, socketManager); }, 5000);
    }, parseInt(g.aTime)*1000);  

    }
  }
}

showdownStage = (gameId, smm) => {
  console.log(`[${gameId}] showdown time`)
  let g = rs.getGame(gameId);

  if (!g){
    console.log(`[${gameId}] somehow no game when trying to start answer stage`);
  }

  let answerer = g.answerer;
  let asker = g.asker;
  let question = g.question;
  let answer = g.answer;

  let bernoulli = Math.max(0, Math.min(g.factor, 100))/100;
  bernoulli = 1 - (0.20 + 0.6 * bernoulli); //redaction probability \in (0.2, 0.8)
  bernoulli = Math.random() < bernoulli;

  if (!bernoulli){
    question = "[REDACTED]";
    asker = null;
  }

  if (!g.reveal){
    asker = null;
  }

  g.tokenLock = false;

  answerer = answerer.username;
  io.in(gameId).emit("showdown", {
    answerer, asker, question, answer
  });

  g.roundMap.set(g.answerer.id, g.roundMap.get(g.answerer.id)+1);

  g.sTimeout = new Timer(() => {
    g.tokenLock = true;
    questionStage(gameId, smm);
  }, 9*1000);

}

exports.questionStage = questionStage;
exports.answerStage = answerStage;
exports.showdownStage = showdownStage;
