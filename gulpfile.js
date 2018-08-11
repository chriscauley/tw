var argv = require('yargs').argv;
var ezGulp = require("./ez-gulp");

const _src = array => array.map(s => "src/"+s);

var JS_FILES = {
  tw: _src([
    "main.js",
    "look.js",

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
    "room/*.js",
    "pallet.js",
    "sprite.js",
    "square.js",
    "replay.js",

    "floor.js",
    "item/base.js",
    "item/*.js",
    "item/weapon/base.js",
    "item/weapon/*.js",

    "sprite/base.js",
    "sprite/*.js",
    "sprite/*.tag",

    "move/base.js",
    "move/*.js",
    "piece/base.js",
    "piece/projectile.js", // will eventually be its own folder
    "piece/*.js",
    "buff.js",
    "player.js",

    "board.js",
    "game.js",
    "score.js",
    "team.js",
    "levels.js",
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
