window.tW = {};

uR.ready(function() {
  window.location.hostname == "public.tfibhodc.com" && uR.admin.start();
  uR.router.start();
  uR.router.default_route= function() { window.game = new tW.Game(); };
});
