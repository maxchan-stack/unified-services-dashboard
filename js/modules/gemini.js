import { store } from '../store.js';
import { parseMarkdown } from '../utils/helpers.js';

function renderBubble(role, text) {
  const isAi = role === 'ai';
  const parsedText = parseMarkdown(text);

  return `
    <div class="chat-bubble ${isAi ? 'ai' : 'user'}">
      <div>${parsedText}</div>
    </div>
  `;
}

export function initGemini() {
  const container = document.getElementById('gemini-container');
  if (!container) return;

  // 每次重新載入 / 開啟頁面均自動重置為全新對話 (不保留舊對話歷史)
  let history = [];
  store.set('chatHistory', []);

  container.innerHTML = `
    <div class="gemini-wrapper">
      <div id="gemini-chat-history" class="gemini-chat-history">
        <div class="chat-bubble ai">
          <div>你好！我是 Gemini AI 助手。已為您開啟全新對話，請隨時輸入問題！</div>
        </div>
      </div>

      <div class="gemini-input-bar">
        <input type="text" id="gemini-input" class="gemini-input" placeholder="輸入問題與 Gemini 對話...">
        <button id="gemini-send-btn" class="btn btn-primary"><i class="ri-send-plane-fill"></i> 發送</button>
        <button id="gemini-clear-btn" class="btn btn-ghost" title="開啟新對話"><i class="ri-refresh-line"></i> 新對話</button>
      </div>
    </div>
  `;

  const chatContainer = document.getElementById('gemini-chat-history');
  const input = document.getElementById('gemini-input');
  const sendBtn = document.getElementById('gemini-send-btn');
  const clearBtn = document.getElementById('gemini-clear-btn');

  function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  scrollToBottom();

  function startNewChat() {
    history = [];
    store.set('chatHistory', []);
    chatContainer.innerHTML = `
      <div class="chat-bubble ai">
        <div>已為您開啟全新對話，請隨時輸入問題！</div>
      </div>
    `;
    input.value = '';
    scrollToBottom();
  }

  async function handleSend(userText) {
    if (!userText) return;

    history.push({ role: 'user', text: userText });
    chatContainer.insertAdjacentHTML('beforeend', renderBubble('user', userText));
    input.value = '';
    scrollToBottom();

    const rawKey = store.get('apiKeys')?.gemini;
    const apiKey = rawKey ? rawKey.trim() : '';

    if (apiKey) {
      chatContainer.insertAdjacentHTML('beforeend', `<div class="chat-bubble ai thinking"><div>正在思考中...</div></div>`);
      scrollToBottom();

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: userText }] }] })
          }
        );

        const data = await res.json();
        const thinkingBubble = chatContainer.querySelector('.thinking');
        thinkingBubble?.remove();

        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          const aiReply = data.candidates[0].content.parts[0].text;
          history.push({ role: 'ai', text: aiReply });
          chatContainer.insertAdjacentHTML('beforeend', renderBubble('ai', aiReply));
        } else {
          const errMsg = data.error?.message || `HTTP ${res.status}：API 傳回非預期格式`;
          const errText = `⚠️ API 錯誤 (${data.error?.code || res.status}): ${errMsg}`;
          history.push({ role: 'ai', text: errText });
          chatContainer.insertAdjacentHTML('beforeend', renderBubble('ai', errText));
        }
      } catch (err) {
        const thinkingBubble = chatContainer.querySelector('.thinking');
        thinkingBubble?.remove();
        const errText = `⚠️ 網路連線失敗: ${err.message}`;
        history.push({ role: 'ai', text: errText });
        chatContainer.insertAdjacentHTML('beforeend', renderBubble('ai', errText));
      }
    } else {
      setTimeout(() => {
        let reply = '這是 Gemini 的展示模擬回應。請至左下角「偏好設定與 API」面板輸入 Gemini API Key，即可啟用真實 AI 對話。';
        history.push({ role: 'ai', text: reply });
        chatContainer.insertAdjacentHTML('beforeend', renderBubble('ai', reply));
        scrollToBottom();
      }, 600);
      return;
    }

    scrollToBottom();
  }

  sendBtn?.addEventListener('click', () => handleSend(input.value.trim()));
  clearBtn?.addEventListener('click', () => startNewChat());
  input?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend(input.value.trim());
  });
}
