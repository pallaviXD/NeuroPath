import { IslTranslator } from "./IslTranslator";
import { SVGSignRenderer } from "./SVGSignRenderer";
import { ThreeJSSignRenderer } from "./ThreeJSSignRenderer";

class SignLanguageEngine {
  constructor() {
    this.translators = new Map();
    this.renderers = new Map();
    this.activeLanguage = "ISL";

    // Register ISL translator as default
    this.registerTranslator("ISL", new IslTranslator());

    // Register renderers
    this.registerRenderer("SVG", new SVGSignRenderer());
    this.registerRenderer("3D", new ThreeJSSignRenderer());
  }

  registerTranslator(language, translator) {
    this.translators.set(language, translator);
  }

  registerRenderer(name, renderer) {
    this.renderers.set(name, renderer);
  }

  setLanguage(language) {
    if (this.translators.has(language)) {
      this.activeLanguage = language;
    } else {
      console.warn(`Language ${language} not registered. Defaulting to ISL.`);
      this.activeLanguage = "ISL";
    }
  }

  async translate(text) {
    const translator = this.translators.get(this.activeLanguage);
    if (!translator) {
      throw new Error(`No translator registered for language ${this.activeLanguage}`);
    }
    return await translator.translate(text);
  }

  async render(glossSequence, rendererName, options = {}) {
    const renderer = this.renderers.get(rendererName);
    if (!renderer) {
      throw new Error(`Renderer ${rendererName} not registered`);
    }
    return await renderer.render(glossSequence, options);
  }

  async process(text, rendererName, options = {}) {
    const glossSequence = await this.translate(text);
    return await this.render(glossSequence, rendererName, options);
  }
}

export const signLanguageEngine = new SignLanguageEngine();
export default signLanguageEngine;
