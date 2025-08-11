import { Handler } from '../../core/handler.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { HandlerResponse } from '../../types/handlerResponse.js';

const execAsync = promisify(exec);

type Output = {
  installed: boolean;
  version?: string;
};

export default class CheckGitInstallation extends Handler<void, Output> {
  async execute(): Promise<HandlerResponse<Output>> {
    try {
      const { stdout } = await execAsync('git --version');
      return this.success({
        installed: true,
        version: stdout.trim().split(' ')[2] as string,
      });
    } catch {
      return this.fail('git', 'Error checking git installation');
    }
  }
}