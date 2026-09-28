import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ambulances } from '../store';

export function setupSockets(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // Simulate ambulance movement for live tracking demo
  setInterval(() => {
    ambulances.forEach((amb) => {
      if (amb.status === 'en_route') {
        amb.lat += (Math.random() - 0.5) * 0.001;
        amb.lng += (Math.random() - 0.5) * 0.001;
        io.emit('ambulance:location', { id: amb.id, lat: amb.lat, lng: amb.lng, name: amb.name });
      }
    });
  }, 3000);

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join:authority', () => {
      socket.join('authority');
    });

    socket.on('join:user', (sessionId: string) => {
      socket.join(`user:${sessionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}
