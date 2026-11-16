import assert from 'node:assert'
import * as col from '../shared/colors.js'

let n = 0
function t(name, f) { f(); n++; console.log('ok  ' + name) }
function good() {
  const c = []
  for (let r = 0; r < 8; r++) c.push([0x43a857, 0x9cc24b, 0xe0c441 + r])
  return c
}

t('пустые цвета — 8 × 3 серых', () => {
  const c = col.emptyColors()
  assert.equal(c.length, 8)
  for (const row of c) assert.deepEqual(row, [0x3a3a3a, 0x3a3a3a, 0x3a3a3a])
})

t('нормальный ответ разбирается', () => {
  const r = col.parseReply({ t: 'stat', c: good(), ts: 123 })
  assert.equal(r.err, '')
  assert.equal(r.ts, 123)
  assert.deepEqual(r.colors, good())
})

t('ответ «err» от старого приложения — понятная причина про обновление', () => {
  const r = col.parseReply({ t: 'err', m: 'rejected' })
  assert.equal(r.colors, null)
  assert.ok(r.err.indexOf('5.13') >= 0)
})

t('пустой, чужой и битый ответы не принимаются', () => {
  assert.equal(col.parseReply(null).colors, null)
  assert.equal(col.parseReply({ t: 'sync', g: { n: 1, h: 0 } }).colors, null)
  const bad = good(); bad[3][1] = 'red'
  assert.equal(col.parseReply({ t: 'stat', c: bad }).colors, null)
  const short = good(); short.pop()
  assert.equal(col.parseReply({ t: 'stat', c: short }).colors, null)
  const big = good(); big[0][0] = 0x1000000
  assert.equal(col.parseReply({ t: 'stat', c: big }).colors, null)
  const neg = good(); neg[0][0] = -1
  assert.equal(col.parseReply({ t: 'stat', c: neg }).colors, null)
  const frac = good(); frac[0][0] = 1.5
  assert.equal(col.parseReply({ t: 'stat', c: frac }).colors, null)
})

t('сохранённые цвета читаются; мусор и пустота — серые', () => {
  assert.deepEqual(col.loadColors(JSON.stringify(good())), good())
  assert.deepEqual(col.loadColors(''), col.emptyColors())
  assert.deepEqual(col.loadColors('{{{'), col.emptyColors())
  assert.deepEqual(col.loadColors('[[1,2,3]]'), col.emptyColors())
})

t('сравнение наборов', () => {
  assert.equal(col.sameColors(good(), good()), true)
  const g = good(); g[7][2] = 0
  assert.equal(col.sameColors(good(), g), false)
  assert.equal(col.sameColors(null, g), false)
})

console.log(n + ' проверок пройдено')
