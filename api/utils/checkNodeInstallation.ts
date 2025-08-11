import { Handler } from '../../core/handler.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { HandlerResponse } from '../../types/handlerResponse.js';

const execAsync = promisify(exec);

type Output = {
  installed: boolean;
  version?: string;
};

export default class CheckNodeInstallation extends Handler<void, Output> {
  async execute(): Promise<HandlerResponse<Output>> {
    try {
      const { stdout } = await execAsync('node -v');
      return this.success({
        installed: true,
        version: stdout.trim(),
      });
    } catch {
      return this.fail('node', 'Error checking node installation');
    }
  }
}