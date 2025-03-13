export {};

declare global {
  interface Window {
    balerion: {
      backendURL: string;
    };
  }
}
