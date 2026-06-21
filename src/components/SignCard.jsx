import React, { useState, useEffect, useRef } from "react";

// ─── HIGHLY DETAILED ASL HAND SVGs ────────────────────────────────────────────
// Each sign uses: tapered fingers, knuckle joints, fingernails, gradient fills, palm creases

const HELLO_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="h_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#15CFA0" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#15CFA0" stop-opacity="0.15"/>
    </linearGradient>
    <linearGradient id="h_finger" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#15CFA0" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#15CFA0" stop-opacity="0.25"/>
    </linearGradient>
  </defs>

  <!-- Wrist -->
  <path d="M 37 128 Q 59 134 83 128 L 83 141 Q 59 147 37 141 Z"
    fill="url(#h_palm)" stroke="#15CFA0" stroke-width="1"/>

  <!-- Palm body -->
  <path d="M 37 128 Q 33 115 34 103 Q 35 95 41 91 L 45 90 L 56 88 L 67 90 L 75 91 Q 82 96 84 104 Q 86 116 83 128 Z"
    fill="url(#h_palm)" stroke="#15CFA0" stroke-width="1.3"/>

  <!-- Palm crease 1 -->
  <path d="M 41 111 Q 60 108 82 113" fill="none" stroke="#15CFA0" stroke-width="0.8" opacity="0.28"/>
  <!-- Palm crease 2 -->
  <path d="M 39 120 Q 60 117 83 121" fill="none" stroke="#15CFA0" stroke-width="0.7" opacity="0.2"/>

  <!-- ── THUMB ── angled lower-left, fleshy -->
  <path d="M 37 109 Q 27 105 19 94 Q 14 84 18 77 Q 23 72 29 78 Q 33 86 35 98 Q 36 104 37 109 Z"
    fill="url(#h_finger)" stroke="#15CFA0" stroke-width="1.3"/>
  <!-- Thumb IP joint -->
  <path d="M 23 91 Q 21 86 20 80" fill="none" stroke="#15CFA0" stroke-width="0.8" opacity="0.38"/>
  <!-- Thumb nail arc -->
  <path d="M 19 80 Q 23 74 28 79" fill="none" stroke="#15CFA0" stroke-width="1" opacity="0.6"/>

  <!-- ── INDEX FINGER ── -->
  <path d="M 41 92 C 40 72 41 52 43 36 Q 45.5 30 48 36 C 50 52 51 72 49 92 Z"
    fill="url(#h_finger)" stroke="#15CFA0" stroke-width="1.3"/>
  <!-- Index knuckle 1 (PIP) -->
  <line x1="41.5" y1="70" x2="48.5" y2="70" stroke="#15CFA0" stroke-width="0.8" opacity="0.38"/>
  <!-- Index knuckle 2 (DIP) -->
  <line x1="42.2" y1="54" x2="47.8" y2="54" stroke="#15CFA0" stroke-width="0.7" opacity="0.3"/>
  <!-- Index nail -->
  <path d="M 43.2 38 Q 45.5 33 47.8 38" fill="none" stroke="#15CFA0" stroke-width="1" opacity="0.62"/>

  <!-- ── MIDDLE FINGER ── tallest -->
  <path d="M 52 91 C 51 70 51.5 47 53.5 29 Q 56 22 58.5 29 C 60.5 47 61 70 60 91 Z"
    fill="url(#h_finger)" stroke="#15CFA0" stroke-width="1.3"/>
  <line x1="52.5" y1="68" x2="59.5" y2="68" stroke="#15CFA0" stroke-width="0.8" opacity="0.38"/>
  <line x1="53" y1="50" x2="59" y2="50" stroke="#15CFA0" stroke-width="0.7" opacity="0.3"/>
  <path d="M 54 31 Q 56 26 58.5 31" fill="none" stroke="#15CFA0" stroke-width="1" opacity="0.62"/>

  <!-- ── RING FINGER ── -->
  <path d="M 62 92 C 62 73 62.5 55 64.2 37 Q 66.5 31 69 37 C 70.5 55 71 73 71 92 Z"
    fill="url(#h_finger)" stroke="#15CFA0" stroke-width="1.3"/>
  <line x1="62.5" y1="70" x2="70.5" y2="70" stroke="#15CFA0" stroke-width="0.8" opacity="0.38"/>
  <line x1="63" y1="54" x2="70" y2="54" stroke="#15CFA0" stroke-width="0.7" opacity="0.3"/>
  <path d="M 64.2 39 Q 66.5 34 68.8 39" fill="none" stroke="#15CFA0" stroke-width="1" opacity="0.62"/>

  <!-- ── PINKY ── shortest -->
  <path d="M 73 94 C 73 77 73.5 62 75 49 Q 76.8 43 79 49 C 80.5 62 81 77 80 94 Z"
    fill="url(#h_finger)" stroke="#15CFA0" stroke-width="1.3"/>
  <line x1="73.5" y1="76" x2="79.5" y2="76" stroke="#15CFA0" stroke-width="0.8" opacity="0.38"/>
  <line x1="74" y1="63" x2="79" y2="63" stroke="#15CFA0" stroke-width="0.7" opacity="0.3"/>
  <path d="M 75 51 Q 76.8 46 79 51" fill="none" stroke="#15CFA0" stroke-width="1" opacity="0.62"/>

  <!-- Motion arrow: forehead outward -->
  <path d="M 93 58 Q 106 46 112 32" stroke="#15CFA0" stroke-width="1.5"
    stroke-dasharray="3 2.5" stroke-linecap="round" fill="none" opacity="0.45"/>
  <polygon points="112,26 117,37 107,35" fill="#15CFA0" opacity="0.45"/>

  <text x="60" y="156" text-anchor="middle" fill="#15CFA0" font-size="10.5"
    font-family="monospace" font-weight="bold" opacity="0.9">HELLO</text>
