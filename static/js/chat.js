
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
        })
        .catch(err => console.error('Error:', err));
    });
}
});