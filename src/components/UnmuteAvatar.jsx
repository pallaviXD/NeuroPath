import React, { useEffect, useRef, useState } from "react";
import { AvatarController } from "../lib/avatar-controller";
import { signAnimation } from "../data/signAnimation";

export default function UnmuteAvatar({
  glossSequence = [],
  activeIndex: controlledIndex,
  isPlaying: controlledPlaying,
  height = 180,
  compact = false,
}) {
  const containerRef = useRef(null);
  const controllerRef = useRef(null);
  const [internalPlaying, setInternalPlaying] = useState(true);
  const [internalIndex, setInternalIndex] = useState(0);
  const timerRef = useRef(null);

  const isControlled = controlledIndex !== undefined;
  const currentIndex = isControlled ? controlledIndex : internalIndex;
  const isPlaying = isControlled ? controlledPlaying : internalPlaying;
  const activeGloss = glossSequence[currentIndex]?.gloss;

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new AvatarController(containerRef.current);
    controllerRef.current = controller;
    controller.resize();
    setTimeout(() => controller.resize(), 100);

    const resizeObserver = new ResizeObserver(() => controller.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isControlled) return;
    if (!isPlaying || glossSequence.length === 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const duration = glossSequence[currentIndex]?.duration || 1000;
    timerRef.current = setTimeout(() => {
      setInternalIndex((prev) => (prev + 1) % glossSequence.length);
    }, duration);

    return () => clearTimeout(timerRef.current);
  }, [currentIndex, isPlaying, glossSequence, isControlled]);

  useEffect(() => {
    let isCancelled = false;

    if (controllerRef.current && isPlaying && glossSequence.length > 0) {
      const playAnim = async () => {
        if (signAnimation?.frames) {
          let currentFrames = [...signAnimation.frames];
          if (currentIndex % 2 === 1) {
            currentFrames = currentFrames.slice().reverse();
          }

          const processedFrames = currentFrames.map((frame) => {
            let leftHand = frame.left_hand ? [...frame.left_hand] : null;
            let rightHand = frame.right_hand ? [...frame.right_hand] : null;

            if (currentIndex % 4 >= 2) {
              const mirrorHand = (hand) => {
                if (!hand) return hand;
                return hand.map((p) => {
                  if (p[0] === 0 && p[1] === 0 && p[2] === 0) return p;
                  return [1.0 - p[0], p[1], p[2]];
                });
              };
              leftHand = mirrorHand(frame.right_hand);
              rightHand = mirrorHand(frame.left_hand);
            }

            const getHandRoot = (handData, defaultPos) => {
              if (!handData || !Array.isArray(handData)) return defaultPos;
              if (handData[0] && (handData[0][0] !== 0 || handData[0][1] !== 0)) {
                return handData[0];
              }
              if (handData[9] && (handData[9][0] !== 0 || handData[9][1] !== 0)) {
                return [handData[9][0], handData[9][1] + 0.05, handData[9][2]];
              }
              for (let i = 0; i < handData.length; i++) {
                if (handData[i][0] !== 0 || handData[i][1] !== 0) {
                  return [handData[i][0], handData[i][1] + 0.05, handData[i][2]];
                }
              }
              return defaultPos;
            };

            const lRoot = getHandRoot(leftHand, [0.65, 0.6, 0.1]);
            const rRoot = getHandRoot(rightHand, [0.35, 0.6, 0.1]);

            if (leftHand?.[0]?.[0] === 0 && leftHand?.[0]?.[1] === 0) {
              leftHand[0] = lRoot;
            }
            if (rightHand?.[0]?.[0] === 0 && rightHand?.[0]?.[1] === 0) {
              rightHand[0] = rRoot;
            }

            const pose = Array(33).fill().map(() => [0, 0, 0]);
            pose[11] = [0.65, 0.25, 0];
            pose[12] = [0.35, 0.25, 0];
            pose[13] = [(0.65 + lRoot[0]) / 2 + 0.05, (0.25 + lRoot[1]) / 2, 0];
            pose[14] = [(0.35 + rRoot[0]) / 2 - 0.05, (0.25 + rRoot[1]) / 2, 0];
            pose[15] = lRoot;
            pose[16] = rRoot;
            pose[0] = [0.5, 0.1, -0.1];

            return { ...frame, left_hand: leftHand, right_hand: rightHand, pose };
          });

          if (!isCancelled) {
            await controllerRef.current.playSequence(processedFrames, 30);
          }
        }
      };
      playAnim();
    }

    return () => {
      isCancelled = true;
    };
  }, [currentIndex, isPlaying, glossSequence]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div
        ref={containerRef}
        className="w-full bg-dark-card border border-white/5 rounded-2xl relative overflow-hidden group shadow-inner"
        style={{ height: compact ? "100%" : height }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {!isControlled && (
          <div className="absolute bottom-2 right-2 flex gap-1.5 z-20">
            <button
              onClick={() => setInternalPlaying(!internalPlaying)}
              className="px-2.5 py-1 bg-dark-bg/85 border border-white/10 hover:border-accent-mint/30 hover:bg-dark-bg text-text-dim hover:text-accent-mint font-mono text-[9px] uppercase tracking-wider rounded-md cursor-pointer transition-all"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
          </div>
        )}
      </div>

      {!compact && glossSequence.length > 0 && (
        <div className="w-full mt-3 px-2 flex flex-wrap justify-center items-center gap-1.5">
          {glossSequence.map((token, index) => (
            <span
              key={index}
              className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full transition-all border ${
                token.gloss === activeGloss && isPlaying
                  ? "bg-accent-mint/20 border-accent-mint/45 text-accent-mint font-bold scale-105 shadow-[0_0_12px_rgba(21,207,160,0.2)]"
                  : "bg-white/[0.01] border-white/5 text-text-faint"
              }`}
            >
              {token.gloss}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
