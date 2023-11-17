export const quotedListFromArray = function(array: readonly string[]) {
  return array.map((keyName) => { return '"' + keyName + '"' }).join(', ');
}
