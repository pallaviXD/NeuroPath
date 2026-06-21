// Generates an SVG for ASL letters using a geometric hand representation.

function generateHand(letter, color) {
  // Config map for A-Z.
  // format: [thumb, index, middle, ring, pinky]
  // 0 = folded, 1 = extended, 0.5 = curved, -1 = thumb tucked across, 2 = side/angled
  const M = {
    A: [-1, 0, 0, 0, 0],
    B: [0, 1, 1, 1, 1],
    C: [0.5, 0.5, 0.5, 0.5, 0.5],
    D: [0, 1, 0.5, 0.5, 0.5],
    E: [0, 0.2, 0.2, 0.2, 0.2],
    F: [0.5, 0.5, 1, 1, 1],
    G: [2, 2, 0, 0, 0],
    H: [-1, 2, 2, 0, 0],
    I: [0, 0, 0, 0, 1],
    J: [0, 0, 0, 0, 'J'], // J swoops
    K: [1, 1, 1, 0, 0], // thumb between index/mid
    L: [2, 1, 0, 0, 0],
    M: [-1, 0, 0, 0, 0], // Thumb under 3 fingers
    N: [-1, 0, 0, 0, 0], // Thumb under 2 fingers
    O: [0.5, 0.5, 0.5, 0.5, 0.5], // Tips touching
    P: [2, 2, 0.5, 0, 0], // angled down
    Q: [0.5, 0.5, 0, 0, 0], // angled down
    R: [0, 'R', 'R', 0, 0], // crossed
    S: [-2, 0, 0, 0, 0], // Thumb across fist
    T: [-1, 0, 0, 0, 0], // Thumb under 1 finger
    U: [0, 1, 1, 0, 0], // Together
    V: [0, 1.2, 1.2, 0, 0], // Spread
    W: [0, 1.2, 1.2, 1.2, 0], // Spread
    X: [0, 0.5, 0, 0, 0], // Hooked index
    Y: [2, 0, 0, 0, 1],
    Z: [0, 'Z', 0, 0, 0] // Z drawing
  };

  const pose = M[letter] || M['A'];
  
  // Render logic:
  // We use geometric rects and lines for fingers.
  const getFingerPath = (baseX, length, state) => {
    if (state === 1) return `<path d="M ${baseX} 80 L ${baseX} ${80 - length}" stroke="${color}" stroke-width="8" stroke-linecap="round" fill="none" />`;
    if (state === 1.2) return `<path d="M ${baseX} 80 L ${baseX + (baseX > 60 ? 10 : -10)} ${80 - length}" stroke="${color}" stroke-width="8" stroke-linecap="round" fill="none" />`;
    if (state === 0) return `<path d="M ${baseX} 80 L ${baseX} 95" stroke="${color}" stroke-width="8" stroke-linecap="round" fill="none" />`;
    if (state === 0.5) return `<path d="M ${baseX} 80 Q ${baseX + 10} 60 ${baseX} 70" stroke="${color}" stroke-width="8" stroke-linecap="round" fill="none" />`;
    if (state === 0.2) return `<path d="M ${baseX} 80 L ${baseX} 75" stroke="${color}" stroke-width="8" stroke-linecap="round" fill="none" />`;
    if (state === 2) return `<path d="M ${baseX} 80 L ${baseX - 25} 80" stroke="${color}" stroke-width="8" stroke-linecap="round" fill="none" />`;
    if (state === 'R') return `<path d="M ${baseX} 80 L ${baseX > 50 ? 45 : 65} 40" stroke="${color}" stroke-width="8" stroke-linecap="round" fill="none" />`;
    if (state === 'Z') return `<path d="M ${baseX} 80 L ${baseX} 40 L ${baseX + 15} 40 L ${baseX - 10} 60 L ${baseX + 15} 60" stroke="${color}" stroke-width="6" stroke-linejoin="round" fill="none" />`;
    if (state === 'J') return `<path d="M ${baseX} 80 L ${baseX} 40 Q ${baseX - 20} 40 ${baseX - 20} 25" stroke="${color}" stroke-width="8" stroke-linecap="round" fill="none" />`;
    return ""; // Fallback
  };

  const getThumbPath = (state) => {
    if (state === 1) return `<path d="M 35 90 L 15 50" stroke="${color}" stroke-width="9" stroke-linecap="round" fill="none" />`;
    if (state === 2) return `<path d="M 35 90 L 10 90" stroke="${color}" stroke-width="9" stroke-linecap="round" fill="none" />`;
    if (state === 0) return `<path d="M 35 90 L 35 70" stroke="${color}" stroke-width="9" stroke-linecap="round" fill="none" />`;
    if (state === -1) return `<path d="M 35 90 L 60 90" stroke="${color}" stroke-width="9" stroke-linecap="round" fill="none" />`;
    if (state === -2) return `<path d="M 35 90 L 70 100" stroke="${color}" stroke-width="9" stroke-linecap="round" fill="none" />`;
    if (state === 0.5) return `<path d="M 35 90 Q 20 70 40 70" stroke="${color}" stroke-width="9" stroke-linecap="round" fill="none" />`;
    return `<path d="M 35 90 L 60 90" stroke="${color}" stroke-width="9" stroke-linecap="round" fill="none" />`;
  };

  return `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="palm_grad_${letter}" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0.1"/>
    </linearGradient>
  </defs>
  
  <!-- Wrist -->
  <path d="M 40 130 L 80 130 L 75 160 L 45 160 Z" fill="url(#palm_grad_${letter})" stroke="${color}" stroke-width="2"/>
  
  <!-- Palm -->
  <rect x="35" y="80" width="50" height="50" rx="12" fill="url(#palm_grad_${letter})" stroke="${color}" stroke-width="2"/>
  
  <!-- Fingers -->
  ${getFingerPath(75, 30, pose[4])} <!-- Pinky -->
  ${getFingerPath(63, 40, pose[3])} <!-- Ring -->
  ${getFingerPath(51, 45, pose[2])} <!-- Middle -->
  ${getFingerPath(39, 40, pose[1])} <!-- Index -->
  
  <!-- Thumb -->
  ${getThumbPath(pose[0])}

  <!-- Letter Label -->
  <text x="60" y="150" text-anchor="middle" fill="${color}" font-size="16" font-family="monospace" font-weight="bold" opacity="0.9">${letter}</text>
</svg>
  `;
}

export function getAlphabetSVG(letter, color = "#15CFA0") {
  if (!/^[A-Z]$/i.test(letter)) return "";
  return generateHand(letter.toUpperCase(), color);
}
