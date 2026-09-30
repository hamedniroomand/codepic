function pipe(source: Blob, transform: CompressionStream | DecompressionStream): Response {
  return new Response(source.stream().pipeThrough(transform));
}

export async function deflate(text: string): Promise<Uint8Array> {
  const response = pipe(new Blob([text]), new CompressionStream('deflate-raw'));
  return new Uint8Array(await response.arrayBuffer());
}

export async function inflate(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const response = pipe(new Blob([bytes]), new DecompressionStream('deflate-raw'));
  return response.text();
}

export function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

export function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text.replaceAll('-', '+').replaceAll('_', '/'));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
