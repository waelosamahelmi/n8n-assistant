// Popup script for Helmies n8n Assistant
// https://helmies.fi

let conversationHistory = [];
let pendingConfirmation = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Check if we're on an n8n page
  checkN8nPage();
  
  // Load conversation history
  const stored = await chrome.storage.local.get(['conversationHistory']);
  if (stored.conversationHistory) {
    conversationHistory = stored.conversationHistory;
    renderConversation();
  }
  
  // Event listeners
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  document.getElementById('sendBtn').addEventListener('click', sendMessage);
  
  document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});

async function checkN8nPage() {
  const statusBar = document.getElementById('statusBar');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      statusBar.textContent = '⚠️ No active tab';
      statusBar.className = 'status-bar disconnected';
      return;
    }
    
    // Check if it's an n8n page
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'isN8nPage' });
    
    if (response && response.isN8nPage) {
      statusBar.textContent = '✓ Connected to n8n workflow';
      statusBar.className = 'status-bar connected';
    } else {
      statusBar.textContent = '⚠️ Not on an n8n page. Please navigate to an n8n workflow.';
      statusBar.className = 'status-bar disconnected';
    }
  } catch (error) {
    statusBar.textContent = '⚠️ Unable to connect to page. Try refreshing.';
    statusBar.className = 'status-bar disconnected';
  }
}

async function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add user message to conversation
  conversationHistory.push({ role: 'user', content: message });
  input.value = '';
  renderConversation();
  
  // Show loading
  addLoadingMessage();
  
  try {
    // Get settings
    const settings = await chrome.storage.sync.get([
      'openrouterKey',
      'model',
      'customPrompt',
      'referenceFile'
    ]);
    
    if (!settings.openrouterKey) {
      throw new Error('OpenRouter API key not set. Please configure in settings.');
    }
    
    // Get workflow data
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const workflowResponse = await chrome.tabs.sendMessage(tab.id, { 
      action: 'getWorkflowData' 
    });
    
    // Get nodes.json
    const { nodesJson } = await chrome.storage.local.get(['nodesJson']);
    
    // Build context
    const systemPrompt = buildSystemPrompt(
      workflowResponse.data,
      nodesJson,
      settings.customPrompt,
      settings.referenceFile
    );
    
    // Prepare messages for API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory
    ];
    
    // Call OpenRouter API
    const response = await chrome.runtime.sendMessage({
      action: 'callOpenRouter',
      data: {
        apiKey: settings.openrouterKey,
        model: settings.model || 'anthropic/claude-3.5-sonnet',
        messages: messages
      }
    });
    
    removeLoadingMessage();
    
    if (response.success) {
      const assistantMessage = response.data.choices[0].message.content;
      
      // Parse response for actions
      const action = parseAssistantResponse(assistantMessage);
      
      if (action) {
        // Show confirmation dialog
        showConfirmation(action, assistantMessage);
      } else {
        // Just add to conversation
        conversationHistory.push({ 
          role: 'assistant', 
          content: assistantMessage 
        });
        renderConversation();
      }
      
      // Save conversation
      await chrome.storage.local.set({ conversationHistory });
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    removeLoadingMessage();
    conversationHistory.push({ 
      role: 'assistant', 
      content: `❌ Error: ${error.message}` 
    });
    renderConversation();
  }
}

function buildSystemPrompt(workflowData, nodesJson, customPrompt, referenceFile) {
  let prompt = `You are an AI assistant for n8n workflow automation. Your role is to help users analyze, debug, and modify their n8n workflows.

Current Workflow Context:
${workflowData ? JSON.stringify(workflowData, null, 2) : 'No workflow data available'}

Available n8n Nodes:
${nodesJson ? JSON.stringify(nodesJson, null, 2) : 'Node definitions not loaded'}

When the user asks you to make changes:
1. Analyze the request carefully
2. Propose the specific changes needed
3. Format your response with a clear action plan
4. Use this JSON format for actions:

ACTION: ADD_NODE
\`\`\`json
{
  "type": "add_node",
  "nodeType": "n8n-nodes-base.googleSheets",
  "position": "after",
  "targetNode": "Google Drive",
  "parameters": {...}
}
\`\`\`

ACTION: UPDATE_NODE
\`\`\`json
{
  "type": "update_node",
  "nodeName": "Hello World",
  "updates": {...}
}
\`\`\`

ACTION: DELETE_NODE
\`\`\`json
{
  "type": "delete_node",
  "nodeName": "Node Name"
}
\`\`\`

Always explain what you're going to do BEFORE proposing the action.
`;

  if (customPrompt) {
    prompt += `\n\nCustom Instructions:\n${customPrompt}`;
  }
  
  if (referenceFile) {
    prompt += `\n\nReference Documentation:\n${referenceFile}`;
  }
  
  return prompt;
}

