var WebSocketServer = require('uws').Server;
var wss = new WebSocketServer({ port: 3000 });

const connections = [];

wss.on('connection', function(ws) {
  const userId = ws.upgradeReq.url.replace('/', '');
  connections.push({ userId, rooms: [], connection: ws });
  ws.on('message', onMessage);
});

function onMessage(message) {
  const { type, payload } = JSON.parse(message);

  switch (type) {
    case 'NEW_MESSAGE':
    case 'USER_TYPING':
      _forwardToMatchingRooms(type, payload);
      break;
    case 'JOIN_ROOM':
      _processJoinRoom(payload.userId, payload.roomId);
      break;
  }
}

function _forwardToMatchingRooms(type, message) {
  connections.find(conn => {
    if (conn.rooms.includes(message.roomId)) {
      conn.connection.send(JSON.stringify({
        type,
        payload: message
      }));
    }
  });
}

function _processJoinRoom(userId, roomId) {
  connections.forEach(conn => {
    if (conn.userId === userId && !conn.rooms.includes(roomId)) {
      conn.rooms.push(roomId);
    }
  });
}
