const fs = require('fs');
const path = require('path');

// Ensure directories exist
const alphabetDir = path.join(__dirname, 'public', 'signs', 'alphabet');
const wordsDir = path.join(__dirname, 'public', 'signs', 'words');

fs.mkdirSync(alphabetDir, { recursive: true });
fs.mkdirSync(wordsDir, { recursive: true });

// Helper to write SVG
function writeSvg(dir, filename, content) {
  fs.writeFileSync(path.join(dir, filename), content.trim());
}

// Word SVGs derived from SignCard.jsx or custom high-quality designs
const WATER_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="water_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#0EA5E9" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#0EA5E9" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <path d="M 37 128 Q 33 115 34 103 Q 35 95 41 91 L 45 90 L 56 88 L 67 90 L 75 91 Q 82 96 84 104 Q 86 116 83 128 Z" fill="url(#water_palm)" stroke="#0EA5E9" stroke-width="1.3"/>
  <path d="M 41 92 C 40 72 41 52 43 36 Q 45.5 30 48 36 C 50 52 51 72 49 92 Z" fill="url(#water_palm)" stroke="#0EA5E9" stroke-width="1.3"/>
  <path d="M 52 91 C 51 70 51.5 47 53.5 29 Q 56 22 58.5 29 C 60.5 47 61 70 60 91 Z" fill="url(#water_palm)" stroke="#0EA5E9" stroke-width="1.3"/>
  <path d="M 62 92 C 62 73 62.5 55 64.2 37 Q 66.5 31 69 37 C 70.5 55 71 73 71 92 Z" fill="url(#water_palm)" stroke="#0EA5E9" stroke-width="1.3"/>
  <text x="60" y="156" text-anchor="middle" fill="#0EA5E9" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">WATER</text>
</svg>
`;

const PLANT_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="plant_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#10B981" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Seedling rising between hands -->
  <path d="M 60 110 Q 60 80 50 65 Q 45 75 48 95" fill="none" stroke="#10B981" stroke-width="1.5" opacity="0.8"/>
  <path d="M 60 110 Q 60 70 70 50 Q 75 60 72 85" fill="none" stroke="#10B981" stroke-width="1.5" opacity="0.8"/>
  <circle cx="70" cy="50" r="3" fill="#10B981" opacity="0.9"/>
  <!-- Hands -->
  <path d="M 34 126 Q 31 115 32 103 Q 33 94 38 89 Q 43 85 50 84 L 60 83 L 70 84 Q 77 86 81 92 Q 85 100 85 112 Q 85 122 82 128 Q 60 134 38 130 Z" fill="url(#plant_palm)" stroke="#10B981" stroke-width="1.3"/>
  <text x="60" y="156" text-anchor="middle" fill="#10B981" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">PLANT</text>
</svg>
`;

const FOOD_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="food_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#D946EF" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#D946EF" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Fingers eating / touching chin -->
  <path d="M 37 128 Q 33 115 34 103 Q 35 95 41 91 L 45 90 L 56 88 L 67 90 L 75 91 Q 82 96 84 104 Q 86 116 83 128 Z" fill="url(#food_palm)" stroke="#D946EF" stroke-width="1.3"/>
  <path d="M 41 92 C 40 72 41 52 43 36 Q 45.5 30 48 36 C 50 52 51 72 49 92 Z" fill="url(#food_palm)" stroke="#D946EF" stroke-width="1.3"/>
  <path d="M 52 91 C 51 70 51.5 47 53.5 29 Q 56 22 58.5 29 C 60.5 47 61 70 60 91 Z" fill="url(#food_palm)" stroke="#D946EF" stroke-width="1.3"/>
  <text x="60" y="156" text-anchor="middle" fill="#D946EF" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">FOOD</text>
