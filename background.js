// Background service worker for Helmies n8n Assistant
// https://helmies.fi

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Helmies n8n Assistant installed');
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'callOpenRouter') {
    callOpenRouterAPI(request.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'fetchNodesJson') {
    fetchNodesJson(request.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'loginToN8n') {
    loginToN8n(request.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Call OpenRouter API
async function callOpenRouterAPI({ apiKey, model, messages }) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://helmies.fi',
        'X-Title': 'Helmies n8n Assistant'
      },
      body: JSON.stringify({
        model: model,
        messages: messages
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Fetch nodes.json from n8n instance
async function fetchNodesJson({ instanceUrl, email, password }) {
  try {
    // First login
    const loginResponse = await fetch(`${instanceUrl}/rest/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        emailOrLdapLoginId: email,
        password: password 
      }),
      credentials: 'include'
    });
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }
    
    // Then fetch nodes.json
    const nodesResponse = await fetch(`${instanceUrl}/types/nodes.json`, {
      credentials: 'include'
    });
    
    if (!nodesResponse.ok) {
      throw new Error('Failed to fetch nodes.json');
    }
    
    return await nodesResponse.json();
  } catch (error) {
    throw new Error(`Error fetching nodes.json: ${error.message}`);
  }
}

// Login to n8n instance
async function loginToN8n({ instanceUrl, email, password }) {
  try {
    const response = await fetch(`${instanceUrl}/rest/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        emailOrLdapLoginId: email,
        password: password 
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Login error: ${error.message}`);
  }
}
