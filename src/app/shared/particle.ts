export class Particle {
  public options: object = {
    style: {
      'position': 'fixed',
      'width': '100%',
      'height': '100%',
      'z-index': -1,
      'top': 0,
      'left': 0,
      'right': 0,
      'bottom': 0,
    },

    params: {
      particles: {
        number: {
          value: 200,
        },
        color: {
          value: '#cccccc'
        },
        shape: {
          type: 'circle',
        },
        line_linked: {
          enable_auto: true,
          width:1,
          opacity: 0.4,
          color: '#333333',
          distance: 150
        }
      }
    },
    width: 100,
    height: 100
  }

  public getOptions(): object {
    this.options['params'].color = '#cccccc';
    this.options['params'].particles.line_linked.color = '#333333';
    return this.options;
  }

  public getOptionsError(): object {
    this.options['params'].color = '#ff0000';
    this.options['params'].particles.line_linked.color = '#aa0000';
    return this.options;
  }

}
