export interface File {
  id?: string;
  name: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
