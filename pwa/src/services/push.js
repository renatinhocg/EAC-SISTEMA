// Função para pedir permissão e registrar push notification
// Função para pedir permissão e registrar push notification, integrando com backend
export async function subscribeUserToPush(usuario_id, equipe_id) {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      // Busca VAPID public key do backend
      const res = await fetch('/api/push/vapid-public-key');
      const { publicKey } = await res.json();
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }
    // Sempre envia subscription para o backend, mesmo que já exista localmente
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription, usuario_id, equipe_id })
    });
    return subscription;
  } else {
    throw new Error('Push notification não suportada');
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
