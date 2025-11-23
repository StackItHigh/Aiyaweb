// Matrix rain effect
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const matrix = "NAD6900MONAD0123456789ABCDEF█▓▒░";
const matrixArray = matrix.split("");
const fontSize = 12;
const columns = canvas.width / fontSize;
const drops = [];

for(let x = 0; x < columns; x++) {
    drops[x] = 1;
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(111, 84, 255, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#6f54ff';
    ctx.font = fontSize + 'px Courier New';

    for(let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 50);

// Resize canvas on window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Chat functionality
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'nad6900'}`;
    
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${isUser ? 'U' : 'K'}</div>
        <div class="message-content">
            <p>${content}</p>
            <span class="message-time">${timeString}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message nad6900';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">K</div>
        <div class="message-content">
            <div class="typing">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function processCommand(input) {
    const command = input.toLowerCase().trim();
    
    // Handle clear command locally
    if (command === 'clear') {
        chatMessages.innerHTML = `
            <div class="message nad6900">
                <div class="message-avatar">K</div>
                <div class="message-content">
                    <p>[TERMINAL CLEARED] Ready for new wisdom.</p>
                    <span class="message-time">${new Date().toTimeString().split(' ')[0]}</span>
                </div>
            </div>
        `;
        return;
    }
    
    // Show typing indicator
    showTyping();
    
    try {
        // Send message to Claude API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: input
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hide typing indicator and show response
        hideTyping();
        addMessage(data.reply);
        
    } catch (error) {
        console.error('Error:', error);
        hideTyping();
        addMessage('Connection error. The Oracle is temporarily unavailable. Please try again.');
    }
}

function sendMessage() {
    const input = messageInput.value.trim();
    if (input) {
        addMessage(input, true);
        messageInput.value = '';
        processCommand(input);
    }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Auto-focus input
messageInput.focus();

// Live Market Data
async function fetchMarketData() {
    try {
        // Fetch crypto data from CoinGecko
        const cryptoResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
        const cryptoData = await cryptoResponse.json();

        const ticker = document.getElementById('liveTicker');
        let tickerHTML = '';

        // S&P 500 (using SPY ETF as proxy - would need stock API for real data)
        tickerHTML += '<span class="ticker-item neutral">S&P 500 <span class="ticker-price">Loading...</span></span>';

        // NASDAQ (using QQQ ETF as proxy - would need stock API for real data)
        tickerHTML += '<span class="ticker-item neutral">NASDAQ <span class="ticker-price">Loading...</span></span>';

        // Bitcoin
        const btcChange = cryptoData.bitcoin.usd_24h_change;
        const btcClass = btcChange >= 0 ? 'positive' : 'negative';
        const btcEmoji = btcChange >= 0 ? '🚀' : '📉';
        tickerHTML += `<span class="ticker-item ${btcClass}">BTC ${btcChange >= 0 ? '+' : ''}${btcChange.toFixed(2)}% ${btcEmoji}</span>`;

        // Ethereum
        const ethChange = cryptoData.ethereum.usd_24h_change;
        const ethClass = ethChange >= 0 ? 'positive' : 'negative';
        const ethEmoji = ethChange >= 0 ? '⚡' : '📊';
        tickerHTML += `<span class="ticker-item ${ethClass}">ETH ${ethChange >= 0 ? '+' : ''}${ethChange.toFixed(2)}% ${ethEmoji}</span>`;

        // MONAD (placeholder - not live yet)
        tickerHTML += '<span class="ticker-item neutral">MONAD <span class="ticker-coming">Coming Soon 💎</span></span>';

        // Duplicate for seamless scroll
        ticker.innerHTML = tickerHTML + tickerHTML;
        
    } catch (error) {
        console.error('Error fetching market data:', error);
        document.getElementById('liveTicker').innerHTML = 
            '<span class="ticker-item neutral">Market data temporarily unavailable</span>';
    }
}

// Fetch market data on load
fetchMarketData();

// Refresh market data every 60 seconds
setInterval(fetchMarketData, 60000);

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Floating character click
document.querySelector('.character-floating').addEventListener('click', () => {
    document.querySelector('#chat').scrollIntoView({
        behavior: 'smooth'
    });
});

// Add some terminal startup effects
setTimeout(() => {
    const welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
        welcomeTitle.style.animation = 'none';
        welcomeTitle.style.borderRight = 'none';
        welcomeTitle.style.width = 'auto';
    }
}, 4000);

// Terminal boot sequence
document.addEventListener('DOMContentLoaded', () => {
    console.log('NAD6900 Terminal initializing...');
    console.log('Keone Hon Oracle Protocol v6900');
    console.log('Connection to Monad chain: ESTABLISHED');
    console.log('Terminal ready for commands.');
});