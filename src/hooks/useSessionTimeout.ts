import { useEffect, useRef } from 'react';
import { useIonToast } from '@ionic/react';
import { useAppDispatch } from './useAppDispatch';
import { logoutUser } from '../store/slices/authSlice';

export const SESSION_IDLE_TIMEOUT_MS = 5 * 60 * 1000;

const IDLE_CHECK_INTERVAL_MS = 30 * 1000;

const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'wheel',
  'click',
] as const;

export const useSessionTimeout = (): void => {
  const dispatch = useAppDispatch();
  const [present] = useIonToast();
  const lastActivityRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const closedRef = useRef<boolean>(false);

  useEffect(() => {
    lastActivityRef.current = Date.now();

    const onActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const closeSession = () => {
      if (closedRef.current) return;
      closedRef.current = true;
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      void present({
        message: 'Tu sesión se cerró por inactividad',
        duration: 4000,
        position: 'bottom',
        color: 'warning',
      });
      void dispatch(logoutUser());
    };

    const checkIdle = () => {
      if (Date.now() - lastActivityRef.current >= SESSION_IDLE_TIMEOUT_MS) {
        closeSession();
      }
    };

    const onVisible = () => {
      // El navegador congela/throttlea los timers en pestañas en segundo plano,
      // así que al volver a la pestaña se reevalúa la inactividad al instante.
      if (document.visibilityState === 'visible') {
        checkIdle();
      }
    };

    window.addEventListener('mousemove', onActivity, { passive: true });
    window.addEventListener('mousedown', onActivity, { passive: true });
    window.addEventListener('keydown', onActivity, { passive: true });
    window.addEventListener('touchstart', onActivity, { passive: true });
    window.addEventListener('scroll', onActivity, { passive: true });
    window.addEventListener('wheel', onActivity, { passive: true });
    window.addEventListener('click', onActivity, { passive: true });
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);

    intervalRef.current = window.setInterval(checkIdle, IDLE_CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, onActivity);
      });
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dispatch, present]);
};