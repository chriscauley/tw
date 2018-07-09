(function() {
  window.DG = {};
var TOP = 0;
var RIGHT = 90;
var BOTTOM = 180;
var LEFT = 270;
DG.TOP = TOP;
DG.RIGHT = RIGHT;
DG.BOTTOM = BOTTOM;
DG.LEFT = LEFT;
DG.FACING = [TOP, RIGHT, BOTTOM, LEFT];
DG.FACING_TO_STRING = {
    [TOP]: 'top',
    [RIGHT]: 'right',
    [BOTTOM]: 'bottom',
    [LEFT]: 'left'
};
DG.FACING_TO_MOD = {
    [TOP]: [0, -1],
    [RIGHT]: [1, 0],
    [BOTTOM]: [0, 1],
    [LEFT]: [-1, 0]
};
DG.FACING_INVERSE = {
    [TOP]: BOTTOM,
    [RIGHT]: LEFT,
    [BOTTOM]: TOP,
    [LEFT]: RIGHT
};
DG.FACING_MOD_RIGHT = {
    [TOP]: RIGHT,
    [RIGHT]: BOTTOM,
    [BOTTOM]: LEFT,
    [LEFT]: TOP
};
DG.FACING_MOD_LEFT = {
    [TOP]: LEFT,
    [RIGHT]: TOP,
    [BOTTOM]: RIGHT,
    [LEFT]: BOTTOM
};
})()
