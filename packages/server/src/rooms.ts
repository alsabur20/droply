import type { WebSocket } from 'ws';
import { normalizeCode, Role } from '@droply/protocol';

export interface PeerSession {
  ws: WebSocket;
  role: Role;
  joinedAt: number;
}

export interface Room {
  code: string;
  sender?: PeerSession;
  receiver?: PeerSession;
  createdAt: number;
  lastActivity: number;
  timeoutHandle?: NodeJS.Timeout;
}

const ROOM_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export class RoomManager {
  private rooms = new Map<string, Room>();

  get activeRoomCount(): number {
    return this.rooms.size;
  }

  getOrCreateRoom(code: string): Room {
    const normalized = normalizeCode(code);
    let room = this.rooms.get(normalized);
    if (!room) {
      room = {
        code: normalized,
        createdAt: Date.now(),
        lastActivity: Date.now()
      };
      this.resetTimeout(room);
      this.rooms.set(normalized, room);
    }
    return room;
  }

  join(code: string, role: Role, ws: WebSocket): { room: Room; peer?: PeerSession; error?: string } {
    const room = this.getOrCreateRoom(code);
    room.lastActivity = Date.now();
    this.resetTimeout(room);

    const session: PeerSession = { ws, role, joinedAt: Date.now() };

    if (role === 'sender') {
      if (room.sender && room.sender.ws.readyState === 1 /* OPEN */) {
        return { room, error: 'A sender is already present in this room' };
      }
      room.sender = session;
      return { room, peer: room.receiver };
    } else {
      if (room.receiver && room.receiver.ws.readyState === 1 /* OPEN */) {
        return { room, error: 'A receiver is already present in this room' };
      }
      room.receiver = session;
      return { room, peer: room.sender };
    }
  }

  getPeer(ws: WebSocket): { room?: Room; peer?: PeerSession } {
    for (const room of this.rooms.values()) {
      if (room.sender?.ws === ws) {
        return { room, peer: room.receiver };
      }
      if (room.receiver?.ws === ws) {
        return { room, peer: room.sender };
      }
    }
    return {};
  }

  leave(ws: WebSocket): { room?: Room; remainingPeer?: PeerSession } {
    for (const [code, room] of this.rooms.entries()) {
      if (room.sender?.ws === ws) {
        room.sender = undefined;
        if (!room.receiver) {
          this.destroyRoom(code);
        }
        return { room, remainingPeer: room.receiver };
      }
      if (room.receiver?.ws === ws) {
        room.receiver = undefined;
        if (!room.sender) {
          this.destroyRoom(code);
        }
        return { room, remainingPeer: room.sender };
      }
    }
    return {};
  }

  destroyRoom(code: string) {
    const normalized = normalizeCode(code);
    const room = this.rooms.get(normalized);
    if (room) {
      if (room.timeoutHandle) clearTimeout(room.timeoutHandle);
      this.rooms.delete(normalized);
    }
  }

  private resetTimeout(room: Room) {
    if (room.timeoutHandle) clearTimeout(room.timeoutHandle);
    room.timeoutHandle = setTimeout(() => {
      this.destroyRoom(room.code);
    }, ROOM_TIMEOUT_MS);
  }
}
