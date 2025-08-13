import { useEffect } from 'react';
import { subscribeUserToPush } from '../services/push';

export function usePushNotifications() {
  useEffect(() => {
    async function subscribe() {
      try {
        // Solicita permissão ao usuário
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;
        // Busca a chave pública VAPID do backend
        const res = await fetch('/api/push/vapid-public-key');
        const data = await res.json();
        if (data.publicKey) {
          await subscribeUserToPush(data.publicKey);
        }
      } catch (err) {
        // Silencia erro se usuário negar permissão
      }
    }
    subscribe();
  }, []);
}
