import React, { useState } from "react";
import { BookOpen, Zap, Eye, Video, Hand, ArrowLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LessonChoice({ onChoice, preferSign = false }) {
  const [visualSelected, setVisualSelected] = useState(false);

  if (preferSign) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] p-6 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-accent-mint bg-accent-mint/10 border border-accent-mint/25 px-3 py-1 rounded-full mb-4 uppercase">
            <Sparkles size={10} /> Deaf/HoH profile detected
          </span>
          <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
            Learn through 3D sign language
          </h2>
          <p className="text-text-dim mb-8 text-sm leading-relaxed">
            NeuroPath will translate your entire syllabus into word-by-word SgSL signs.
            Watch the 3D hands — no reading required.
          </p>
          <button
            onClick={() => onChoice("visual", "sign")}
            className="w-full p-6 rounded-2xl border border-accent-mint/40 bg-accent-mint/10 hover:bg-accent-mint/15 transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent-mint/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Hand className="text-accent-mint" size={28} />
            </div>
            <h3 className="font-bold text-lg text-text-primary mb-2">Start 3D Sign Study</h3>
            <p className="text-text-dim text-sm">Full syllabus → every word signed in 3D</p>
          </button>
          <button
            onClick={() => onChoice("narrative")}
            className="mt-4 text-xs font-mono text-text-faint hover:text-text-dim underline cursor-pointer"
          >
            Or choose a different format
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
          How would you like to learn this?
        </h2>
        <p className="text-text-dim mb-8">
          Choose the explanation style that works best for you right now.
        </p>

        <AnimatePresence mode="wait">
          {visualSelected ? (
            <motion.div
              key="visual-choices"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col items-center"
            >
              <button
                onClick={() => setVisualSelected(false)}
                className="mb-6 text-sm text-text-faint hover:text-text-primary flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} /> Back to all options
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                <ChoiceCard
                  icon={<Video size={24} />}
                  title="Watch a Video"
                  description="See a curated list of relevant video tutorials and resources."
                  color="text-accent-blue"
                  bgHover="hover:bg-accent-blue/10"
                  borderHover="hover:border-accent-blue/50"
                  onClick={() => onChoice("visual", "video")}
                />
                <ChoiceCard
                  icon={<Hand size={24} />}
                  title="Sign Explanation"
                  description="See key terms translated into ASL gloss with animations."
                  color="text-accent-mint"
                  bgHover="hover:bg-accent-mint/10"
                  borderHover="hover:border-accent-mint/50"
                  onClick={() => onChoice("visual", "sign")}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="main-choices"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <ChoiceCard
                icon={<Eye size={24} />}
                title="Visual Explanation"
                description="See diagrams, watch videos, or use our interactive 3D Sign Language player."
                color="text-accent-blue"
                bgHover="hover:bg-accent-blue/10"
                borderHover="hover:border-accent-blue/50"
                onClick={() => setVisualSelected(true)}
              />
              <ChoiceCard
                icon={<BookOpen size={24} />}
                title="Story Explanation"
                description="Learn the concept through a relatable narrative analogy with characters."
                color="text-accent-pink"
                bgHover="hover:bg-accent-pink/10"
                borderHover="hover:border-accent-pink/50"
                onClick={() => onChoice("narrative")}
              />
              <ChoiceCard
                icon={<Zap size={24} />}
                title="Shorter Explanation"
                description="Just the facts. Direct, concise, and quick to read without extra fluff."
                color="text-accent-violetLight"
                bgHover="hover:bg-accent-violet/10"
                borderHover="hover:border-accent-violet/50"
                onClick={() => onChoice("shorter")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function ChoiceCard({
  icon,
  title,
  description,
  color,
  bgHover,
  borderHover,
  onClick,
  featured = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-6 bg-surface-glass border rounded-2xl text-left transition-all duration-200 cursor-pointer ${bgHover} ${borderHover} group ${
        featured ? "border-accent-mint/30 md:col-span-2" : "border-white/5"
      }`}
    >
      <div
        className={`mb-4 p-3 rounded-full bg-black/20 group-hover:scale-110 transition-transform duration-300 ${color}`}
      >
        {icon}
      </div>
      <h3 className="font-bold text-text-primary text-lg mb-2">{title}</h3>
      <p className="text-text-dim text-sm text-center">{description}</p>
    </button>
  );
}
