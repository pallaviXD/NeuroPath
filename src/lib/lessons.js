import { lessonsData } from "../data/lessonsData";

const STORAGE_KEY = "neuropath_generated_lessons";
const CACHE_VERSION_KEY = "neuropath_cache_version";
const CURRENT_CACHE_VERSION = "v4"; // bump this to bust stale caches

// Auto-clear stale cache on load
(function bustStaleCache() {
  try {
    const savedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    if (savedVersion !== CURRENT_CACHE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
    }
  } catch {}
})();

export function clearLessonCache() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getGeneratedLessons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveGeneratedLesson(lesson) {
  const generated = getGeneratedLessons();
  generated[lesson.id] = { ...lesson, savedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(generated));
  return lesson;
}

export function getAllLessons() {
  return { ...lessonsData, ...getGeneratedLessons() };
}

export function getLesson(lessonId) {
  return getAllLessons()[lessonId] || null;
}

export function listLessonSummaries() {
  return Object.values(getAllLessons()).map(({ id, title, subject, generated }) => ({
    id,
    title,
    subject,
    generated: !!generated,
  }));
}
