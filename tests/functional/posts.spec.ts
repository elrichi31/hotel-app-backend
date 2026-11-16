import { test } from '@japa/runner'

test('removed demo posts endpoint returns not found', async ({ client }) => {
  const response = await client.get('/posts')

  response.assertStatus(404)
})
