import { readFile, writeFile } from 'fs/promises';
import { readFileSync } from 'fs';
import path from 'path';
import rootDirObj from 'app-root-path';

import * as jsonCoverage from '../coverage/coverage-summary.json';

const sourceName = 'README-raw.md';
const destinationName = 'README.md';
const picBase = 'https://raw.githubusercontent.com/apaschenko/lenka/docs/docs';
const template = /({{{)(.*?)(}}})/;
const jsonPackage = JSON.parse(
  readFileSync(path.join(rootDirObj.path, 'package.json'), 'utf8')
);
const replaceInFiles = [[/'[./]*src'/g, "'lenka'"]];

export default (async function () {
  let readme = await readFile(path.join(rootDirObj.path, sourceName), 'utf8');

  let found;
  while ((found = readme.match(template))) {
    const [fullMatch, , fileName] = found;

    let content = await readFile(
      path.join(rootDirObj.path, fileName),
      'utf8'
    );

    for (const [pattern, result] of replaceInFiles) {
      content = content.replace(pattern, <string>result);
    }

    readme = readme.replace(fullMatch, content);
  }

  const coverage =
    typeof jsonCoverage.total.lines.pct === 'number'
      ? jsonCoverage.total.lines.pct.toFixed(1)
      : jsonCoverage.total.lines.pct;
  readme = readme
    .replace('[[[coverage]]]', `${coverage}`)
    .replace('[[[version]]]', jsonPackage.version)
    .replace(/\[{3}picURL]{3}/g, picBase);

  await writeFile(path.join(rootDirObj.path, destinationName), readme);
})();
