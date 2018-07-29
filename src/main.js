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
    if (data.matches && data.matches[1]) {
      try {
        const replay = Replay.objects.get(data.matches[1]);
        game_opts = replay.game_opts;
      } catch (e) {}
    }
    tW.game = new tW.Game(game_opts);
  };
  uR.router.add({
    "#Replay=(\\d+)": uR.router.default_route,
  })
});
