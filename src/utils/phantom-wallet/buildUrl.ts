export const buildUrl = (path: string, params: URLSearchParams): string => {
  const isSafariOnIOS =
    /^((?!Chrome|CriOS|Edg|OPR|Firefox|UCBrowser|SamsungBrowser).)*(iPhone|iPad|iPod).*Version\/[\d.]+.*Safari/i.test(
      navigator.userAgent,
    );
  const baseUrl = `https://phantom.app/ul/v1/${path}`;
  const phantomDeepLink = `phantom://v1/${path}`;

  if (isSafariOnIOS) {
    // Safari on iOS uses the standard web URL
    const url = new URL(baseUrl);
    url.search = params.toString();
    return url.toString();
  } else {
    // Android and other browsers use phantom:// deep link
    const url = new URL(phantomDeepLink);
    url.search = params.toString();
    return url.toString();
  }
};
