import { useCallback } from 'react';
import { toast } from 'sonner';

export const TOAST_TYPES = {
  DEFAULT: 'DEFAULT',
  INFO: 'INFO',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
} as const;

export type ToastType = keyof typeof TOAST_TYPES;

export function useToaster() {
  const showToast = useCallback(
    ({
      id,
      message,
      type = TOAST_TYPES.SUCCESS,
      duration = 3000,
    }: {
      id?: string | number;
      message: string;
      type?: ToastType;
      duration?: number;
    }) => {
      const toastId = id ?? Math.random().toString(36).slice(2, 11);

      switch (type) {
        case TOAST_TYPES.DEFAULT:
          toast(message, { id: toastId, duration });
          break;
        case TOAST_TYPES.INFO:
          toast.info(message, { id: toastId, duration });
          break;
        case TOAST_TYPES.LOADING:
          toast.loading(message, { id: toastId, duration });
          break;
        case TOAST_TYPES.SUCCESS:
          toast.success(message, { id: toastId, duration });
          break;
        case TOAST_TYPES.ERROR:
          toast.error(message, { id: toastId, duration });
          break;
        default:
          toast(message, { id: toastId, duration });
      }

      return toastId;
    },
    []
  );

  const dismissToast = useCallback((id: string | number) => {
    toast.dismiss(id);
  }, []);

  return { showToast, dismissToast, TOAST_TYPES };
}
