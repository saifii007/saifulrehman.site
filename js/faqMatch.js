/**
 * faqMatch.js
 * Shared keyword-matcher against CHAT_FAQ (data.js). Used by both the
 * chat-gate landing screen and the floating chatbot so their answers
 * and section-navigation targets stay identical.
 */
function matchFaq(userText) {
  if (typeof CHAT_FAQ === "undefined") return null;
  const text = userText.toLowerCase();
  let best = null;
  let bestScore = 0;

  CHAT_FAQ.forEach((entry) => {
    const score = entry.keywords.reduce((acc, kw) => (text.includes(kw) ? acc + 1 : acc), 0);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  });

  return best;
}