</svg>`;

const GOOD_MORNING_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gm_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#F59E0B" stop-opacity="0.15"/>
    </linearGradient>
    <linearGradient id="gm_finger" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#F59E0B" stop-opacity="0.25"/>
    </linearGradient>
  </defs>

  <!-- Sun symbol above -->
  <circle cx="60" cy="18" r="7" fill="#F59E0B" opacity="0.2" stroke="#F59E0B" stroke-width="1.2"/>
  <line x1="60" y1="7"  x2="60" y2="3"  stroke="#F59E0B" stroke-width="1.3" opacity="0.45"/>
  <line x1="60" y1="29" x2="60" y2="33" stroke="#F59E0B" stroke-width="1.3" opacity="0.45"/>
  <line x1="49" y1="18" x2="45" y2="18" stroke="#F59E0B" stroke-width="1.3" opacity="0.45"/>
  <line x1="71" y1="18" x2="75" y2="18" stroke="#F59E0B" stroke-width="1.3" opacity="0.45"/>
  <line x1="52" y1="11" x2="49" y2="8" stroke="#F59E0B" stroke-width="1.2" opacity="0.38"/>
  <line x1="68" y1="11" x2="71" y2="8" stroke="#F59E0B" stroke-width="1.2" opacity="0.38"/>
  <line x1="52" y1="25" x2="49" y2="28" stroke="#F59E0B" stroke-width="1.2" opacity="0.38"/>
  <line x1="68" y1="25" x2="71" y2="28" stroke="#F59E0B" stroke-width="1.2" opacity="0.38"/>

  <!-- Wrist -->
  <path d="M 37 129 Q 59 135 83 129 L 83 142 Q 59 148 37 142 Z"
    fill="url(#gm_palm)" stroke="#F59E0B" stroke-width="1"/>

  <!-- Palm body - slightly wider spread for morning -->
  <path d="M 37 129 Q 33 116 34 104 Q 35 96 41 92 L 45 91 L 56 89 L 67 91 L 75 92 Q 82 97 84 105 Q 86 117 83 129 Z"
    fill="url(#gm_palm)" stroke="#F59E0B" stroke-width="1.3"/>
  <path d="M 41 112 Q 60 109 82 114" fill="none" stroke="#F59E0B" stroke-width="0.8" opacity="0.28"/>
  <path d="M 39 121 Q 60 118 83 122" fill="none" stroke="#F59E0B" stroke-width="0.7" opacity="0.2"/>

  <!-- ── THUMB ── -->
  <path d="M 37 110 Q 27 106 19 95 Q 14 85 18 78 Q 23 73 29 79 Q 33 87 35 99 Q 36 105 37 110 Z"
    fill="url(#gm_finger)" stroke="#F59E0B" stroke-width="1.3"/>
  <path d="M 23 92 Q 21 87 20 81" fill="none" stroke="#F59E0B" stroke-width="0.8" opacity="0.38"/>
  <path d="M 19 81 Q 23 75 28 80" fill="none" stroke="#F59E0B" stroke-width="1" opacity="0.6"/>

  <!-- ── INDEX ── spread leftward -->
  <path d="M 40 93 C 38 72 38.5 52 40 37 Q 42 31 44.5 37 C 46.5 52 47.5 72 47 93 Z"
    fill="url(#gm_finger)" stroke="#F59E0B" stroke-width="1.3"/>
  <line x1="40.5" y1="71" x2="47" y2="71" stroke="#F59E0B" stroke-width="0.8" opacity="0.38"/>
  <line x1="41" y1="55" x2="46.5" y2="55" stroke="#F59E0B" stroke-width="0.7" opacity="0.3"/>
  <path d="M 40.5 39 Q 42.5 34 44.5 39" fill="none" stroke="#F59E0B" stroke-width="1" opacity="0.62"/>

  <!-- ── MIDDLE ── straight up -->
  <path d="M 52 91 C 51 70 51.5 47 53.5 29 Q 56 22 58.5 29 C 60.5 47 61 70 60 91 Z"
    fill="url(#gm_finger)" stroke="#F59E0B" stroke-width="1.3"/>
  <line x1="52.5" y1="68" x2="59.5" y2="68" stroke="#F59E0B" stroke-width="0.8" opacity="0.38"/>
  <line x1="53" y1="50" x2="59" y2="50" stroke="#F59E0B" stroke-width="0.7" opacity="0.3"/>
  <path d="M 54 31 Q 56 26 58.5 31" fill="none" stroke="#F59E0B" stroke-width="1" opacity="0.62"/>

  <!-- ── RING ── spread rightward -->
  <path d="M 63 92 C 63.5 73 64.5 55 67 38 Q 69.5 32 72 38 C 73.5 55 74 73 73 92 Z"
    fill="url(#gm_finger)" stroke="#F59E0B" stroke-width="1.3"/>
  <line x1="63.5" y1="70" x2="73" y2="70" stroke="#F59E0B" stroke-width="0.8" opacity="0.38"/>
  <line x1="64" y1="54" x2="72" y2="54" stroke="#F59E0B" stroke-width="0.7" opacity="0.3"/>
  <path d="M 66 40 Q 68.5 35 71.5 40" fill="none" stroke="#F59E0B" stroke-width="1" opacity="0.62"/>

  <!-- ── PINKY ── spread far right -->
  <path d="M 75 95 C 75.5 79 77 64 79 52 Q 81 46 83.5 52 C 85 64 85.5 79 85 95 Z"
    fill="url(#gm_finger)" stroke="#F59E0B" stroke-width="1.3"/>
  <line x1="75.5" y1="78" x2="85" y2="78" stroke="#F59E0B" stroke-width="0.8" opacity="0.38"/>
  <line x1="76" y1="65" x2="84.5" y2="65" stroke="#F59E0B" stroke-width="0.7" opacity="0.3"/>
  <path d="M 79 54 Q 81 49 83.5 54" fill="none" stroke="#F59E0B" stroke-width="1" opacity="0.62"/>

  <!-- Motion arc: forward from chin -->
  <path d="M 30 118 Q 58 113 89 118" stroke="#F59E0B" stroke-width="1.5"
    stroke-dasharray="3 2.5" stroke-linecap="round" fill="none" opacity="0.42"/>
  <polygon points="89,114 97,118 89,122" fill="#F59E0B" opacity="0.42"/>

  <text x="60" y="156" text-anchor="middle" fill="#F59E0B" font-size="9"
    font-family="monospace" font-weight="bold" opacity="0.9">GOOD MORNING</text>
</svg>`;

