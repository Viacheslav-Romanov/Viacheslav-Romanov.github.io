require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, OAuth2Scopes, PermissionsBitField } = require('discord.js');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",  // Allow all origins
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Enable CORS for Express with more permissive settings
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
}));

// Create Discord client with ALL necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Serve static files
app.use(express.static('.'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).send('Server error');
});

// Add invite link route
app.get('/invite', (req, res) => {
    const inviteLink = client.generateInvite({
        scopes: [OAuth2Scopes.Bot],
        permissions: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.SendMessages
        ]
    });
    res.send(`<a href="${inviteLink}">Click here to invite the bot to your server</a>`);
});

// Socket.IO connection handling with debug
io.on('connection', (socket) => {
    console.log('Socket.IO: Client connected');
    
    // Send a test message to verify client reception
    socket.emit('discord-message', {
        author: 'System',
        content: 'Socket.IO connection test message',
        timestamp: Date.now(),
        avatar: null
    });
    
    socket.on('disconnect', () => {
        console.log('Socket.IO: Client disconnected');
    });

    socket.on('error', (error) => {
        console.error('Socket.IO error:', error);
    });
});

// Discord bot setup with enhanced logging
client.once('ready', () => {
    console.log('=== Discord Bot Status ===');
    console.log('Bot is ready!');
    console.log('Logged in as:', client.user.tag);
    console.log('Connected to guilds:', client.guilds.cache.size);
    console.log('Watching channel:', process.env.DISCORD_CHANNEL_ID);
    
    // Try to fetch the channel to verify access
    const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
    if (channel) {
        console.log('Successfully found channel:', channel.name);
    } else {
        console.error('Could not find channel with ID:', process.env.DISCORD_CHANNEL_ID);
    }
});

// Listen for messages with enhanced debugging
client.on('messageCreate', async (message) => {
    console.log('Received Discord message:', {
        channelId: message.channelId,
        targetChannelId: process.env.DISCORD_CHANNEL_ID,
        author: message.author.username,
        content: message.content.substring(0, 50) + '...',
        isBot: message.author.bot
    });

    try {
        if (message.channelId === process.env.DISCORD_CHANNEL_ID) {
            console.log('Emitting message to Socket.IO clients');
            
            io.emit('discord-message', {
                author: message.author.username,
                content: message.content,
                timestamp: message.createdTimestamp,
                avatar: message.author.avatarURL()
            });
        }
    } catch (error) {
        console.error('Error handling Discord message:', error);
    }
});

// Global error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment variables loaded:', {
        DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ? 'Set' : 'Not set',
        DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID ? 'Set' : 'Not set',
        DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN ? 'Present (hidden)' : 'Not set'
    });
});

// Error handling for Discord client
client.on('error', (error) => {
    console.error('Discord client error:', error);
});

// Discord debug events
client.on('debug', (info) => {
    console.log('Discord Debug:', info);
});

client.on('warn', (info) => {
    console.warn('Discord Warning:', info);
});

// Login Discord bot with enhanced error handling
client.login(process.env.DISCORD_BOT_TOKEN)
    .then(() => {
        console.log('Successfully logged into Discord');
    })
    .catch(error => {
        console.error('Failed to log in to Discord:', error.message);
        // Check if token is malformed
        if (error.code === 'TokenInvalid') {
            console.error('The provided token appears to be invalid. Please check your .env file.');
        }
    });