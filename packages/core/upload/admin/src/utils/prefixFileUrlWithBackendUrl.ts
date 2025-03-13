export const prefixFileUrlWithBackendUrl = (fileURL?: string) => {
  return !!fileURL && fileURL.startsWith('/') ? `${window.balerion.backendURL}${fileURL}` : fileURL;
};
