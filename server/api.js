/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

const rs = require("./room-service");
const ph = require("./paranoiaHandler")

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  //console.log(`${req.user._id} asked whoami.}`)
  res.send(req.user);
});

router.get("/amigoog", (req, res) => {
  if (req.session.goog) {
    res.send({ok: true});
  }
  else {
    res.send({ok: false});
  }
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  console.log(`socket initiated. id ${req.body.socketid} from user ${req.user._id}`);
  let result = null;
  if (req.user){
     result = socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  }
  res.send({ok: result});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

router.post('/createGame', (req, res) => {
  console.log(`user ${req.body.username} wants a new room`);
  const newId = rs.newRoom(req.user._id, req.body.username);
  socketManager.getSocketFromUserID(req.user._id).join(newId);
  res.send({newId: newId});
  socketManager.getIo().in(newId).emit("attendees", {attendees: rs.getMembers(newId).map((m) => m.username)});
  console.log(`created room ${newId} for ${req.body.username}`);
});

router.post('/startGame', (req, res) => {
  let opts = {uid : req.user, started: true};
  opts = {...req.body, ...opts};
  rs.registerGame(req.body.gameId, opts);
  res.send({});
  
  console.log(`gonna start game in ${req.body.gameId}`)

  setTimeout(() => {
    socketManager.getIo().in(req.body.gameId).emit("gameStart", "go!");
    socketManager.getIo().in(req.body.gameId).emit('attendees', {attendees: rs.getMembers(req.body.gameId).map((m) => m.username)});
    ph.questionStage(req.body.gameId, socketManager);
  }, 1500); // delay so people can get ready

});

router.get('/verify', (req, res) => {
  if (!rs.roomExists(req.query.gameId)){
    res.send({ok: false});
  }
  else {
    const g = rs.getGame(req.query.gameId);
    const gameCreator = g.username;
    const started = g.started;
    const ok = true;
    res.send({gameCreator, started, ok});
  }
});

router.get('/names', (req, res) => {
  res.send({attendees: rs.getMembers(req.query.gameId).map((m) => m.username)});
});

router.post('/join', (req, res) => {
  socketManager.getSocketFromUserID(req.user._id).join(req.body.gameId);
  rs.addMember(req.body.gameId, {id: req.user._id, username: req.body.username});
  res.send({attendees: rs.getMembers(req.body.gameId).map((m) => m.username)});
  socketManager.getIo().in(req.body.gameId).emit('attendees', {attendees: rs.getMembers(req.body.gameId).map((m) => m.username)});
  console.log(`added ${req.body.username} to game ${req.body.gameId}`);
});

/*router.post('/document', (req, res) => {
  newEntry = req.body.question.split(' ').join(',').split('?').join(',').split('.').join(',').split(',').filter(item => !stopWords.includes(item));
  User.findById(req.user._id).then(user => {
    user.library = user.library.concat(newEntry);
    user.save().then((r) => res.send(r));
  });
});*/

router.post('/document', (req, res) => {
  res.send({});
});


router.get('/retrieve', (req, res) => {
  if (req.user._id && req.session.goog){
    User.findById(req.user._id).then(user => {
      library = user.library;
      res.send({library});
    });
  }
  else {
    res.send({library: []});
  }
});

router.get("/lag", (req, res) => {
  res.send({date: Date.now()});
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
