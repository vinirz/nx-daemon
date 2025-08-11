import { Handler } from '../../core/handler.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { HandlerResponse } from '../../types/handlerResponse.js';

const execAsync = promisify(exec);

type DockerMissing = 'docker' | 'docker-compose';

type Output = {
  missing: DockerMissing[]
};

export default class CheckDockerInstallation extends Handler<void, Output> {
  async execute(): Promise<HandlerResponse<Output>> {
    try {
      const missing: DockerMissing[] = [];

      const { stdout: dockerStdout } = await execAsync('docker --version');
      if (!dockerStdout) {
        missing.push('docker');
      }
      
      const { stdout: composeStdout } = await execAsync('docker-compose --version');
      if (!composeStdout) {
        missing.push('docker-compose');
      }

      if (missing.length === 0) {
        return this.success({
          missing
        });
      }

      return this.fail('docker', `Missing ${missing.join(', ')}`);
    } catch {
      return this.fail('docker', 'Error checking docker and docker-compose installation');
    }
  }
}