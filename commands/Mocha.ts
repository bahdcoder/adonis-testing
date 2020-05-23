import Fs from 'fs'
import Path from 'path'
import Http from 'http'
import MochaRunner from 'mocha'
import Supertest from 'supertest'
import { BaseCommand } from '@adonisjs/ace'
import { Ignitor } from '@adonisjs/core/build/src/Ignitor'

export default class Mocha extends BaseCommand {
  public static commandName = 'mocha'
  public static description = ''

  public $mocha = new MochaRunner({
    
  })

  public async build () {
    return new Ignitor(Path.resolve(this.application.appRoot, '..')).ace().handle(['build']).catch(console.error)
  }

  public async migrate () {
    // run migrations
  }

  public async handle () {
    let rawServer: Http.Server | null = null
    const testDirectory = `${this.application.appRoot}/tests`

    process.env.PORT = '3445'
    process.env.NODE_ENV = 'testing'

    const serverCallback = (handler: any) => {
      rawServer = Http.createServer(handler)

      return rawServer
    }

    await this.build()
    await this.migrate()

    const apiServer = new Ignitor(this.application.appRoot).httpServer()

    await apiServer.start(serverCallback).catch(console.log)

    global.apiClient = Supertest(rawServer)

    Fs.readdirSync(testDirectory)
      .filter((file) => Path.extname(file) === '.js')
      .forEach(file => {
        this.$mocha.addFile(Path.join(testDirectory, file))
      })

    this.$mocha

    this.$mocha.run(() => {
      apiServer.close()
    })
  }
}