const ILY_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ily_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#EC4899" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#EC4899" stop-opacity="0.15"/>
    </linearGradient>
    <linearGradient id="ily_finger" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#EC4899" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#EC4899" stop-opacity="0.25"/>
    </linearGradient>
    <linearGradient id="ily_folded" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#EC4899" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#EC4899" stop-opacity="0.1"/>
    </linearGradient>
  </defs>

  <!-- Small heart glow above -->
  <path d="M 56 17 C 56 12 60 10 62 13 C 64 10 68 12 68 17 C 68 23 62 27 62 27 C 62 27 56 23 56 17 Z"
    fill="#EC4899" opacity="0.22" stroke="#EC4899" stroke-width="0.9"/>

  <!-- Wrist -->
  <path d="M 33 128 Q 58 134 85 128 L 85 141 Q 58 147 33 141 Z"
    fill="url(#ily_palm)" stroke="#EC4899" stroke-width="1"/>

  <!-- Palm - slightly wider for spread -->
  <path d="M 33 128 Q 29 115 31 103 Q 32 95 38 91 L 43 90 L 55 88 L 67 90 L 76 92 Q 84 97 86 105 Q 88 117 85 128 Z"
    fill="url(#ily_palm)" stroke="#EC4899" stroke-width="1.3"/>
  <path d="M 38 111 Q 59 108 84 113" fill="none" stroke="#EC4899" stroke-width="0.8" opacity="0.28"/>
  <path d="M 36 121 Q 59 118 85 122" fill="none" stroke="#EC4899" stroke-width="0.7" opacity="0.2"/>

  <!-- ── THUMB ── extended far left (ILY thumb is prominent) -->
  <path d="M 33 110 Q 21 105 12 92 Q 7 81 12 74 Q 17 68 24 74 Q 29 83 31 97 Q 32 104 33 110 Z"
    fill="url(#ily_finger)" stroke="#EC4899" stroke-width="1.3"/>
  <path d="M 18 89 Q 15 83 14 77" fill="none" stroke="#EC4899" stroke-width="0.8" opacity="0.38"/>
  <path d="M 13 77 Q 17 71 23 76" fill="none" stroke="#EC4899" stroke-width="1" opacity="0.6"/>

  <!-- ── INDEX FINGER ── extended upward (lean slightly left) -->
  <path d="M 40 92 C 39 71 40 52 42 36 Q 44.5 30 47 36 C 49 52 50 71 48 92 Z"
    fill="url(#ily_finger)" stroke="#EC4899" stroke-width="1.3"/>
  <line x1="40.5" y1="70" x2="47.5" y2="70" stroke="#EC4899" stroke-width="0.8" opacity="0.38"/>
  <line x1="41" y1="54" x2="47" y2="54" stroke="#EC4899" stroke-width="0.7" opacity="0.3"/>
  <path d="M 42 38 Q 44.5 33 47 38" fill="none" stroke="#EC4899" stroke-width="1" opacity="0.62"/>

  <!-- ── MIDDLE FINGER ── folded, first segment visible as rounded bump -->
  <path d="M 51 92 C 51 81 53 76 55.5 74 Q 58 72 60.5 74 C 62 76 62 82 62 92 Z"
    fill="url(#ily_folded)" stroke="#EC4899" stroke-width="1"/>
  <!-- Knuckle hint on folded middle -->
  <path d="M 53 84 Q 56.5 87 60 84" fill="none" stroke="#EC4899" stroke-width="0.8" opacity="0.3"/>

  <!-- ── RING FINGER ── folded, same treatment -->
  <path d="M 63 93 C 63 82 65 77 67.5 75 Q 69.5 73 71.5 75 C 73 77 73 83 72 93 Z"
    fill="url(#ily_folded)" stroke="#EC4899" stroke-width="1"/>
  <path d="M 65 85 Q 67.5 88 71 85" fill="none" stroke="#EC4899" stroke-width="0.8" opacity="0.3"/>

  <!-- ── PINKY ── extended upward (lean slightly right) -->
  <path d="M 74 95 C 74 77 74.5 61 76.5 48 Q 78.5 42 81 48 C 82.5 61 83 77 82 95 Z"
    fill="url(#ily_finger)" stroke="#EC4899" stroke-width="1.3"/>
  <line x1="74.5" y1="77" x2="81.5" y2="77" stroke="#EC4899" stroke-width="0.8" opacity="0.38"/>
  <line x1="75" y1="62" x2="81" y2="62" stroke="#EC4899" stroke-width="0.7" opacity="0.3"/>
  <path d="M 76.5 50 Q 78.5 45 81 50" fill="none" stroke="#EC4899" stroke-width="1" opacity="0.62"/>

  <text x="60" y="156" text-anchor="middle" fill="#EC4899" font-size="9.5"
    font-family="monospace" font-weight="bold" opacity="0.9">I LOVE YOU</text>
</svg>`;

const SORRY_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sr_fist" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#A78BFA" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#A78BFA" stop-opacity="0.18"/>
    </linearGradient>
    <linearGradient id="sr_thumb" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#A78BFA" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#A78BFA" stop-opacity="0.28"/>
    </linearGradient>
  </defs>

  <!-- Circular motion arc: chest circle -->
  <ellipse cx="60" cy="108" rx="42" ry="30" fill="none" stroke="#A78BFA"
    stroke-width="1.4" stroke-dasharray="5 3" opacity="0.3"/>
  <polygon points="18,100 13,110 23,112" fill="#A78BFA" opacity="0.3"/>

  <!-- ── CLOSED FIST BODY ── -->
  <!-- Main fist: fingers curled, viewed from front -->
  <path d="M 34 126 Q 31 115 32 103 Q 33 94 38 89 Q 43 85 50 84 L 60 83 L 70 84 Q 77 86 81 92 Q 85 100 85 112 Q 85 122 82 128 Q 60 134 38 130 Q 35 128 34 126 Z"
    fill="url(#sr_fist)" stroke="#A78BFA" stroke-width="1.3"/>

  <!-- Knuckle bumps across the top -->
  <!-- Index knuckle -->
  <path d="M 43 89 Q 47.5 82 52 89" fill="url(#sr_fist)" stroke="#A78BFA" stroke-width="1.2"/>
  <!-- Middle knuckle (highest) -->
  <path d="M 52 88 Q 57 80 62 88" fill="url(#sr_fist)" stroke="#A78BFA" stroke-width="1.2"/>
  <!-- Ring knuckle -->
  <path d="M 61 89 Q 65.5 82 70 89" fill="url(#sr_fist)" stroke="#A78BFA" stroke-width="1.2"/>
  <!-- Pinky knuckle (smallest) -->
  <path d="M 69 91 Q 72.5 85 76 91" fill="url(#sr_fist)" stroke="#A78BFA" stroke-width="1.1"/>

  <!-- Finger curl lines showing each folded finger segment -->
  <!-- Index curl -->
  <path d="M 38 100 Q 46 103 53 100" fill="none" stroke="#A78BFA" stroke-width="0.8" opacity="0.35"/>
  <!-- Middle curl -->
  <path d="M 47 101 Q 57 104 64 101" fill="none" stroke="#A78BFA" stroke-width="0.8" opacity="0.35"/>
  <!-- Ring curl -->
  <path d="M 57 102 Q 65 105 72 102" fill="none" stroke="#A78BFA" stroke-width="0.7" opacity="0.3"/>
  <!-- Pinky curl -->
  <path d="M 66 104 Q 72 107 78 104" fill="none" stroke="#A78BFA" stroke-width="0.7" opacity="0.28"/>

  <!-- Knuckle dividers (between knuckle bumps) -->
  <line x1="51" y1="86" x2="52" y2="93" stroke="#A78BFA" stroke-width="0.8" opacity="0.35"/>
  <line x1="62" y1="86" x2="62" y2="93" stroke="#A78BFA" stroke-width="0.8" opacity="0.35"/>
  <line x1="70" y1="87" x2="70" y2="93" stroke="#A78BFA" stroke-width="0.7" opacity="0.3"/>

  <!-- ── THUMB ── rests along left side of fist (A-shape) -->
  <path d="M 34 114 Q 26 111 22 103 Q 19 96 22 90 Q 26 85 32 89 Q 35 95 34 106 Q 34 111 34 114 Z"
    fill="url(#sr_thumb)" stroke="#A78BFA" stroke-width="1.3"/>
  <!-- Thumb IP joint -->
  <path d="M 25 100 Q 23 96 22 91" fill="none" stroke="#A78BFA" stroke-width="0.8" opacity="0.38"/>
  <!-- Thumb nail -->
  <path d="M 22 93 Q 25 88 29 91" fill="none" stroke="#A78BFA" stroke-width="1" opacity="0.55"/>

  <!-- Wrist -->
  <path d="M 34 128 Q 58 134 83 130 L 83 143 Q 58 148 34 143 Z"
    fill="url(#sr_fist)" stroke="#A78BFA" stroke-width="1" opacity="0.8"/>

  <text x="60" y="156" text-anchor="middle" fill="#A78BFA" font-size="10.5"
    font-family="monospace" font-weight="bold" opacity="0.9">SORRY</text>
</svg>`;

