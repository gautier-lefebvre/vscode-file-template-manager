/**
 * A version of list.filter(Boolean) for TS, since it does not statically analyze that expression.
 * (I don't know TS much though).
 */
export function compact<T>(list: Array<T | null | undefined>): Array<T> {
  const nextList: Array<T> = [];
  list.forEach((elem) => {
    if (elem) { nextList.push(elem); }
  });
  return nextList;
}
