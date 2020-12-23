import { test } from '@ianwalter/bff'
import { oneLine } from 'common-tags'
import { app } from './support/defer.js'

const mockCookie = oneLine`
  koa.sid=s:dsfdss.PjOnUyhFG5bkeHsZ1UbEY7bDerxBINnZsD5MUguEph8; path=/;
  httponly
`

async function getCookie () {
  const response = await app.test('/session/get').get()
  return response.headers['set-cookie'].join(';')
}

test('Defer • GET /session/get', async t => {
  const response = await app.test('/session/get').get()
  t.expect(response.body).toMatch(/1/)
})

test('Defer • GET /session/get existing session', async t => {
  const headers = { cookie: await getCookie() }
  const response = await app.test('/session/get', { headers }).get()
  t.expect(response.body).toMatch(/2/)
})

test('Defer • GET /session/httponly', async t => {
  const headers = { cookie: await getCookie() }
  let response = await app.test('/session/httponly', { headers }).get()
  t.expect(response.body).toMatch(/httpOnly: false/)

  headers.cookie = response.headers['set-cookie'].join(';')
  t.expect(headers.cookie.indexOf('httponly')).toBe(-1)
  t.expect(headers.cookie.indexOf('expires=')).toBeGreaterThan(0)

  response = await app.test('/session/get', { headers }).get()
  t.expect(response.body).toMatch(/3/)
})

test('Defer • GET /session/httponly existing session', async t => {
  let response = await app.test('/session/httponly').get()
  const headers = { cookie: response.headers['set-cookie'].join(';') }

  response = await app.test('/session/httponly', { headers }).get()
  const cookie = response.headers['set-cookie'].join(';')
  t.expect(cookie.indexOf('httponly')).toBeGreaterThan(0)
  t.expect(cookie.indexOf('expires=')).toBeGreaterThan(0)
})

test('Defer • GET /session/nothing', async t => {
  const headers = { cookie: await getCookie() }
  const response = await app.test('/session/nothing', { headers }).get()
  t.expect(response.body).toMatch(/2/)
})

test('Defer • GET /session/notuse', async t => {
  const headers = { cookie: await getCookie() }
  const response = await app.test('/session/notuse', { headers }).get()
  t.expect(response.body).toMatch(/no session/)
})

test('Defer • GET /wrongpath', async t => {
  const headers = { cookie: await getCookie() }
  const response = await app.test('/wrongpath', { headers }).get()
  t.expect(response.body).toMatch(/no session/)
})

test('Defer • GET /session/get mock cookie', async t => {
  const headers = { cookie: mockCookie }
  let response = await app.test('/session/get', { headers }).get()
  t.expect(response.body).toMatch(/1/)

  response = await app.test('/session/get', { headers }).get()
  t.expect(response.body).toMatch(/1/)
})

test('Defer • GET /session/remove', async t => {
  const response = await app.test('/session/remove').get()
  t.expect(response.body).toMatch(/0/)
})

test('Defer • GET /session/remove existing session', async t => {
  const headers = { cookie: await getCookie() }
  let response = await app.test('/session/remove', { headers }).get()
  t.expect(response.body).toMatch(/0/)

  response = await app.test('/session/get', { headers }).get()
  t.expect(response.body).toMatch(/1/)
})

test('Defer • GET /', async t => {
  const response = await app.test('/').get()
  t.expect(response.body).toMatch(/no session/)
})

test('Defer • GET /session', async t => {
  const response = await app.test('/session').get()
  t.expect(response.body).toMatch(/has session/)
})

test('Defer • GET /session/rewrite', async t => {
  const response = await app.test('/session/rewrite').get()
  t.expect(response.body).toEqual({ foo: 'bar' })
})

// describe('test/defer.test.js', () => {
//   describe('use', () => {
//     let cookie

//     it('should regenerate existing sessions', async () => {
//       const agent = request.agent(app)
//       const res1 = await agent
//         .get('/session/get')
//         .expect(/.+/)

//       const firstId = res1.body

//       const res2 = await agent
//         .get('/session/regenerate')
//         .expect(/.+/)

//       const secondId = res2.body
//       secondId.should.not.equal(firstId)
//     })

//     it('should regenerate new sessions', () => {
//       return request(app)
//         .get('/session/regenerateWithData')
//         .expect({ /* foo: undefined, */ hasSession: true })
//     })
//   })
// })
