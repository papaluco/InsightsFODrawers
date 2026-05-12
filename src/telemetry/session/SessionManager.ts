import type { SessionMetadata } from '../types';
import { generateSessionId } from '../core/telemetryUtils';

const SESSION_ID_KEY      = 'telemetry_session_id';
const SESSION_STARTED_KEY = 'telemetry_session_started_at';

function readStorage(key: string): string | null {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

function writeStorage(key: string, value: string): void {
  try { sessionStorage.setItem(key, value); } catch { /* SSR / private mode */ }
}

class SessionManagerClass {
  private _sessionId: string;
  private _startedAt: string;
  private _lastActivityAt: string;
  private _pageCount = 0;

  constructor() {
    const stored      = readStorage(SESSION_ID_KEY);
    const storedStart = readStorage(SESSION_STARTED_KEY);

    if (stored) {
      this._sessionId  = stored;
      this._startedAt  = storedStart ?? new Date().toISOString();
    } else {
      this._startedAt  = new Date().toISOString();
      this._sessionId  = this._persist(generateSessionId());
    }
    this._lastActivityAt = new Date().toISOString();
  }

  private _persist(id: string): string {
    writeStorage(SESSION_ID_KEY,      id);
    writeStorage(SESSION_STARTED_KEY, this._startedAt);
    return id;
  }

  getSessionId(): string {
    this._lastActivityAt = new Date().toISOString();
    return this._sessionId;
  }

  startNewSession(): string {
    this._startedAt      = new Date().toISOString();
    this._lastActivityAt = this._startedAt;
    this._pageCount      = 0;
    this._sessionId      = this._persist(generateSessionId());
    return this._sessionId;
  }

  resetSession(): string {
    return this.startNewSession();
  }

  incrementPageCount(): void { this._pageCount++; }

  getSessionMetadata(): SessionMetadata {
    return {
      sessionId:      this._sessionId,
      startedAt:      this._startedAt,
      lastActivityAt: this._lastActivityAt,
      pageCount:      this._pageCount,
    };
  }
}

export const SessionManager = new SessionManagerClass();
