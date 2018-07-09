window.tW = {};

uR.ready(function() {
  window.location.search == "?cheat" && uR.admin.start();
  uR.router.start();
  uR.router.default_route= function() { window.game = new tW.Game(); };
});
