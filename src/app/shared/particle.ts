export class Particle {
  public style: object = {
    'position': 'fixed',
    'width': '100%',
    'height': '100%',
    'z-index': -1,
    'top': 0,
    'left': 0,
    'right': 0,
    'bottom': 0,
  };
  public params: object = {
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
  };
  public width: number = 100;
  public height: number = 100;

  public setDefaultLayout(): void {
    this.params['color'] = '#cccccc';
    this.params['particles'].line_linked.color = '#333333';
  }

  public setErrorLayout(): void {
    this.params['color'] = '#ff0000';
    this.params['particles'].line_linked.color = '#aa0000';
  }

}
