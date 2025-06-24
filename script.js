// DOM elements
const chatMessages = document.querySelector('.chat-messages');
const chatInput = document.querySelector('.chat-input input');
const sendButton = document.querySelector('.chat-input button');

// Matrix rain effect
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const matrix = "BASE69ETH0123456789ABCDEF█▓▒░";
const matrixArray = matrix.split("");
const fontSize = 12;
const columns = canvas.width / fontSize;
const drops = [];

for(let x = 0; x < columns; x++) {
    drops[x] = 1;
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 82, 255, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00FF00';
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

// Add a message to the chat
function addMessage(content, isUser) {
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const messageHTML = `
        <div class="message ${isUser ? 'user' : 'base69'}">
            <div class="message-avatar">${isUser ? 'U' : 'AI'}</div>
            <div class="message-content">
                <p>${content}</p>
                <span class="message-time">${time}</span>
            </div>
        </div>
    `;
    
    chatMessages.innerHTML += messageHTML;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingHTML = `
        <div class="message base69" id="typing-indicator">
            <div class="message-avatar">AI</div>
            <div class="message-content">
                <div class="typing">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>
    `;
    chatMessages.innerHTML += typingHTML;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Call backend API that securely connects to Claude
async function getBase69Response(userMessage) {
    try {
        console.log('Sending message to BASE69 terminal:', userMessage);
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage })
        });
        
        console.log('BASE69 response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('BASE69 error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('BASE69 received data:', data);
        return data.reply;
    } catch (error) {
        console.error('BASE69 terminal error:', error);
        return "[CONNECTION ERROR] BASE69 terminal temporarily offline. Please try again.";
    }
}

// Handle sending messages
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, true);
    chatInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Get response from backend
    try {
        const response = await getBase69Response(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI response to chat
        addMessage(response, false);
    } catch (error) {
        console.error('BASE69 Error:', error);
        removeTypingIndicator();
        addMessage("[SYSTEM ERROR] Unable to process request. BASE69 terminal may be experiencing issues.", false);
    }
}

// Handle clear command locally
function handleClearCommand() {
    chatMessages.innerHTML = `
        <div class="message base69">
            <div class="message-avatar">AI</div>
            <div class="message-content">
                <p>[TERMINAL CLEARED] BASE69 ready for new commands.</p>
                <span class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        </div>
    `;
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const message = chatInput.value.trim().toLowerCase();
        if (message === 'clear') {
            handleClearCommand();
            chatInput.value = '';
        } else {
            sendMessage();
        }
    }
});

// Auto-focus input
chatInput.focus();

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
    
    // Remove the blinking cursor from ASCII subtitle after typing completes
    const asciiSubtitle = document.getElementById('ascii-subtitle');
    if (asciiSubtitle) {
        setTimeout(() => {
            asciiSubtitle.style.borderRight = 'none';
        }, 1000);
    }
}, 4000);

// Connect suggestion chips (if any exist)
document.addEventListener('DOMContentLoaded', () => {
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    
    suggestionChips.forEach(chip => {
        chip.removeEventListener('click', suggestionChipHandler);
        chip.addEventListener('click', suggestionChipHandler);
    });
});

function suggestionChipHandler(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const message = event.target.textContent;
    chatInput.value = message;
    sendMessage();
}

// Terminal boot sequence
document.addEventListener('DOMContentLoaded', () => {
    console.log('BASE69 Terminal initializing...');
    console.log('Brian Armstrong ETH Stack Protocol v1.0');
    console.log('Connection to Base chain: ESTABLISHED');
    console.log('Terminal ready for commands.');
});