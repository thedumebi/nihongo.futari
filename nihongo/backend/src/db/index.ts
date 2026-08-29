import { pino } from '@nihongo/shared'
import { connection } from '@nihongo/shared/db'

export default async function testDatabaseConnection() {
  try {
    await connection.query('SELECT 1')
    pino.info('✅ Connected to the database successfully')
  } catch (err) {
    pino.error({ err }, '❌ Failed to connect to the database')
    process.exit(1)
  }
}
