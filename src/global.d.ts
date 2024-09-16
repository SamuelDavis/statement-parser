export default {};
declare global {
  interface Array<T = any> {
    unique(cb?: (value: T, index: number, array: T[]) => boolean): Array<T>;
  }
}
