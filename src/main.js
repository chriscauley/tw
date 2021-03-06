if (localStorage.getItem("VERSION") != PACKAGE.version) {
  localStorage.clear();
  console.log('reset');
  localStorage.setItem("VERSION",PACKAGE.version);
}

window.tW = {
  ANIMATION_TIME: 200,
  nameFunction: function(f1,f2) {
    // transfer name from f2 to f1 via _name
    // #! TODO: this should probably be in unrest or part of a function utility library
    console.log(f1,f2);
    f1._name = f2.name || f2._name;
  },
  getName: function(f) { return f._name || f.name },
};

uR.ready(function() {
  window.location.search == "?cheat" && uR.admin.start();
  uR.router.start();
  uR.router.default_route = function(path,data={}) {
    var game_opts;
    const replay_id = data.matches && data.matches[1]
    if (replay_id) {
      try {
        const replay = Replay.objects.get(replay_id);
        game_opts = replay.game_opts;
        game_opts.replay_id = replay.id
      } catch (e) {}
    }
    if (tW.game && tW.game.opts.replay_id == replay_id) { }
    else {
      const e = document.getElementById("game");
      while (e.firstChild) {
        e.removeChild(e.firstChild);
      }
      tW.game = new tW.Game(game_opts);
    }
    data.one && data.one.route && data.one.route();
    data.on && data.on.route && data.on.route();
  };
  uR.router.add({
    "#Replay=(\\d+)": uR.router.default_route,
  })
});
