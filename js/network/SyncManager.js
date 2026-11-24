/**
 * SyncManager: Handles real-time public river synchronization.
 *
 * Transmits public krathong metadata (type, lane, speed) across clients
 * via BroadcastChannel / WebSockets / Cloud DB.
 *
 * PRIVACY GUARANTEE: Never transmits or records personal wish messages.
 */
export class SyncManager {
  constructor(onRemoteKrathongReceived) {
    this.onRemoteKrathongReceived = onRemoteKrathongReceived;
    this.channel = null;

    try {
      // Local real-time channel across browser tabs & windows
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.channel = new BroadcastChannel('loy_krathong_public_river');
        this.channel.onmessage = (event) => {
          if (event.data && event.data.type) {
            this.handleIncomingKrathong(event.data);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }
  }

  broadcastKrathong(krathongType) {
    const payload = {
      id: 'k_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: krathongType, // 'small' | 'medium'
      laneX: (Math.random() - 0.5) * 55,
      timestamp: Date.now()
    };

    if (this.channel) {
      this.channel.postMessage(payload);
    }
  }

  handleIncomingKrathong(data) {
    if (this.onRemoteKrathongReceived) {
      this.onRemoteKrathongReceived(data.type, data.laneX);
    }
  }
}
