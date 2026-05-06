// OM SDK - OpenMetadata Manager SDK
// Export all modules

export * from './auth';
export * from './identity';
export * from './chat';
export * from './providers';
export * from './lifecycle';
export * from './fga';
export * from './opa';
export * from './catalog';
export * from './lineage';
export * from './governance';
export * from './ingestion';
export * from './storage';
export * from './query';
export * from './protocols';
export * from './workflow';
export * from './logs';
export { default as UI } from './ui';

export const version = '1.0.0';
export const name = '@om-agent/sdk';