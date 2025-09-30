import { keys as flags } from '@repo/feature-flags/keys';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  extends: [flags()],
  server: {},
  client: {},
  runtimeEnv: {},
});
