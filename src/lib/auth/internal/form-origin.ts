type HeaderSource = {
  get(name: string): string | null;
};

export function resolveRequestOrigin(headerList: HeaderSource): string | undefined {
  const directOrigin = headerList.get("origin") || undefined;
  if (directOrigin) {
    return directOrigin;
  }

  const forwardedHost =
    headerList.get("x-forwarded-host") || headerList.get("host");
  const forwardedProto =
    headerList.get("x-forwarded-proto") ||
    headerList.get("x-forwarded-protocol") ||
    headerList.get("x-forwarded-scheme");

  if (!forwardedHost) {
    return undefined;
  }

  return `${forwardedProto ?? "https"}://${forwardedHost}`;
}
