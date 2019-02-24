/*
// note, running these functions shows that x[array] could be a bottleneck
// costs about 3us more than pre-stringing the array
// this means at about 5000 checks this will slow game logic by 1/60 seconds

const a = { '1,1': 1 }

const _t = f => () => {
  let i = 1e6
  const start = new Date().valueOf()
  while (i--) {
    f()
  }
  console.log(new Date().valueOf() - start)
  console.log(a)
}

const key = [1,1]

window.f0 = _t(() => {
  a[key] += 1
})

window.f1 = _t(() => {
  a[[1,1]] += 1
})

window.f2 = _t(() => {
  a['1,1'] += 1
})
*/
