// Popup script for Helmies n8n Assistant
// https://helmies.fi

let conversationHistory = [];
let pendingConfirmation = null;
const MAX_CONTEXT_MESSAGES = 20; // Maximum messages before summarization

document.addEventListener('DOMContentLoaded', async () => {
  // Check if we're on an n8n page
  checkN8nPage();
  
  // Load conversation history (persistent)
  const stored = await chrome.storage.local.get(['conversationHistory']);
  if (stored.conversationHistory) {
    conversationHistory = stored.conversationHistory;
    renderConversation();
  }
  
  // Event listeners
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  document.getElementById('newConversationBtn').addEventListener('click', startNewConversation);
  
  document.getElementById('sendBtn').addEventListener('click', sendMessage);
  
  document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});

async function startNewConversation() {
  if (conversationHistory.length > 0) {
    if (confirm('Start a new conversation? Current chat will be cleared.')) {
      conversationHistory = [];
      await chrome.storage.local.set({ conversationHistory: [] });
      renderConversation();
      addSystemMessage('Started new conversation');
    }
  }
}

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
  
  // Save immediately
  await chrome.storage.local.set({ conversationHistory });
  
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
    
    // Get workflow data with timeout
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    let workflowData = null;
    try {
      const workflowResponse = await Promise.race([
        chrome.tabs.sendMessage(tab.id, { action: 'getWorkflowData' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
      ]);
      
      if (workflowResponse?.success && workflowResponse?.data) {
        workflowData = workflowResponse.data;
        
        // Check if workflow has actual data
        if (workflowData.error) {
          console.warn('Workflow extraction error:', workflowData.error);
          addSystemMessage(`⚠️ ${workflowData.error}`);
          workflowData = null;
        } else if (!workflowData.nodes || workflowData.nodes.length === 0) {
          console.warn('No nodes found in workflow');
          addSystemMessage('⚠️ No workflow nodes detected. Make sure you are on an active workflow page.');
          workflowData = null;
        } else {
          console.log('Workflow data extracted:', workflowData.nodes.length, 'nodes');
        }
      } else {
        console.warn('Could not get workflow data from response');
        workflowData = null;
      }
    } catch (error) {
      console.warn('Could not get workflow data:', error.message);
      addSystemMessage('⚠️ Could not read workflow. Make sure you are on an n8n workflow page and refresh if needed.');
      workflowData = null;
    }
    
    // Get nodes.json from IndexedDB
    let nodesJson = null;
    try {
      nodesJson = await getLargeData('nodesJson');
    } catch (error) {
      console.warn('Could not get nodes.json:', error.message);
      nodesJson = null;
    }
    
    // Extract relevant node types from message and workflow
    const relevantNodeInfo = extractRelevantNodeInfo(
      message, 
      workflowData, 
      nodesJson
    );
    
    // Check if we need to summarize conversation
    let messagesToSend = conversationHistory;
    if (conversationHistory.length > MAX_CONTEXT_MESSAGES) {
      messagesToSend = await summarizeConversation(conversationHistory);
      addSystemMessage('Context summarized to maintain performance');
    }
    
    // Build context with only relevant node information
    const systemPrompt = buildSystemPrompt(
      workflowData,
      relevantNodeInfo,
      settings.customPrompt,
      settings.referenceFile
    );
    
    // Prepare messages for API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...messagesToSend
    ];
    
    // Call OpenRouter API with timeout
    const response = await Promise.race([
      chrome.runtime.sendMessage({
        action: 'callOpenRouter',
        data: {
          apiKey: settings.openrouterKey,
          model: settings.model || 'anthropic/claude-3.5-sonnet',
          messages: messages
        }
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout after 30s')), 30000))
    ]);
    
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
    
    let errorMessage = error.message;
    
    // Check for moderation errors
    if (errorMessage.includes('moderation') || errorMessage.includes('flagged')) {
      errorMessage = `⚠️ Content Moderation Issue\n\nThe AI model flagged your request. This usually happens with free models that have strict filters.\n\n💡 Solutions:\n1. Try a different model (recommended: anthropic/claude-3.5-sonnet or openai/gpt-4-turbo)\n2. Rephrase your question\n3. Use paid models which have less restrictive filtering\n\nOriginal error: ${errorMessage}`;
    }
    
    conversationHistory.push({ 
      role: 'assistant', 
      content: `❌ Error: ${errorMessage}` 
    });
    renderConversation();
    await chrome.storage.local.set({ conversationHistory });
  }
}

// Summarize conversation when it gets too long
async function summarizeConversation(history) {
  // Keep first message, last 10 messages, and create summary of the middle
  if (history.length <= MAX_CONTEXT_MESSAGES) {
    return history;
  }
  
  const recentMessages = history.slice(-10);
  const oldMessages = history.slice(0, -10);
  
  // Create a summary of old messages
  const summary = {
    role: 'system',
    content: `Previous conversation summary (${oldMessages.length} messages): ${oldMessages.map(m => `${m.role}: ${m.content.substring(0, 100)}...`).join(' | ')}`
  };
  
  return [summary, ...recentMessages];
}

// Extract relevant node information based on context
function extractRelevantNodeInfo(message, workflowData, nodesJson) {
  if (!nodesJson) {
    return 'Node definitions not loaded';
  }
  
  // Extract node types mentioned in the message
  const messageLower = message.toLowerCase();
  const mentionedTypes = new Set();
  
  // Common node name patterns
  const nodeKeywords = [
    'google', 'drive', 'sheets', 'gmail', 'calendar',
    'slack', 'discord', 'telegram',
    'http', 'webhook', 'api',
    'email', 'smtp', 'imap',
    'database', 'mysql', 'postgres', 'mongodb',
    'airtable', 'notion',
    'code', 'function', 'set', 'if', 'switch', 'merge',
    'salesforce', 'hubspot', 'pipedrive',
    'twitter', 'facebook', 'linkedin',
    'stripe', 'paypal',
    'aws', 's3', 'lambda',
    'filter', 'sort', 'aggregate',
    'schedule', 'cron', 'trigger'
  ];
  
  // Check for keywords in message
  nodeKeywords.forEach(keyword => {
    if (messageLower.includes(keyword)) {
      mentionedTypes.add(keyword);
    }
  });
  
  // Add node types from current workflow
  if (workflowData && workflowData.nodes) {
    workflowData.nodes.forEach(node => {
      if (node.type) {
        const nodeType = node.type.toLowerCase();
        // Extract base type (e.g., "googleDrive" from "n8n-nodes-base.googleDrive")
        const baseType = nodeType.split('.').pop();
        mentionedTypes.add(baseType);
      }
    });
  }
  
  // If no specific types mentioned, return summary
  if (mentionedTypes.size === 0) {
    return `Available node categories: ${Object.keys(nodesJson).length} nodes loaded. Ask about specific nodes for details.`;
  }
  
  // Filter nodes.json to only relevant entries
  const relevantNodes = {};
  let matchCount = 0;
  
  Object.keys(nodesJson).forEach(nodeKey => {
    const nodeLower = nodeKey.toLowerCase();
    
    // Check if this node matches any mentioned types
    for (const type of mentionedTypes) {
      if (nodeLower.includes(type)) {
        relevantNodes[nodeKey] = nodesJson[nodeKey];
        matchCount++;
        break;
      }
    }
  });
  
  // If we found relevant nodes, return them
  if (matchCount > 0) {
    return `Relevant nodes found (${matchCount} matches):\n${JSON.stringify(relevantNodes, null, 2)}`;
  }
  
  // Otherwise return summary
  return `${Object.keys(nodesJson).length} nodes available. Mentioned: ${Array.from(mentionedTypes).join(', ')}. Ask for specific node details.`;
}

function buildSystemPrompt(workflowData, relevantNodeInfo, customPrompt, referenceFile) {
  let prompt = `You are an AI assistant for n8n workflow automation. Your role is to help users analyze, debug, and modify their n8n workflows.

Current Workflow Context:
${workflowData ? `
Workflow Name: ${workflowData.name || 'Unnamed'}
Number of Nodes: ${workflowData.nodes?.length || 0}
Nodes: ${JSON.stringify(workflowData.nodes, null, 2)}
Connections: ${JSON.stringify(workflowData.connections, null, 2)}
${workflowData.settings ? 'Settings: ' + JSON.stringify(workflowData.settings, null, 2) : ''}
` : 'No workflow data available - user may not be on a workflow page or workflow could not be extracted'}

Available n8n Nodes (filtered to relevant context):
${relevantNodeInfo}

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
  chrome.storage.local.set({ conversationHistory });
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
