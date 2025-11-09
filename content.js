// Content script for Helmies n8n Assistant
// Injects into n8n pages to read and modify workflows
// https://helmies.fi

(function() {
  'use strict';
  
  // Detect if we're on an n8n page
  function isN8nPage() {
    // Check for n8n-specific elements or patterns
    return document.querySelector('[data-test-id*="canvas"]') !== null ||
           document.querySelector('.node-view') !== null ||
           window.location.pathname.includes('/workflow/');
  }
  
  // Extract workflow data from the page
  function getWorkflowData() {
    try {
      // Try to get workflow data from various sources
      
      // Method 1: Check if n8n exposes workflow data globally
      if (window.__n8nWorkflowData) {
        return window.__n8nWorkflowData;
      }
      
      // Method 2: Try to access Vue/React component data
      const canvasElement = document.querySelector('[data-test-id*="canvas"]');
      if (canvasElement && canvasElement.__vue__) {
        return canvasElement.__vue__.$store?.state?.workflow;
      }
      
      // Method 3: Check localStorage/sessionStorage
      const storedWorkflow = localStorage.getItem('currentWorkflow') || 
                            sessionStorage.getItem('currentWorkflow');
      if (storedWorkflow) {
        return JSON.parse(storedWorkflow);
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting workflow data:', error);
      return null;
    }
  }
  
  // Get all nodes from the workflow
  function getAllNodes() {
    const workflowData = getWorkflowData();
    if (!workflowData || !workflowData.nodes) {
      return [];
    }
    return workflowData.nodes;
  }
  
  // Find a specific node by name
  function findNodeByName(nodeName) {
    const nodes = getAllNodes();
    return nodes.find(node => 
      node.name.toLowerCase().includes(nodeName.toLowerCase())
    );
  }
  
  // Inject a helper function into the page context to access n8n internals
  function injectPageScript() {
    const script = document.createElement('script');
    script.textContent = `
      (function() {
        console.log('=== Helmies n8n Assistant: Page script injected ===');
        console.log('Checking for n8n stores...');
        console.log('window.pinia:', typeof window.pinia);
        console.log('window.$store:', typeof window.$store);
        console.log('useWorkflowsStore:', typeof useWorkflowsStore);
        
        window.__n8nAssistant = {
          getWorkflowData: function() {
            console.log('=== getWorkflowData() called ===');
            try {
              let workflowData = null;
              
              // Method 1: Try Pinia store (newer n8n versions >= 1.0)
              if (typeof useWorkflowsStore !== 'undefined') {
                try {
                  const store = useWorkflowsStore();
                  workflowData = {
                    id: store.workflowId,
                    name: store.workflowName || store.workflow?.name,
                    nodes: store.allNodes || store.workflow?.nodes || [],
                    connections: store.allConnections || store.workflow?.connections || {},
                    settings: store.workflowSettings || store.workflow?.settings || {},
                    active: store.isWorkflowActive
                  };
                  console.log('Method 1 (Pinia) succeeded:', workflowData);
                } catch (e) {
                  console.log('Pinia store method failed:', e);
                }
              }
              
              // Method 2: Try accessing global window stores
              if (!workflowData && window.pinia) {
                try {
                  const stores = window.pinia._s;
                  let workflowStore = null;
                  
                  // Find the workflow store
                  stores.forEach(store => {
                    if (store.workflow || store.workflowName || store.allNodes) {
                      workflowStore = store;
                    }
                  });
                  
                  if (workflowStore) {
                    workflowData = {
                      id: workflowStore.workflowId || workflowStore.workflow?.id,
                      name: workflowStore.workflowName || workflowStore.workflow?.name,
                      nodes: workflowStore.allNodes || workflowStore.workflow?.nodes || [],
                      connections: workflowStore.allConnections || workflowStore.workflow?.connections || {},
                      settings: workflowStore.workflowSettings || workflowStore.workflow?.settings || {}
                    };
                    console.log('Method 2 (Pinia global) succeeded:', workflowData);
                  }
                } catch (e) {
                  console.log('Pinia global method failed:', e);
                }
              }
              
              // Method 3: Try Vuex store (older n8n versions)
              if (!workflowData && window.$store) {
                try {
                  const state = window.$store.state;
                  workflowData = {
                    id: state.workflow?.id,
                    name: state.workflow?.name,
                    nodes: state.workflow?.nodes || [],
                    connections: state.workflow?.connections || {},
                    settings: state.workflow?.settings || {}
                  };
                  console.log('Method 3 (Vuex) succeeded:', workflowData);
                } catch (e) {
                  console.log('Vuex store method failed:', e);
                }
              }
              
              // Method 4: Try to find Vue app and get workflow from root
              if (!workflowData) {
                try {
                  const app = document.querySelector('#app');
                  if (app && app.__vue_app__) {
                    const root = app.__vue_app__.config.globalProperties;
                    if (root.$store) {
                      workflowData = {
                        nodes: root.$store.state.workflow?.nodes || [],
                        connections: root.$store.state.workflow?.connections || {}
                      };
                      console.log('Method 4 (Vue app) succeeded:', workflowData);
                    }
                  }
                } catch (e) {
                  console.log('Vue app method failed:', e);
                }
              }
              
              // Method 5: Try localStorage as fallback
              if (!workflowData) {
                try {
                  const keys = Object.keys(localStorage);
                  for (const key of keys) {
                    if (key.includes('workflow') || key.includes('n8n')) {
                      const data = JSON.parse(localStorage.getItem(key));
                      if (data && (data.nodes || data.workflow?.nodes)) {
                        workflowData = data.workflow || data;
                        console.log('Method 5 (localStorage) succeeded:', workflowData);
                        break;
                      }
                    }
                  }
                } catch (e) {
                  console.log('localStorage method failed:', e);
                }
              }
              
              if (!workflowData) {
                console.error('All methods failed to get workflow data');
                return { error: 'Could not extract workflow data. Make sure you are on a workflow page.' };
              }
              
              return workflowData;
            } catch (error) {
              console.error('Error getting workflow data:', error);
              return { error: error.message };
            }
          },
          
          updateNode: function(nodeName, updates) {
            try {
              // Try to update via store
              if (window.useWorkflowsStore) {
                const store = window.useWorkflowsStore();
                const node = store.getNodeByName(nodeName);
                
                if (node) {
                  // Update node properties
                  Object.assign(node, updates);
                  
                  // Trigger store update
                  if (store.updateNode) {
                    store.updateNode(node);
                  }
                  
                  return { success: true, node: node };
                }
              }
              
              console.log('Update node called:', nodeName, updates);
              return { success: false, error: 'Node update not yet implemented for this n8n version' };
            } catch (error) {
              console.error('Error updating node:', error);
              return { success: false, error: error.message };
            }
          },
          
          addNode: function(nodeData) {
            try {
              // Try to add via store
              if (window.useWorkflowsStore) {
                const store = window.useWorkflowsStore();
                
                const newNode = {
                  id: 'node_' + Date.now(),
                  name: nodeData.name || nodeData.nodeType,
                  type: nodeData.nodeType,
                  position: nodeData.position || [100, 100],
                  parameters: nodeData.parameters || {},
                  ...nodeData
                };
                
                if (store.addNode) {
                  store.addNode(newNode);
                  return { success: true, node: newNode };
                }
              }
              
              console.log('Add node called:', nodeData);
              return { success: false, error: 'Node addition not yet implemented for this n8n version' };
            } catch (error) {
              console.error('Error adding node:', error);
              return { success: false, error: error.message };
            }
          },
          
          deleteNode: function(nodeName) {
            try {
              if (window.useWorkflowsStore) {
                const store = window.useWorkflowsStore();
                const node = store.getNodeByName(nodeName);
                
                if (node && store.removeNode) {
                  store.removeNode(node.name);
                  return { success: true };
                }
              }
              
              return { success: false, error: 'Node deletion not yet implemented for this n8n version' };
            } catch (error) {
              console.error('Error deleting node:', error);
              return { success: false, error: error.message };
            }
          },
          
          executeNode: function(nodeName) {
            try {
              // Trigger node execution
              if (window.useWorkflowsStore) {
                const store = window.useWorkflowsStore();
                if (store.executeNode) {
                  store.executeNode(nodeName);
                  return { success: true };
                }
              }
              
              return { success: false, error: 'Node execution not available' };
            } catch (error) {
              return { success: false, error: error.message };
            }
          }
        };
        
        // Signal that the assistant is ready
        window.postMessage({ type: '__n8nAssistantReady' }, '*');
      })();
    `;
    document.documentElement.appendChild(script);
    script.remove();
  }
  
  // Call the injected function and get the result
  async function callPageFunction(functionName, ...args) {
    return new Promise((resolve) => {
      const eventId = 'n8nAssistant_' + Date.now();
      
      // Listen for response
      window.addEventListener(eventId, function handler(event) {
        window.removeEventListener(eventId, handler);
        resolve(event.detail);
      });
      
      // Call function in page context
      const script = document.createElement('script');
      script.textContent = `
        (function() {
          const result = window.__n8nAssistant.${functionName}(${args.map(arg => JSON.stringify(arg)).join(',')});
          window.dispatchEvent(new CustomEvent('${eventId}', { detail: result }));
        })();
      `;
      document.documentElement.appendChild(script);
      script.remove();
    });
  }
  
  // Listen for messages from the extension
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getWorkflowData') {
      callPageFunction('getWorkflowData')
        .then(data => {
          sendResponse({ success: true, data: data });
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true;
    }
    
    if (request.action === 'updateNode') {
      callPageFunction('updateNode', request.nodeName, request.updates)
        .then(result => {
          sendResponse(result);
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true;
    }
    
    if (request.action === 'addNode') {
      callPageFunction('addNode', request.nodeData)
        .then(result => {
          sendResponse(result);
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true;
    }
    
    if (request.action === 'deleteNode') {
      callPageFunction('deleteNode', request.nodeName)
        .then(result => {
          sendResponse(result);
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true;
    }
    
    if (request.action === 'isN8nPage') {
      sendResponse({ success: true, isN8nPage: isN8nPage() });
      return true;
    }
  });
  
  // Initialize - wait for page to be ready
  function init() {
    console.log('Helmies n8n Assistant: Initializing content script');
    console.log('Current URL:', window.location.href);
    
    // Always inject the script, but check if n8n is present
    injectPageScript();
    
    // Log detection status
    setTimeout(() => {
      const detected = isN8nPage();
      console.log('Helmies n8n Assistant: n8n page detected:', detected);
      if (!detected) {
        console.log('Helmies n8n Assistant: Warning - n8n elements not found. Script is still injected and will work once workflow loads.');
      }
    }, 1000);
  }
  
  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Also try again after a delay for SPAs
  setTimeout(init, 2000);
})();
