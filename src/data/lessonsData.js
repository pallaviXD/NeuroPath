import { buildLocalSignStudyFromText } from "../lib/signPoseMap";

export const lessonsData = {
  /* ═══════════════════════════════════════
     PHYSICS
  ═══════════════════════════════════════ */
  "newtons-first-law": {
    id: "newtons-first-law",
    title: "Newton's First Law (Inertia)",
    subject: "Physics",
    description: "An object at rest stays at rest, and an object in motion stays in motion, unless acted on by an unbalanced force.",
    modalities: {
      visual: {
        content: "Newton's First Law is the principle of inertia. When net force is zero, velocity does not change. A stationary object stays still. A moving object keeps moving at constant speed in a straight line.",
        wikiTopic: "Newton%27s_laws_of_motion",
        searchQuery: "Newton first law inertia diagram",
        videos: [
          { title: "Newton's First Law Explained", channel: "Khan Academy", duration: "8:42", searchQuery: "Newtons first law of motion explained" },
          { title: "Inertia Real-World Examples", channel: "Physics Girl", duration: "6:14", searchQuery: "inertia examples real world physics" }
        ]
      },
      narrative: {
        storyTitle: "The Reluctant Asteroid and the Solar Gale",
        content: "Imagine Jax, a lazy rock drifting in the deep dark of space. For four billion years, Jax did absolutely nothing — perfectly at rest.\n\nSuddenly, a roaring solar wind swept past. A solar gale struck Jax's side. Jax began to slide forward. But once the gale subsided, Jax didn't stop! With no friction in space, Jax zipped through the void forever at the exact same speed in a straight line.\n\nJax was now in motion — and without another force, he would never, ever stop. That is inertia.",
        illustration: "A glowing asteroid sailing through space with force arrows."
      },
      kinesthetic: {
        instructions: "Adjust the forces acting on the box. Watch how the net force and movement vector respond. Can you make the box accelerate, or keep it drifting at constant speed?",
        simulation: { minForce: -20, maxForce: 20, initialLeft: 10, initialRight: -10 }
      },
      sign: buildLocalSignStudyFromText(
        "An object at rest stays at rest. An object in motion stays in motion. Nothing changes until an unbalanced force pushes or pulls. Then motion changes.",
        "Inertia",
        [{ gloss: "OBJECT" }, { gloss: "STAY" }, { gloss: "SAME" }, { gloss: "UNTIL" }, { gloss: "PUSH" }, { gloss: "CHANGES" }]
      ),
    },
    microCheck: {
      question: "If you throw a ball in deep space (zero gravity, zero friction), what happens?",
      options: [
        "It gradually slows down and stops.",
        "It continues moving in a straight line at constant speed forever.",
        "It immediately drops down."
      ],
      answerIndex: 1,
      explanation: "Without an unbalanced force, inertia keeps the ball moving at the same speed in a straight line forever."
    },
    assessment: [
      { id: "q1", question: "What is inertia?", options: ["Force pulling objects to Earth.", "An object's resistance to a change in its state of motion.", "The speed at which an object travels in a vacuum."], answerIndex: 1 },
      { id: "q2", question: "A car brakes suddenly. Passengers lurch forward because:", options: ["A force pushes them forward.", "Their inertia keeps them moving as the car stops.", "The brakes exert forward force on them."], answerIndex: 1 }
    ]
  },

  /* ─── BIOLOGY ─── */
  "photosynthesis": {
    id: "photosynthesis",
    title: "Photosynthesis",
    subject: "Biology",
    description: "The process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water.",
    modalities: {
      visual: {
        content: "Photosynthesis occurs inside chloroplasts. Chlorophyll absorbs sunlight and converts CO2 and water into glucose and oxygen. The equation: 6CO2 + 6H2O + light → C6H12O6 + 6O2.",
        wikiTopic: "Photosynthesis",
        searchQuery: "photosynthesis diagram chloroplast process",
        videos: [
          { title: "Photosynthesis Explained", channel: "Khan Academy", duration: "9:15", searchQuery: "photosynthesis explained biology" },
          { title: "How Plants Make Food", channel: "CrashCourse Biology", duration: "12:03", searchQuery: "how plants make food photosynthesis crash course" }
        ]
      },
      narrative: {
        storyTitle: "Chloe the Chloroplast's Sweet Machine",
        content: "Chloe was a tiny green engine living in the leafy canopy of a great oak tree. Every morning, as the sun climbed high, Chloe would open her solar panels.\n\nShe grabbed water molecules travelling up from the roots and caught carbon dioxide drifting in through the leaf's breathing pores. Using sunlight as her stove, she cracked the water and gas apart, rearranging them into a sweet syrup called glucose.\n\nAs a waste product, she released bubbles of fresh oxygen into the forest air. 'Another delicious day,' Chloe whispered.",
        illustration: "A cartoon chloroplast baking sugar under a warm sun."
      },
      kinesthetic: {
        instructions: "Adjust sunlight intensity, CO2, and water levels to maximize glucose production rate. The reaction requires all three inputs — reducing any one limits the output.",
        simulation: { minSunlight: 0, maxSunlight: 100, minCO2: 0, maxCO2: 100, initialSunlight: 50, initialCO2: 40 }
      },
      sign: buildLocalSignStudyFromText(
        "Plants absorb sunlight. They take water and carbon dioxide. They make sugar inside chloroplasts. They release oxygen gas.",
        "Photosynthesis",
        [{ gloss: "SUNLIGHT" }, { gloss: "ABSORB" }, { gloss: "WATER" }, { gloss: "GAS" }, { gloss: "MAKE" }, { gloss: "SUGAR" }, { gloss: "RELEASE" }, { gloss: "OXYGEN" }]
      ),
    },
    microCheck: {
      question: "What are the primary inputs for photosynthesis?",
      options: ["Glucose and Oxygen", "Water, Carbon Dioxide, and Sunlight", "Soil nutrients and Oxygen"],
      answerIndex: 1,
      explanation: "Plants require water, CO2, and sunlight to synthesize glucose."
    },
    assessment: [
      { id: "q1", question: "Where does photosynthesis occur inside the plant cell?", options: ["Mitochondria", "Nucleus", "Chloroplasts"], answerIndex: 2 },
      { id: "q2", question: "What pigment absorbs light energy for photosynthesis?", options: ["Carotenoid", "Chlorophyll", "Hemoglobin"], answerIndex: 1 }
    ]
  },

  /* ─── CHEMISTRY ─── */
  "states-of-matter": {
    id: "states-of-matter",
    title: "States of Matter",
    subject: "Chemistry",
    description: "Matter exists as solid, liquid, or gas depending on the energy of its particles and the forces between them.",
    modalities: {
      visual: {
        content: "In solids, particles are tightly packed and vibrate in place. In liquids, particles can flow but remain close. In gases, particles move freely at high speed. Adding heat increases particle energy, causing phase transitions.",
        wikiTopic: "States_of_matter",
        searchQuery: "states of matter solid liquid gas particle diagram",
        videos: [
          { title: "States of Matter Explained", channel: "Khan Academy", duration: "7:30", searchQuery: "states of matter solid liquid gas explained" },
          { title: "Phase Changes Visualized", channel: "TED-Ed", duration: "5:14", searchQuery: "phase changes matter chemistry animation" }
        ]
      },
      narrative: {
        storyTitle: "The Three Lives of Water",
        content: "Meet Wren — a water molecule living in the Arctic. For millennia, Wren stayed perfectly still, locked in a crystal lattice with billions of friends. This was ice — rigid, orderly, solid.\n\nThen the sun rose. Wren absorbed heat energy and started vibrating faster and faster until the bonds snapped. Suddenly free, Wren and her friends swirled around each other — still close, but flowing. This was water — liquid, flexible.\n\nOn a hot summer day, Wren absorbed so much energy she escaped entirely, rocketing away as water vapor — a gas — soaring upward to form clouds.",
        illustration: "A water molecule transforming through solid, liquid, and gas phases."
      },
      kinesthetic: {
        instructions: "Adjust the temperature slider to observe how particle behavior changes. Watch the energy levels — when do particles break free from their bonds?",
        simulation: { minForce: 0, maxForce: 100, initialLeft: 30, initialRight: 0 }
      },
      sign: buildLocalSignStudyFromText(
        "Matter has three states. Solid particles stay in place. Liquid particles flow and move. Gas particles spread out freely. Heat makes particles move faster and change state.",
        "States of Matter",
        [{ gloss: "OBJECT" }, { gloss: "STAY" }, { gloss: "SAME" }, { gloss: "PUSH" }, { gloss: "CHANGES" }, { gloss: "MAKE" }]
      ),
    },
    microCheck: {
      question: "What happens to particles when matter changes from solid to liquid?",
      options: ["They stop moving completely.", "They gain energy and begin to flow more freely.", "They disappear and re-form as a gas."],
      answerIndex: 1,
      explanation: "Heat adds energy to particles, breaking the rigid bonds of a solid so they can flow as a liquid."
    },
    assessment: [
      { id: "q1", question: "In which state are particles most tightly packed?", options: ["Gas", "Liquid", "Solid"], answerIndex: 2 },
      { id: "q2", question: "What is the term for liquid turning into gas?", options: ["Condensation", "Evaporation", "Sublimation"], answerIndex: 1 }
    ]
  },

  /* ─── MATH ─── */
  "pythagoras-theorem": {
    id: "pythagoras-theorem",
    title: "Pythagoras' Theorem",
    subject: "Mathematics",
    description: "In a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides: a² + b² = c².",
    modalities: {
      visual: {
        content: "Pythagoras' Theorem states: a² + b² = c². The hypotenuse (c) is the longest side, always opposite the right angle. If a = 3 and b = 4, then c² = 9 + 16 = 25, so c = 5. This 3-4-5 triangle is the most famous Pythagorean triple.",
        wikiTopic: "Pythagorean_theorem",
        searchQuery: "Pythagorean theorem right triangle diagram proof",
        videos: [
          { title: "Pythagoras Theorem Explained", channel: "Khan Academy", duration: "6:08", searchQuery: "Pythagorean theorem explained simply" },
          { title: "Why a² + b² = c²?", channel: "TED-Ed", duration: "4:32", searchQuery: "why Pythagorean theorem works visual proof" }
        ]
      },
      narrative: {
        storyTitle: "The Architect's Secret Shortcut",
        content: "Ancient builders needed to create perfect right angles for their temples. They had a clever trick: a rope with exactly 12 knots tied at equal intervals.\n\nIf you formed a triangle with sides of 3 knots, 4 knots, and 5 knots — the corner opposite the 5-knot side was always a perfect right angle.\n\nYears later, a Greek philosopher named Pythagoras proved WHY this worked: multiply each side by itself, and the two shorter sides always add up to the longest one squared. 3×3 + 4×4 = 5×5. Nine plus sixteen equals twenty-five. Every time, without fail.",
        illustration: "An ancient builder using a rope triangle to create a perfect right angle."
      },
      kinesthetic: {
        instructions: "Adjust the two shorter sides of the right triangle. The calculator will show you the hypotenuse. Try to find Pythagorean triples — whole number solutions.",
        simulation: { minForce: 1, maxForce: 20, initialLeft: 3, initialRight: 4 }
      },
      sign: buildLocalSignStudyFromText(
        "A right triangle has three sides. Two short sides and one long side. Square the two short sides. Add them together. The answer equals the long side squared.",
        "Pythagoras",
        [{ gloss: "OBJECT" }, { gloss: "MAKE" }, { gloss: "SAME" }, { gloss: "CHANGES" }, { gloss: "YES" }]
      ),
    },
    microCheck: {
      question: "In a right triangle with sides 5 and 12, what is the hypotenuse?",
      options: ["13", "17", "15"],
      answerIndex: 0,
      explanation: "5² + 12² = 25 + 144 = 169 = 13². The hypotenuse is 13."
    },
    assessment: [
      { id: "q1", question: "What does 'hypotenuse' refer to?", options: ["The shortest side", "The side opposite the right angle", "Any side of the triangle"], answerIndex: 1 },
      { id: "q2", question: "A ladder 10m long rests against a wall 6m high. How far is the base from the wall?", options: ["8m", "4m", "6m"], answerIndex: 0 }
    ]
  },

  /* ─── CS ─── */
  "binary-numbers": {
    id: "binary-numbers",
    title: "Binary Numbers",
    subject: "Computer Science",
    description: "Computers use binary (base-2) numbering, where every value is expressed using only 0s and 1s.",
    modalities: {
      visual: {
        content: "Binary is base-2. Each position represents a power of 2: 1, 2, 4, 8, 16... The binary number 1011 = 8+0+2+1 = 11 in decimal. All computer data — images, text, sound — is ultimately stored as binary digits (bits).",
        wikiTopic: "Binary_number",
        searchQuery: "binary numbers decimal conversion diagram",
        videos: [
          { title: "Binary Numbers Explained", channel: "Khan Academy", duration: "8:40", searchQuery: "binary numbers explained base 2" },
          { title: "How Computers Count", channel: "CrashCourse CS", duration: "11:22", searchQuery: "how computers use binary numbers crash course" }
        ]
      },
      narrative: {
        storyTitle: "The Town of Only Two Digits",
        content: "Imagine a tiny town where all the shops only ever have two choices: OPEN or CLOSED. No 'kind of open' — either fully open (1) or fully shut (0).\n\nTo count in this town, you'd need to be creative. One shop open = 1. Two shops open = you close the first and open the second — that means 10 in binary, which is just the number 2.\n\nAdd another? Close everything and open the third shop — 100 in binary — that's the number 4. Every number humans use can be expressed through this simple on-or-off pattern. That's exactly how every computer chip in the world counts.",
        illustration: "A row of light switches representing binary digits."
      },
      kinesthetic: {
        instructions: "Toggle the binary switches below. Watch how turning each bit on or off changes the decimal value. Try to make the numbers 7, 10, and 15.",
        simulation: { minForce: 0, maxForce: 15, initialLeft: 5, initialRight: 3 }
      },
      sign: buildLocalSignStudyFromText(
        "Binary uses only two numbers: zero and one. Each position doubles in value. Computers store all information as ones and zeros.",
        "Binary",
        [{ gloss: "NO" }, { gloss: "YES" }, { gloss: "MAKE" }, { gloss: "CHANGES" }, { gloss: "SAME" }]
      ),
    },
    microCheck: {
      question: "What is the decimal value of binary 1010?",
      options: ["10", "8", "12"],
      answerIndex: 0,
      explanation: "1010 = 8+0+2+0 = 10. Each position is a power of 2 from right to left."
    },
    assessment: [
      { id: "q1", question: "How many digits does binary use?", options: ["10", "2", "8"], answerIndex: 1 },
      { id: "q2", question: "What is 5 in binary?", options: ["110", "011", "101"], answerIndex: 2 }
    ]
  },

  /* ─── BIOLOGY 2 ─── */
  "cell-structure": {
    id: "cell-structure",
    title: "Cell Structure",
    subject: "Biology",
    description: "Cells are the basic unit of life. Animal and plant cells contain organelles that each perform specific functions.",
    modalities: {
      visual: {
        content: "Every living organism is made of cells. Key organelles: Nucleus (control center, contains DNA), Mitochondria (powerhouse, produces ATP), Ribosomes (protein synthesis), Cell membrane (controls entry/exit), Chloroplasts (photosynthesis — plants only), Cell wall (structure — plants only).",
        wikiTopic: "Cell_(biology)",
        searchQuery: "animal plant cell structure diagram organelles",
        videos: [
          { title: "Cell Structure and Function", channel: "Khan Academy", duration: "14:22", searchQuery: "cell structure function organelles explained" },
          { title: "Inside the Cell", channel: "CrashCourse Biology", duration: "10:18", searchQuery: "cell organelles crash course biology" }
        ]
      },
      narrative: {
        storyTitle: "The City That Never Sleeps",
        content: "Imagine a cell as a bustling city. The nucleus is City Hall — it stores all the blueprints (DNA) and sends instructions to everyone else. The mitochondria are the power plants, burning fuel to keep the lights on.\n\nSmall factories called ribosomes read instructions from the nucleus and build proteins — the construction workers of the city. The cell membrane is the city wall: it decides what gets in and what gets out, keeping order while still allowing vital trade.\n\nPlant cells have an extra-thick outer wall and a solar farm (chloroplasts) that captures sunlight and converts it to energy. This is the city of life.",
        illustration: "A cell illustrated as a functioning city with labeled organelles."
      },
      kinesthetic: {
        instructions: "Match each organelle to its function. Drag and connect them to build a working cell model.",
        simulation: { minForce: 0, maxForce: 6, initialLeft: 3, initialRight: 3 }
      },
      sign: buildLocalSignStudyFromText(
        "Cells are the basic unit of life. The nucleus holds DNA and controls the cell. Mitochondria make energy. The membrane controls what enters and exits.",
        "Cell Structure",
        [{ gloss: "OBJECT" }, { gloss: "MAKE" }, { gloss: "HELP" }, { gloss: "STAY" }, { gloss: "RELEASE" }]
      ),
    },
    microCheck: {
      question: "Which organelle is known as the 'powerhouse of the cell'?",
      options: ["Nucleus", "Ribosome", "Mitochondria"],
      answerIndex: 2,
      explanation: "Mitochondria produce ATP (energy) through cellular respiration — hence the nickname 'powerhouse of the cell'."
    },
    assessment: [
      { id: "q1", question: "Which organelle contains the cell's DNA?", options: ["Mitochondria", "Nucleus", "Ribosome"], answerIndex: 1 },
      { id: "q2", question: "Which structure is found in plant cells but NOT animal cells?", options: ["Cell membrane", "Nucleus", "Cell wall"], answerIndex: 2 }
    ]
  },
};
