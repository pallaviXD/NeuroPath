import { create } from "zustand";
import { dbService } from "../lib/firebase";
import { initialLogs } from "../data/mockClassData";

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

  // Calculate Cognitive Profile using the exact mathematical formula
  computeCognitiveProfile: () => {
    const { hoverTime, interactionDepth, clicks } = get().telemetry;
    const isSignPreferred = get().studentProfile.deafOrHoh;

    // Explicit override if student requested sign language
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
    
    // Sum hover times
    const totalT = Object.values(hoverTime).reduce((a, b) => a + b, 0) || 1;
    
    // Performance default (no quiz checks in onboarding, so default to 1.0)
    const performance = { visual: 1.0, narrative: 1.0, kinesthetic: 1.0, sign: 1.0 };
    
    // Weights
    const w_T = 0.5; // hover time ratio
    const w_D = 0.3; // interaction depth
    const w_P = 0.2; // micro-check performance

    const scores = {};
    modalities.forEach((m) => {
      const T_m = hoverTime[m] || 0;
      const ratioT = T_m / totalT;
      const D_m = interactionDepth[m] || 0;
      const P_m = performance[m] || 1.0;
      
      // Calculate individual modality score (0.0 to 1.0)
      const rawScore = w_T * ratioT + w_D * D_m + w_P * P_m;
      scores[m] = Math.round(rawScore * 100);
    });

    // Determine primary modality
    let primary = "visual";
    let maxScore = -1;
    modalities.forEach((m) => {
      if (scores[m] > maxScore) {
        maxScore = scores[m];
        primary = m;
      }
    });

    // Calculate confidence score (relative strength of winning modality score)
    const sumScores = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    const confidence = Math.min(100, Math.round((scores[primary] / sumScores) * 300)); // normalized scale

    const profile = {
      primary,
      confidence: confidence > 0 ? confidence : 75,
      breakdown: scores,
      deafOrHoh: false
    };

    get().setStudentProfile(profile);
    return profile;
  },

  // Dashboard actions
  fetchDashboardStudents: () => {
    set({ dashboardStudents: dbService.getStudents() });
  },

  triggerStruggleIntervention: (studentId, concept, struggleType, targetModality) => {
    const students = dbService.getStudents();
    const student = students.find(s => s.id === studentId);
    
    if (student) {
      // Add intervention to student's history
      const newIntervention = {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        concept,
        type: struggleType,
        modalityOffered: targetModality,
        resolved: true
      };
      
      student.struggleHistory = [newIntervention, ...(student.struggleHistory || [])];
      
      // Update cell in heatmap matrix (e.g. index 4 or random checkpoint for demo purposes)
      const checkpointIndex = Math.floor(Math.random() * 12);
      student.checkpoints[checkpointIndex] = 2; // Fired
      
      dbService.updateStudent(student);

      // Log intervention to feed
      const logEntry = dbService.logIntervention({
        studentId: student.id,
        studentName: student.name,
        modality: targetModality,
        concept,
        type: struggleType
      });

      set((state) => {
        const dashboardLogs = [logEntry, ...state.dashboardLogs].slice(0, 50);
        return {
          dashboardStudents: dbService.getStudents(),
          dashboardLogs
        };
      });
    }
  },

  // Direct log addition (for websocket simulator)
  addLiveLog: (log) => {
    set((state) => {
      const dashboardLogs = [log, ...state.dashboardLogs].slice(0, 50);
      return { dashboardLogs };
    });
  }
}));
