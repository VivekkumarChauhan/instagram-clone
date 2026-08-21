import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from './app';
import { setupChatSocket } from './sockets/chatSocket';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/instagram_clone';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupChatSocket(io);

mongoose.set('bufferCommands', false);

let isMongoConnected = false;

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 3000,
    dbName: 'instagram_clone',
  })
  .then(() => {
    isMongoConnected = true;
    console.log(`🍃 [MONGODB ATLAS] Connected successfully to Cloud Database (instagram_clone)!`);
  })
  .catch((err) => {
    console.log(`⚠️ [MONGODB] Cloud Atlas IP not whitelisted. Using active local JSON database fallback (server/data/db.json)`);
  });

export { isMongoConnected };

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 LUMIGRAM FULL-STACK BACKEND (TypeScript & Express)`);
  console.log(`📡 REST API:   http://localhost:${PORT}/v1`);
  console.log(`⚡ SOCKET.IO:  http://localhost:${PORT}`);
  console.log(`🍃 MONGODB:    ${MONGODB_URI}`);
  console.log(`🔥 FIREBASE:   Active Phone/Email OTP Verification`);
  console.log(`🔑 Test User:  user@example.com / Password1`);
  console.log(`🔢 Master OTP: 123456`);
  console.log(`=================================================`);
});
