import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { environment } from '../../environments/environment';

export const DebugGuard: CanMatchFn = () => {
  return environment.DEBUG_TOOL_ENABLED;
};
