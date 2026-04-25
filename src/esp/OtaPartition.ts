import { isEqualBytes, leBytesToU32, u32ToLeBytes } from '@/utils/bytes';
import { generateCrc32Le } from '@/utils/crc';
import {
  OtaPartitionState,
  otaPartitionStateFromBytes,
  otaPartitionStateToBytes,
} from './OtaPartitionState';

export interface OtaPartitionDetails {
  partitionLabel: 'app0' | 'app1';
  sequence: number;
  state: OtaPartitionState;
  crcBytes: Uint8Array;
  crcValid?: boolean;
}

export default class OtaPartition {
  private cachedOtaAppParitions:
    | [OtaPartitionDetails, OtaPartitionDetails]
    | null = null;

  constructor(public readonly data: Uint8Array) {}

  otaAppPartitions(): [OtaPartitionDetails, OtaPartitionDetails] {
    if (!this.cachedOtaAppParitions) {
      this.cachedOtaAppParitions = [
        this.parseOtaAppPartition('app0'),
        this.parseOtaAppPartition('app1'),
      ];
    }

    return this.cachedOtaAppParitions;
  }

  getCurrentBootPartition() {
    const partitions = this.otaAppPartitions();

    return partitions
      .filter(
        ({ state, crcValid }) =>
          !['invalid', 'aborted'].includes(state) && crcValid,
      )
      .sort((a, b) => b.sequence - a.sequence)[0];
  }

  getCurrentBootPartitionLabel() {
    return this.getCurrentBootPartition()?.partitionLabel ?? 'app0';
  }

  getCurrentBackupPartitionLabel() {
    return this.getCurrentBootPartitionLabel() === 'app0' ? 'app1' : 'app0';
  }

  setBootPartition(partitionLabel: OtaPartitionDetails['partitionLabel']) {
    const currentBootPartition = this.getCurrentBootPartition();

    if (currentBootPartition?.partitionLabel === partitionLabel) {
      return;
    }

    const nextSequence = (currentBootPartition?.sequence ?? 0) + 1;
    this.setOtaPartitionDetails({
      partitionLabel,
      sequence: nextSequence,
      state: OtaPartitionState.NEW,
      crcBytes: generateCrc32Le(nextSequence),
    });
  }

  private parseOtaAppPartition(
    partitionLabel: OtaPartitionDetails['partitionLabel'],
  ) {
    const offset = partitionLabel === 'app1' ? 0x1000 : 0;

    const sequenceBytes = this.data.slice(offset, offset + 4);
    const sequence = leBytesToU32(sequenceBytes);
    const stateBytes = this.data.slice(offset + 0x18, offset + 0x1c);
    const crcBytes = this.data.slice(offset + 0x1c, offset + 0x20);
    const expectedCrcBytes = generateCrc32Le(sequence);

    return {
      partitionLabel,
      sequence,
      state: otaPartitionStateFromBytes(stateBytes),
      crcBytes,
      crcValid: isEqualBytes(crcBytes, expectedCrcBytes),
    };
  }

  private setOtaPartitionDetails(partition: OtaPartitionDetails) {
    const offset = partition.partitionLabel === 'app1' ? 0x1000 : 0;

    this.cachedOtaAppParitions = null;
    this.data.set(u32ToLeBytes(partition.sequence), offset);
    this.data.set(otaPartitionStateToBytes(partition.state), offset + 0x18);
    this.data.set(generateCrc32Le(partition.sequence), offset + 0x1c);
  }
}
