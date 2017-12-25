class Controller {
  constructor(opts) {
    uR.extend(
      this,
      uR.defaults(opts||{},{
        code2key: {
          37: 'left',
          38: 'up',
          39: 'right',
          40: 'down',
          32: 'space',
          16: 'shift',
        },
        game: uR.REQUIRED,
        is_keyboard: true,
      })
    )
    this.bindKeys();
  }
  bindKeys() {
    document.addEventListener("keydown",this.onKeyDown.bind(this));
    document.addEventListener("keyup",this.onKeyUp.bind(this));
    var letters = 'abcdefghijklmnopqrstuvwxyz';
  }

  onKeyDown(e) {
    this.game.board.onKeyDown(this.code2key[e.keyCode]);
  }

  onKeyUp(e) {
    this.game.board.onKeyUp(this.code2key[e.keyCode]);
  }
}
