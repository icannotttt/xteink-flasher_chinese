'use client';

import React, { ReactNode, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CloseButton,
  Dialog,
  Em,
  Flex,
  Heading,
  Mark,
  Portal,
  Separator,
  Stack,
  Table,
  Text,
  SimpleGrid,
} from '@chakra-ui/react';
import { useEspOperations } from '@/esp/useEspOperations';
import Steps from '@/components/Steps';
import { OtaPartitionState } from '@/esp/OtaPartitionState';
import OtaPartition, { OtaPartitionDetails } from '@/esp/OtaPartition';
import HexSpan from '@/components/HexSpan';
import HexViewer from '@/components/HexViewer';
import { downloadData } from '@/utils/download';
import { FirmwareInfo } from '@/utils/firmwareIdentifier';

function OtadataDebug({ otaPartition }: { otaPartition: OtaPartition }) {
  const bootPartitionLabel = otaPartition.getCurrentBootPartitionLabel();

  return (
    <Stack>
      <Heading size="lg">OTA data</Heading>
      <Stack direction="row">
        {otaPartition.otaAppPartitions().map((partition) => (
          <Card.Root
            variant="subtle"
            size="sm"
            key={partition.partitionLabel}
            colorPalette="red"
          >
            <Card.Header>
              <Heading size="md">Partition {partition.partitionLabel}</Heading>
            </Card.Header>
            <Card.Body>
              <Table.Root size="sm">
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>Boot Partition:</Table.Cell>
                    <Table.Cell>
                      <Mark
                        colorPalette={
                          partition.partitionLabel === bootPartitionLabel
                            ? 'green'
                            : 'red'
                        }
                        variant="solid"
                        paddingLeft={1}
                        paddingRight={1}
                      >
                        {partition.partitionLabel === bootPartitionLabel
                          ? 'Yes'
                          : 'No'}
                      </Mark>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>OTA Sequence:</Table.Cell>
                    <Table.Cell>{partition.sequence}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>OTA State:</Table.Cell>
                    <Table.Cell>
                      <Mark
                        colorPalette={
                          [
                            OtaPartitionState.ABORTED,
                            OtaPartitionState.INVALID,
                          ].includes(partition.state)
                            ? 'red'
                            : 'green'
                        }
                        variant="solid"
                        paddingLeft={1}
                        paddingRight={1}
                      >
                        {partition.state}
                      </Mark>{' '}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>CRC32 Bytes:</Table.Cell>
                    <Table.Cell>
                      <HexSpan data={partition.crcBytes} />
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>CRC32 Valid:</Table.Cell>
                    <Table.Cell>
                      <Mark
                        colorPalette={partition.crcValid ? 'green' : 'red'}
                        variant="solid"
                        paddingLeft={1}
                        paddingRight={1}
                      >
                        {partition.crcValid ? 'Yes' : 'No'}
                      </Mark>
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Root>
            </Card.Body>
          </Card.Root>
        ))}
      </Stack>
      <Dialog.Root size="xl" modal>
        <Dialog.Trigger asChild>
          <Button variant="outline">View Raw Data</Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Raw Data</Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
              <Dialog.Body>
                <HexViewer data={otaPartition.data} />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
      <Button
        variant="outline"
        onClick={() =>
          downloadData(
            otaPartition.data,
            'otadata.bin',
            'application/octet-stream',
          )
        }
      >
        Download Raw Data
      </Button>
    </Stack>
  );
}

function AppDebug({
  appPartitionData,
  partitionLabel,
}: {
  appPartitionData: Uint8Array;
  partitionLabel: OtaPartitionDetails['partitionLabel'];
}) {
  return (
    <Stack>
      <Heading size="lg">App partition data ({partitionLabel})</Heading>
      <Dialog.Root size="xl" modal>
        <Dialog.Trigger asChild>
          <Button variant="outline">View Raw Data</Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Raw Data</Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
              <Dialog.Body>
                <HexViewer data={appPartitionData} />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
      <Button
        variant="outline"
        onClick={() =>
          downloadData(
            appPartitionData,
            `${partitionLabel}.bin`,
            'application/octet-stream',
          )
        }
      >
        Download Raw Data
      </Button>
    </Stack>
  );
}