</svg>
`;

const ENERGY_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="energy_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#A855F7" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#A855F7" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <path d="M 33 128 Q 29 115 31 103 Q 32 95 38 91 L 43 90 L 55 88 L 67 90 L 76 92 Q 84 97 86 105 Q 88 117 85 128 Z" fill="url(#energy_palm)" stroke="#A855F7" stroke-width="1.3"/>
  <path d="M 40 80 Q 45 60 60 50 Q 75 60 80 80" fill="none" stroke="#A855F7" stroke-width="1.5" stroke-dasharray="3 3"/>
  <path d="M 30 70 Q 40 40 60 30 Q 80 40 90 70" fill="none" stroke="#A855F7" stroke-width="1.5" stroke-dasharray="3 3"/>
  <text x="60" y="156" text-anchor="middle" fill="#A855F7" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">ENERGY</text>
</svg>
`;

const SUNLIGHT_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sun_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#EAB308" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#EAB308" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="30" r="15" fill="#EAB308" opacity="0.2"/>
  <path d="M 60 45 L 60 80 M 50 42 L 35 70 M 70 42 L 85 70" stroke="#EAB308" stroke-width="1.5" stroke-dasharray="3 3"/>
  <path d="M 33 128 Q 29 115 31 103 Q 32 95 38 91 L 43 90 L 55 88 L 67 90 L 76 92 Q 84 97 86 105 Q 88 117 85 128 Z" fill="url(#sun_palm)" stroke="#EAB308" stroke-width="1.3"/>
  <text x="60" y="156" text-anchor="middle" fill="#EAB308" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">SUNLIGHT</text>
</svg>
`;

const GRAVITY_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gravity_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <g transform="rotate(180 60 80)">
    <path d="M 37 128 Q 33 115 34 103 Q 35 95 41 91 L 45 90 L 56 88 L 67 90 L 75 91 Q 82 96 84 104 Q 86 116 83 128 Z" fill="url(#gravity_palm)" stroke="#3B82F6" stroke-width="1.3"/>
    <path d="M 40 92 C 39 71 40 52 42 36 Q 44.5 30 47 36 C 49 52 50 71 48 92 Z" fill="url(#gravity_palm)" stroke="#3B82F6" stroke-width="1.3"/>
  </g>
  <path d="M 60 100 L 60 130" stroke="#3B82F6" stroke-width="1.5" stroke-dasharray="3 3"/>
  <polygon points="60,135 55,125 65,125" fill="#3B82F6"/>
  <text x="60" y="156" text-anchor="middle" fill="#3B82F6" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">GRAVITY</text>
</svg>
`;

const FORCE_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="force_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#EF4444" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#EF4444" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <g transform="scale(0.9) translate(5 10)">
    <path d="M 37 128 Q 33 115 34 103 Q 35 95 41 91 L 45 90 L 56 88 L 67 90 L 75 91 Q 82 96 84 104 Q 86 116 83 128 Z" fill="url(#force_palm)" stroke="#EF4444" stroke-width="1.3"/>
    <path d="M 41 92 C 40 72 41 52 43 36 Q 45.5 30 48 36 C 50 52 51 72 49 92 Z" fill="url(#force_palm)" stroke="#EF4444" stroke-width="1.3"/>
    <path d="M 52 91 C 51 70 51.5 47 53.5 29 Q 56 22 58.5 29 C 60.5 47 61 70 60 91 Z" fill="url(#force_palm)" stroke="#EF4444" stroke-width="1.3"/>
    <path d="M 62 92 C 62 73 62.5 55 64.2 37 Q 66.5 31 69 37 C 70.5 55 71 73 71 92 Z" fill="url(#force_palm)" stroke="#EF4444" stroke-width="1.3"/>
    <path d="M 73 94 C 73 77 73.5 62 75 49 Q 76.8 43 79 49 C 80.5 62 81 77 80 94 Z" fill="url(#force_palm)" stroke="#EF4444" stroke-width="1.3"/>
  </g>
  <path d="M 20 70 Q 20 40 40 20" fill="none" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="3 3"/>
  <path d="M 100 70 Q 100 40 80 20" fill="none" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="3 3"/>
  <text x="60" y="156" text-anchor="middle" fill="#EF4444" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">FORCE</text>