const OBJECT_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="obj_fist" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0.18"/>
    </linearGradient>
  </defs>
  <!-- Hand grasping an invisible sphere -->
  <path d="M 34 126 Q 31 115 32 103 Q 33 94 38 89 Q 43 85 50 84 L 60 83 L 70 84 Q 77 86 81 92 Q 85 100 85 112 Q 85 122 82 128 Q 60 134 38 130 Q 35 128 34 126 Z"
    fill="url(#obj_fist)" stroke="#8B5CF6" stroke-width="1.3"/>
  <circle cx="60" cy="90" r="25" stroke="#8B5CF6" stroke-width="1.5" stroke-dasharray="4 2" fill="none" opacity="0.4"/>
  <text x="60" y="156" text-anchor="middle" fill="#8B5CF6" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">OBJECT</text>
</svg>`;

const STAY_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="stay_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Hand pushing down -->
  <g transform="rotate(180 60 80)">
    <path d="M 37 128 Q 33 115 34 103 Q 35 95 41 91 L 45 90 L 56 88 L 67 90 L 75 91 Q 82 96 84 104 Q 86 116 83 128 Z" fill="url(#stay_palm)" stroke="#3B82F6" stroke-width="1.3"/>
    <path d="M 41 92 C 40 72 41 52 43 36 Q 45.5 30 48 36 C 50 52 51 72 49 92 Z" fill="url(#stay_palm)" stroke="#3B82F6" stroke-width="1.3"/>
    <path d="M 52 91 C 51 70 51.5 47 53.5 29 Q 56 22 58.5 29 C 60.5 47 61 70 60 91 Z" fill="url(#stay_palm)" stroke="#3B82F6" stroke-width="1.3"/>
    <path d="M 62 92 C 62 73 62.5 55 64.2 37 Q 66.5 31 69 37 C 70.5 55 71 73 71 92 Z" fill="url(#stay_palm)" stroke="#3B82F6" stroke-width="1.3"/>
    <path d="M 73 94 C 73 77 73.5 62 75 49 Q 76.8 43 79 49 C 80.5 62 81 77 80 94 Z" fill="url(#stay_palm)" stroke="#3B82F6" stroke-width="1.3"/>
  </g>
  <line x1="30" y1="130" x2="90" y2="130" stroke="#3B82F6" stroke-width="2" opacity="0.6"/>
  <line x1="40" y1="138" x2="80" y2="138" stroke="#3B82F6" stroke-width="2" opacity="0.4"/>
  <text x="60" y="156" text-anchor="middle" fill="#3B82F6" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">STAY</text>
</svg>`;

const SAME_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="same_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#EAB308" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#EAB308" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Y handshape moving side to side -->
  <path d="M 33 128 Q 29 115 31 103 Q 32 95 38 91 L 43 90 L 55 88 L 67 90 L 76 92 Q 84 97 86 105 Q 88 117 85 128 Z" fill="url(#same_palm)" stroke="#EAB308" stroke-width="1.3"/>
  <!-- Thumb extended -->
  <path d="M 33 110 Q 21 105 12 92 Q 7 81 12 74 Q 17 68 24 74 Q 29 83 31 97 Q 32 104 33 110 Z" fill="url(#same_palm)" stroke="#EAB308" stroke-width="1.3"/>
  <!-- Pinky extended -->
  <path d="M 74 95 C 74 77 74.5 61 76.5 48 Q 78.5 42 81 48 C 82.5 61 83 77 82 95 Z" fill="url(#same_palm)" stroke="#EAB308" stroke-width="1.3"/>
  <!-- Arrow left and right -->
  <path d="M 20 40 L 100 40" stroke="#EAB308" stroke-width="1.5" stroke-dasharray="3 3"/>
  <polygon points="20,40 25,35 25,45" fill="#EAB308"/>
  <polygon points="100,40 95,35 95,45" fill="#EAB308"/>
  <text x="60" y="156" text-anchor="middle" fill="#EAB308" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">SAME</text>
</svg>`;

const UNTIL_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="until_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#14B8A6" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#14B8A6" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Index finger extended, moving in an arc forward -->
  <path d="M 33 128 Q 29 115 31 103 Q 32 95 38 91 L 43 90 L 55 88 L 67 90 L 76 92 Q 84 97 86 105 Q 88 117 85 128 Z" fill="url(#until_palm)" stroke="#14B8A6" stroke-width="1.3"/>
  <!-- Index extended -->
  <path d="M 40 92 C 39 71 40 52 42 36 Q 44.5 30 47 36 C 49 52 50 71 48 92 Z" fill="url(#until_palm)" stroke="#14B8A6" stroke-width="1.3"/>
  <!-- Arc path -->
  <path d="M 55 30 Q 80 30 90 60" fill="none" stroke="#14B8A6" stroke-width="1.5" stroke-dasharray="3 3"/>
  <polygon points="90,60 85,53 95,55" fill="#14B8A6"/>
  <text x="60" y="156" text-anchor="middle" fill="#14B8A6" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">UNTIL</text>
</svg>`;

