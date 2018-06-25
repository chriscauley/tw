var argv = require('yargs').argv;
var ezGulp = require("./ez-gulp");

var JS_FILES = {
  tw: [
    "main.js",
    "look.js",

    "dungeon/const.js",
    "dungeon/templates.js",
    "dungeon/utils/index.js",
    "dungeon/utils/array2d.js",
    "dungeon/utils/random.js",
    "dungeon/utils/rectangle.js",
    "dungeon/pieces/piece.js",
    "dungeon/pieces/room.js",
    "dungeon/pieces/corridor.js",
    "dungeon/generators/generator.js",
    "dungeon/generators/dungeon.js",
    "pallet.js",
    "sprite.js",
    "square.js",

    "floor.js",
    "item/base.js",
    "item/*.js",
    "item/weapon/base.js",
    "item/weapon/*.js",

    "moves.js",
    "piece.js",
    "player.js",

    "board.js",
    "game.js",
    "score.js",
    "team.js",
    "levels.js",
    "ui.tag",
    "map-sprite.tag",
  ]
}
var LESS_FILES = {
  tw: ["less/base.less"],
}

var STATIC_FILES = [
  'data.json',
  '_sprites/',
];
var MUSTACHE_FILES = [
  'index.html',
]
var PRODUCTION = argv._[0] == 'deploy';

var RENAMES = [
  [`src/img/tw${PRODUCTION?".png":"-dev.ico"}`,"favicon.ico"]
]

ezGulp({
  js: JS_FILES,
  less: LESS_FILES,
  static: STATIC_FILES,
  renames: RENAMES,
  mustache: MUSTACHE_FILES,
  DEST: PRODUCTION?"/var/timewalker.io/":".dist/",
})
