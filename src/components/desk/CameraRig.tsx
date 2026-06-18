"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";

export type CameraView = "room" | "pc";

interface Targets {
  position: Vector3;
  lookAt: Vector3;
}

const VIEW_TARGETS: Record<CameraView, Targets> = {
  room: {
    position: new Vector3(-8.5, 7.8, 9),
    lookAt: new Vector3(0, 1.0, -1.4),
  },
  pc: {
    position: new Vector3(0, 1.55, -0.2),
    lookAt: new Vector3(0, 1.55, -1.78),
  },
};

interface CameraRigProps {
  view: CameraView;
  onArrived?: (view: CameraView) => void;
}

export default function CameraRig({ view, onArrived }: CameraRigProps) {
  const { camera } = useThree();
  const currentLookAt = useRef(new Vector3().copy(VIEW_TARGETS.room.lookAt));
  const arrivedRef = useRef<CameraView | null>(null);

  useFrame((_, delta) => {
    if (arrivedRef.current === view) return;

    const target = VIEW_TARGETS[view];
    const lerpFactor = 1 - Math.exp(-delta * 5);

    camera.position.lerp(target.position, lerpFactor);
    currentLookAt.current.lerp(target.lookAt, lerpFactor);
    camera.lookAt(currentLookAt.current);

    const positionDist = camera.position.distanceTo(target.position);
    const lookDist = currentLookAt.current.distanceTo(target.lookAt);

    if (positionDist < 0.02 && lookDist < 0.02) {
      arrivedRef.current = view;
      onArrived?.(view);
    } else {
      arrivedRef.current = null;
    }
  });

  return null;
}
