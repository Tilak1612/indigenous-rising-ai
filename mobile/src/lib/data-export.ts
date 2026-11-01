import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { exportMyData } from './account';

export type ExportOutcome = { kind: 'shared'; uri: string } | { kind: 'unavailable'; uri: string };

export function exportFileName(now: Date = new Date()): string {
  return `indigenous-rising-export-${now.toISOString().slice(0, 10)}.json`;
}

/**
 * Writes the user's export to the app cache and hands it to the system share
 * sheet. Nothing is uploaded by the app; where the file goes next is the
 * user's choice in the share sheet.
 */
export async function shareDataExport(userId: string, now: Date = new Date()): Promise<ExportOutcome> {
  const json = await exportMyData(userId);
  const file = new File(Paths.cache, exportFileName(now));
  file.write(json);
  if (!(await Sharing.isAvailableAsync())) return { kind: 'unavailable', uri: file.uri };
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export my data' });
  return { kind: 'shared', uri: file.uri };
}
