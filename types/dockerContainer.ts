export interface Port {
  PrivatePort: number;
  Type: string;
  IP?: string;
  PublicPort?: number;
}

export interface NetworkDetails {
  IPAMConfig: null | unknown;
  Links: null | unknown;
  Aliases: null | unknown;
  MacAddress: string;
  DriverOpts: null | unknown;
  GwPriority: number;
  NetworkID: string;
  EndpointID: string;
  Gateway: string;
  IPAddress: string;
  IPPrefixLen: number;
  IPv6Gateway: string;
  GlobalIPv6Address: string;
  GlobalIPv6PrefixLen: number;
  DNSNames: null | unknown;
}

export interface Networks {
  [networkName: string]: NetworkDetails;
}

export interface NetworkSettings {
  Networks: Networks;
}

export interface HostConfig {
  NetworkMode: string;
}

export interface DockerContainer {
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Command: string;
  Created: number;
  Ports: Port[];
  Labels: Record<string, unknown>;
  State: string;
  Status: string;
  HostConfig: HostConfig;
  NetworkSettings: NetworkSettings;
  Mounts: unknown[];
}
