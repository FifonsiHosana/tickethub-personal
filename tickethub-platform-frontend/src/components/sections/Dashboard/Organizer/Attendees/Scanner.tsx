import { forwardRef, useImperativeHandle, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { logger } from "@/utils/logger";

const MIN_QRBOX_SIZE = 50;
const CONTAINER_ID = "qr-scanner-dialog";

export interface ScannerHandle {
  stop: () => Promise<void>;
}

interface ScannerProps {
  onDecode: (decodedText: string) => void;
  onError?: (message: string) => void;
}

const Scanner = forwardRef<ScannerHandle, ScannerProps>(function Scanner(
  { onDecode, onError },
  ref,
) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startPromiseRef = useRef<Promise<void> | null>(null);

  const qrboxFunction = (vw: number, vh: number) => {
    const size = Math.max(Math.floor(Math.min(vw, vh) * 0.8), MIN_QRBOX_SIZE);
    return { width: size, height: size };
  };

  const startScanning = (node: HTMLDivElement) => {
    const scanner = new Html5Qrcode(node.id);
    scannerRef.current = scanner;

    startPromiseRef.current = scanner
      .start(
        { facingMode: "environment" },
        { fps: 20, qrbox: qrboxFunction },
        onDecode,
        () => {},
      )
      .catch((err) => {
        logger.error(`Scanner failed to start: ${err}`);
        onError?.("Camera access denied or unavailable.");
      }) as Promise<void>;
  };

  const stopScanning = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;

    try {
      await startPromiseRef.current;

      const state = scanner.getState();
      if (
        state === Html5QrcodeScannerState.SCANNING ||
        state === Html5QrcodeScannerState.PAUSED
      ) {
        await scanner.stop();
      }
    } catch (err) {
      logger.error(`Error stopping scanner: ${err}`);
    }
  };

  useImperativeHandle(ref, () => ({ stop: stopScanning }));

  const setContainerNode = (node: HTMLDivElement | null) => {
    if (node) {
      startScanning(node);
    } else {
      stopScanning();
    }
  };

  return (
    <div
      id={CONTAINER_ID}
      ref={setContainerNode}
      className="w-full rounded-lg overflow-hidden bg-black"
    />
  );
});

export default Scanner;
