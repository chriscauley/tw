function getFontAwesomeTable() {
  var element = document.querySelector('link[href*="font-awesome"]');
  var key_match = '.fa-([^:]+)::before';
  var value_match = 'content: ?"([^\'"]+)";';
  var rules = Array.prototype.slice.call(element.sheet.cssRules);
  var map = {};
  var icon = document.createElement("i");
  icon.className = "fa fa-heart";
  document.body.appendChild(icon);
  setTimeout(function() { document.body.removeChild(icon); },0);
  for (var i=0;i<rules.length;i++) {
    var r = rules[i];
    var keys = r.cssText.match(key_match);
    var value = r.cssText.match(value_match);
    if (!(keys && keys[1] && value && value[1])) { continue }
    for (var ki=1;ki<keys.length;ki++) { map[keys[ki]] = value[1]; }
  }
  return map;
}

var _FAT = getFontAwesomeTable();

function writeFA(ctx,key,x,y,size) {
  ctx.font = size+'px FontAwesome';
  ctx.fillText(_FAT[key],x,y);
}

/*var canvas = document.createElement('canvas');
canvas.width=400;
canvas.height = 200;
canvas.style.background = "gray";
document.body.appendChild(canvas);
var context = canvas.getContext('2d');
context.textAlign = 'center';
context.textBaseline = 'middle';
context.font = "50px sans";
context.fillText("click me",200,100);
canvas.addEventListener("click",function() {
  context.clearRect(0,0,canvas.width,canvas.height);
  context.fillStyle = "white";
  writeFA(context,'heart',50,50,50);
  context.fillStyle = "red";
  writeFA(context,'heart',50,50,40);
  context.fillStyle = "white";
  writeFA(context,'heart',150,50,50);
  context.fillStyle = "black";
  writeFA(context,'heart',150,50,40);
  context.fillStyle = "red";
  writeFA(context,'heart',150,50,20);
  context.fillStyle = "black";
  writeFA(context,'heart',250,50,40);
});*/