const PUSH_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="push_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#EF4444" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#EF4444" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Hand pushing forward -->
  <g transform="scale(0.9) translate(5 10)">
    <path d="M 37 128 Q 33 115 34 103 Q 35 95 41 91 L 45 90 L 56 88 L 67 90 L 75 91 Q 82 96 84 104 Q 86 116 83 128 Z" fill="url(#push_palm)" stroke="#EF4444" stroke-width="1.3"/>
    <path d="M 41 92 C 40 72 41 52 43 36 Q 45.5 30 48 36 C 50 52 51 72 49 92 Z" fill="url(#push_palm)" stroke="#EF4444" stroke-width="1.3"/>
    <path d="M 52 91 C 51 70 51.5 47 53.5 29 Q 56 22 58.5 29 C 60.5 47 61 70 60 91 Z" fill="url(#push_palm)" stroke="#EF4444" stroke-width="1.3"/>
    <path d="M 62 92 C 62 73 62.5 55 64.2 37 Q 66.5 31 69 37 C 70.5 55 71 73 71 92 Z" fill="url(#push_palm)" stroke="#EF4444" stroke-width="1.3"/>
    <path d="M 73 94 C 73 77 73.5 62 75 49 Q 76.8 43 79 49 C 80.5 62 81 77 80 94 Z" fill="url(#push_palm)" stroke="#EF4444" stroke-width="1.3"/>
  </g>
  <!-- Push lines -->
  <path d="M 20 70 Q 20 40 40 20" fill="none" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="3 3"/>
  <path d="M 100 70 Q 100 40 80 20" fill="none" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="3 3"/>
  <text x="60" y="156" text-anchor="middle" fill="#EF4444" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">PUSH</text>
</svg>`;

const CHANGES_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="change_fist" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#F97316" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#F97316" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Two X-hands twisting -->
  <path d="M 34 126 Q 31 115 32 103 Q 33 94 38 89 Q 43 85 50 84 L 60 83 L 70 84 Q 77 86 81 92 Q 85 100 85 112 Q 85 122 82 128 Q 60 134 38 130 Q 35 128 34 126 Z"
    fill="url(#change_fist)" stroke="#F97316" stroke-width="1.3"/>
  <path d="M 40 92 C 39 80 39 70 45 70 C 50 70 50 80 48 92 Z" fill="url(#change_fist)" stroke="#F97316" stroke-width="1.3"/> <!-- Crooked index -->
  <!-- Exchange arrows -->
  <path d="M 20 60 Q 60 20 100 60" fill="none" stroke="#F97316" stroke-width="1.5" stroke-dasharray="3 3"/>
  <polygon points="100,60 95,55 105,55" fill="#F97316"/>
  <path d="M 100 80 Q 60 120 20 80" fill="none" stroke="#F97316" stroke-width="1.5" stroke-dasharray="3 3"/>
  <polygon points="20,80 25,85 15,85" fill="#F97316"/>
  <text x="60" y="156" text-anchor="middle" fill="#F97316" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">CHANGES</text>
</svg>`;

const DOWN_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="down_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <g transform="rotate(180 60 80)">
    <!-- Palm -->
    <path d="M 37 128 Q 33 115 34 103 Q 35 95 41 91 L 45 90 L 56 88 L 67 90 L 75 91 Q 82 96 84 104 Q 86 116 83 128 Z" fill="url(#down_palm)" stroke="#3B82F6" stroke-width="1.3"/>
    <!-- Index extended -->
    <path d="M 40 92 C 39 71 40 52 42 36 Q 44.5 30 47 36 C 49 52 50 71 48 92 Z" fill="url(#down_palm)" stroke="#3B82F6" stroke-width="1.3"/>
    <!-- Folded fingers -->
    <path d="M 52 91 C 51 81 53 76 55.5 74 Q 58 72 60.5 74 C 62 76 62 82 62 92 Z" fill="url(#down_palm)" stroke="#3B82F6" stroke-width="1.3"/>
    <path d="M 63 93 C 63 82 65 77 67.5 75 Q 69.5 73 71.5 75 C 73 77 73 83 72 93 Z" fill="url(#down_palm)" stroke="#3B82F6" stroke-width="1.3"/>
    <path d="M 74 95 C 74 85 75 80 77.5 78 Q 79.5 76 81.5 78 C 83 80 83 86 82 95 Z" fill="url(#down_palm)" stroke="#3B82F6" stroke-width="1.3"/>
  </g>
  <path d="M 60 100 L 60 130" stroke="#3B82F6" stroke-width="1.5" stroke-dasharray="3 3"/>
  <polygon points="60,135 55,125 65,125" fill="#3B82F6"/>
  <text x="60" y="156" text-anchor="middle" fill="#3B82F6" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">DOWN</text>
</svg>`;

const THANK_YOU_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ty_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#14B8A6" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#14B8A6" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Hand moving forward from chin -->
  <path d="M 37 128 Q 33 115 34 103 Q 35 95 41 91 L 45 90 L 56 88 L 67 90 L 75 91 Q 82 96 84 104 Q 86 116 83 128 Z" fill="url(#ty_palm)" stroke="#14B8A6" stroke-width="1.3"/>
  <path d="M 41 92 C 40 72 41 52 43 36 Q 45.5 30 48 36 C 50 52 51 72 49 92 Z" fill="url(#ty_palm)" stroke="#14B8A6" stroke-width="1.3"/>
  <path d="M 52 91 C 51 70 51.5 47 53.5 29 Q 56 22 58.5 29 C 60.5 47 61 70 60 91 Z" fill="url(#ty_palm)" stroke="#14B8A6" stroke-width="1.3"/>
  <path d="M 62 92 C 62 73 62.5 55 64.2 37 Q 66.5 31 69 37 C 70.5 55 71 73 71 92 Z" fill="url(#ty_palm)" stroke="#14B8A6" stroke-width="1.3"/>
  <!-- Motion arc -->
  <path d="M 40 100 Q 60 60 80 40" stroke="#14B8A6" stroke-width="1.5" stroke-dasharray="3 3"/>
  <polygon points="80,40 72,38 78,48" fill="#14B8A6"/>
  <text x="60" y="156" text-anchor="middle" fill="#14B8A6" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">THANK YOU</text>
</svg>`;

