import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import rootDirObj from 'app-root-path'
import * as json from '../coverage/coverage-summary.json'

const sourceName = 'README-raw.md'
const destinationName = 'README.md'
const template = /({{{)(.*?)(}}})/

export default (async function() {
  let readme = await readFile(path.join(rootDirObj.path, sourceName), 'utf8')

  let found
  while(found = readme.match(template)) {
    const [fullMatch, , fileName] = found

    const content = await readFile(path.join(rootDirObj.path, fileName), 'utf8')

    readme = readme.replace(fullMatch, content)
  }

  readme = readme.replace('[[[coverage]]]', `${json.total.lines.pct.toFixed()}`)

  await writeFile(path.join(rootDirObj.path, destinationName), readme)
})()