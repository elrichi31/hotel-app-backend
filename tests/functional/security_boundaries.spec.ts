import { test } from '@japa/runner'
import proxyAddr from 'proxy-addr'
import { http } from 'Config/app'

test('proxy trust accepts loopback and rejects external addresses', ({ assert }) => {
  const trust = http.trustProxy as ReturnType<typeof proxyAddr.compile>
  assert.isTrue(trust('127.0.0.1', 0))
  assert.isTrue(trust('::1', 0))
  assert.isFalse(trust('203.0.113.8', 0))
  assert.isFalse(trust('::ffff:203.0.113.8', 0))
  const malformedTrust = proxyAddr.compile('::ffff:10.0.0.0/8')
  assert.isFalse(malformedTrust('203.0.113.8', 0))
})

test('configuration and users require authentication', async ({ client }) => {
  for (const path of ['/configuracion', '/users', '/configuracion/reservas-libres-api-key']) {
    const response = await client.get(path)
    response.assertStatus(401)
  }
})
