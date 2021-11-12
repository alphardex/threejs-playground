import "pannellum";

let pannellum: any;

class Panorama {
  config: Record<string, any>;
  viewer: any;
  constructor(config: Record<string, any>) {
    this.config = config;
    this.viewer = null;
  }
  init() {
    const { config } = this;
    const viewer = pannellum.viewer(config.id, config.data);
    this.viewer = viewer;
  }
}

export default Panorama;
