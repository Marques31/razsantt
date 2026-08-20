export function usePrint() {
  const printResume = () => {
    window.print()
  }

  return {
    printResume
  }
}