function parseAssistantResponse(response) {
  // Look for ACTION: blocks in the response
  const actionRegex = /ACTION:\s*(ADD_NODE|UPDATE_NODE|DELETE_NODE)\s*```json\s*(\{[\s\S]*?\})\s*```/;
  const match = response.match(actionRegex);
  
  if (match) {
    try {
      return JSON.parse(match[2]);
    } catch (error) {
      console.error('Error parsing action:', error);
      return null;
    }
  }
  
  return null;
}

function showConfirmation(action, fullMessage) {
  pendingConfirmation = action;
  
  const container = document.getElementById('chatContainer');
  
  // Add assistant message
  conversationHistory.push({ 
    role: 'assistant', 
    content: fullMessage 
  });
  
  // Add confirmation UI
  const confirmDiv = document.createElement('div');
  confirmDiv.className = 'message confirmation';
  confirmDiv.innerHTML = `
    <strong>⚠️ Confirmation Required</strong>
    <p>I want to perform the following action:</p>
    <pre>${JSON.stringify(action, null, 2)}</pre>
    <div class="confirmation-buttons">
      <button class="btn-approve" onclick="approveAction()">✓ Approve</button>
      <button class="btn-reject" onclick="rejectAction()">✗ Reject</button>
    </div>
  `;
  
  container.appendChild(confirmDiv);
  container.scrollTop = container.scrollHeight;
}

window.approveAction = async function() {
  if (!pendingConfirmation) return;
  
  const action = pendingConfirmation;
  pendingConfirmation = null;
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    let response;
    if (action.type === 'add_node') {
      response = await chrome.tabs.sendMessage(tab.id, {
        action: 'addNode',
        nodeData: action
      });
    } else if (action.type === 'update_node') {
      response = await chrome.tabs.sendMessage(tab.id, {
        action: 'updateNode',
        nodeName: action.nodeName,
        updates: action.updates
      });
    } else if (action.type === 'delete_node') {
      response = await chrome.tabs.sendMessage(tab.id, {
        action: 'deleteNode',
        nodeName: action.nodeName
      });
    }
    
    if (response && response.success) {
      addSystemMessage('✓ Action completed successfully!');
    } else {
      addSystemMessage('❌ Action failed: ' + (response?.error || 'Unknown error'));
    }
  } catch (error) {
    addSystemMessage('❌ Error: ' + error.message);
  }
  
  renderConversation();
};

window.rejectAction = function() {
  pendingConfirmation = null;
  addSystemMessage('Action rejected by user.');
  renderConversation();
};

function addSystemMessage(message) {
  conversationHistory.push({
    role: 'system',
    content: message
  });
}

function addLoadingMessage() {
  const container = document.getElementById('chatContainer');
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading';
  loadingDiv.id = 'loadingMessage';
  loadingDiv.textContent = '🤔 Thinking...';
  container.appendChild(loadingDiv);
  container.scrollTop = container.scrollHeight;
}

function removeLoadingMessage() {
  const loading = document.getElementById('loadingMessage');
  if (loading) loading.remove();
}

function renderConversation() {
  const container = document.getElementById('chatContainer');
  container.innerHTML = '';
  
  if (conversationHistory.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>👋 Welcome to Helmies n8n Assistant!</h2>
        <p>I can help you with your n8n workflows. Try saying:</p>
        <p>
          • "Node 'Hello World' shows an error"<br>
          • "Add a Google Sheets node after Google Drive"<br>
          • "Complete the workflow after the Hello node"
        </p>
      </div>
    `;
    return;
  }
  
  conversationHistory.forEach(msg => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.role}`;
    
    // Simple markdown-like formatting
    let content = msg.content;
    content = content.replace(/```json\n([\s\S]*?)```/g, '<pre>$1</pre>');
    content = content.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>');
    content = content.replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = content;
    container.appendChild(messageDiv);
  });
  
  container.scrollTop = container.scrollHeight;
}
