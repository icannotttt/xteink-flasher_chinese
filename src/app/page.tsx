'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Heading,
  Em,
  Separator,
  Card,
  Alert,
  Stack,
  Flex,
  HStack,
} from '@chakra-ui/react';
import FileUpload, { FileUploadHandle } from '@/components/FileUpload';
import Steps from '@/components/Steps';
import { useEspOperations } from '@/esp/useEspOperations';
import {
  getOfficialFirmwareVersions,
  getCommunityFirmwareRemoteData,
} from '@/remote/firmwareFetcher';

export default function Home() {
  const { actions, stepData, isRunning, deviceModel, setDeviceModel } =
    useEspOperations();
  const [officialFirmwareVersions, setOfficialFirmwareVersions] = useState<{
    en: string;
    ch: string;
  } | null>(null);
  const [communityFirmwareVersions, setCommunityFirmwareVersions] = useState<{
    crossPoint: { version: string; releaseDate: string };
  } | null>(null);
  const fullFlashFileInput = useRef<FileUploadHandle>(null);
  const appPartitionFileInput = useRef<FileUploadHandle>(null);

  useEffect(() => {
    let cancelled = false;
    setOfficialFirmwareVersions(null);
    getOfficialFirmwareVersions(deviceModel).then((versions) => {
      if (!cancelled) {
        setOfficialFirmwareVersions(versions);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [deviceModel]);

  useEffect(() => {
    getCommunityFirmwareRemoteData().then(setCommunityFirmwareVersions);
  }, []);

  return (
    <Flex direction="column" gap="20px">
      <Stack gap={3} as="section">
        <Heading size="xl">选择设备型号</Heading>
        <HStack gap={3}>
          {(['x4', 'x3'] as const).map((model) => (
            <Button
              key={model}
              variant={deviceModel === model ? 'solid' : 'outline'}
              aria-pressed={deviceModel === model}
              onClick={() => setDeviceModel(model)}
              disabled={isRunning}
            >
              Xteink {model.toUpperCase()}
            </Button>
          ))}
        </HStack>
      </Stack>
      <Separator />
      <Alert.Root status="warning">
        <Alert.Indicator />
        <Alert.Content>
          <img src="/logo.jpg" alt="logo" style={{ maxWidth: '10%', marginBottom: 8 }} />
          <Alert.Description>
            <Stack>
              <p>
                <a href="https://epdfontweb.streamlit.app/" target="_blank" style={{ color: '#ff8c00', fontWeight: 'bold' }}>字体网站快速入口</a>
              </p>
              <p>
                免责声明：已尽量避免误操作导致不可恢复的问题，但风险永远不为零。请务必小心操作，并在刷写前通过 <b>保存完整闪存</b> 进行备份。
              </p>
              <p>
                版权声明：本固件完全免费，如是从别的地方倒卖的，请找商家追责。
              </p>
              <p>
                网站版权声明：本刷机网站来自crosspoint作者Dave的开源项目，仅为中国用户方便使用，本人仅做少量修改
              </p>
              <p>
                另：根据阅星曈官方消息，<b>刷机不保修</b>，请谨慎考虑是否刷机。
              </p>
            </Stack>
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      <Stack gap={3} as="section">
        <div>
          <Heading size="xl">1.全闪存操作框/全閃存操作框</Heading>
          <Stack gap={1} color="grey" textStyle="sm">
            <p>
              这些操作可以让你完整备份 Xteink 设备，以便在出现问题时恢复。
            </p>
            <p>
              <b>保存完整闪存</b> 会读取设备闪存并保存为 <Em>flash.bin</Em>，大约需要 25 分钟。你可以用该文件（或他人的备份）通过 <b>从文件写入全闪存</b> 恢复设备。
            </p>
            <p>
              這些操作可以讓你完整備份 Xteink 設備，以便在出現問題時恢復。
            </p>
            <p>
              <b>保存完整閃存</b> 會讀取設備閃存並保存為 <Em>flash.bin</Em>，大約需要 25 分鐘。你可以用該文件（或他人的備份）通過 <b>從文件寫入全閃存</b> 恢復設備。
            </p>
          </Stack>
        </div>
        <Stack as="section">
          <Button
            colorScheme="blue"
            // variant="subtle"
            onClick={actions.saveFullFlash}
            disabled={isRunning}
          >
            1 保存完整闪存／保存完整閃存
          </Button>
          <Stack direction="row">
            <Flex grow={1}>
              <FileUpload ref={fullFlashFileInput} />
            </Flex>
            <Button
              variant="subtle"
              flexGrow={1}
              onClick={() =>
                actions.writeFullFlash(() =>
                  fullFlashFileInput.current?.getFile(),
                )
              }
              disabled={isRunning}
            >
              从文件写入全闪存／從文件寫入全閃存
            </Button>

          </Stack>
           <Stack gap={1} color="grey" textStyle="sm">
            <p>
              由于每个开发者定义的分区表不同，所以如果是<b>从非官方系统</b>那里来的伙伴
            </p>
            <p>
              可能需要多一个步骤：点击刷入快速匹配按钮
            </p>
          </Stack>         
          <Button
            colorScheme="orange"
            onClick={actions.flashBootFilesFromPublic}
            disabled={isRunning}
          >
            1.5 快速匹配分区表，主要用于不同固件快速切换
          </Button>

        </Stack>
      </Stack>
      <Separator />
      <Stack gap={3} as="section">
        <div>
          <Heading size="xl">OTA fast flash controls</Heading>
          <Stack gap={1} color="grey" textStyle="sm">
            <p>
              使用本功能前，强烈建议先通过上方 <b>保存完整备份</b> 进行备份。
              <br />
              使用 <b>快速刷写英文/中文固件</b> 会自动下载固件，覆盖备份分区并切换至新固件（原固件会作为新备份保留）。
              该方式比完整刷写快很多，且会保留所有设置。如遇异常可重复操作。
            </p>
            <p>
              使用本功能前，強烈建議先通過上方 <b>保存完整備份</b> 進行備份。<br />
              使用 <b>快速刷寫英文/中文固件</b> 會自動下載固件，覆蓋備份分區並切換至新固件（原固件會作為新備份保留）。<br />
              該方式比完整刷寫快很多，且會保留所有設置。如遇異常可重複操作。
            </p>
            <p>
                <a href="https://epdfontweb.streamlit.app/" target="_blank" style={{ color: '#000000', fontWeight: 'bold' }}>字体网站快速入口</a>
           </p>
            {/* <p>
              可能涉嫌法律风险，暂时关闭刷回官方固件入口<br />
              如想刷回官方，可以点击<br />
              <a href="https://xteink.dve.al//" target="_blank" style={{ color: '#000000', fontWeight: 'bold' }}>刷回官方中文固件</a>
              选择OTA fast flash controls框下面的Flash Chinese firmware
                
           </p> */}
          </Stack>
        </div>
        <Stack as="section">
          {/* <Button
            variant="subtle"
            onClick={actions.flashEnglishFirmware}
            disabled={isRunning || !officialFirmwareVersions}
            loading={!officialFirmwareVersions}
          >
            Flash English firmware for {deviceModel.toUpperCase()} (
            {officialFirmwareVersions?.en ?? '...'})
          </Button>*/}
          <Button
            variant="subtle"
            onClick={actions.flashChineseFirmware}
            disabled={isRunning || !officialFirmwareVersions}
            loading={!officialFirmwareVersions}
          >
            {deviceModel.toUpperCase()} 设备刷回官方 (
            {officialFirmwareVersions?.ch ?? '...'})
          </Button> 
          <Button
            // variant="subtle"
            onClick={actions.flashCrossPointFirmware}
            disabled={isRunning || !communityFirmwareVersions}
            loading={!communityFirmwareVersions}
          >
            2. 刷入 allocate中文 CrossPoint 固件 (
            {communityFirmwareVersions?.crossPoint.version}) -{' '}
            {communityFirmwareVersions?.crossPoint.releaseDate}
          </Button>
          <Stack direction="row">
            <Flex grow={1}>
              <FileUpload ref={appPartitionFileInput} />
            </Flex>
            <Button
              variant="subtle"
              flexGrow={1}
              onClick={() =>
                actions.flashCustomFirmware(() =>
                  appPartitionFileInput.current?.getFile(),
                )
              }
              disabled={isRunning}
            >
               {deviceModel.toUpperCase()}刷入自定义固件
            </Button>
          </Stack>
          <Button
            // variant="subtle"
            w="100%" 
            onClick={async () => {
              const flashFileName = deviceModel === 'x3' ? '/flash_all.bin' : '/flash.bin';
              const res = await fetch(flashFileName);
              const blob = await res.blob();
              const file = new File([blob], flashFileName.slice(1));
              actions.writeFullFlash(() => file);
            }}
            disabled={isRunning}
          >
            {deviceModel === 'x3'
              ? 'x3全闪存'
              : '双语全闪存（觉得英文优化得不好的可以刷一下这个）'}
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="subtle"
              onClick={actions.fakeWriteFullFlash}
              disabled={isRunning}
            >
              模拟写入全闪存
            </Button>
          )}
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
                进度显示/進度顯示
              </Alert.Title>
            </Alert.Root>
          )}
        </Card.Body>
      </Card.Root>
      {/* <Alert.Root status="info">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Change device language</Alert.Title>
          <Alert.Description>
            Before starting the process, it is recommended to change the device
            language to English. To do this, select &ldquo;Settings&rdquo; icon,
            then click &ldquo;OK / Confirm&rdquo; button and &ldquo;OK /
            Confirm&rdquo; again until English is shown. Otherwise, the language
            will still be Chinese after flashing and you may not notice changes.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root> */}
      <Alert.Root status="info">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>完成后重启一下</Alert.Title>
          <Alert.Description>
            <Stack>
              <p>
            写入操作完成后，请按如下方式重启设备：
            <br />
            1. 按下并松开右下角的小“重置”按钮；<br />
            2. 迅速按住主电源键约3秒钟，直到设备启动。
              </p>
              {deviceModel === 'x3' && (
                <p>
                  对于crosspoint，断联后重新连接
                </p>
              )}
            </Stack>
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    </Flex>
  );
}
