/**
 * Adds or updates the industry detail pages without touching any other content.
 *
 *   npm run seed:industries
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../payload.config'
import { seedIndustries } from './index'

getPayload({ config })
  .then(seedIndustries)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
