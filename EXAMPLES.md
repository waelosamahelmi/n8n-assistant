# Example Prompts and Use Cases

This file contains example prompts you can use with the n8n AI Assistant to get the best results.

## Debugging Nodes

### Find and Fix Errors
- "The 'HTTP Request' node is showing an error. Can you help me debug it?"
- "Node 'Send Email' is failing. What could be wrong?"
- "Why is my 'Google Sheets' node not returning any data?"

### Check Configuration
- "Can you review the configuration of the 'Webhook' node?"
- "Is my 'Schedule Trigger' set up correctly to run every day at 9 AM?"

## Adding Nodes

### Simple Node Addition
- "Add a Google Sheets node after the 'Google Drive' node"
- "I want to add an HTTP Request node before the 'Send Email' node"
- "Add a Code node to transform the data between 'Webhook' and 'Database'"

### Complex Workflow Building
- "After the 'Google Drive' node, add a Google Sheets node to create a new spreadsheet"
- "I need to add a Filter to check if email is not empty, then a Code node to format data"
- "Create error handling after the HTTP Request node with an IF node"

## Modifying Nodes

### Update Parameters
- "Change the 'HTTP Request' node URL to 'https://api.example.com/v2/users'"
- "Update the 'Google Sheets' node to append data instead of creating a new sheet"
- "Modify the 'Schedule Trigger' to run every 2 hours instead of daily"

## Workflow Analysis

### Understanding Workflow
- "Can you explain what this workflow does?"
- "What is the purpose of the 'IF' node in the middle?"
- "How does data flow from the Webhook to the Database?"

### Optimization
- "How can I optimize this workflow to run faster?"
- "Are there any redundant nodes I can remove?"
- "What's the best way to handle errors in this workflow?"

## Tips for Best Results

1. **Be Specific**: Use exact node names in quotes
2. **Provide Context**: Mention what comes before/after
3. **State Your Goal**: Explain what you want to achieve
4. **Ask for Explanations**: Request clarification before changes
5. **Iterate**: Start simple, then refine
