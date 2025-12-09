export interface Preset<T> {
  description: string;
  data: T;
}

export type PresetRecord<TName extends string, TData> = Record<
  TName,
  Preset<TData>
>;
