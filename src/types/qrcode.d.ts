declare module 'qrcode' {
  interface QRCodeOptions {
    errorCorrectionLevel?: 'low' | 'medium' | 'quartile' | 'high' | 'L' | 'M' | 'Q' | 'H';
    type?: 'image/png' | 'image/jpeg' | 'image/webp';
    quality?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    width?: number;
    scale?: number;
  }

  function toDataURL(text: string, options?: QRCodeOptions): Promise<string>;
  function toCanvas(canvasElement: HTMLCanvasElement, text: string, options?: QRCodeOptions): Promise<HTMLCanvasElement>;
  function toString(text: string, options?: QRCodeOptions): Promise<string>;

  export { toDataURL, toCanvas, toString };
  // export default { toDataURL, toCanvas, toString };
}
