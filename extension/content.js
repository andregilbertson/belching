// Content script - runs in the context of web pages
console.log('Content script loaded');

// Function to get all text from the page
function getAllPageText() {
  // Get all text content, excluding script and style tags
  const bodyText = document.body.innerText || document.body.textContent;
  return bodyText.trim();
}

// Function to get selected text
function getSelectedText() {
  return window.getSelection().toString().trim();
}

// Function to get text from a specific element
function getTextFromElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    return null;
  }
  
  // For input and textarea elements, get the value
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    return element.value || '';
  }
  
  // For other elements, get text content
  return element.innerText || element.textContent || '';
}

// Function to get all text from paragraphs
function getAllParagraphs() {
  const paragraphs = Array.from(document.querySelectorAll('p'));
  return paragraphs.map(p => p.innerText || p.textContent).filter(text => text.trim());
}

// Function to get page title
function getPageTitle() {
  return document.title;
}

// Function to get page URL
function getPageUrl() {
  return window.location.href;
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'buttonClicked') {
    console.log('Button clicked from popup!');
    
    // Example: Change page background color temporarily
    document.body.style.transition = 'background-color 0.3s';
    document.body.style.backgroundColor = '#e8f0fe';
    
    setTimeout(() => {
      document.body.style.backgroundColor = '';
    }, 500);
    
    sendResponse({ success: true });
  }
  
  // Get latest ChatGPT response
  if (request.action === 'getLatestChatGPTResponse') {
    try {
      // Find all assistant messages (ChatGPT responses)
      // Method 1: Look for elements with data-message-author-role="assistant"
      let assistantMessages = Array.from(
        document.querySelectorAll('[data-message-author-role="assistant"]')
      );
      
      // Method 2: If that doesn't work, look for markdown prose elements in message containers
      if (assistantMessages.length === 0) {
        assistantMessages = Array.from(
          document.querySelectorAll('.markdown.prose, .markdown-prose, [class*="markdown"]')
        ).filter(el => {
          // Make sure it's in a message container, not the input area
          return !el.closest('textarea') && !el.closest('input');
        });
      }
      
      // Method 3: Look for text-message elements with assistant role
      if (assistantMessages.length === 0) {
        assistantMessages = Array.from(
          document.querySelectorAll('.text-message, [class*="message"]')
        ).filter(el => {
          const role = el.getAttribute('data-message-author-role') || 
                     el.closest('[data-message-author-role]')?.getAttribute('data-message-author-role');
          return role === 'assistant';
        });
      }
      
      if (assistantMessages.length === 0) {
        sendResponse({ 
          success: false, 
          error: 'No ChatGPT assistant messages found on this page',
          url: getPageUrl(),
          title: getPageTitle(),
          elementInfo: 'Could not find assistant response messages'
        });
        return;
      }
      
      // Get the last (most recent) message
      const latestMessage = assistantMessages[assistantMessages.length - 1];
      
      // Extract text from the message
      // Try to get text from markdown content if available
      const markdownContent = latestMessage.querySelector('.markdown, [class*="markdown"], .prose');
      const textElement = markdownContent || latestMessage;
      
      let text = textElement.innerText || textElement.textContent || '';
      
      // Clean up the text (remove extra whitespace)
      text = text.trim().replace(/\n{3,}/g, '\n\n');
      
      sendResponse({ 
        success: true, 
        text: text,
        url: getPageUrl(),
        title: getPageTitle(),
        elementInfo: `Found latest assistant response (${assistantMessages.length} total messages)`
      });
      return;
    } catch (e) {
      sendResponse({ 
        success: false, 
        error: e.message,
        url: getPageUrl(),
        title: getPageTitle()
      });
      return;
    }
  }
  
  // Get text from page
  if (request.action === 'getPageText') {
    const textType = request.textType || 'all';
    let text = '';
    
    switch(textType) {
      case 'all':
        text = getAllPageText();
        break;
      case 'selected':
        text = getSelectedText();
        break;
      case 'title':
        text = getPageTitle();
        break;
      case 'paragraphs':
        text = getAllParagraphs().join('\n\n');
        break;
      case 'element':
        const elementResult = getTextFromElement(request.selector);
        if (elementResult === null) {
          sendResponse({ 
            success: false, 
            error: `Element not found: ${request.selector}`,
            url: getPageUrl(),
            title: getPageTitle()
          });
          return;
        }
        text = elementResult;
        break;
      default:
        text = getAllPageText();
    }
    
    sendResponse({ 
      success: true, 
      text: text || '',
      url: getPageUrl(),
      title: getPageTitle(),
      elementInfo: request.selector ? `Found element: ${request.selector}` : 'All page text'
    });
  }
  
  return true; // Keep the message channel open for async response
});

// Example: Add a custom element to the page
function addCustomElement() {
  const element = document.createElement('div');
  element.id = 'extension-custom-element';
  element.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #4285f4;
    color: white;
    padding: 10px;
    border-radius: 4px;
    z-index: 10000;
    font-size: 12px;
    display: none;
  `;
  element.textContent = 'Extension Active';
  document.body.appendChild(element);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addCustomElement);
} else {
  addCustomElement();
}

