import { Handler } from '../../core/handler.js';
import type { HandlerResponse } from '../../types/handlerResponse.js';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';

type Output = {
  key: string
};

export default class CheckIfSSHKeyExists extends Handler<void, Output> {
  async execute(): Promise<HandlerResponse<Output>> {
    try {
      const homeDir = os.homedir();
      const sshFiles = fs.readdirSync(homeDir + '/.ssh');

      const fileFound = sshFiles.find((name) => {
        return name.startsWith('id_') && name.endsWith('.pub');
      });

      if (!fileFound) {
        return this.fail('ssh', 'SSH key not found');
      }

      const keyPath = path.join(homeDir, '.ssh', fileFound);

      if (fs.existsSync(keyPath)) {
        const key = fs.readFileSync(keyPath, 'utf8').trim();
        return this.success({
          key
        });
      }

      return this.fail('ssh', 'SSH key not found');

    } catch {
      return this.fail('ssh', 'Error checking SSH key');
    }
  }
}