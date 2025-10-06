// Delegate to generated OpenAPI client to keep a single source of truth for API types
export type Health = API.Health;
export type Summary = API.Summary;

export { getHealth, getSummary } from './api-client/client';
