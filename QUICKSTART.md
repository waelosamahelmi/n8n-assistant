# Quick Start Guide

## What You've Built

A complete Chrome extension that acts as an AI assistant for n8n workflows! Here's what it can do:

✅ **Read Your Workflows** - Automatically extracts workflow JSON from n8n pages
✅ **Chat with AI** - Natural language interface to discuss your workflows  
✅ **Add/Edit/Delete Nodes** - Modify workflows with AI guidance
✅ **Smart Confirmations** - Review all changes before they're applied
✅ **Custom Context** - Add your own prompts and documentation
✅ **Multiple AI Models** - Choose from Claude, GPT-4, Gemini, and more

## Installation Steps

### 1. Generate Icons (Required First!)
1. Open `generate-icons.html` in Chrome
2. Click "Download All"
3. Move the 3 PNG files to the `icons/` folder

### 2. Load Extension
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `n8n-assistant` folder

### 3. Configure
1. Click the extension icon → Settings
2. Add OpenRouter API key (get from openrouter.ai/keys)
3. Select AI model (Claude 3.5 Sonnet recommended)
4. Add n8n instance URL, email, password
5. Click "Login to n8n" then "Fetch nodes.json"
6. Click "Save All Settings"

### 4. Use It!
1. Open any n8n workflow
2. Click extension icon
3. Start chatting!

## Example Usage

```
You: "The 'HTTP Request' node shows a 401 error"
AI: Analyzes the node and suggests fixing authentication

You: "Add a Google Sheets node after Google Drive"
AI: Proposes the node addition with configuration
You: Click "Approve"
AI: Node is added to your workflow!

You: "Complete this workflow to send email notifications"
AI: Suggests complete node chain with configurations
```

## Files Overview

```
n8n-assistant/
├── manifest.json          # Extension configuration
├── background.js          # API calls handler
├── content.js            # n8n page integration
├── popup.html/js         # Main chat interface
├── settings.html/js      # Settings page
├── generate-icons.html   # Icon generator
├── README.md            # Full documentation
├── INSTALL.md           # Detailed setup
├── EXAMPLES.md          # Example prompts
└── QUICKSTART.md        # This file
```

## Key Features

### 🔒 Security
- All credentials stored locally in Chrome
- No third-party data collection
- Review all changes before applying

### 🎯 Smart Context
- Reads current workflow automatically
- Uses nodes.json for accurate suggestions
- Supports custom documentation/prompts

### 🤖 Multiple AI Models
- Claude 3.5 Sonnet (best for code)
- GPT-4 Turbo (general purpose)
- Gemini Pro (fast responses)
- And 5+ more options

### ✅ Confirmation System
- See proposed changes as JSON
- Approve or reject each action
- Safe workflow modification

## Troubleshooting

**Extension won't load:**
- Make sure all 3 icon files are in `icons/` folder
- Check Chrome extensions page for errors

**Can't connect to n8n:**
- Verify instance URL includes https://
- Check credentials are correct
- Try "Test Connection" button

**AI not responding:**
- Verify OpenRouter API key is set
- Check you have API credits
- Look for errors in extension console

**Changes not applying:**
- Make sure you're on an n8n workflow page
- Try refreshing the n8n page
- Check browser console for errors

## Next Steps

1. **Customize**: Add your own prompts in Settings
2. **Experiment**: Try the examples in EXAMPLES.md
3. **Share**: Help improve the extension with feedback
4. **Extend**: Modify the code for your specific needs

## Getting Help

- Read README.md for full documentation
- Check EXAMPLES.md for prompt ideas
- Review code comments for implementation details
- Open issues on GitHub for bugs

## Tips for Success

1. **Be Specific**: Use exact node names from your workflow
2. **Provide Context**: Mention what comes before/after nodes
3. **Start Simple**: Test with small changes first
4. **Review Changes**: Always check the JSON before approving
5. **Iterate**: Refine your requests based on results

## Have Fun! 🚀

You now have a powerful AI assistant for n8n workflows. Experiment, explore, and automate with confidence!
