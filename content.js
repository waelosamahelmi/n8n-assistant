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
        window.__n8nAssistant = {
          getWorkflowData: function() {
            try {
              let workflowData = null;
              
              // Method 1: Try Pinia store (newer n8n versions >= 1.0)
              if (window.useWorkflowsStore) {
                try {
                  const store = window.useWorkflowsStore();
                  workflowData = {
                    id: store.workflowId,
                    name: store.workflowName,
                    nodes: store.allNodes || [],
                    connections: store.allConnections || {},
                    settings: store.workflowSettings || {},
                    active: store.isWorkflowActive
                  };
                } catch (e) {
                  console.log('Pinia store method failed:', e);
                }
              }
              
              // Method 2: Try Vuex store (older n8n versions)
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
                } catch (e) {
                  console.log('Vuex store method failed:', e);
                }
              }
              
              // Method 3: Try to extract from DOM
              if (!workflowData) {
                try {
                  // Look for workflow data in the page
                  const canvasEl = document.querySelector('[data-test-id*="canvas"]');
                  if (canvasEl && canvasEl.__vueParentComponent) {
                    const vueComponent = canvasEl.__vueParentComponent;
                    workflowData = {
                      nodes: vueComponent.ctx?.nodes || [],
                      connections: vueComponent.ctx?.connections || {}
                    };
                  }
                } catch (e) {
                  console.log('DOM extraction method failed:', e);
                }
              }
              
              // Method 4: Try window-level exports
              if (!workflowData && window.n8n) {
                try {
                  workflowData = window.n8n.getWorkflow();
                } catch (e) {
                  console.log('Window n8n method failed:', e);
                }
              }
              
              return workflowData;
            } catch (error) {
              console.error('Error getting workflow data:', error);
              return null;
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
      callPageFunction('getWorkflowData').then(data => {
        sendResponse({ success: true, data: data });
      });
      return true;
    }
    
    if (request.action === 'updateNode') {
      callPageFunction('updateNode', request.nodeName, request.updates).then(result => {
        sendResponse(result);
      });
      return true;
    }
    
    if (request.action === 'addNode') {
      callPageFunction('addNode', request.nodeData).then(result => {
        sendResponse(result);
      });
      return true;
    }
    
    if (request.action === 'deleteNode') {
      callPageFunction('deleteNode', request.nodeName).then(result => {
        sendResponse(result);
      });
      return true;
    }
    
    if (request.action === 'isN8nPage') {
      sendResponse({ success: true, isN8nPage: isN8nPage() });
      return true;
    }
  });
  
  // Initialize
  if (isN8nPage()) {
    console.log('Helmies n8n Assistant: Detected n8n page');
    injectPageScript();
  }
})();
