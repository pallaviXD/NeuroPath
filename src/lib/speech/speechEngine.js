// Speech utility engine — Text-to-Speech (TTS) and Speech-to-Text (STT) services

let activeAudio = null;
let activeUtterance = null;
let activeRecognition = null;

// Get ElevenLabs API Key and Voice ID
function getElevenLabsConfig() {
  return {
    apiKey: (import.meta.env.VITE_ELEVENLABS_API_KEY || "").trim(),
    voiceId: (import.meta.env.VITE_ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM").trim(), // Default: Rachel voice
  };
}

/**
 * Text-to-Speech (TTS): Speeds text using ElevenLabs or falls back to browser native SpeechSynthesis
 */
export async function speakText(text, onStart = null, onEnd = null, onError = null) {
  // Always stop any current speech first
  stopSpeaking();

  const { apiKey, voiceId } = getElevenLabsConfig();

  // If ElevenLabs API Key is present, try using it
  if (apiKey) {
    try {
      if (onStart) onStart();
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs TTS response error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      activeAudio = audio;

      audio.onended = () => {
        activeAudio = null;
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
        activeAudio = null;
        URL.revokeObjectURL(audioUrl);
        console.warn("[Speech Engine] ElevenLabs Audio playback error, falling back to browser TTS:", e);
        speakWithBrowser(text, onStart, onEnd, onError);
      };

      await audio.play();
      return;
    } catch (err) {
      console.warn("[Speech Engine] ElevenLabs TTS generation failed, falling back to browser TTS:", err);
      // Fall through to browser SpeechSynthesis
    }
  }

  // Fallback: Browser native SpeechSynthesis
  speakWithBrowser(text, onStart, onEnd, onError);
}

function speakWithBrowser(text, onStart, onEnd, onError) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.error("[Speech Engine] SpeechSynthesis not supported by this browser.");
    if (onError) onError("SpeechSynthesis not supported.");
    return;
  }

  try {
    // Stop speaking first
    window.speechSynthesis.cancel();

    // Clean up text slightly for better pronunciation
    const cleanText = text.replace(/[*#_`[\]]/g, ""); // Strip markdown characters

    const utterance = new SpeechSynthesisUtterance(cleanText);
    activeUtterance = utterance;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      activeUtterance = null;
      // 'interrupted' is fired when cancel() is called, which is normal and not a real error
      if (e.error !== "interrupted") {
        console.error("[Speech Engine] browser TTS error:", e);
        if (onError) onError(e.error || "Speech synthesis failed");
      }
    };

    // Pick a high quality English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Microsoft"))
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error("[Speech Engine] browser SpeechSynthesis exception:", err);
    if (onError) onError(err.message || "Synthesis exception");
  }
}

/**
 * Cancel any ongoing speech synthesis or audio playback
 */
export function stopSpeaking() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio = null;
    } catch (e) {}
  }

  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      activeUtterance = null;
    } catch (e) {}
  }
}

/**
 * Speech-to-Text (STT): Records mic input and transcribes using browser-native SpeechRecognition API
 */
export function startListening(onResult, onError = null, onEnd = null) {
  // Stop existing recognition if running
  stopListening();

  if (typeof window === "undefined") return null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("[Speech Engine] SpeechRecognition is not supported in this browser.");
    if (onError) onError("Browser does not support Speech Recognition.");
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    activeRecognition = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    recognition.onerror = (event) => {
      // Don't report 'aborted' as a bad error since we stop it programmatically
      if (event.error !== "aborted" && onError) {
        console.error("[Speech Engine] SpeechRecognition error:", event.error);
        onError(event.error);
      }
    };

    recognition.onend = () => {
      activeRecognition = null;
      if (onEnd) onEnd();
    };

    recognition.start();
    return recognition;
  } catch (err) {
    console.error("[Speech Engine] Failed to start SpeechRecognition:", err);
    if (onError) onError(err.message || "Failed to start recognition");
    return null;
  }
}

/**
 * Stop active microphone speech recognition
 */
export function stopListening() {
  if (activeRecognition) {
    try {
      activeRecognition.abort();
      activeRecognition = null;
    } catch (e) {}
  }
}
