// Type shim to expose OpenAPI-generated types under a global API namespace
// so existing code can reference API.Health and API.Summary

import type { paths } from './api';

declare global {
  namespace API {
    type Health = paths['/api/health']['get']['responses'][200]['content']['application/json'];
    type Summary =
      paths['/api/reports/summary']['get']['responses'][200]['content']['application/json'];
  }
}

export {};
