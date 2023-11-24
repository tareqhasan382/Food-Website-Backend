import mongoose from 'mongoose'
import app from './app'
import config from './config'
// import { errorlogger, logger } from './shared/logger'
import { Server } from 'http'

//=======uncaught Exception handle=======
process.on('uncaughtException', error => {
  console.log(error)
  process.exit(1)
})
let server: Server
async function main() {
  try {
    await mongoose.connect(config.database_url as string)
    console.log(`Database is connected successfully`)

    server = app.listen(config.port, () => {
      console.log(`Application Food app listening on port ${config.port}`)
    })
  } catch (error) {
    console.log('Field to connect Database', error)
  }

  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        console.log(error)
        process.exit(1)
      })
    } else {
      process.exit(1)
    }
  })
}

main()

process.on('SIGTERM', () => {
  console.log('SIGTERM is received')
  if (server) {
    server.close()
  }
})
