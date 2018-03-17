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
    var actions = ['mouseover','mouseout','mousemove','mouseclick','mouseup','mousedown','mousewheel'];
    for (let action of actions) {
      this.parent[action] && target.addEventListener(action,(e) => this.parent[action](e));
    }
    uR.forEach(['keydown','keyup'], function(action) {
      self.parent[action] && target.addEventListener(action,function (e) {
        e._key = self.code2key[e.keyCode];
        self.parent[action](e);
      });
    });
    var letters = 'abcdefghijklmnopqrstuvwxyz';
  }
}
