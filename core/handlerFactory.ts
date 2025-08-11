import fs from 'fs';
import * as path from 'path';
import logger from './logger.js';
import { Handler } from './handler.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class HandlerFactory {
  #handlersDirectory: string;

  constructor() {
    this.#handlersDirectory = path.join(__dirname, '../api');
  }

  async create(action: string) {
    const handlerPath = this.#handlersDirectory;
    const subPaths = fs.readdirSync(handlerPath);
    let handler: { new (): Handler} | null = null;

    for (const subPath of subPaths) {
      if (!fs.statSync(path.join(handlerPath, subPath)).isDirectory()) {
        continue;
      }

      const foundHandler = await this.#findInFolder({
        folder: path.join(handlerPath, subPath),
        action
      });

      if (foundHandler) {
        handler = new foundHandler();
      }
    }

    if (!handler || !(handler instanceof Handler)) {
      logger.error(`Handler for action ${action} not found or invalid`);
      return false;
    }

    return handler;
  }

  async #findInFolder({ folder, action }: { folder: string, action: string }) {
    const files = fs.readdirSync(folder);
    for (const file of files) {
      if (file === `${action}.ts` || file === `${action}.js`) {
        const filePath = path.join(folder, file);
        const handler = await import(filePath);
        return handler.default;
      }
    }
  }
}