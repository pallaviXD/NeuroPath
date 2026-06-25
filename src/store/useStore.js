import { create } from "zustand";
import { dbService } from "../lib/firebase";
import { initialLogs } from "../data/mockClassData";
import { emitIntervention } from "../lib/eventBus";

export const useStore = create((set, get) => ({
  // Student cognitive state
  studentProfile: dbService.getStudentProfile() || {
    primary: null, // 'visual' | 'narrative' | 'kinesthetic' | 'sign'
    confidence: 0,
    breakdown: { visual: 0, narrative: 0, kinesthetic: 0, sign: 0 },
    deafOrHoh: false,
    sessions: []
  },

  // Active lesson modality (can deviate from primary during struggle override)
  activeModality: null,

  // Telemetry logs for onboarding finger-print tracking
  telemetry: {
    hoverTime: { visual: 0, narrative: 0, kinesthetic: 0, sign: 0 },
    interactionDepth: { visual: 0, narrative: 0, kinesthetic: 0, sign: 0 },
    clicks: { visual: 0, narrative: 0, kinesthetic: 0, sign: 0 },
    lastInteraction: null
  },

  // Dashboard feeds
  dashboardStudents: dbService.getStudents(),
  dashboardLogs: dbService.getInterventionLogs().length 
    ? dbService.getInterventionLogs() 
    : initialLogs,

  // Actions
  setStudentProfile: async (profile) => {
    const updated = await dbService.saveStudentProfile(profile);
    set({ studentProfile: updated });
  },

  setDeafOrHoh: async (deafOrHoh) => {
    const profile = { ...get().studentProfile, deafOrHoh };
    if (deafOrHoh) {
      profile.primary = "sign";
      profile.confidence = 100;
      profile.breakdown = { ...profile.breakdown, sign: 100 };
    }
    await get().setStudentProfile(profile);
  },

  setActiveModality: (modality) => set({ activeModality: modality }),

  // Telemetry updates
  incrementHoverTime: (modality, amount) => {
    set((state) => {
      const hoverTime = { ...state.telemetry.hoverTime };
      hoverTime[modality] = (hoverTime[modality] || 0) + amount;
      return { telemetry: { ...state.telemetry, hoverTime } };
    });
  },

  updateInteractionDepth: (modality, depth) => {
    set((state) => {
      const interactionDepth = { ...state.telemetry.interactionDepth };
      interactionDepth[modality] = Math.max(interactionDepth[modality] || 0, depth);
      return { telemetry: { ...state.telemetry, interactionDepth } };
    });
  },

  recordClick: (modality) => {
    set((state) => {
      const clicks = { ...state.telemetry.clicks };
      clicks[modality] = (clicks[modality] || 0) + 1;
      return {
        telemetry: {
          ...state.telemetry,
          clicks,
          lastInteraction: Date.now()
        }
      };
    });
  },

  clearTelemetry: () => {
    set({
      telemetry: {
        hoverTime: { visual: 0, narrative: 0, kinesthetic: 0, sign: 0 },
        interactionDepth: { visual: 0, narrative: 0, kinesthetic: 0, sign: 0 },
        clicks: { visual: 0, narrative: 0, kinesthetic: 0, sign: 0 },
        lastInteraction: null
      }
    });
  },

  // ─── NEW: Compute Cognitive Baseline from Timed Quiz ───────────
  computeCognitiveBaseline: ({ quizResults, accessibilityFlag }) => {
    if (accessibilityFlag === "deaf") {
      const profile = {
        primary: "sign",
        confidence: 100,
        breakdown: { visual: 40, narrative: 30, kinesthetic: 50, sign: 100 },
        deafOrHoh: true,
        cognitiveStyle: "Visual / Sign Processor",
        effort: "High",
        processingSpeed: "N/A"
      };
      get().setStudentProfile(profile);
      return profile;
    }

    let totalTime = 0;
    let totalAccuracy = 0;
    let fastWrongCount = 0;

    const scores = { visual: 0, narrative: 0, kinesthetic: 0, sign: 0 };

    quizResults.forEach(r => {
      totalTime += r.timeMs;
      totalAccuracy += r.accuracy; // 0.0 to 1.0

      // Add to modality score based on accuracy
      if (r.modality && scores[r.modality] !== undefined) {
        scores[r.modality] += r.accuracy * 10;
      }

      // Check for rapid guessing (under 2 seconds and incorrect/low accuracy)
      if (r.timeMs < 2000 && r.accuracy < 0.5) {
        fastWrongCount++;
      }
    });

    const avgTime = totalTime / (quizResults.length || 1);
    const avgAccuracy = totalAccuracy / (quizResults.length || 1);

    // Determine Effort Level
    let effort = "High";
    if (fastWrongCount >= 2) effort = "Low (Random Guessing)";
    else if (fastWrongCount === 1) effort = "Medium (Rushed)";

    // Determine Processing Speed Profile
    let processingSpeed = "Average";
    if (avgTime < 4000 && avgAccuracy > 0.8) processingSpeed = "Rapid Processor";
    else if (avgTime > 10000 && avgAccuracy > 0.7) processingSpeed = "Deep Thinker";
    else if (avgTime < 4000 && avgAccuracy <= 0.8) processingSpeed = "Impulsive";

    let cognitiveStyle = "Balanced";
    if (avgAccuracy > 0.8) cognitiveStyle = "Highly Analytical";
    else if (avgAccuracy > 0.5) cognitiveStyle = "Intuitive";
    
    // Determine primary modality for legacy support
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primary = sorted[0][0] || "visual";
    
    const profile = {
      primary,
      confidence: Math.round(avgAccuracy * 100),
      breakdown: { visual: scores.visual, narrative: scores.narrative, kinesthetic: scores.kinesthetic, sign: 0 },
      deafOrHoh: false,
      cognitiveStyle,
      effort,
      processingSpeed
    };

    get().setStudentProfile(profile);
    return profile;
  },

  // Legacy hover-based compute (kept for compatibility, now unused by onboarding)
  computeCognitiveProfile: () => {
    const { hoverTime, interactionDepth } = get().telemetry;
    const isSignPreferred = get().studentProfile.deafOrHoh;

    if (isSignPreferred) {
      const profile = {
        primary: "sign",
        confidence: 100,
        breakdown: { visual: 40, narrative: 30, kinesthetic: 50, sign: 100 },
        deafOrHoh: true
      };
      get().setStudentProfile(profile);
      return profile;
    }

    const modalities = ["visual", "narrative", "kinesthetic", "sign"];
    const totalT = Object.values(hoverTime).reduce((a, b) => a + b, 0) || 1;
    const performance = { visual: 1.0, narrative: 1.0, kinesthetic: 1.0, sign: 1.0 };
    const w_T = 0.5, w_D = 0.3, w_P = 0.2;
    const scores = {};
    modalities.forEach((m) => {
      const ratioT = (hoverTime[m] || 0) / totalT;
      const D_m = interactionDepth[m] || 0;
      const P_m = performance[m] || 1.0;
      scores[m] = Math.round((w_T * ratioT + w_D * D_m + w_P * P_m) * 100);
    });

    let primary = "visual", maxScore = -1;
    modalities.forEach((m) => { if (scores[m] > maxScore) { maxScore = scores[m]; primary = m; } });
    const sumScores = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    const confidence = Math.min(100, Math.round((scores[primary] / sumScores) * 300));
    const profile = { primary, confidence: confidence > 0 ? confidence : 75, breakdown: scores, deafOrHoh: false };
    get().setStudentProfile(profile);
    return profile;
  },

  fetchDashboardStudents: () => {
    set({
      dashboardStudents: dbService.getStudents(),
      dashboardLogs: dbService.getInterventionLogs().length
        ? dbService.getInterventionLogs()
        : initialLogs
    });
  },

  triggerStruggleIntervention: (studentId, concept, struggleType, targetModality, agentMeta = {}) => {
    const students = dbService.getStudents();
    const student = students.find(s => s.id === studentId);
    if (student) {
      const newIntervention = {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        concept,
        type: struggleType,
        modalityOffered: targetModality,
        resolved: true,
        outcomeVerified: false,
        agentReasoning: agentMeta.modalityRationale || null,
        teacherNote: agentMeta.teacherNote || null,
        agentSource: agentMeta.source || "fallback",
        interventionMessage: agentMeta.interventionMessage || null,
        adaptedSnippet: agentMeta.adaptedSnippet || null,
      };
      student.struggleHistory = [newIntervention, ...(student.struggleHistory || [])];
      const checkpointIndex = Math.floor(Math.random() * 12);
      student.checkpoints[checkpointIndex] = 2;
      dbService.updateStudent(student);
      const logEntry = dbService.logIntervention({
        studentId: student.id,
        studentName: student.name,
        modality: targetModality,
        concept,
        type: struggleType,
        agentReasoning: agentMeta.modalityRationale,
        teacherNote: agentMeta.teacherNote,
        agentSource: agentMeta.source
      });
      set((state) => {
        const dashboardLogs = [logEntry, ...state.dashboardLogs].slice(0, 50);
        return { dashboardStudents: dbService.getStudents(), dashboardLogs };
      });
      emitIntervention(logEntry);
    }
  },

  addLiveLog: (log) => {
    set((state) => {
      const dashboardLogs = [log, ...state.dashboardLogs].slice(0, 50);
      return { dashboardLogs };
    });
    if (!log.simulated) {
      emitIntervention(log);
    }
  },

  confirmInterventionOutcome: (studentId, concept, outcome) => {
    const students = dbService.getStudents();
    const student = students.find((s) => s.id === studentId);
    if (!student?.struggleHistory?.length) return;

    const idx = student.struggleHistory.findIndex(
      (h) => h.concept === concept && !h.outcomeVerified
    );
    if (idx < 0) return;

    student.struggleHistory[idx] = {
      ...student.struggleHistory[idx],
      outcomeVerified: true,
      attemptsBefore: outcome.attemptsBefore,
      attemptsAfter: outcome.attemptsAfter,
      resolutionSeconds: outcome.durationSec,
    };
    dbService.updateStudent(student);
    set({ dashboardStudents: dbService.getStudents() });
  },
}));
