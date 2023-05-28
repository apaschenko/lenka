function refineDescriptorAndName(str: string): {
  descriptor: string,
  name?: string,
} {
  if (!str) {
    return { descriptor: undefined, name: undefined }
  }

  let i = str[0] === '[' ? 1 : 0
  let descriptor = ''
  let name = ''

  while (str[i] !== ' ') {
    descriptor += str[i++]
  }

  i++

  while (![' ', '{', '(', '<', ']'].includes(str[i])) {
    name += str[i++]
  }

  return { descriptor, name: name || undefined }
}

const toLower = (str: string): string => `${str?.[0]?.toLowerCase()}${str?.slice(1)}`

const toUpper = (str: string): string => `${str?.[0]?.toUpperCase()}${str?.slice(1)}`

// eslint-disable-next-line sonarjs/cognitive-complexity
export function whatIsIt(wtf: any, options?: {
  nan?: boolean
  infinity?: boolean
}): string {
  if (wtf === void 0) {
    return 'undefined'
  }

  if (wtf === null) {
    return 'null'
  }

  const { descriptor: descrRough, name: typeRough } 
    = refineDescriptorAndName(Object.prototype.toString.call(wtf))

  const ctorName = wtf?.constructor?.name

  switch (typeRough.toLowerCase()) {
    case 'number':
      // eslint-disable-next-line no-case-declarations
      const ctorType = toLower(ctorName) || 'number'

      if (Number.isNaN(wtf)) {
        return options?.nan ? 'nan' : ctorType
      }
    
      if (
        // eslint-disable-next-line unicorn/prefer-number-properties
        wtf === Infinity 
        || wtf === Number.NEGATIVE_INFINITY 
        || wtf === Number.POSITIVE_INFINITY
      ) {
        return options?.infinity ? 'infinity' : ctorType
      }

      return ctorType

    case 'function':
      // eslint-disable-next-line no-case-declarations
      const { descriptor, name } = refineDescriptorAndName(wtf.toString())

      if (descriptor === 'class') {
        return name 
      } else if (descriptor === 'function') {
        return (name[0] === name[0].toUpperCase()) ? name : 'function'
      } else {
        return name
      }

    case 'object':
      return ctorName ? toLower(ctorName) : 'object';

    default:
      // eslint-disable-next-line no-case-declarations
      const isInstance = descrRough?.toLowerCase() === 'object'
      return isInstance ? toLower(typeRough) : toUpper(typeRough)
  }
}
