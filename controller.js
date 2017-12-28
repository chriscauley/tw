class Controller {
  constructor(opts) {
    uR.extend(
      this,
      uR.defaults(opts,{
        code2key: {
          37: 'left',
          38: 'up',
          39: 'right',
          40: 'down',
          32: 'space',
          16: 'shift',
        },
        parent: uR.REQUIRED,
        is_keyboard: true,
      })
    )
    this.bindKeys();
  }
  bindKeys() {
    var self = this;
    var target = this.target || document;
    uR.forEach(['mouseover','mouseout','mousemove','mouseclick','mouseup','mousedown'],function(action) {
      self.parent[action] && target.addEventListener(action,(e) => self.parent[action](e));
    })
    uR.forEach(['keydown','keyup'], function(action) {
      self.parent[action] && target.addEventListener(action,function (e) {
        self.parent[action](self.code2key[e.keyCode]);
      });
    });
    var letters = 'abcdefghijklmnopqrstuvwxyz';
  }
}
