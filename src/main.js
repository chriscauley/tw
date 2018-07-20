window.tW = {
  nameFunction: function(f1,f2) {
    // transfer name from f2 to f1 via _name
    // #! TODO: this should probably be in unrest or part of a function utility library
    console.log(f1,f2);
    f1._name = f2.name || f2._name;
  },
};

uR.ready(function() {
  window.location.search == "?cheat" && uR.admin.start();
  uR.router.start();
  uR.router.default_route= function() { tW.game = new tW.Game(); };
});
