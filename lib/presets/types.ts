export interface Preset<T> {
  description: string;
  data: T;
}

export type PresetRecord<TName extends string, TData> = Record<
  TName,
  Preset<TData>
>;

export interface PresetWithCodeGen<T> extends Preset<T> {
  generateExampleCode: (data: T) => string;
}

export type PresetRecordWithCodeGen<TName extends string, TData> = Record<
  TName,
  PresetWithCodeGen<TData>
>;