const PLEASE_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="plz_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Circular motion arc for rubbing chest -->
  <ellipse cx="60" cy="80" rx="35" ry="35" fill="none" stroke="#3B82F6" stroke-width="1.4" stroke-dasharray="5 3" opacity="0.5"/>
  <polygon points="25,80 20,90 30,90" fill="#3B82F6" opacity="0.5"/>
  <!-- Hand -->
  <path d="M 37 128 Q 33 115 34 103 Q 35 95 41 91 L 45 90 L 56 88 L 67 90 L 75 91 Q 82 96 84 104 Q 86 116 83 128 Z" fill="url(#plz_palm)" stroke="#3B82F6" stroke-width="1.3"/>
  <path d="M 41 92 C 40 72 41 52 43 36 Q 45.5 30 48 36 C 50 52 51 72 49 92 Z" fill="url(#plz_palm)" stroke="#3B82F6" stroke-width="1.3"/>
  <path d="M 52 91 C 51 70 51.5 47 53.5 29 Q 56 22 58.5 29 C 60.5 47 61 70 60 91 Z" fill="url(#plz_palm)" stroke="#3B82F6" stroke-width="1.3"/>
  <path d="M 62 92 C 62 73 62.5 55 64.2 37 Q 66.5 31 69 37 C 70.5 55 71 73 71 92 Z" fill="url(#plz_palm)" stroke="#3B82F6" stroke-width="1.3"/>
  <text x="60" y="156" text-anchor="middle" fill="#3B82F6" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">PLEASE</text>
</svg>`;

const YES_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="yes_fist" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#10B981" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Fist bobbing up and down -->
  <path d="M 34 126 Q 31 115 32 103 Q 33 94 38 89 Q 43 85 50 84 L 60 83 L 70 84 Q 77 86 81 92 Q 85 100 85 112 Q 85 122 82 128 Q 60 134 38 130 Z" fill="url(#yes_fist)" stroke="#10B981" stroke-width="1.3"/>
  <path d="M 85 80 L 85 100 M 80 95 L 85 100 L 90 95" stroke="#10B981" stroke-width="1.5" stroke-dasharray="2 2" fill="none"/>
  <path d="M 85 60 L 85 40 M 80 45 L 85 40 L 90 45" stroke="#10B981" stroke-width="1.5" stroke-dasharray="2 2" fill="none"/>
  <text x="60" y="156" text-anchor="middle" fill="#10B981" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">YES</text>
</svg>`;

const NO_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="no_hand" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#EF4444" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#EF4444" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Two fingers tapping thumb -->
  <path d="M 37 128 Q 33 115 34 103 Q 35 95 41 91 L 45 90 L 56 88 L 67 90 L 75 91 Q 82 96 84 104 Q 86 116 83 128 Z" fill="url(#no_hand)" stroke="#EF4444" stroke-width="1.3"/>
  <path d="M 40 92 Q 50 70 30 70 Q 20 80 37 100" fill="url(#no_hand)" stroke="#EF4444" stroke-width="1.3"/>
  <path d="M 45 92 Q 55 60 35 60 Q 25 70 37 100" fill="url(#no_hand)" stroke="#EF4444" stroke-width="1.3"/>
  <!-- Pinch marks -->
  <circle cx="30" cy="70" r="5" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="2 2" fill="none"/>
  <text x="60" y="156" text-anchor="middle" fill="#EF4444" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">NO</text>
</svg>`;

const HELP_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="help_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Flat hand base -->
  <path d="M 10 110 Q 60 120 110 110" stroke="#8B5CF6" stroke-width="4" stroke-linecap="round"/>
  <!-- Thumbs up fist on top -->
  <path d="M 44 106 Q 41 95 42 83 Q 43 74 48 69 Q 53 65 60 64 L 70 63 L 80 64 Q 87 66 91 72 Q 95 80 95 92 Q 95 102 92 108 Q 70 114 48 110 Z" fill="url(#help_palm)" stroke="#8B5CF6" stroke-width="1.3"/>
  <path d="M 40 85 Q 30 70 40 40 Q 50 30 50 60" fill="url(#help_palm)" stroke="#8B5CF6" stroke-width="1.3"/>
  <path d="M 80 100 L 80 80 M 75 85 L 80 80 L 85 85" stroke="#8B5CF6" stroke-width="1.5" stroke-dasharray="2 2" fill="none"/>
  <text x="60" y="156" text-anchor="middle" fill="#8B5CF6" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">HELP</text>
</svg>`;

const EARTH_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="earth_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#10B981" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="80" r="30" stroke="#10B981" stroke-width="1.5" stroke-dasharray="4 2" fill="none" opacity="0.4"/>
  <!-- Left hand -->
  <path d="M 15 80 Q 20 60 35 50 Q 30 70 30 80 Q 30 90 35 110 Q 20 100 15 80 Z" fill="url(#earth_palm)" stroke="#10B981" stroke-width="1.3"/>
  <!-- Right hand -->
  <path d="M 105 80 Q 100 60 85 50 Q 90 70 90 80 Q 90 90 85 110 Q 100 100 105 80 Z" fill="url(#earth_palm)" stroke="#10B981" stroke-width="1.3"/>
  <text x="60" y="156" text-anchor="middle" fill="#10B981" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">EARTH</text>
