# Custom Prompt Template for n8n AI Assistant

Copy and paste this into the "Custom Prompt / Instructions" field in Settings.
Customize it based on your needs and workflow patterns.

---

## My Workflow Preferences

### Node Naming Convention
- Always use descriptive names for nodes (e.g., "Fetch Customer Data" instead of "HTTP Request")
- Include the data source in the name (e.g., "Get Salesforce Contacts")
- Use action verbs (Get, Send, Process, Transform, etc.)

### Error Handling Standards
- Always add error workflows for external API calls
- Use IF nodes to check for empty/null data before processing
- Log all errors to [your logging system]
- Send error notifications to [your notification channel]

### Code Node Patterns
- Always add comments explaining the transformation logic
- Use async/await for asynchronous operations
- Return data in the format: { json: { ...data } }
- Handle edge cases (null, undefined, empty arrays)

### Data Processing Rules
- Never expose sensitive data (PII, passwords, tokens) in logs
- Sanitize all user inputs before processing
- Validate data schemas before sending to external services
- Use the Set node to rename fields before sending to APIs

---

## Company-Specific Patterns

### Our Standard Workflow Structure
1. Trigger (Webhook/Schedule/Manual)
2. Data Validation (IF/Switch node)
3. Data Transformation (Code/Set node)
4. External API Call (HTTP Request)
5. Error Handling (IF node checking for errors)
6. Success Actions (Database/Notification)
7. Error Actions (Log/Alert)

### Preferred Nodes
- For HTTP calls: Always use the HTTP Request node with authentication
- For data transformation: Prefer Code node over Function node
- For conditional logic: Use IF node for binary decisions, Switch for multiple conditions
- For notifications: Use [your preferred service: Slack/Email/etc.]

---

## API Integration Guidelines

### Authentication
- Use credential system for all API keys
- Never hardcode credentials in nodes
- For OAuth: Store tokens in n8n credentials
- For API keys: Use HTTP Request node authentication

### Rate Limiting
- Add Wait nodes between bulk API calls
- Implement retry logic for rate-limited APIs
- Use SplitInBatches for processing large datasets
- Monitor API usage limits

### Response Handling
- Always check for HTTP status codes
- Parse error messages from API responses
- Transform responses to consistent format
- Handle pagination properly

---

## Data Transformation Best Practices

### Code Node Templates

```javascript
// Template for API response transformation
const items = $input.all();
const transformed = items.map(item => ({
  id: item.json.id,
  name: item.json.name,
  // Add your fields here
  timestamp: new Date().toISOString()
}));

return transformed.map(data => ({ json: data }));
```

```javascript
// Template for error checking
const items = $input.all();
const errors = [];
const valid = [];

items.forEach(item => {
  if (!item.json.email || !item.json.name) {
    errors.push(item);
  } else {
    valid.push(item);
  }
});

// Return valid items or handle errors
return valid.map(item => ({ json: item.json }));
```

---

## Specific Integration Instructions

### Salesforce Integration
- Use Salesforce node when possible
- For custom objects, use HTTP Request with OAuth
- Always handle record locking scenarios
- Batch operations for bulk updates

### Google Workspace
- Use service account credentials
- Handle rate limits (100 requests/user/100 seconds)
- Check file permissions before operations
- Use batch operations for multiple files

### Database Operations
- Use connection pooling
- Always use parameterized queries
- Handle transaction rollbacks
- Log all database errors

---

## Monitoring and Logging

### What to Log
- All external API calls (URL, method, status)
- Error conditions with full context
- Performance metrics for slow operations
- Data validation failures

### Where to Log
- Errors: [Your error logging service]
- Metrics: [Your monitoring service]
- Audit trail: [Your audit database]

---

## Testing Guidelines

### Before Deploying Changes
1. Test with sample data first
2. Verify error handling paths
3. Check all conditional branches
4. Validate output format
5. Test with edge cases (empty, null, large datasets)

### Common Test Scenarios
- Empty input data
- Malformed data
- API timeouts
- Rate limiting
- Network failures
- Invalid credentials

---

## When Making Suggestions

### Always Consider
- Will this change affect other workflows?
- Is this the most efficient approach?
- Are there security implications?
- Does this follow our naming conventions?
- Is error handling adequate?

### Prefer These Approaches
- Reusable sub-workflows over duplicated logic
- Native n8n nodes over custom code
- Clear, simple logic over complex transformations
- Documented code over undocumented
- Tested patterns over experimental approaches

---

## Custom Vocabulary

### Our Terms
- "Customer" refers to [your definition]
- "Order" means [your definition]
- "Pipeline" refers to [your workflow pattern]
- [Add your company-specific terms]

### Our Systems
- CRM: [Your CRM system]
- ERP: [Your ERP system]
- Database: [Your database type]
- Notification: [Your notification system]

---

## Additional Context

[Add any other information specific to your use case:
- Workflow templates you use frequently
- Common patterns in your organization
- Specific requirements or constraints
- Documentation links
- API documentation references
]

---

Remember: When in doubt, ask for clarification before making changes!
