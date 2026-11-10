import '../styles.scss'
import { bootstrap } from './bootstrap.js'
import { logger } from './utils/logger.js'

bootstrap().catch((error) => logger.error('Failed to initialize GitMap:', error))
