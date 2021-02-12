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

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user) socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

router.post('/createGame', (req, res) => {
  console.log(`user ${req.user} wants a new room`);
  /*
  const newId = rs.newRoom(req.user, req.body.username);
  socketManager.getSocketFromUserID(req.user).join(newId);
  res.send({newId: newId});
  socketManager.getIo().in(newId).emit("attendees", rs.getMembers(newId).map((m) => m.username));
  console.log(`created room ${newId} for ${req.body.username}`);
  */
});

router.post('/startGame', (req, res) => {
  let opts = {uid : req.user, started: true};
  opts = {...req.body, ...opts};
  rs.registerGame(req.body.gameId, opts);
  
  setTimeout(() => {
  }, 1500);

});

router.get('verify', (req, res) => {
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

router.get('names', (req, res) => {
  res.send({attendees: rs.getMembers(req.query.gameId).map((m) => m.username)});
});

router.post('join', (req, res) => {
  socketManager.getSocketFromUserID(req.user).join(req.body.gameId);
  rs.addMember(req.body.gameId, {id: req.user, username: req.body.username});
  res.send({attendees: rs.getMembers(req.body.gameId).map((m) => m.username)});
  socketManager.getIo().in(req.body.gameId).emit('attendees', rs.getMembers(req.body.gameId).map((m) => m.username));
  console.log(`added ${req.body.username} to game ${req.body.gameId}`);
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
