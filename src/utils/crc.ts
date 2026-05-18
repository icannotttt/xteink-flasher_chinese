import crc32 from 'crc/crc32';
import { u32ToLeBytes } from './bytes';

export function generateCrc32Le(sequence: number) {
  const value = crc32(u32ToLeBytes(sequence).buffer, 0xffffffff);
  return u32ToLeBytes(value);
}
