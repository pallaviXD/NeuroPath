import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import * as THREE from "three";

// Rigged Humanoid model made from basic three.js primitives
function HumanoidPuppet({ activeGloss, progress }) {
  // References to limbs for procedural animation
  const leftShoulderRef = useRef();
  const rightShoulderRef = useRef();
  const leftElbowRef = useRef();
  const rightElbowRef = useRef();
  const leftHandRef = useRef();
  const rightHandRef = useRef();
  const headRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Default neutral breathing
    if (leftShoulderRef.current && rightShoulderRef.current) {
      leftShoulderRef.current.rotation.z = Math.sin(t * 2) * 0.05 + 0.1;
      rightShoulderRef.current.rotation.z = -Math.sin(t * 2) * 0.05 - 0.1;
    }

    if (!activeGloss) {
      // Return to resting pose
      const restSpeed = 0.1;
      if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.2, restSpeed);
      if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 0.2, restSpeed);
      if (leftElbowRef.current) leftElbowRef.current.rotation.z = THREE.MathUtils.lerp(leftElbowRef.current.rotation.z, -0.5, restSpeed);
      if (rightElbowRef.current) rightElbowRef.current.rotation.z = THREE.MathUtils.lerp(rightElbowRef.current.rotation.z, 0.5, restSpeed);
      if (leftHandRef.current) leftHandRef.current.rotation.y = THREE.MathUtils.lerp(leftHandRef.current.rotation.y, 0, restSpeed);
      if (rightHandRef.current) rightHandRef.current.rotation.y = THREE.MathUtils.lerp(rightHandRef.current.rotation.y, 0, restSpeed);
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 1.5) * 0.05;
      return;
    }

    // Procedural keyframes based on the active gloss token
    const phase = progress; // 0 to 1

    switch (activeGloss) {
      case "OBJECT":
        // Raise hands up, palms open
        if (leftShoulderRef.current) {
          leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, -0.6, 0.2);
          leftShoulderRef.current.rotation.y = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.y, 0.3, 0.2);
        }
        if (rightShoulderRef.current) {
          rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, -0.6, 0.2);
          rightShoulderRef.current.rotation.y = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.y, -0.3, 0.2);
        }
        if (leftElbowRef.current) leftElbowRef.current.rotation.z = THREE.MathUtils.lerp(leftElbowRef.current.rotation.z, -1.2, 0.2);
        if (rightElbowRef.current) rightElbowRef.current.rotation.z = THREE.MathUtils.lerp(rightElbowRef.current.rotation.z, 1.2, 0.2);
        break;

      case "STAY":
        // Press flat hands downwards in front of torso
        if (leftShoulderRef.current) {
          leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, -0.2, 0.2);
          leftShoulderRef.current.rotation.y = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.y, 0.1, 0.2);
        }
        if (rightShoulderRef.current) {
          rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, -0.2, 0.2);
          rightShoulderRef.current.rotation.y = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.y, -0.1, 0.2);
        }
        if (leftElbowRef.current) leftElbowRef.current.rotation.z = THREE.MathUtils.lerp(leftElbowRef.current.rotation.z, -0.8 + Math.sin(phase * Math.PI) * 0.3, 0.2);
        if (rightElbowRef.current) rightElbowRef.current.rotation.z = THREE.MathUtils.lerp(rightElbowRef.current.rotation.z, 0.8 - Math.sin(phase * Math.PI) * 0.3, 0.2);
        break;

      case "SAME":
        // Bring index fingers together (hands meet in center)
        if (leftShoulderRef.current) leftShoulderRef.current.rotation.y = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.y, 0.6, 0.2);
        if (rightShoulderRef.current) rightShoulderRef.current.rotation.y = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.y, -0.6, 0.2);
        if (leftElbowRef.current) leftElbowRef.current.rotation.z = THREE.MathUtils.lerp(leftElbowRef.current.rotation.z, -0.9, 0.2);
        if (rightElbowRef.current) rightElbowRef.current.rotation.z = THREE.MathUtils.lerp(rightElbowRef.current.rotation.z, 0.9, 0.2);
        break;

      case "UNTIL":
        // Point forward
        if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, -0.8, 0.2);
        if (leftElbowRef.current) leftElbowRef.current.rotation.z = THREE.MathUtils.lerp(leftElbowRef.current.rotation.z, -0.3, 0.2);
        break;

      case "PUSH":
        // Push arms outwards forward
        const pushDist = Math.sin(phase * Math.PI) * 0.6;
        if (leftShoulderRef.current) {
          leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, -0.9 - pushDist, 0.25);
          leftShoulderRef.current.rotation.y = 0.2;
        }
        if (rightShoulderRef.current) {
          rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, -0.9 - pushDist, 0.25);
          rightShoulderRef.current.rotation.y = -0.2;
        }
        if (leftElbowRef.current) leftElbowRef.current.rotation.z = THREE.MathUtils.lerp(leftElbowRef.current.rotation.z, -0.4, 0.2);
        if (rightElbowRef.current) rightElbowRef.current.rotation.z = THREE.MathUtils.lerp(rightElbowRef.current.rotation.z, 0.4, 0.2);
        break;

      case "CHANGES":
        // Rotate hands around each other
        const rollSpeed = t * 10;
        if (leftShoulderRef.current) {
          leftShoulderRef.current.rotation.x = -0.5 + Math.sin(rollSpeed) * 0.15;
          leftShoulderRef.current.rotation.y = 0.4;
        }
        if (rightShoulderRef.current) {
          rightShoulderRef.current.rotation.x = -0.5 - Math.sin(rollSpeed) * 0.15;
          rightShoulderRef.current.rotation.y = -0.4;
        }
        if (leftElbowRef.current) leftElbowRef.current.rotation.z = -1.0 + Math.cos(rollSpeed) * 0.15;
        if (rightElbowRef.current) rightElbowRef.current.rotation.z = 1.0 - Math.cos(rollSpeed) * 0.15;
        break;

      case "SUNLIGHT":
        // Fingers wiggle down from high-up (sunshine rays)
        if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, -1.5, 0.2);
        if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, -1.5, 0.2);
        if (leftElbowRef.current) leftElbowRef.current.rotation.z = THREE.MathUtils.lerp(leftElbowRef.current.rotation.z, -1.5 + Math.sin(t * 15) * 0.1, 0.2);
        if (rightElbowRef.current) rightElbowRef.current.rotation.z = THREE.MathUtils.lerp(rightElbowRef.current.rotation.z, 1.5 - Math.sin(t * 15) * 0.1, 0.2);
        break;

      case "ABSORB":
        // Bring hands inward toward chest
        if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, -0.4, 0.2);
        if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, -0.4, 0.2);
        if (leftElbowRef.current) leftElbowRef.current.rotation.z = THREE.MathUtils.lerp(leftElbowRef.current.rotation.z, -0.1, 0.2);
        if (rightElbowRef.current) rightElbowRef.current.rotation.z = THREE.MathUtils.lerp(rightElbowRef.current.rotation.z, 0.1, 0.2);
        break;

      case "WATER":
        // Wiggle fingers moving down (rain droplets)
        if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = -0.5;
        if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = -0.5;
        if (leftElbowRef.current) leftElbowRef.current.rotation.z = -1.1 + Math.sin(t * 8) * 0.08;
        if (rightElbowRef.current) rightElbowRef.current.rotation.z = 1.1 - Math.sin(t * 8) * 0.08;
        break;

      case "GAS":
        // Floating waves upward
        if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = -0.8 + Math.sin(t * 4) * 0.1;
        if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = -0.8 - Math.sin(t * 4) * 0.1;
        break;

      case "MAKE":
        // Clench hands rolling
        if (leftShoulderRef.current) leftShoulderRef.current.rotation.y = 0.5;
        if (rightShoulderRef.current) rightShoulderRef.current.rotation.y = -0.5;
        break;

      case "SUGAR":
        // Touch lips then extend out
        if (rightShoulderRef.current) {
          rightShoulderRef.current.rotation.x = -1.1;
          rightShoulderRef.current.rotation.y = -0.6;
        }
        if (rightElbowRef.current) rightElbowRef.current.rotation.z = 1.4;
        break;

      case "RELEASE":
        // Open hands expanding outward from center
        if (leftShoulderRef.current) leftShoulderRef.current.rotation.y = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.y, -0.5, 0.2);
        if (rightShoulderRef.current) rightShoulderRef.current.rotation.y = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.y, 0.5, 0.2);
        break;

      case "OXYGEN":
        // Fingers pinch and open in air
        if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = -0.8;
        if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = -0.8;
        break;

      default:
        break;
    }
  });

  return (
    <group position={[0, -1.2, 0]}>
      {/* Torso/Chest */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.35]} />
        <meshStandardMaterial color="#1C1525" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Head */}
      <group position={[0, 1.45, 0]}>
        <mesh ref={headRef}>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial color="#15CFA0" roughness={0.3} emissive="#15CFA0" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* LEFT ARM */}
      <group ref={leftShoulderRef} position={[-0.42, 1.15, 0]}>
        {/* Left Upper Arm */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.07, 0.06, 0.45]} />
          <meshStandardMaterial color="#15CFA0" />
        </mesh>
        
        {/* Left Forearm */}
        <group ref={leftElbowRef} position={[0, -0.4, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.06, 0.05, 0.4]} />
            <meshStandardMaterial color="#15CFA0" />
          </mesh>
          
          {/* Left Hand */}
          <mesh ref={leftHandRef} position={[0, -0.42, 0]}>
            <boxGeometry args={[0.09, 0.1, 0.03]} />
            <meshStandardMaterial color="#7B2FF7" emissive="#7B2FF7" emissiveIntensity={0.3} />
          </mesh>
        </group>
      </group>

      {/* RIGHT ARM */}
      <group ref={rightShoulderRef} position={[0.42, 1.15, 0]}>
        {/* Right Upper Arm */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.07, 0.06, 0.45]} />
          <meshStandardMaterial color="#15CFA0" />
        </mesh>
        
        {/* Right Forearm */}
        <group ref={rightElbowRef} position={[0, -0.4, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.06, 0.05, 0.4]} />
            <meshStandardMaterial color="#15CFA0" />
          </mesh>
          
          {/* Right Hand */}
          <mesh ref={rightHandRef} position={[0, -0.42, 0]}>
            <boxGeometry args={[0.09, 0.1, 0.03]} />
            <meshStandardMaterial color="#7B2FF7" emissive="#7B2FF7" emissiveIntensity={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function SigningAvatar({
  glossSequence = [],
  controlledIndex,
  controlledPlaying,
  compact = false,
}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [internalPlaying, setInternalPlaying] = useState(true);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const isControlled = controlledIndex !== undefined;
  const currentIndex = isControlled ? controlledIndex : internalIndex;
  const isPlaying = isControlled ? controlledPlaying : internalPlaying;
  const activeToken = glossSequence[currentIndex];

  useEffect(() => {
    if (isControlled) {
      setProgress(0);
      startTimeRef.current = performance.now();
    }
  }, [isControlled, currentIndex]);

  useEffect(() => {
    if (isControlled || !isPlaying || glossSequence.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (isControlled && isPlaying) {
        const duration = activeToken?.duration || 1000;
        startTimeRef.current = performance.now();
        timerRef.current = setInterval(() => {
          const elapsed = performance.now() - startTimeRef.current;
          setProgress(Math.min(elapsed / duration, 1));
        }, 1000 / 60);
      }
      return () => clearInterval(timerRef.current);
    }

    const duration = activeToken?.duration || 1000;
    startTimeRef.current = performance.now();

    const interval = 1000 / 60;
    timerRef.current = setInterval(() => {
      const elapsed = performance.now() - startTimeRef.current;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);

      if (elapsed >= duration) {
        clearInterval(timerRef.current);
        setInternalIndex((prev) => (prev + 1) % glossSequence.length);
        setProgress(0);
      }
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isPlaying, glossSequence, activeToken, isControlled]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className={`w-full ${compact ? "h-full min-h-[180px]" : "h-[180px]"} bg-dark-card border border-white/5 rounded-2xl relative overflow-hidden group shadow-inner`}>
        {/* Soft grid lines inside viewport */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        
        {/* R3F Canvas */}
        <Canvas camera={{ position: [0, 0, 2.4], fov: 60 }}>
          <ambientLight intensity={0.65} />
          <directionalLight position={[1, 3, 2]} intensity={0.8} />
          <pointLight position={[-2, -1, 1]} intensity={0.3} color="#7B2FF7" />
          <pointLight position={[2, 1, 1]} intensity={0.4} color="#15CFA0" />
          <Center>
            <HumanoidPuppet activeGloss={activeToken?.gloss} progress={progress} />
          </Center>
        </Canvas>

        {/* Video Controls */}
        {!isControlled && (
        <div className="absolute bottom-2 right-2 flex gap-1.5 z-20">
          <button
            onClick={() => setInternalPlaying(!internalPlaying)}
            className="px-2.5 py-1 bg-dark-bg/85 border border-white/10 hover:border-accent-mint/30 hover:bg-dark-bg text-text-dim hover:text-accent-mint font-mono text-[9px] uppercase tracking-wider rounded-md cursor-pointer transition-all"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => {
              setInternalIndex(0);
              setProgress(0);
            }}
            className="px-2.5 py-1 bg-dark-bg/85 border border-white/10 hover:border-white/20 text-text-dim hover:text-text-primary font-mono text-[9px] uppercase tracking-wider rounded-md cursor-pointer transition-all"
          >
            Reset
          </button>
        </div>
        )}
      </div>

      {!compact && (
      <div className="w-full mt-3 px-2 flex flex-wrap justify-center items-center gap-1.5">
        {glossSequence.map((token, index) => (
          <span
            key={index}
            className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full transition-all border ${
              index === currentIndex && isPlaying
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
