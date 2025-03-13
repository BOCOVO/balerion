const prefixFileUrlWithBackendUrl = (fileURL?: string): string | undefined => {
  return !!fileURL && fileURL.startsWith('/') ? `${window.balerion.backendURL}${fileURL}` : fileURL;
};

export { prefixFileUrlWithBackendUrl };
