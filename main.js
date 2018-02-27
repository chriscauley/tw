uR.ready(function() {
  uR.admin.start();
  uR.router.start();
  uR.router.default_route= function() { window.game = new Game(); };
});
