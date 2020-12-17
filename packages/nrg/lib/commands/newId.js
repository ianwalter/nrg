import { nanoid } from 'nanoid'
import { chalk } from '@generates/logger'

export default function newId ({ logger }) {
  logger.log('🆔', chalk.white.bold('New ID:'))
  logger.log(nanoid())
}
