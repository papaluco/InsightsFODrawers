/**
 * Seed Supabase with mock telemetry data from mockTelemetryData.ts.
 *
 * Usage:
 *   npx tsx scripts/seed-telemetry.ts
 *
 * Requires in .env:
 *   SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-key
 */

// Shim import.meta.env so Vite-specific references in imported modules don't crash
Object.defineProperty(globalThis, 'import', {
  value: { meta: { env: {} } },
  configurable: true,
  writable: true,
});

import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { mockErrorEvents, mockPerformanceEvents } from '../src/data/mockTelemetryData';

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// ── Row mappers ───────────────────────────────────────────────────────────────

function toErrorRow(e: any) {
  return {
    event_id: e.eventId, event_name: e.eventName, timestamp: e.timestamp,
    session_id: e.sessionId, module: e.module, source: e.source,
    correlation_id: e.correlationId ?? null, workflow_id: e.workflowId ?? null,
    parent_event_id: e.parentEventId ?? null, district_id: e.districtId ?? null,
    site_id: e.siteId ?? null, user_id: e.userId ?? null,
    route: e.route ?? null, page: e.page ?? null,
    component: e.component ?? null, action: e.action ?? null,
    error_category: e.errorCategory, severity: e.severity, message: e.message,
    status_code: e.statusCode ?? null, is_user_blocking: e.isUserBlocking ?? false,
    sanitized_stack_trace: e.sanitizedStackTrace ?? null,
    properties: e.properties ?? null,
  };
}

function toPerfRow(e: any) {
  return {
    event_id: e.eventId, event_name: e.eventName, timestamp: e.timestamp,
    session_id: e.sessionId, module: e.module, source: e.source,
    correlation_id: e.correlationId ?? null, workflow_id: e.workflowId ?? null,
    parent_event_id: e.parentEventId ?? null, district_id: e.districtId ?? null,
    site_id: e.siteId ?? null, user_id: e.userId ?? null,
    route: e.route ?? null, page: e.page ?? null,
    component: e.component ?? null, action: e.action ?? null,
    performance_category: e.performanceCategory, duration_ms: e.durationMs,
    threshold_ms: e.thresholdMs ?? null, is_slow: e.isSlow ?? false,
    success: e.success ?? true, properties: e.properties ?? null,
  };
}

async function batchUpsert(table: string, rows: object[], batchSize = 200) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).upsert(batch, { onConflict: 'event_id' });
    if (error) {
      console.error(`  [${table}] batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
    } else {
      inserted += batch.length;
    }
  }
  return inserted;
}

// ── Seed ──────────────────────────────────────────────────────────────────────

console.log(`Seeding ${mockErrorEvents.length} error events…`);
const errCount = await batchUpsert('telemetry_error_events', mockErrorEvents.map(toErrorRow));
console.log(`  ✓ ${errCount} inserted`);

console.log(`Seeding ${mockPerformanceEvents.length} performance events…`);
const perfCount = await batchUpsert('telemetry_performance_events', mockPerformanceEvents.map(toPerfRow));
console.log(`  ✓ ${perfCount} inserted`);

console.log('\nDone. Run the backfill SQL in Supabase SQL Editor to populate session_summaries:');
console.log('  CALL backfill_session_summaries();');
