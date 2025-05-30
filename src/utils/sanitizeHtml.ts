const unescapeUnicode = (str: string): string => {
  return str.replace(/\\u[\dA-F]{4}/gi, (match) =>
    String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16)),
  );
};

const sanitizeHtml = (rawHtml: string): string => {
  const unescaped = unescapeUnicode(rawHtml);

  const parser = new DOMParser();
  const doc = parser.parseFromString(unescaped, "text/html");

  // Process special elements - quote-inline, hashtags, and mentions
  const processSpecialElements = () => {
    // Remove quote-inline spans completely
    doc.querySelectorAll(".quote-inline").forEach(el => {
      el.remove();
    });

    // Process hashtags to simple text
    doc.querySelectorAll("a.mention.hashtag").forEach(el => {
      const tagSpan = el.querySelector("span");
      if (tagSpan) {
        const hashtagText = document.createTextNode("#" + tagSpan.textContent);
        el.parentNode?.replaceChild(hashtagText, el);
      }
    });

    // Process mentions to simple text
    doc.querySelectorAll(".h-card").forEach(el => {
      const mentionElement = el.querySelector(".u-url.mention span");
      if (mentionElement) {
        const mentionText = document.createTextNode("@" + mentionElement.textContent);
        el.parentNode?.replaceChild(mentionText, el);
      }
    });
  };

  // Remove dangerous elements and attributes
  const cleanNode = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;

      // Remove dangerous tags
      if (["SCRIPT", "STYLE"].includes(el.tagName)) {
        el.remove();
        return;
      }

      // Remove event handler attributes
      Array.from(el.attributes).forEach((attr) => {
        if (/^on/i.test(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });

      // Process child nodes
      Array.from(el.childNodes).forEach(cleanNode);
    }
  };

  // First process special elements
  processSpecialElements();

  // Then clean for security
  cleanNode(doc.body);

  return doc.body.innerHTML;
};

export default sanitizeHtml;