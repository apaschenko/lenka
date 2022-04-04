export default function getPropertyNames(obj: object) {
  const properties = []

  do {
    for (const key of Reflect.ownKeys(obj)) {
      console.log('prop: ', `${String(key)}: ${obj[key]}`)
      console.log('ctor.name: ', obj.constructor?.name)
    }
  } while (obj = Object.getPrototypeOf(obj))
}

const a = { aaa: 1, bbb: 2 }

getPropertyNames(a)