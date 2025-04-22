class DiscordChat {
    constructor() {
        console.log('Initializing Discord chat overlay...');
        
        // Get the server URL from the current domain or use localhost as fallback
        const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3001'
            : 'https://fb9d-2405-6587-9560-100-9c32-ab76-a297-962b.ngrok-free.app';
            
        console.log('Connecting to chat server at:', serverUrl);
        
        // Initialize Socket.IO with the dynamic server URL
        this.socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            withCredentials: true
        });
        
        this.chatContainer = document.querySelector('.chat-overlay');
        this.messagesContainer = document.querySelector('.chat-messages');
        this.toggleButton = document.querySelector('.chat-toggle');
        this.isExpanded = true;
        this.setupEventListeners();
        
        // Add connection status handlers
        this.socket.on('connect', () => {
            console.log('Connected to chat server');
            this.addSystemMessage('Connected to chat server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from chat server');
            this.addSystemMessage('Disconnected from chat server');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.addSystemMessage('Error connecting to chat server');
        });
    }

    setupEventListeners() {
        // Toggle chat visibility
        this.toggleButton.addEventListener('click', () => {
            this.isExpanded = !this.isExpanded;
            this.messagesContainer.style.display = this.isExpanded ? 'block' : 'none';
            this.toggleButton.textContent = this.isExpanded ? '▼' : '▲';
        });

        // Listen for Discord messages
        this.socket.on('discord-message', (message) => {
            console.log('Received message:', message);
            this.addMessage(message);
        });
    }

    addSystemMessage(content) {
        this.addMessage({
            author: 'System',
            content: content,
            timestamp: Date.now(),
            avatar: null
        });
    }

    addMessage({ author, content, timestamp, avatar }) {
        console.log('Adding message to chat:', { author, content });
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';

        const header = document.createElement('div');
        header.className = 'message-header';

        if (avatar) {
            const avatarImg = document.createElement('img');
            avatarImg.className = 'message-avatar';
            avatarImg.src = avatar;
            avatarImg.alt = author;
            header.appendChild(avatarImg);
        }

        const authorSpan = document.createElement('span');
        authorSpan.className = 'message-author';
        authorSpan.textContent = author;
        header.appendChild(authorSpan);

        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = new Date(timestamp).toLocaleTimeString();
        header.appendChild(timeSpan);

        const content_div = document.createElement('div');
        content_div.className = 'message-content';
        content_div.textContent = content;

        messageElement.appendChild(header);
        messageElement.appendChild(content_div);

        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialize chat
console.log('Starting Discord chat integration...');
const discordChat = new DiscordChat();