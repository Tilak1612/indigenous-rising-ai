import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * The Strategic Partnerships Initiative record pointed at an ISC page that has
 * returned 404 since 2026-08-26. The repair points it at ISC's current page and
 * stops implying an application route the programme does not have.
 */
const sql = readFileSync('supabase/migrations/20261103000002_spi_source_link_repair.sql', 'utf8');

describe('SPI link repair', () => {
  test('points every link at the current ISC page', () => {
    const body = sql.slice(sql.indexOf('update'));
    expect(body.match(/1330016561558\/1594122175203/g)?.length).toBe(3);
  });

  test('says recipients cannot apply directly, and routes to the Secretariat', () => {
    expect(sql).toMatch(/cannot apply directly/);
    expect(sql).toMatch(/apply_link_type = 'contact'/);
    expect(sql).toMatch(/IPS-SPI@sac-isc\.gc\.ca/);
  });

  test('only touches the dead record and leaves sign-off to a person', () => {
    expect(sql).toMatch(/where slug = 'strategic-partnerships-initiative'\s+and source_url = 'https:\/\/www\.sac-isc\.gc\.ca\/eng\/1331657507074\/1533645155560'/);
    expect(sql).not.toMatch(/verification_status\s*=/);
  });
});