</svg>`;

const PULL_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pull_fist" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#EF4444" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#EF4444" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <g transform="scale(0.9) translate(5 10)">
    <path d="M 34 126 Q 31 115 32 103 Q 33 94 38 89 Q 43 85 50 84 L 60 83 L 70 84 Q 77 86 81 92 Q 85 100 85 112 Q 85 122 82 128 Q 60 134 38 130 Q 35 128 34 126 Z" fill="url(#pull_fist)" stroke="#EF4444" stroke-width="1.3"/>
  </g>
  <path d="M 40 20 Q 20 40 20 70" fill="none" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="3 3"/>
  <polygon points="20,70 15,65 25,65" fill="#EF4444"/>
  <path d="M 80 20 Q 100 40 100 70" fill="none" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="3 3"/>
  <polygon points="100,70 95,65 105,65" fill="#EF4444"/>
  <text x="60" y="156" text-anchor="middle" fill="#EF4444" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">PULL</text>
</svg>`;

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
</svg>`;

const ABSORB_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="abs_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <path d="M 34 126 Q 31 115 32 103 Q 33 94 38 89 Q 43 85 50 84 L 60 83 L 70 84 Q 77 86 81 92 Q 85 100 85 112 Q 85 122 82 128 Q 60 134 38 130 Z" fill="url(#abs_palm)" stroke="#8B5CF6" stroke-width="1.3"/>
  <path d="M 20 60 Q 40 70 50 85" fill="none" stroke="#8B5CF6" stroke-width="1.5" stroke-dasharray="3 3"/>
  <polygon points="50,85 45,75 55,75" fill="#8B5CF6"/>
  <path d="M 100 60 Q 80 70 70 85" fill="none" stroke="#8B5CF6" stroke-width="1.5" stroke-dasharray="3 3"/>
  <polygon points="70,85 65,75 75,75" fill="#8B5CF6"/>
  <text x="60" y="156" text-anchor="middle" fill="#8B5CF6" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">ABSORB</text>
</svg>`;

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
</svg>`;

const GAS_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gas_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#A855F7" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#A855F7" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <path d="M 33 128 Q 29 115 31 103 Q 32 95 38 91 L 43 90 L 55 88 L 67 90 L 76 92 Q 84 97 86 105 Q 88 117 85 128 Z" fill="url(#gas_palm)" stroke="#A855F7" stroke-width="1.3"/>
  <path d="M 40 80 Q 45 60 60 50 Q 75 60 80 80" fill="none" stroke="#A855F7" stroke-width="1.5" stroke-dasharray="3 3"/>
  <path d="M 30 70 Q 40 40 60 30 Q 80 40 90 70" fill="none" stroke="#A855F7" stroke-width="1.5" stroke-dasharray="3 3"/>
  <text x="60" y="156" text-anchor="middle" fill="#A855F7" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">GAS</text>
</svg>`;

const MAKE_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="make_fist" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#F43F5E" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#F43F5E" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <g transform="translate(0 -15)">
    <path d="M 34 126 Q 31 115 32 103 Q 33 94 38 89 Q 43 85 50 84 L 60 83 L 70 84 Q 77 86 81 92 Q 85 100 85 112 Q 85 122 82 128 Q 60 134 38 130 Z" fill="url(#make_fist)" stroke="#F43F5E" stroke-width="1.3"/>
  </g>
  <g transform="translate(0 15)">
    <path d="M 34 126 Q 31 115 32 103 Q 33 94 38 89 Q 43 85 50 84 L 60 83 L 70 84 Q 77 86 81 92 Q 85 100 85 112 Q 85 122 82 128 Q 60 134 38 130 Z" fill="url(#make_fist)" stroke="#F43F5E" stroke-width="1.3"/>
  </g>
  <path d="M 20 80 Q 20 40 60 40" fill="none" stroke="#F43F5E" stroke-width="1.5" stroke-dasharray="3 3"/>
  <polygon points="60,40 55,35 55,45" fill="#F43F5E"/>
  <text x="60" y="156" text-anchor="middle" fill="#F43F5E" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">MAKE</text>
</svg>`;

const SUGAR_SVG = `
<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sugar_palm" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#D946EF" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#D946EF" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <path d="M 37 128 Q 33 115 34 103 Q 35 95 41 91 L 45 90 L 56 88 L 67 90 L 75 91 Q 82 96 84 104 Q 86 116 83 128 Z" fill="url(#sugar_palm)" stroke="#D946EF" stroke-width="1.3"/>
  <path d="M 41 92 C 40 72 41 52 43 36 Q 45.5 30 48 36 C 50 52 51 72 49 92 Z" fill="url(#sugar_palm)" stroke="#D946EF" stroke-width="1.3"/>
  <path d="M 52 91 C 51 70 51.5 47 53.5 29 Q 56 22 58.5 29 C 60.5 47 61 70 60 91 Z" fill="url(#sugar_palm)" stroke="#D946EF" stroke-width="1.3"/>
  <text x="60" y="156" text-anchor="middle" fill="#D946EF" font-size="10.5" font-family="monospace" font-weight="bold" opacity="0.9">SUGAR</text>
