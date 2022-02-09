import {
  WebSocketClient,
  WebSocketServer,
} from 'https://deno.land/x/websocket@v0.1.3/mod.ts';

const connections = new Map<
  'extension' | 'client',
  WebSocketClient | WebSocketClient[]
>();

const wss: WebSocketServer = new WebSocketServer(2292);
wss.on('connection', (ws: WebSocketClient) => {
  ws.on('message', (message: string) => {
    console.log(message);
    wss.clients.forEach((client) => {
      if (client === ws) return;
      client.send(message);
    });
  });
});
