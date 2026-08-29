import { FrontendEnvSchema } from './types/env'

const env = FrontendEnvSchema.parse(import.meta.env)
export default env
