import SigningAvatar from "../../components/SigningAvatar";

export class ThreeJSSignRenderer {
  constructor() {
    this.name = "3D";
  }

  async render(glossSequence, options = {}) {
    return {
      component: SigningAvatar,
      props: {
        glossSequence,
        ...options,
      }
    };
  }
}
