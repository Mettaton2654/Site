document.addEventListener('DOMContentLoaded', function() {
    function getCurrentUserId() {
        const el = document.getElementById('currentUserId');
        return el ? parseInt(el.value, 10) : 0;
    }

    function getLastMessageId() {
        const el = document.getElementById('lastMessageId');
        return el ? parseInt(el.value, 10) : 0;
    }

    function getActiveChatId() {
        const el = document.getElementById('chatId');
        return el ? parseInt(el.value, 10) : null;
    }

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
                    const lastIdField = document.getElementById('lastMessageId');
                    if (lastIdField) lastIdField.value = data.id;
                }
            })
            .catch(err => console.error('Error sending message:', err));
        });
    }

    let lastMessageId = getLastMessageId();

    function fetchNewMessages() {
        const chatId = getActiveChatId();
        if (!chatId) return;
        
        const url = `/api/chat/${chatId}/messages/new?last_id=${lastMessageId}`;
        
        fetch(url, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.messages && data.messages.length > 0) {
                const container = document.getElementById('messageContainer');
                if (!container) return;
                
                const currentUserId = getCurrentUserId();
                
                data.messages.forEach(msg => {
                    const isOut = (msg.sender_id == currentUserId);
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

                const lastIdField = document.getElementById('lastMessageId');
                if (lastIdField) lastIdField.value = lastMessageId;
            }
        })
        .catch(err => console.error('Ошибка при получении новых сообщений:', err));
    }

    function startPolling() {
        if (window.pollInterval) clearInterval(window.pollInterval);
        const chatId = getActiveChatId();
        if (chatId) {
        
            lastMessageId = getLastMessageId();
            window.pollInterval = setInterval(fetchNewMessages, 2000);
            console.log('Polling started for chat', chatId, 'lastId:', lastMessageId);
        }
    }
    startPolling();
    window.addEventListener('beforeunload', function() {
        if (window.pollInterval) clearInterval(window.pollInterval);
    });
});