import ADDITIONAL_JSON from './additional.json'
import { a, b, c } from './additional-import'
// import ADDITIONAL_UNSUPPORTED from './additional-unsupported.txt' // uncomment to see error

const DATA = {
  ADDITIONAL_JSON,
  'additional-import': { a, b, c }
}

export { DATA }
