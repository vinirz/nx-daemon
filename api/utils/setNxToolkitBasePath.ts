import { Handler } from '../../core/handler.js';
import type { HandlerResponse } from '../../types/handlerResponse.js';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';

type Input = {
  basePath: string
}

type Output = {
  success: boolean
};

export default class SetNxToolkitBasePath extends Handler<Input, Output> {
  async execute({ basePath }: Input): Promise<HandlerResponse<Output>> {
    try {
      const homeDir = os.homedir();
      const shells = ['.zshrc', '.bashrc'];
      let success = true;

      for (const shell of shells) {
        const filePath = path.join(homeDir, shell);

        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const hasVar = content.includes('export NXTOOLKITBASEPATH=');
          const hasPathWithVar = content.includes('$NXTOOLKITBASEPATH');
          const hasPathWithLiteral = content.includes(`:${basePath}`);

          const linesToAppend: string[] = [];

          if (!hasVar) {
            linesToAppend.push(`\nexport NXTOOLKITBASEPATH="${basePath}"`);
          }

          if (!hasPathWithVar && !hasPathWithLiteral) {
            linesToAppend.push(`export PATH="$PATH:$NXTOOLKITBASEPATH"`);
          }

          if (linesToAppend.length > 0) {
            fs.appendFileSync(filePath, linesToAppend.join('\n') + '\n');
          }
        }
      }
      
      return this.success({
        success
      });
    } catch {
      return this.fail('nx', 'Error checking the nx-suite-docker folder');
    }
  }
}