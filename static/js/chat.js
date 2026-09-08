document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');
    
    console.log('Tabs found:', tabButtons.length, 'Panes found:', panes.length);
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.dataset.tab;
            console.log('Switching to', tabId);
            
            tabButtons.forEach(b => b.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            const targetPane = document.getElementById(tabId);
            if (targetPane) {
                targetPane.classList.add('active');
            } else {
                console.error('Pane not found:', tabId);
            }
        });
    });

    const msgContainer = document.getElementById('messageContainer');
    if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
    
    const msgForm = document.getElementById('messageForm');
    if (msgForm) {
        msgForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {'X-Requested-With': 'XMLHttpRequest'}
            })
            .then(r => r.json())
            .then(data => {
                const html = `<div class="message message-out">
                    <div class="message-content">${data.content}</div>
                    <div class="message-meta"><span class="message-time">${data.timestamp.slice(-5)}</span></div>
                </div>`;
                msgContainer.insertAdjacentHTML('beforeend', html);
                document.getElementById('messageInput').value = '';
                msgContainer.scrollTop = msgContainer.scrollHeight;
                
                
                if (data.id) {
                    lastMessageId = data.id;
                }
            })
            .catch(err => console.error('Error:', err));
        });
    }

    let lastMessageId = 0;

    function fetchNewMessages() {
        const chatIdInput = document.querySelector('input[name="chat_id"]');
        if (!chatIdInput) return;
        
        const chatId = chatIdInput.value;
        const url = `/api/chat/${chatId}/messages/new?last_id=${lastMessageId}`;
        
        fetch(url, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.messages && data.messages.length > 0) {
                const container = document.getElementById('messageContainer');
                if (!container) return;
                
                data.messages.forEach(msg => {
                    const isOut = (msg.sender_id == currentUserId); // currentUserId объявлена в шаблоне
                    const msgClass = isOut ? 'message-out' : 'message-in';
                    
                    const html = `
                        <div class="message ${msgClass}">
                            <div class="message-content">${msg.content}</div>
                            <div class="message-meta">
                                <span class="message-time">${msg.timestamp.slice(-5)}</span>
                            </div>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', html);
                    
                    if (msg.id > lastMessageId) lastMessageId = msg.id;
                });
                
                container.scrollTop = container.scrollHeight;
            }
        })
        .catch(err => console.error('Ошибка при получении новых сообщений:', err));
    }

    function startPolling() {
        if (window.pollInterval) clearInterval(window.pollInterval);
        const chatIdInput = document.querySelector('input[name="chat_id"]');
        if (chatIdInput) {
            const lastIdInput = document.getElementById('lastMessageId');
            if (lastIdInput) {
                lastMessageId = parseInt(lastIdInput.value, 10) || 0;
            }
            window.pollInterval = setInterval(fetchNewMessages, 3000);
        }
    }
    startPolling();

    window.addEventListener('beforeunload', function() {
        if (window.pollInterval) clearInterval(window.pollInterval);
    });
});