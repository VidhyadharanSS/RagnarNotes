declare module "jszip" {
  interface JSZipObject {
    name: string;
    dir: boolean;
    date: Date;
    comment: string;
    unixPermissions: number | null;
    dosPermissions: number | null;
    async(type: "string"): Promise<string>;
    async(type: "arraybuffer"): Promise<ArrayBuffer>;
    async(type: "uint8array"): Promise<Uint8Array>;
    async(type: "blob"): Promise<Blob>;
  }

  interface JSZip {
    file(name: string, data: string | ArrayBuffer | Uint8Array | Blob, options?: { binary?: boolean }): JSZip;
    folder(name: string): JSZip | null;
    generateAsync(options: { type: "blob" | "arraybuffer" | "uint8array" | "base64" | "string" }): Promise<Blob | ArrayBuffer | Uint8Array | string>;
    files: Record<string, JSZipObject>;
  }

  interface JSZipConstructor {
    new (): JSZip;
    (): JSZip;
  }

  const JSZip: JSZipConstructor;
  export default JSZip;
}

declare module "file-saver" {
  export function saveAs(data: Blob | string, filename?: string, opts?: { autoBom?: boolean }): void;
}
