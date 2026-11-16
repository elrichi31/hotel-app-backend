import { test } from '@japa/runner'
import { mkdtemp, writeFile, readFile, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import Drive from '@ioc:Adonis/Core/Drive'
import { File } from '@adonisjs/bodyparser/build/src/Multipart/File'
import Configuracion from 'App/Models/Configuracion'
import ConfiguracionController from 'App/Controllers/Http/ConfiguracionController'

// Real MultipartFile + local disk; only persistence is replaced to avoid a database.
test.group('Logo upload security', () => {
  test('stores hostile client filenames under a server-generated name', async ({ assert }) => {
    const originalActual = Configuracion.actual
    const folder = await mkdtemp(join(tmpdir(), 'hotel-logo-test-'))
    let logoPath: string | null = null
    try {
      const config = {
        logoPath: null,
        serialize() { return { logo_path: this.logoPath } },
        async save() { logoPath = this.logoPath },
      }
      Configuracion.actual = async () => config as unknown as Configuracion
      const file = new File({ fieldName: 'logo', clientName: '../../outside.png', headers: {} }, {}, Drive)
      file.tmpPath = join(folder, 'upload')
      const contents = Buffer.from('89504e470d0a1a0a', 'hex')
      await writeFile(file.tmpPath, contents)
      file.extname = 'png'
      file.size = contents.length
      file.state = 'consumed'
      let result: any
      const response = { json(value: any) { result = value; return value } }
      await new ConfiguracionController().update({
        request: {
          only: () => ({}),
          file: (_name: string, options: any) => {
            file.sizeLimit = options.size
            file.allowedExtensions = options.extnames
            file.validate()
            return file
          },
        }, response,
      } as any)
      assert.match(logoPath!, /^logos\/[0-9a-f-]{36}\.png$/)
      assert.equal(result.logo_url, `/uploads/${logoPath}`)
      assert.deepEqual(await readFile(file.filePath!), contents)
    } finally {
      Configuracion.actual = originalActual
      if (logoPath) await Drive.delete(logoPath)
      await rm(folder, { recursive: true, force: true })
    }
  })

  test('rejects oversized and disallowed logos without saving', async ({ assert }) => {
    const originalActual = Configuracion.actual
    try {
      let saved = false
      Configuracion.actual = async () => ({ async save() { saved = true } }) as unknown as Configuracion
      for (const [extname, size] of [['png', 3 * 1024 * 1024], ['exe', 10]] as const) {
        const file = new File({ fieldName: 'logo', clientName: `logo.${extname}`, headers: {} }, {}, Drive)
        file.extname = extname
        file.size = size
        file.state = 'consumed'
        let status = 200
        const response = { status(code: number) { status = code; return this }, json(value: any) { return value } }
        await new ConfiguracionController().update({
          request: {
            only: () => ({}),
            file: (_name: string, options: any) => {
              file.sizeLimit = options.size
              file.allowedExtensions = options.extnames
              file.validate()
              return file
            },
          }, response,
        } as any)
        assert.equal(status, 400)
      }
      assert.isFalse(saved)
    } finally {
      Configuracion.actual = originalActual
    }
  })
})
