const nanoid = require('nanoid');

const roomList = new Set();
const idToNameMap = new Map();
const idToGameMap = new Map();

const newRoom = (id, username) => {
  const newId = nanoid(10);

  roomList.add(newId);

  const names = new Array();
  names.push({username: username, id: id});
  idToNameMap.set(newId, names);
  idToGameMap.set(newId, {username: username, started: false});
  return newId;
};

const registerGame = (id, data) => {
  idToGameMap.set(id, data);
}

const removeRoom = (id) => {
  roomList.delete(id);
  idToGameMap.delete(id);
}

const getMembers = (id) => {
  return idToNameMap.get(id);
}

const getGame = (id) => {
  return idToGameMap.get(id);
}

const addMember = (id, user) => {
  idToNameMap.get(id).push({username: user.username, id: user.id});
}

const roomExists = (id) => {
  return roomList.has(id);
}

module.exports = {
  newRoom: newRoom,
  registerGame: registerGame,
  removeRoom: removeRoom,
  getMembers: getMembers,
  getGame: getGame,
  addMember: addMember,
  roomExists: roomExists
};
