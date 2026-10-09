import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
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
  const onDecodeRef = useRef(onDecode);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onDecodeRef.current = onDecode;
    onErrorRef.current = onError;
  }, [onDecode, onError]);

  const startScanning = useCallback((node: HTMLDivElement) => {
    if (scannerRef.current) return;

    const scanner = new Html5Qrcode(node.id);
    scannerRef.current = scanner;

    startPromiseRef.current = scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 20,
          qrbox: (vw, vh) => {
            const size = Math.max(
              Math.floor(Math.min(vw, vh) * 0.8),
              MIN_QRBOX_SIZE,
            );
            return { width: size, height: size };
          },
        },
        (decodedText) => onDecodeRef.current(decodedText),
        () => {},
      )
      .catch((err) => {
        logger.error(`Scanner failed to start: ${err}`);
        onErrorRef.current?.("Camera access denied or unavailable.");
        scannerRef.current = null;
      }) as Promise<void>;
  }, []);

  const stopScanning = useCallback(async () => {
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
  }, []);

  useImperativeHandle(ref, () => ({ stop: stopScanning }), [stopScanning]);

  const setContainerNode = useCallback((node: HTMLDivElement | null) => {
    if (node) startScanning(node);
    else stopScanning();
  }, [startScanning, stopScanning]);

  return (
    <div
      id={CONTAINER_ID}
      ref={setContainerNode}
      className="w-full rounded-lg overflow-hidden bg-black"
    />
  );
});

export default Scanner;
