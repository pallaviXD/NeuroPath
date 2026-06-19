export const lessonsData = {
  "newtons-first-law": {
    id: "newtons-first-law",
    title: "Newton's First Law (Inertia)",
    subject: "Physics",
    description: "An object at rest stays at rest, and an object in motion stays in motion, unless acted on by an unbalanced force.",
    modalities: {
      visual: {
        content: "Newton's First Law describes the principle of inertia. In a balanced system, the net force is zero. This means there is no change in velocity. If an object is static, it remains static. If it is moving, it continues at constant velocity in a straight line.",
        diagram: {
          title: "Force Vector Diagram",
          description: "Hover over the forces to see their vectors. When forces cancel each other out, acceleration is zero.",
          elements: [
            { id: "box", label: "Object (Mass)", x: 50, y: 50, radius: 20 },
            { id: "forceL", label: "Left Push (F1 = 10N)", x1: 50, y1: 50, x2: 20, y2: 50, color: "#FF1D7E" },
            { id: "forceR", label: "Right Push (F2 = 10N)", x1: 50, y1: 50, x2: 80, y2: 50, color: "#15CFA0" }
          ]
        }
      },
      narrative: {
        storyTitle: "The Reluctant Asteroid and the Solar Gale",
        content: "Imagine Jax, a lazy rock drifting in the deep dark of space. For four billion years, Jax did absolutely nothing. No wind to push him, no planets nearby to pull him. Jax was perfectly content to stay at rest. 'I shall stay right here,' Jax thought. \n\nSuddenly, a roaring solar wind swept past. A solar gale (an unbalanced force) struck Jax's side. Jax began to slide forward. But once the gale subsided, Jax didn't stop! With no friction in space to hold him back, Jax zipped through the void forever at the exact same speed in a straight line. Jax was now in motion, and without another force, he would never, ever stop.",
        illustration: "A glowing purple asteroid sailing through space with force arrows."
      },
      kinesthetic: {
        instructions: "Adjust the forces acting on the box. Watch how the net force and movement vector respond. Can you make the box accelerate, or keep it drifting at a constant speed?",
        simulation: {
          minForce: -20,
          maxForce: 20,
          initialLeft: 10,
          initialRight: -10
        }
      },
      sign: {
        text: "Newton's First Law is also called the Law of Inertia. It means objects keep doing what they are doing unless a push or pull changes it.",
        gloss: [
          { gloss: "OBJECT", duration: 800 },
          { gloss: "STAY", duration: 600 },
          { gloss: "SAME", duration: 800 },
          { gloss: "UNTIL", duration: 500 },
          { gloss: "PUSH", duration: 900 },
          { gloss: "CHANGES", duration: 700 }
        ]
      }
    },
    // Inline micro-check question to trigger struggle detection on wrong answers
    microCheck: {
      question: "If you throw a ball in deep space (with zero gravity and zero friction), what will happen to the ball?",
      options: [
        "It will gradually slow down and come to a complete stop.",
        "It will continue moving in a straight line at a constant speed forever.",
        "It will immediately drop down."
      ],
      answerIndex: 1,
      explanation: "Correct! Without an unbalanced force like gravity or friction, inertia keeps the ball moving at the same speed in a straight line forever."
    },
    assessment: [
      {
        id: "q1",
        question: "What is inertia?",
        options: [
          "The force that pulls objects toward the center of the Earth.",
          "An object's resistance to a change in its state of motion.",
          "The speed at which an object travels in a vacuum."
        ],
        answerIndex: 1
      },
      {
        id: "q2",
        question: "If a moving car slams on its brakes, the passengers lurch forward because:",
        options: [
          "A force pushes them forward.",
          "Their inertia keeps them moving forward even as the car stops.",
          "The brakes exert a forward force on their bodies."
        ],
        answerIndex: 1
      }
    ]
  },
  "photosynthesis": {
    id: "photosynthesis",
    title: "Photosynthesis",
    subject: "Biology",
    description: "The process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water.",
    modalities: {
      visual: {
        content: "Photosynthesis takes place inside the chloroplasts of plant cells. Chlorophyll absorbs sunlight and drives the conversion of carbon dioxide and water into glucose and oxygen.",
        diagram: {
          title: "Chloroplast Energy Flow",
          description: "Hover over the key chemical components to trace how water and CO2 are converted into chemical energy.",
          elements: [
            { id: "light", label: "Sunlight (Energy Input)", x: 50, y: 15, color: "#FFB347" },
            { id: "water", label: "Water (H2O)", x: 20, y: 40, color: "#7B2FF7" },
            { id: "co2", label: "Carbon Dioxide (CO2)", x: 20, y: 60, color: "#FF1D7E" },
            { id: "glucose", label: "Glucose (C6H12O6)", x: 80, y: 50, color: "#15CFA0" },
            { id: "oxygen", label: "Oxygen (O2 Release)", x: 80, y: 70, color: "#A472FF" }
          ]
        }
      },
      narrative: {
        storyTitle: "Chloe the Chloroplast's Sweet Machine",
        content: "Chloe was a tiny green engine living in the leafy canopy of a great oak tree. Every morning, as the sun climbed high, Chloe would open her solar solar panels. Her job was sweet and simple: cook food for the tree.\n\nShe would grab molecules of Water ($H_2O$) travelling up from the roots, and catch Carbon Dioxide ($CO_2$) drifting in through the leaf's breathing pores. Using sunlight as her stove, she cracked the water and gas apart, rearranging them into a sweet syrup called Glucose. As a waste product, she released bubbles of fresh Oxygen ($O_2$) into the forest air. 'Another delicious day,' Chloe whispered, sending glucose down to feed the roots.",
        illustration: "A cartoon green chloroplast baking sugar cookies under a warm sun."
      },
      kinesthetic: {
        instructions: "Assemble the ingredients needed for photosynthesis. Adjust the sunlight intensity and carbon dioxide sliders to maximize glucose production rate.",
        simulation: {
          minSunlight: 0,
          maxSunlight: 100,
          minCO2: 0,
          maxCO2: 100,
          initialSunlight: 50,
          initialCO2: 40
        }
      },
      sign: {
        text: "Plants absorb light energy from the sun. They take water and gas, mix them together, make sugar food, and release oxygen gas.",
        gloss: [
          { gloss: "SUNLIGHT", duration: 900 },
          { gloss: "ABSORB", duration: 700 },
          { gloss: "WATER", duration: 500 },
          { gloss: "GAS", duration: 600 },
          { gloss: "MAKE", duration: 800 },
          { gloss: "SUGAR", duration: 600 },
          { gloss: "RELEASE", duration: 700 },
          { gloss: "OXYGEN", duration: 800 }
        ]
      }
    },
    microCheck: {
      question: "Which of the following are the primary inputs (reactants) for photosynthesis?",
      options: [
        "Glucose and Oxygen",
        "Water, Carbon Dioxide, and Sunlight",
        "Soil nutrients and Oxygen"
      ],
      answerIndex: 1,
      explanation: "Exactly! Plants require water from the soil, carbon dioxide from the air, and sunlight to synthesize energy."
    },
    assessment: [
      {
        id: "q1",
        question: "Where inside the plant cell does photosynthesis take place?",
        options: [
          "In the Mitochondria",
          "In the Nucleus",
          "In the Chloroplasts"
        ],
        answerIndex: 2
      },
      {
        id: "q2",
        question: "What green pigment absorbs light energy to power photosynthesis?",
        options: [
          "Carotenoid",
          "Chlorophyll",
          "Hemoglobin"
        ],
        answerIndex: 1
      }
    ]
  }
};
