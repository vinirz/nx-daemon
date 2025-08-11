import { WebSocketServer } from 'ws';
import logger from '../core/logger.js';
import HandlerFactory from '../core/handlerFactory.js';

const port = 1424;
const wss = new WebSocketServer({ port });
const handlerFactory = new HandlerFactory();

logger.success(`[NXUID] Server listening on port ${port}`);

wss.on('connection', socket => {
  logger.success('[NXUID] Client connected');

  socket.on('message', async msg => {
    try {
      const { action, args, requestId } = JSON.parse(msg.toString());
      const handler = await handlerFactory.create(action);

      if (!handler) {
        logger.warn(`Action ${action} not found`);
        return socket.send(JSON.stringify({ requestId, error: 'Action not found' }));
      }

      const argsObject = args || {};
      const result = await handler.execute(argsObject);

      logger.log(`\n[${requestId}] ${JSON.stringify(result, null, 2)}`);

      socket.send(JSON.stringify({ requestId, result }));
    } catch (error: unknown) {
      logger.error(error as string);
      if(error instanceof Error) {
        socket.send(JSON.stringify({ error: error?.message as string }));
      }
    }
  });
});
