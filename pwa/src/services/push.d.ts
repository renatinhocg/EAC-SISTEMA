export interface PushSubscriptionResult {
	endpoint: string;
	expirationTime: number | null;
	keys: {
		p256dh: string;
		auth: string;
	};
}
export declare function subscribeUserToPush(usuario_id: number, equipe_id?: number | null): Promise<PushSubscriptionResult>;
