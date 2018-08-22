var argv = require('yargs').argv;
var ezGulp = require("./ez-gulp");

const _src = array => array.map(s => "src/"+s);

var JS_FILES = {
  tw: _src([
    "main.js",
    "look/*.js",
    "look/*.tag",

    "dungeon/const.js",
    "dungeon/templates.js",
    "dungeon/utils/index.js",
    "dungeon/utils/array2d.js",
    "dungeon/utils/rectangle.js",
    "dungeon/pieces/piece.js",
    "dungeon/pieces/room.js",
    "dungeon/pieces/corridor.js",
    "dungeon/generators/generator.js",
    "dungeon/generators/dungeon.js",
    "square/*.js",
    "room/*.js",
    "pallet.js",
    "sprite.js",
    "replay.js",

    "floor.js",
    "item/index.js",
    "item/*.js",
    "item/weapon/index.js",
    "item/weapon/*.js",

    "sprite/index.js",
    "sprite/*.js",
    "sprite/*.tag",

    "move/index.js",
    "move/*.js",
    "piece/index.js",
    "piece/projectile.js", // will eventually be its own folder
    "piece/*.js",
    "buff.js",
    "player.js",

    "board.js",
    "game.js",
    "score.js",
    "team.js",
    "levels.js",
    "pixi.tag",
    "ui.tag",
    "map-sprite.tag",
  ])
}
var LESS_FILES = {
  tw: _src(["less/base.less"]),
}

var STATIC_FILES = _src([
  'uc-tests.js',
  'data.json',
  'img/',
]);
var MUSTACHE_FILES = _src([
  'index.html',
]);
var PRODUCTION = argv._[0] == 'deploy';

var RENAMES = [
  [`src/img/tw${PRODUCTION?".png":"-dev.ico"}`,"favicon.ico"]
]

ezGulp({
  js: JS_FILES,
  less: LESS_FILES,
  static: STATIC_FILES,
  mustache: MUSTACHE_FILES,
  renames: RENAMES,
  DEST: PRODUCTION?"/var/timewalker.io/":".dist/",
  environment: PRODUCTION?"production":"development",
})
