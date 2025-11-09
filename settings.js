// Settings page script

document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings
  const settings = await chrome.storage.sync.get([
    'openrouterKey',
    'model',
    'instanceUrl',
    'email',
    'password',
    'stayLoggedIn',
    'customPrompt',
    'referenceFile'
  ]);
  
  // Populate form fields
  if (settings.openrouterKey) document.getElementById('openrouterKey').value = settings.openrouterKey;
  if (settings.model) {
    document.getElementById('model').value = settings.model;
  } else {
    // Set default model if none exists
    document.getElementById('model').value = 'anthropic/claude-3.5-sonnet';
  }
  if (settings.instanceUrl) document.getElementById('instanceUrl').value = settings.instanceUrl;
  if (settings.email) document.getElementById('email').value = settings.email;
  if (settings.password) document.getElementById('password').value = settings.password;
  if (settings.stayLoggedIn) document.getElementById('stayLoggedIn').checked = settings.stayLoggedIn;
  if (settings.customPrompt) document.getElementById('customPrompt').value = settings.customPrompt;
  if (settings.referenceFile) document.getElementById('referenceFile').value = settings.referenceFile;
  
  // Save settings
  document.getElementById('saveBtn').addEventListener('click', async () => {
    const settings = {
      openrouterKey: document.getElementById('openrouterKey').value,
      model: document.getElementById('model').value,
      instanceUrl: document.getElementById('instanceUrl').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      stayLoggedIn: document.getElementById('stayLoggedIn').checked,
      customPrompt: document.getElementById('customPrompt').value,
      referenceFile: document.getElementById('referenceFile').value
    };
    
    try {
      await chrome.storage.sync.set(settings);
      showStatus('saveStatus', 'Settings saved successfully!', 'success');
    } catch (error) {
      showStatus('saveStatus', 'Error saving settings: ' + error.message, 'error');
    }
  });
  
  // Clear settings
  document.getElementById('clearBtn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all settings?')) {
      await chrome.storage.sync.clear();
      location.reload();
    }
  });
  
  // Login to n8n
  document.getElementById('loginBtn').addEventListener('click', async () => {
    const instanceUrl = document.getElementById('instanceUrl').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!instanceUrl || !email || !password) {
      showStatus('loginStatus', 'Please fill in all n8n credentials', 'error');
      return;
    }
    
    showStatus('loginStatus', 'Logging in...', 'success');
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'loginToN8n',
        data: { instanceUrl, email, password }
      });
      
      if (response.success) {
        showStatus('loginStatus', 'Successfully logged in to n8n!', 'success');
      } else {
        showStatus('loginStatus', 'Login failed: ' + response.error, 'error');
      }
    } catch (error) {
      showStatus('loginStatus', 'Login error: ' + error.message, 'error');
    }
  });
  
  // Test connection
  document.getElementById('testConnectionBtn').addEventListener('click', async () => {
    const instanceUrl = document.getElementById('instanceUrl').value;
    
    if (!instanceUrl) {
      showStatus('loginStatus', 'Please enter an instance URL', 'error');
      return;
    }
    
    showStatus('loginStatus', 'Testing connection...', 'success');
    
    try {
      const response = await fetch(instanceUrl);
      if (response.ok) {
        showStatus('loginStatus', 'Connection successful!', 'success');
      } else {
        showStatus('loginStatus', 'Connection failed: ' + response.status, 'error');
      }
    } catch (error) {
      showStatus('loginStatus', 'Connection error: ' + error.message, 'error');
    }
  });
  
  // Fetch nodes.json
  document.getElementById('fetchNodesBtn').addEventListener('click', async () => {
    const instanceUrl = document.getElementById('instanceUrl').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!instanceUrl || !email || !password) {
      showStatus('loginStatus', 'Please fill in all n8n credentials', 'error');
      return;
    }
    
    showStatus('loginStatus', 'Fetching nodes.json... This may take a moment.', 'success');
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'fetchNodesJson',
        data: { instanceUrl, email, password }
      });
      
      if (response.success) {
        // Store nodes.json in IndexedDB (can handle large files)
        await storeLargeData('nodesJson', response.data);
        
        // Calculate size
        const sizeKB = Math.round(JSON.stringify(response.data).length / 1024);
        showStatus('loginStatus', `Successfully fetched and saved nodes.json! (${sizeKB} KB stored in IndexedDB)`, 'success');
      } else {
        showStatus('loginStatus', 'Failed to fetch nodes.json: ' + response.error, 'error');
      }
    } catch (error) {
      showStatus('loginStatus', 'Error: ' + error.message, 'error');
    }
  });
});

function showStatus(elementId, message, type) {
  const statusElement = document.getElementById(elementId);
  statusElement.textContent = message;
  statusElement.className = 'status ' + type;
  statusElement.style.display = 'block';
  
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 5000);
}
