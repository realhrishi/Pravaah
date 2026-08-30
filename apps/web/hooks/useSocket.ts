"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type {
  RiskUpdatePayload,
  AlertNewPayload,
  SensorStatusPayload,
} from "../types/socket";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export function useSocket(watershedId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [latestRisk, setLatestRisk] = useState<RiskUpdatePayload | null>(null);
  const [latestAlert, setLatestAlert] = useState<AlertNewPayload | null>(null);
  const [sensorStatuses, setSensorStatuses] = useState<
    Record<string, SensorStatusPayload>
  >({});

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      if (watershedId) socket.emit("join:watershed", watershedId);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("risk:update", (payload: RiskUpdatePayload) =>
      setLatestRisk(payload),
    );
    socket.on("alert:new", (payload: AlertNewPayload) =>
      setLatestAlert(payload),
    );
    socket.on("alert:broadcast", (payload: AlertNewPayload) => {
      setLatestAlert(payload);
    });
    socket.on("sensor:status", (payload: SensorStatusPayload) => {
      setSensorStatuses((prev) => ({ ...prev, [payload.sensorId]: payload }));
    });

    return () => {
      if (watershedId) socket.emit("leave:watershed", watershedId);
      socket.disconnect();
    };
  }, [watershedId]);

  return {
    connected,
    latestRisk,
    latestAlert,
    sensorStatuses,
    socket: socketRef.current,
  };
}
