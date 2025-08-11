import Docker from 'dockerode';
import { Handler } from '../../core/handler.js';
import fs from 'node:fs';
import fg from 'fast-glob';
import path from 'node:path';
import type { HandlerResponse } from '../../types/handlerResponse.js';
import type { DockerContainer, Port } from '../../types/dockerContainer.js';

type Input = { path: string };
type Output = { containers: DockerContainer[] };

export default class ListDockerContainers extends Handler<Input, Output> {
  async execute({ path } : Input): Promise<HandlerResponse<Output>> {
    try {
      const docker = new Docker();
      const normalizedPath = path.replace(/\\/g, '/');
      const allContainers = await this.#findDockerFiles(normalizedPath);
      const startedContainers = await docker.listContainers({ all: true });

      this.#mergeStartedContainers(allContainers, startedContainers);

      const containers = Array.from(allContainers.values()).sort(this.#sortByRunningState);
      return this.success({ containers });
    } catch (err) {
      return this.fail('docker', 'Error listing Docker containers');
    }
  }

  #mergeStartedContainers(
    allContainers: Map<string, DockerContainer>,
    startedContainers: any[]
  ) {
    for (const container of startedContainers) {
      const containerName = container.Names[0].split('/')[1];
      if (!allContainers.has(containerName)) continue;

      const existing = allContainers.get(containerName);
      if (existing && container.State !== 'exited') {
        allContainers.set(containerName, {
          ...existing,
          Id: container.Id,
          Names: [containerName],
          Image: container.Image,
          ImageID: container.ImageID ?? '',
          Command: container.Command ?? '',
          Created: container.Created ?? 0,
          State: container.State ?? '',
          Status: container.Status ?? '',
          HostConfig: { NetworkMode: container.HostConfig?.NetworkMode ?? '' },
          Mounts: container.Mounts ?? [],
        });
      }
    }
  }

  #sortByRunningState(a: DockerContainer, b: DockerContainer): number {
    if (a.State === 'running' && b.State !== 'running') return -1;
    if (b.State === 'running' && a.State !== 'running') return 1;
    return 0;
  }

  async #findDockerFiles(directory: string): Promise<Map<string, DockerContainer>> {
    const containers = new Map<string, DockerContainer>();

    if (!directory || !fs.existsSync(directory)) {
      console.error(`Directory ${directory} does not exist.`);
      return containers;
    }

    const suiteFolders = await fg(['api/*', 'service/*'], {
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      cwd: directory,
      onlyDirectories: true,
    });

    const dockerFolders = await fg(['*'], {
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      cwd: path.resolve(directory, '../../lib/dockers'),
      onlyDirectories: true,
    });

    for (const folder of [...suiteFolders, ...dockerFolders]) {
      const { folderName, subfolder } = this.#parseFolderName(folder);
      const envPath = path.join(directory, folder, '.env-local');
      const ports = this.#extractPorts(envPath);

      containers.set(`nx-suite-${subfolder}`, {
        Id: `nx-suite-${subfolder}`,
        Names: [`nx-suite-${subfolder}`],
        Image: `nx:${subfolder}`,
        ImageID: '',
        Command: '',
        Created: 0,
        Ports: ports,
        Labels: { type: folderName },
        State: 'unbuilt',
        Status: '',
        HostConfig: { NetworkMode: 'nxsuiteContainerNetwork' },
        NetworkSettings: { Networks: {} },
        Mounts: [],
      });
    }

    return containers;
  }

  #parseFolderName(folder: string) {
    let [folderName, subfolder] = folder.split('/');
    if (!subfolder) {
      folderName = 'core';
      subfolder = folder.split('-')[1];
      if (subfolder === 'postgresql') subfolder = 'postgres';
      else if (subfolder === 'redis') subfolder = 'nx-redis';
    }
    return { folderName, subfolder };
  }

  #extractPorts(envPath: string): Port[] {
    if (!fs.existsSync(envPath)) return [];
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/^PORT\s*=\s*(.*)$/m);
    if (!match) return [];
    const foundPort = parseInt(match[1]?.trim() as string);
    return [
      {
        PrivatePort: 3000,
        PublicPort: foundPort,
        Type: 'tcp',
      },
    ];
  }
}