</svg>`;

// ─── SIGN DATA ─────────────────────────────────────────────────────────────────
export const ASL_SIGNS = {
  HELLO: {
    label: "Hello",
    emoji: "👋",
    description: "Open hand at forehead, fingers together, wave outward",
    svg: HELLO_SVG,
    color: "#15CFA0",
    bgColor: "rgba(21,207,160,0.07)",
  },
  "GOOD MORNING": {
    label: "Good Morning",
    emoji: "🌅",
    description: "Open hand, fingers spread, sweep forward from chin",
    svg: GOOD_MORNING_SVG,
    color: "#F59E0B",
    bgColor: "rgba(245,158,11,0.07)",
  },
  "I LOVE YOU": {
    label: "I Love You",
    emoji: "🤟",
    description: "ILY: thumb, index & pinky extended — middle & ring folded",
    svg: ILY_SVG,
    color: "#EC4899",
    bgColor: "rgba(236,72,153,0.07)",
  },
  SORRY: {
    label: "Sorry",
    emoji: "🙏",
    description: "Closed fist (A-shape), rotate in circle over chest",
    svg: SORRY_SVG,
    color: "#A78BFA",
    bgColor: "rgba(167,139,250,0.07)",
  },
  OBJECT: {
    label: "Object",
    emoji: "📦",
    description: "C-shape hands tracing the outline of a physical item",
    svg: OBJECT_SVG,
    color: "#8B5CF6",
    bgColor: "rgba(139,92,246,0.07)",
  },
  STAY: {
    label: "Stay",
    emoji: "🛑",
    description: "Flat hand facing down, pushing firmly toward the ground",
    svg: STAY_SVG,
    color: "#3B82F6",
    bgColor: "rgba(59,130,246,0.07)",
  },
  SAME: {
    label: "Same",
    emoji: "↔️",
    description: "Y-handshape (thumb & pinky) moving side to side",
    svg: SAME_SVG,
    color: "#EAB308",
    bgColor: "rgba(234,179,8,0.07)",
  },
  UNTIL: {
    label: "Until",
    emoji: "⏳",
    description: "Index finger drawing an arc forward through time",
    svg: UNTIL_SVG,
    color: "#14B8A6",
    bgColor: "rgba(20,184,166,0.07)",
  },
  PUSH: {
    label: "Push",
    emoji: "💨",
    description: "Open hands pushing forcefully forward",
    svg: PUSH_SVG,
    color: "#EF4444",
    bgColor: "rgba(239,68,68,0.07)",
  },
  CHANGES: {
    label: "Changes",
    emoji: "🔄",
    description: "Two fists with index fingers bent (X-shape) twisting",
    svg: CHANGES_SVG,
    color: "#F97316",
    bgColor: "rgba(249,115,22,0.07)",
  },
  DOWN: {
    label: "Down",
    emoji: "⬇️",
    description: "Index finger pointing downward",
    svg: DOWN_SVG,
    color: "#3B82F6",
    bgColor: "rgba(59,130,246,0.07)",
  },
  EARTH: {
    label: "Earth",
    emoji: "🌍",
    description: "Hands shaping a sphere",
    svg: EARTH_SVG,
    color: "#10B981",
    bgColor: "rgba(16,185,129,0.07)",
  },
  PULL: {
    label: "Pull",
    emoji: "🧲",
    description: "Fists pulling inward",
    svg: PULL_SVG,
    color: "#EF4444",
    bgColor: "rgba(239,68,68,0.07)",
  },
  SUNLIGHT: {
    label: "Sunlight",
    emoji: "☀️",
    description: "Hand opening to cast rays down",
    svg: SUNLIGHT_SVG,
    color: "#EAB308",
    bgColor: "rgba(234,179,8,0.07)",
  },
  ABSORB: {
    label: "Absorb",
    emoji: "🧽",
    description: "Hands squeezing inward",
    svg: ABSORB_SVG,
    color: "#8B5CF6",
    bgColor: "rgba(139,92,246,0.07)",
  },
  WATER: {
    label: "Water",
    emoji: "💧",
    description: "W handshape at the chin",
    svg: WATER_SVG,
    color: "#0EA5E9",
    bgColor: "rgba(14,165,233,0.07)",
  },
  GAS: {
    label: "Gas",
    emoji: "💨",
    description: "Hands fluttering upward",
    svg: GAS_SVG,
    color: "#A855F7",
    bgColor: "rgba(168,85,247,0.07)",
  },
  THANK_YOU: {
    label: "Thank You",
    emoji: "✨",
    description: "Flat hand moving from the chin outward",
    svg: THANK_YOU_SVG,
    color: "#10B981",
    bgColor: "rgba(16,185,129,0.07)",
  },
  NO: {
    label: "No",
    emoji: "🙅",
    description: "Index, middle, and thumb pinching together repeatedly",
    svg: NO_SVG,
    color: "#EF4444",
    bgColor: "rgba(239,68,68,0.07)",
  },
  HELP: {
    label: "Help",
    emoji: "🤝",
    description: "Thumbs-up hand resting on a flat palm moving upward together",
    svg: HELP_SVG,
    color: "#8B5CF6",
    bgColor: "rgba(139,92,246,0.07)",
  },
};

// ─── COMPONENT ─────────────────────────────────────────────────────────────────
export default function SignCard({ glossSequence = [], signSystem = "SgSL" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);

  const activeToken = glossSequence[currentIndex];
  const signData = ASL_SIGNS[activeToken?.gloss] || ASL_SIGNS["HELLO"];

  // Advance sequence with a brief fade transition
  useEffect(() => {
    if (!isPlaying || glossSequence.length === 0) return;
    const duration = activeToken?.duration || 2500;
    timerRef.current = setTimeout(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % glossSequence.length);
        setTransitioning(false);
      }, 280);
    }, duration);
    return () => clearTimeout(timerRef.current);
  }, [currentIndex, isPlaying, glossSequence]);

  const jumpTo = (idx) => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(idx);
      setIsPlaying(true);
      setTransitioning(false);
    }, 180);
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Card */}
      <div
        className="w-full rounded-2xl border relative overflow-hidden transition-all duration-500"
        style={{
          background: signData.bgColor,
          borderColor: signData.color + "30",
          boxShadow: `0 0 28px ${signData.color}18, inset 0 1px 0 ${signData.color}15`,
        }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${signData.color}07 1px, transparent 1px), linear-gradient(90deg, ${signData.color}07 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
          }}
        />

        {/* SgSL system badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-accent-mint/15 text-accent-mint border border-accent-mint/25 uppercase tracking-wider">
            {signSystem}
          </span>
        </div>

        {/* Play/Pause */}
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 flex items-center justify-center bg-black/30 border border-white/10 hover:border-white/25 text-white/40 hover:text-white/70 rounded-lg cursor-pointer transition-all text-xs"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
        </div>

        <div className="relative flex flex-col items-center py-4 px-3 gap-2">
          {/* SVG Hand Illustration */}
          <div
            className="transition-all duration-300"
            style={{
              width: 120,
              height: 160,
              opacity: transitioning ? 0 : 1,
              transform: transitioning ? "scale(0.94)" : "scale(1)",
              filter: `drop-shadow(0 0 14px ${signData.color}55)`,
            }}
            dangerouslySetInnerHTML={{ 
              __html: signData.svg
                .replace(/stroke-width="[0-9.]+"/g, 'stroke-width="2.5"')
                .replace(/opacity="[0-9.]+"/g, 'opacity="1"')
                .replace(/stop-opacity="[0-9.]+"/g, 'stop-opacity="0.7"') 
            }}
          />

          {/* Description pill */}
          <div
            className="text-center font-mono text-[11px] leading-relaxed px-3 py-2 rounded-xl w-full font-semibold"
            style={{
              color: signData.color,
              background: signData.color + "20",
              border: `1px solid ${signData.color}50`,
            }}
          >
            {signData.description}
          </div>

          {/* Emoji + label */}
          <div className="flex items-center gap-2">
            <span className="text-lg">{signData.emoji}</span>
            <span
              className="font-mono text-xs font-bold tracking-widest uppercase"
              style={{ color: signData.color }}
            >
              {signData.label}
            </span>
          </div>
        </div>
      </div>

      {/* Clickable gloss tokens */}
      {glossSequence.length > 0 && (
        <div className="w-full flex flex-wrap justify-center items-center gap-1.5">
          {glossSequence.map((token, idx) => {
            const td = ASL_SIGNS[token.gloss];
            const isActive = idx === currentIndex && isPlaying;
            return (
              <button
                key={idx}
                onClick={() => jumpTo(idx)}
                className="font-mono text-[11px] font-medium px-3.5 py-1 rounded-full transition-all duration-300 border cursor-pointer"
                style={{
                  background: isActive ? (td?.color || "#15CFA0") + "40" : "rgba(255,255,255,0.06)",
                  borderColor: isActive ? (td?.color || "#15CFA0") + "AA" : "rgba(255,255,255,0.2)",
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.7)",
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                  boxShadow: isActive ? `0 0 16px ${td?.color || "#15CFA0"}60` : "none",
                }}
              >
                {token.gloss}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