function FirmwareIdentificationDebug({
  app0: app0Info,
  app1: app1Info,
  currentBoot,
}: {
  app0: FirmwareInfo;
  app1: FirmwareInfo;
  currentBoot: 'app0' | 'app1';
}) {
  const getColorPalette = (
    type: FirmwareInfo['type'],
  ): 'green' | 'orange' | 'blue' | 'gray' => {
    switch (type) {
      case 'official-english':
      case 'official-chinese':
        return 'green';
      case 'crosspoint':
        return 'blue';
      case 'unknown':
      default:
        return 'orange';
    }
  };

  return (
    <Stack>
      <Heading size="lg">Firmware Information</Heading>
      <SimpleGrid columns={{ sm: 1, md: 2 }} gap={4}>
        {[
          { label: 'app0', info: app0Info },
          { label: 'app1', info: app1Info },
        ].map(({ label, info }) => (
          <Card.Root
            variant="subtle"
            size="sm"
            key={label}
            colorPalette={getColorPalette(info.type)}
          >
            <Card.Header>
              <Flex alignItems="center" gap={2}>
                <Heading size="md">Partition {label}</Heading>
                {label === currentBoot && (
                  <Badge colorPalette="green" variant="solid" size="sm">
                    Active
                  </Badge>
                )}
              </Flex>
            </Card.Header>
            <Card.Body>
              <Stack gap={2}>
                <div>
                  <Text fontWeight="bold">Firmware:</Text>
                  <Text>{info.displayName}</Text>
                </div>
                <div>
                  <Text fontWeight="bold">Version:</Text>
                  <Text>{info.version}</Text>
                </div>
                <div>
                  <Text fontWeight="bold">Type:</Text>
                  <Text>{info.type}</Text>
                </div>
              </Stack>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

export default function Debug() {
  const { debugActions, stepData, isRunning } = useEspOperations();
  const [debugOutputNode, setDebugOutputNode] = useState<ReactNode>(null);

  return (
    <Flex direction="column" gap="20px">
      <Stack gap={3} as="section">
        <div>
          <Heading size="xl">调试工具</Heading>
          <Stack gap={1} color="grey" textStyle="sm">
            <p>
              这些是帮助调试和管理你的 Xtink 设备的一些工具，适合喜欢折腾设备的用户。
            </p>
            <p>
              <b>读取 otadata 分区</b>：读取 <Em>otadata</Em> 分区的原始数据，可检查或下载内容。
            </p>
            <p>
              <b>读取应用分区</b>：读取选定应用分区的原始数据，可检查或下载内容。
            </p>
            <p>
              <b>交换启动区</b>：检查当前启动分区（app0 或 app1），并重写 <Em>otadata</Em> 以切换启动分区。
            </p>
            <p>
              <b>识别两区固件</b>：读取 app0 和 app1 分区，自动识别各自安装的固件类型（官方英文、官方中文、CrossPoint 社区版或自定义）。
            </p>
            <p>
              這些是幫助調試和管理你的 Xtink 設備的一些工具，適合喜歡折騰設備的用戶。
            </p>
            <p>
              <b>讀取 otadata 分區</b>：讀取 <Em>otadata</Em> 分區的原始數據，可檢查或下載內容。
            </p>
            <p>
              <b>讀取應用分區</b>：讀取選定應用分區的原始數據，可檢查或下載內容。
            </p>
            <p>
              <b>交換啟動區</b>：檢查當前啟動分區（app0 或 app1），並重寫 <Em>otadata</Em> 以切換啟動分區。
            </p>
            <p>
              <b>識別兩區固件</b>：讀取 app0 和 app1 分區，自動識別各自安裝的固件類型（官方英文、官方中文、CrossPoint 社區版或自定義）。
            </p>
          </Stack>
        </div>
        <Stack as="section">
          <Button
            variant="subtle"
            onClick={() => {
              debugActions
                .readDebugOtadata()
                .then((data) =>
                  setDebugOutputNode(<OtadataDebug otaPartition={data} />),
                );
            }}
            disabled={isRunning}
          >
            Read otadata partition
          </Button>
          <Button
            variant="subtle"
            onClick={() => {
              debugActions
                .readAppPartition('app0')
                .then((data) =>
                  setDebugOutputNode(
                    <AppDebug appPartitionData={data} partitionLabel="app0" />,
                  ),
                );
            }}
            disabled={isRunning}
          >
            Read app0 partition
          </Button>
          <Button
            variant="subtle"
            onClick={() => {
              debugActions
                .readAppPartition('app1')
                .then((data) =>
                  setDebugOutputNode(
                    <AppDebug appPartitionData={data} partitionLabel="app1" />,
                  ),
                );
            }}
            disabled={isRunning}
          >
            Read app1 partition
          </Button>
          <Button
            variant="subtle"
            onClick={() => {
              debugActions
                .swapBootPartition()
                .then((data) =>
                  setDebugOutputNode(<OtadataDebug otaPartition={data} />),
                );
            }}
            disabled={isRunning}
          >
            Swap boot partitions (app0 / app1)
          </Button>
          <Button
            variant="subtle"
            onClick={() => {
              debugActions
                .readAndIdentifyAllFirmware()
                .then((data) =>
                  setDebugOutputNode(
                    <FirmwareIdentificationDebug
                      app0={data.app0}
                      app1={data.app1}
                      currentBoot={data.currentBoot}
                    />,
                  ),
                );
            }}
            disabled={isRunning}
          >
            Identify firmware in both partitions
          </Button>
        </Stack>
      </Stack>
      <Separator />
      <Card.Root variant="subtle">
        <Card.Header>
          <Heading size="lg">Steps</Heading>
        </Card.Header>
        <Card.Body>
          {stepData.length > 0 ? (
            <Steps steps={stepData} />
          ) : (
            <Alert.Root status="info" variant="surface">
              <Alert.Indicator />
              <Alert.Title>
                开始操作后将在此显示进度／開始操作後將在此顯示進度
              </Alert.Title>
            </Alert.Root>
          )}
        </Card.Body>
      </Card.Root>
      {!isRunning && !!debugOutputNode ? (
        <>
          <Separator />
          {debugOutputNode}
        </>
      ) : null}
    </Flex>
  );
}
