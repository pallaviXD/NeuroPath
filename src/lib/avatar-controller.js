import * as THREE from "three";

// MediaPipe Hand landmark connections (21 landmarks per hand)
const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring finger
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm
  [5, 9], [9, 13], [13, 17],
];

export class AvatarController {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.joints = [];
    this.bones = [];
    this.connections = [];
    // Hand-specific meshes
    this.leftHandJoints = [];
    this.rightHandJoints = [];
    this.leftHandBones = [];
    this.rightHandBones = [];
    this.animationFrameId = null;

    this.initScene();
    this.createRig();
    this.createHandRig();
    this.animate();
  }

  initScene() {
    // Scene background - transparent so it blends with our app
    this.scene.background = null;

    // Camera setup
    this.camera.position.set(0, 0, 2);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer.setSize(1, 1); // Start small, resize later
    this.container.appendChild(this.renderer.domElement);

    // Lights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 2, 5);
    this.scene.add(directionalLight);
    this.scene.add(new THREE.AmbientLight(0x404040));
  }

  resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width > 0 && height > 0) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  createRig() {
    // MediaPipe Pose Topology (Complete 33 landmarks connections)
    this.connections = [
      // Face - Left eye
      [0, 1], [1, 2], [2, 3], [3, 7],
      // Face - Right eye
      [0, 4], [4, 5], [5, 6], [6, 8],
      // Mouth
      [9, 10],
      // Torso
      [11, 12],  // Shoulders
      [11, 23], [12, 24],  // Shoulders to hips
      [23, 24],  // Hips
      // Left arm
      [11, 13], [13, 15],  // Shoulder -> Elbow -> Wrist
      [15, 17], [15, 19], [15, 21],  // Wrist to pinky, index, thumb
      [17, 19],  // Pinky to index
      // Right arm
      [12, 14], [14, 16],  // Shoulder -> Elbow -> Wrist
      [16, 18], [16, 20], [16, 22],  // Wrist to pinky, index, thumb
      [18, 20],  // Pinky to index
      // Left leg
      [23, 25], [25, 27],  // Hip -> Knee -> Ankle
      [27, 29], [29, 31],  // Ankle -> Heel -> Foot index
      [27, 31],  // Ankle to foot index
      // Right leg
      [24, 26], [26, 28],  // Hip -> Knee -> Ankle
      [28, 30], [30, 32],  // Ankle -> Heel -> Foot index
      [28, 32],  // Ankle to foot index
    ];

    // Create joint spheres (33 joints for MediaPipe Pose)
    const geometry = new THREE.SphereGeometry(0.015, 8, 8);
    const matHead = new THREE.MeshLambertMaterial({ color: 0x15CFA0 }); // Using NeuroPath Mint
    const matUpperBody = new THREE.MeshLambertMaterial({ color: 0x7B2FF7 }); // Using NeuroPath Purple
    const matJoint = new THREE.MeshLambertMaterial({ color: 0xffffff });

    for (let i = 0; i < 33; i++) {
      let mat;
      if (i <= 10) {
        mat = matHead;  // Head landmarks
      } else if (i <= 28) {
        mat = matUpperBody;  // Upper body
      } else {
        mat = matJoint;  // Feet
      }

      const mesh = new THREE.Mesh(geometry, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.joints.push(mesh);
    }

    // Create bone connections
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    this.connections.forEach((conn) => {
      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ]);
      const line = new THREE.Line(lineGeom, lineMat);
      line.visible = false;
      this.scene.add(line);
      this.bones.push({ line, start: conn[0], end: conn[1] });
    });
  }

  createHandRig() {
    // Create hand joints (21 per hand)
    const geometry = new THREE.SphereGeometry(0.012, 8, 8);
    const leftHandMat = new THREE.MeshLambertMaterial({ color: 0x15CFA0 });
    const rightHandMat = new THREE.MeshLambertMaterial({ color: 0x7B2FF7 });
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });

    // Left hand joints
    for (let i = 0; i < 21; i++) {
      const mesh = new THREE.Mesh(geometry, leftHandMat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.leftHandJoints.push(mesh);
    }

    // Right hand joints
    for (let i = 0; i < 21; i++) {
      const mesh = new THREE.Mesh(geometry, rightHandMat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.rightHandJoints.push(mesh);
    }

    // Left hand bones
    HAND_CONNECTIONS.forEach((conn) => {
      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ]);
      const line = new THREE.Line(lineGeom, lineMat);
      line.visible = false;
      this.scene.add(line);
      this.leftHandBones.push({ line, start: conn[0], end: conn[1] });
    });

    // Right hand bones
    HAND_CONNECTIONS.forEach((conn) => {
      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ]);
      const line = new THREE.Line(lineGeom, lineMat);
      line.visible = false;
      this.scene.add(line);
      this.rightHandBones.push({ line, start: conn[0], end: conn[1] });
    });
  }

  animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  hideAllPose() {
    this.joints.forEach((j) => (j.visible = false));
    this.bones.forEach((b) => (b.line.visible = false));
  }

  hideAllHands() {
    this.leftHandJoints.forEach((j) => (j.visible = false));
    this.rightHandJoints.forEach((j) => (j.visible = false));
    this.leftHandBones.forEach((b) => (b.line.visible = false));
    this.rightHandBones.forEach((b) => (b.line.visible = false));
  }

  updateHand(points, joints, bones) {
    if (!points || !Array.isArray(points) || points.length !== 21) {
      joints.forEach((j) => (j.visible = false));
      bones.forEach((b) => (b.line.visible = false));
      return false;
    }

    const isPresent = points.some(
      (p) => p && Array.isArray(p) && p.length >= 3 && !isNaN(p[0]) && (p[0] !== 0 || p[1] !== 0 || p[2] !== 0)
    );

    if (!isPresent) {
      joints.forEach((j) => (j.visible = false));
      bones.forEach((b) => (b.line.visible = false));
      return false;
    }

    const scale = 1.5;
    const zScale = 0.75;

    for (let i = 0; i < 21; i++) {
      const p = points[i];
      const j = joints[i];

      if (!p || !Array.isArray(p) || p.length < 3 || (p[0] === 0 && p[1] === 0 && p[2] === 0)) {
        j.visible = false;
        continue;
      }

      j.position.set(
        (p[0] - 0.5) * scale,
        -(p[1] - 0.5) * scale,
        -p[2] * zScale
      );
      j.visible = true;
    }

    bones.forEach((b) => {
      const jStart = joints[b.start];
      const jEnd = joints[b.end];

      if (!jStart.visible || !jEnd.visible) {
        b.line.visible = false;
        return;
      }

      const pStart = jStart.position;
      const pEnd = jEnd.position;
      const positions = b.line.geometry.attributes.position.array;

      positions[0] = pStart.x;
      positions[1] = pStart.y;
      positions[2] = pStart.z;
      positions[3] = pEnd.x;
      positions[4] = pEnd.y;
      positions[5] = pEnd.z;

      b.line.geometry.attributes.position.needsUpdate = true;
      b.line.visible = true;
    });

    return true;
  }

  updateFrame(frame) {
    if (!frame) {
      this.hideAllPose();
      this.hideAllHands();
      return false;
    }

    let hasValidData = false;

    if (frame.left_hand || frame.right_hand) {
      if (frame.left_hand) {
        const valid = this.updateHand(frame.left_hand, this.leftHandJoints, this.leftHandBones);
        if (valid) hasValidData = true;
      } else {
        this.leftHandJoints.forEach((j) => (j.visible = false));
        this.leftHandBones.forEach((b) => (b.line.visible = false));
      }
      
      if (frame.right_hand) {
        const valid = this.updateHand(frame.right_hand, this.rightHandJoints, this.rightHandBones);
        if (valid) hasValidData = true;
      } else {
        this.rightHandJoints.forEach((j) => (j.visible = false));
        this.rightHandBones.forEach((b) => (b.line.visible = false));
      }
    } else {
      this.hideAllHands();
    }

    const points = frame.pose;
    
    if (!points || !Array.isArray(points) || points.length !== 33) {
      this.hideAllPose();
      return hasValidData;
    }

    const isPresent = points.some(
      (p) => p && Array.isArray(p) && p.length >= 3 && !isNaN(p[0]) && (p[0] !== 0 || p[1] !== 0 || p[2] !== 0)
    );

    if (!isPresent) {
      this.hideAllPose();
      return false;
    }

    const scale = 1.5;
    const zScale = 0.75;

    this.joints.forEach((j) => (j.visible = false));

    for (let i = 0; i < 33; i++) {
      const p = points[i];
      const j = this.joints[i];

      if (!p || !Array.isArray(p) || p.length < 3 || (p[0] === 0 && p[1] === 0 && p[2] === 0)) {
        continue;
      }

      const x = (p[0] - 0.5) * scale;
      const y = -(p[1] - 0.5) * scale;
      const z = -p[2] * zScale;
      
      j.position.set(x, y, z);
      j.visible = true;
    }

    this.bones.forEach((b) => {
      const jStart = this.joints[b.start];
      const jEnd = this.joints[b.end];

      if (!jStart.visible || !jEnd.visible) {
        b.line.visible = false;
        return;
      }

      const pStart = jStart.position;
      const pEnd = jEnd.position;
      const positions = b.line.geometry.attributes.position.array;

      positions[0] = pStart.x;
      positions[1] = pStart.y;
      positions[2] = pStart.z;
      positions[3] = pEnd.x;
      positions[4] = pEnd.y;
      positions[5] = pEnd.z;

      b.line.geometry.attributes.position.needsUpdate = true;
      b.line.visible = true;
    });

    return true;
  }

  async playSequence(frames, fps = 30) {
    if (!frames || frames.length === 0) return false;

    // Increment sequence ID to invalidate any currently running sequences
    this.sequenceId = (this.sequenceId || 0) + 1;
    const currentSequenceId = this.sequenceId;

    const interval = 1000 / fps;
    let hasValidFrames = false;

    for (const frame of frames) {
      if (this.sequenceId !== currentSequenceId) break; // Stop if a new sequence started
      const isValid = this.updateFrame(frame);
      if (isValid) hasValidFrames = true;
      await new Promise((r) => setTimeout(r, interval));
    }

    return hasValidFrames;
  }

  dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.joints.forEach((j) => {
      j.geometry.dispose();
      j.material.dispose();
    });

    this.bones.forEach((b) => {
      b.line.geometry.dispose();
      b.line.material.dispose();
    });

    this.leftHandJoints.forEach((j) => {
      j.geometry.dispose();
      j.material.dispose();
    });

    this.rightHandJoints.forEach((j) => {
      j.geometry.dispose();
      j.material.dispose();
    });

    this.leftHandBones.forEach((b) => {
      b.line.geometry.dispose();
      b.line.material.dispose();
    });

    this.rightHandBones.forEach((b) => {
      b.line.geometry.dispose();
      b.line.material.dispose();
    });

    this.renderer.dispose();

    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
