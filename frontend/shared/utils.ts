
export function mapToObj<K extends string | number, V>(map: Map<K, V>): Record<string, V> {
  return Object.fromEntries(
    [...map].map(([k, v]) => [String(k), v])
  );
}
