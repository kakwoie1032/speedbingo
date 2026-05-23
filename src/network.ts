/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Peer, DataConnection } from 'peerjs';
import { PeerMessage } from './types';

export class NetworkManager {
  peer: Peer | null = null;
  connections: Map<string, DataConnection> = new Map();
  isHost: boolean = false;
  onMessageReceived: ((msg: PeerMessage) => void) | null = null;
  onConnectionOpened: ((connectionId: string) => void) | null = null;
  onConnectionClosed: ((connectionId: string) => void) | null = null;
  onError: ((error: string) => void) | null = null;

  initialize(nickname: string, targetRoomId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // If targetRoomId is set, we are Client; we connect to targetRoomId.
        // If targetRoomId is not set, we are Host; we can generate a random Room ID.
        this.isHost = !targetRoomId;
        
        // Connect to PeerJS cloud server
        const newPeer = new Peer({
          debug: 1,
        });

        this.peer = newPeer;

        newPeer.on('open', (id) => {
          console.log(`Peer opened with ID: ${id}`);
          if (this.isHost) {
            this.setupHostListeners();
            resolve(id);
          } else {
            this.setupClientListeners(targetRoomId!);
            resolve(id);
          }
        });

        newPeer.on('error', (err) => {
          console.error('Peer error:', err);
          if (this.onError) {
            this.onError(err.message || 'Peer communication error');
          }
          reject(err);
        });

      } catch (e: any) {
        console.error('Failed to initialize Peer:', e);
        reject(e);
      }
    });
  }

  setupHostListeners() {
    if (!this.peer) return;

    this.peer.on('connection', (conn) => {
      console.log(`Host received connection from client: ${conn.peer}`);
      
      this.connections.set(conn.peer, conn);

      conn.on('open', () => {
        if (this.onConnectionOpened) {
          this.onConnectionOpened(conn.peer);
        }
      });

      conn.on('data', (data: any) => {
        if (this.onMessageReceived) {
          try {
            const message = data as PeerMessage;
            this.onMessageReceived(message);
          } catch (e) {
            console.error('Error handling client data payload:', e);
          }
        }
      });

      conn.on('close', () => {
        console.log(`Connection with client ${conn.peer} closed`);
        this.connections.delete(conn.peer);
        if (this.onConnectionClosed) {
          this.onConnectionClosed(conn.peer);
        }
      });

      conn.on('error', (err) => {
        console.error(`Connection error for peer ${conn.peer}:`, err);
        this.connections.delete(conn.peer);
        if (this.onConnectionClosed) {
          this.onConnectionClosed(conn.peer);
        }
      });
    });
  }

  setupClientListeners(hostRoomId: string) {
    if (!this.peer) return;

    console.log(`Connecting to Host Room: ${hostRoomId}`);
    const hostConn = this.peer.connect(hostRoomId, {
      reliable: true
    });

    this.connections.set(hostRoomId, hostConn);

    hostConn.on('open', () => {
      console.log(`Successfully connected to host: ${hostRoomId}`);
      if (this.onConnectionOpened) {
        this.onConnectionOpened(hostRoomId);
      }
    });

    hostConn.on('data', (data: any) => {
      if (this.onMessageReceived) {
        try {
          const message = data as PeerMessage;
          this.onMessageReceived(message);
        } catch (e) {
          console.error('Error parsing data from host:', e);
        }
      }
    });

    hostConn.on('close', () => {
      console.log('Host connection closed');
      this.connections.delete(hostRoomId);
      if (this.onConnectionClosed) {
        this.onConnectionClosed(hostRoomId);
      }
    });

    hostConn.on('error', (err) => {
      console.error('Host connection error:', err);
      this.connections.delete(hostRoomId);
      if (this.onConnectionClosed) {
        this.onConnectionClosed(hostRoomId);
      }
    });
  }

  sendMessage(targetId: string, message: PeerMessage) {
    const conn = this.connections.get(targetId);
    if (conn && conn.open) {
      conn.send(message);
    }
  }

  // Host sends to all connected clients
  broadcast(message: PeerMessage) {
    if (!this.isHost) {
      console.warn('Clients are not authorized to broadcast');
      return;
    }
    this.connections.forEach((conn, peerId) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }

  destroy() {
    this.connections.forEach((conn) => {
      conn.close();
    });
    this.connections.clear();
    
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}
