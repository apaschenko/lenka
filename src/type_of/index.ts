function refineDescriptorAndName(str: string): {
  descriptor: string
  name?: string
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

export function typeOf(wtf: any, options: {
  nan?: boolean
  infinity?: boolean
}): {
  type: string
  name?: string
}

export function typeOf(wtf: any): {
  type: string
  name?: string
}

export function typeOf(wtf: any, options: {
  nan?: boolean
  infinity?: boolean
}): string

export function typeOf(wtf: any, options?: {
  nan?: boolean
  infinity?: boolean
}): string | { 
  type: string 
  name?: string 
} {
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
      const ctorType = toLower(ctorName) || 'number'

      if (Number.isNaN(wtf)) {
        return options?.nan ? 'nan' : ctorType
      }
    
      if (wtf === Number.NEGATIVE_INFINITY) {
        return options?.infinity ? '-infinity' : ctorType
      }
    
      if (wtf === Number.POSITIVE_INFINITY) {
        return options?.infinity ? '+infinity' : ctorType
      }

      return ctorType

    case 'function':
      const { descriptor, name } = refineDescriptorAndName(wtf.toString())

      if (descriptor === 'class') {
        return name 
      } else if (descriptor === 'function') {
        return (name[0] === name[0].toUpperCase()) ? name : 'function'
      } else {
        return name
      }

    case 'object':
      if (ctorName) {
        const instanceType = toLower(ctorName)
        return instanceType
      } else {
        return 'object'
      }

    default:
      const isInstance = descrRough?.toLowerCase() === 'object'
      return isInstance ? toLower(typeRough) : toUpper(typeRough)
  }
}
