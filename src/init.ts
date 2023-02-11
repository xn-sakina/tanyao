import { getConfig } from './config'
import { logger } from './logger'

export const init = async () => {
  const config = await getConfig()
  if (config) {
    logger.info('Config already exists, not need to init')
  }
}
