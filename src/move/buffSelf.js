tW.move.buffSelf = function(buff_class,direction,opts={}) {
  function out(move) {
    opts.target = this;
    const buff = new buff_class(opts);
    buff.onBuff(move,direction);
  }
  out._name = `buffSelf(${buff_class.name})`;
  return out
}