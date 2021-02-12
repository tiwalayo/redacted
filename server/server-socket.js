var _ = require('underscore');

let io;
let ph = require("./paranoiaHandler.js");
let rs = require("./room-service");

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object
const sidToSocketMap = new Map();

const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => sidToSocketMap.get(socketid);


 // console.log(io.sockets.sockets);
//  io.sockets.connected[socketid];
const addUser = (user, socket) => {
  const oldSocket = userToSocketMap[user._id];
  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    //oldSocket.disconnect();
    //delete socketToUserMap[oldSocket.id];
    return false;
  }

  userToSocketMap[user._id] = socket;
  socketToUserMap[socket.id] = user;
};

const removeUser = (user, socket) => {
  if (user) delete userToSocketMap[user._id];
  delete socketToUserMap[socket.id];
};


module.exports = {
  init: (http) => {
    io = require("socket.io")(http);

    io.on("connection", (socket) => {
      console.log(`socket has connected ${socket.id}`);
      sidToSocketMap.set(socket.id, socket);
      socket.on("disconnecting", (reason) => {
        console.log(`socket has disconnected ${socket.id}`);
        const user = getUserFromSocketID(socket.id);
        removeUser(user, socket);
        sidToSocketMap.delete(socket.id);

        let gameId = [...(socket.rooms)].filter((e) => { return e !== socket.id; })[0];
        console.log(socket.rooms, gameId);
        let g = rs.getGame(gameId);
        if (g && g.started){
          rs.removeMember(gameId, user);
          io.in(gameId).emit('attendees', rs.getMembers(gameId).map((m) => m.username));
          if (_.isEqual(g.answerer, user)){
            g.dcFlag = true;
          }
          if (rs.getMembers(gameId).length < 2){
            console.log(`[@] taking ${gameId} apart and kicking users`)
            rs.removeRoom(gameId);
            io.in(gameId).emit("404", {redirect: "/"});
          }
        }
      });

      ph.init(io, socket);

    });
  },

  addUser: addUser,
  removeUser: removeUser,

  getSocketFromUserID: getSocketFromUserID,
  getUserFromSocketID: getUserFromSocketID,
  getSocketFromSocketID: getSocketFromSocketID,
  getIo: () => io,
};
