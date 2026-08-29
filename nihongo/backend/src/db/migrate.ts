/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const migrationsFolder = path.resolve(__dirname, '../../../shared/src/db/migrations')

async function main() {
  console.log(`Running migrations from: ${migrationsFolder}`)
  try {
    await migrate(db, { migrationsFolder })
    console.log('Migrations applied successfully')
  } catch (err) {
    console.error('Migration failed:', err)
    process.exitCode = 1
  } finally {
    await connection.end()
  }
}

main()
