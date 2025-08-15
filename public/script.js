const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Configure marked options
marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return code;
    }
});

// Track conversation history
let messages = [];

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Add user message to chat
    appendMessage('user', userMessage);
    input.value = '';

    // Add to conversation history
    const currentMessages = [...messages, { role: 'user', content: userMessage }];
    
    // Show thinking message
    const thinkingMsg = appendMessage('bot', 'Thinking...');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: currentMessages })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.result) {
            throw new Error('No response received');
        }

        // Update thinking message with AI response
        thinkingMsg.innerHTML = marked.parse(data.result);
        
        // Update conversation history
        messages = [...currentMessages, { role: 'assistant', content: data.result }];

        // Highlight code blocks if any
        thinkingMsg.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

    } catch (error) {
        console.error('Error:', error);
        thinkingMsg.innerHTML = marked.parse('❌ Sorry, failed to get response from server.');
        // Reset conversation on error
        messages = [];
    }
});

function appendMessage(sender, text) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    
    // Format text as markdown if it's a bot message
    msg.innerHTML = sender === 'bot' ? marked.parse(text) : text;
    
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msg;
}