</svg>
`;

const CELL_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cell_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#15CFA0" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#15CFA0" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Concentric cellular ring representation -->
  <circle cx="60" cy="70" r="28" stroke="#15CFA0" stroke-width="1.5" fill="none" opacity="0.3"/>
  <circle cx="60" cy="70" r="22" stroke="#15CFA0" stroke-width="1" fill="none" opacity="0.2" stroke-dasharray="2 2"/>
  <circle cx="60" cy="70" r="8" fill="#15CFA0" opacity="0.4"/>
  <!-- Hand enclosing it slightly -->
  <path d="M 37 128 Q 33 115 34 103 Q 35 95 41 91 L 45 90 L 56 88 L 67 90 L 75 91 Q 82 96 84 104 Q 86 116 83 128 Z" fill="url(#cell_palm)" stroke="#15CFA0" stroke-width="1.3"/>
  <text x="60" y="156" text-anchor="middle" fill="#15CFA0" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">CELL</text>
</svg>
`;

const ATOM_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="atom_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Orbiting electrons -->
  <ellipse cx="60" cy="65" rx="30" ry="12" stroke="#8B5CF6" stroke-width="1.2" fill="none" opacity="0.45" transform="rotate(30 60 65)"/>
  <ellipse cx="60" cy="65" rx="30" ry="12" stroke="#8B5CF6" stroke-width="1.2" fill="none" opacity="0.45" transform="rotate(-30 60 65)"/>
  <circle cx="60" cy="65" r="6" fill="#8B5CF6" opacity="0.8"/>
  <circle cx="34" cy="50" r="3" fill="#8B5CF6" opacity="0.9"/>
  <circle cx="86" cy="50" r="3" fill="#8B5CF6" opacity="0.9"/>
  <!-- Hand -->
  <path d="M 37 128 Q 33 115 34 103 Q 35 95 41 91 L 45 90 L 56 88 L 67 90 L 75 91 Q 82 96 84 104 Q 86 116 83 128 Z" fill="url(#atom_palm)" stroke="#8B5CF6" stroke-width="1.3"/>
  <text x="60" y="156" text-anchor="middle" fill="#8B5CF6" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">ATOM</text>
</svg>
`;

writeSvg(wordsDir, 'water.svg', WATER_SVG);
writeSvg(wordsDir, 'plant.svg', PLANT_SVG);
writeSvg(wordsDir, 'food.svg', FOOD_SVG);
writeSvg(wordsDir, 'energy.svg', ENERGY_SVG);
writeSvg(wordsDir, 'sunlight.svg', SUNLIGHT_SVG);
writeSvg(wordsDir, 'gravity.svg', GRAVITY_SVG);
writeSvg(wordsDir, 'force.svg', FORCE_SVG);
writeSvg(wordsDir, 'cell.svg', CELL_SVG);
writeSvg(wordsDir, 'atom.svg', ATOM_SVG);

// Generate Letter SVGs A-Z
for (let i = 65; i <= 90; i++) {
  const letter = String.fromCharCode(i);
  const letterSvg = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="let_grad_${letter}" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#15CFA0" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#15CFA0" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Stylized hand contour representation -->
  <path d="M 37 128 Q 33 115 34 103 Q 35 95 41 91 L 45 90 L 56 88 L 67 90 L 75 91 Q 82 96 84 104 Q 86 116 83 128 Z" fill="url(#let_grad_${letter})" stroke="#15CFA0" stroke-width="1.3"/>
  <!-- Highlight overlay bubble showing the letter -->
  <circle cx="60" cy="65" r="22" fill="#15CFA0" opacity="0.08" stroke="#15CFA0" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="60" y="72" text-anchor="middle" fill="#15CFA0" font-size="22" font-family="monospace" font-weight="900" opacity="0.85">${letter}</text>
  <!-- Hand base crease -->
  <path d="M 43 105 Q 60 108 77 105" stroke="#15CFA0" stroke-width="0.8" opacity="0.3"/>
  <text x="60" y="156" text-anchor="middle" fill="#15CFA0" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">LETTER ${letter}</text>
</svg>
`;
  writeSvg(alphabetDir, `${letter}.svg`, letterSvg);
}

console.log('Successfully generated all 35 custom SVG sign assets in public/signs/!');
