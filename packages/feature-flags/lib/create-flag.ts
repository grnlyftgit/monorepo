import { flag } from 'flags/next';

export const createFlag = (key: string) =>
  flag({
    key,
    defaultValue: false,
    async decide() {
      // const { userId } = await auth();

      // if (!userId) {
      //   return this.defaultValue as boolean;
      // }

      // const isEnabled = await analytics.isFeatureEnabled(key, userId);

      return this.defaultValue as boolean;
    },
  });
