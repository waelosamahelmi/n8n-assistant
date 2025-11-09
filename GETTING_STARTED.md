# 🚀 Getting Started with n8n AI Assistant

Welcome! This guide will get you up and running in 5 minutes.

## What is This?

n8n AI Assistant is a Chrome extension that adds an AI chatbot to your n8n workflows. You can:
- Ask questions about your workflows
- Get help debugging errors
- Add/edit/delete nodes with natural language
- Analyze and optimize workflows

## Quick Setup (5 minutes)

### Step 1: Generate Icons (30 seconds)
1. Open `generate-icons.html` in Chrome
2. Click "Download All"
3. Move the 3 PNG files into the `icons/` folder

### Step 2: Load Extension (1 minute)
1. Open `chrome://extensions/` in Chrome
2. Toggle "Developer mode" ON (top-right)
3. Click "Load unpacked"
4. Select this `n8n-assistant` folder
5. Pin the extension to your toolbar (click puzzle icon → pin)

### Step 3: Get API Key (2 minutes)
1. Go to https://openrouter.ai
2. Sign up or login
3. Go to https://openrouter.ai/keys
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-...`)

### Step 4: Configure Extension (2 minutes)
1. Click the extension icon → Settings
2. Paste your OpenRouter API key
3. Select model (try "Claude 3.5 Sonnet")
4. Enter your n8n URL (e.g., `https://n8n.helmies.fi`)
5. Enter your n8n email and password
6. Click "Login to n8n"
7. Click "Fetch nodes.json"
8. Click "Save All Settings"

### Step 5: Test It! (30 seconds)
1. Open any n8n workflow
2. Click the extension icon
3. Type: "What does this workflow do?"
4. Press Send

**That's it! You're ready to go! 🎉**

---

## Your First Conversation

Try these examples:

### 1. Understand Your Workflow
```
You: "Explain what this workflow does"
AI: [Analyzes and explains your workflow]
```

### 2. Debug an Error
```
You: "The 'HTTP Request' node is showing a 401 error"
AI: [Analyzes the node and suggests authentication fixes]
```

### 3. Add a Node
```
You: "Add a Google Sheets node after 'Google Drive'"
AI: [Proposes the node with configuration]
You: [Click "Approve" button]
AI: [Adds the node to your workflow]
```

### 4. Modify a Node
```
You: "Change the HTTP Request URL to https://api.example.com/v2"
AI: [Shows the proposed change]
You: [Approve or Reject]
```

---

## Understanding the Interface

### Status Bar (Top)
- 🟢 **Green**: Connected to n8n workflow - ready to chat
- 🔴 **Red**: Not on n8n page or connection issue

### Chat Area (Middle)
- **Your messages**: Blue bubbles on the right
- **AI responses**: Gray bubbles on the left
- **Confirmations**: Blue boxes with Approve/Reject buttons
- **System messages**: Yellow boxes for status updates

### Input Box (Bottom)
- Type your messages here
- Press Enter to send (Shift+Enter for new line)
- Send button sends the message

---

## How Confirmations Work

When the AI wants to make changes:

1. **AI explains** what it wants to do in plain English
2. **Shows JSON** preview of the exact changes
3. **You decide**: Click "Approve ✓" or "Reject ✗"
4. **Only approved changes** are applied to your workflow

**You're always in control!**

---

## Important Tips

### ✅ DO:
- Be specific: "Update the 'Send Email' node timeout to 30 seconds"
- Use exact node names from your workflow
- Ask for explanations before approving changes
- Start with simple requests to learn the system

### ❌ DON'T:
- Use vague requests: "fix it" or "make it better"
- Approve changes you don't understand
- Expect it to work offline or without n8n page open
- Share your API key with others

---

## Common Questions

### Q: Does this cost money?
**A:** OpenRouter charges based on AI usage. Most models cost $0.001-0.03 per request. Claude 3.5 Sonnet is ~$0.003 per message. Budget $5-10/month for regular use.

### Q: Is my data safe?
**A:** Yes! Your credentials stay in Chrome's secure storage. Only you can access them. No data is sent anywhere except to OpenRouter for AI processing.

### Q: Will it break my workflows?
**A:** No! You must approve every change. The AI can't modify anything without your explicit approval.

### Q: What if something goes wrong?
**A:** Click "Reject" on any proposed change. Use Ctrl+Z in n8n to undo. The AI can't make irreversible changes.

### Q: Which AI model should I use?
**A:** Start with Claude 3.5 Sonnet - it's best for code and workflows. GPT-4 Turbo is also excellent. Try Gemini Pro for faster, cheaper responses.

### Q: Can I use it on self-hosted n8n?
**A:** Yes! Just enter your self-hosted n8n URL in settings.

---

## Next Steps

### Learn More
- 📖 Read **EXAMPLES.md** for more prompt ideas
- 🔧 Customize **PROMPT_TEMPLATE.md** for your workflows
- 📋 Follow **CHECKLIST.md** to verify everything works
- 📚 Check **README.md** for full documentation

### Customize
1. Add your company's workflow patterns to Custom Instructions
2. Paste your n8n documentation in Reference File field
3. Configure preferred error handling approaches
4. Set up naming conventions for your team

### Experiment
- Try different AI models to find your favorite
- Test with various workflow types
- Explore complex multi-step requests
- Build custom prompt templates

---

## Troubleshooting

### Extension Icon Not Showing
→ Check `chrome://extensions/` for errors
→ Make sure icons folder has all 3 PNG files
→ Try reloading the extension

### "Not on an n8n page"
→ Navigate to an actual workflow (not just n8n home)
→ Refresh the page
→ Check if n8n loaded completely

### AI Not Responding
→ Verify API key is correct in Settings
→ Check you have OpenRouter credits
→ Try a different AI model
→ Check browser console for errors (F12)

### Changes Not Applying
→ Make sure you clicked "Approve"
→ Check n8n page didn't refresh
→ Verify you have edit permissions in n8n
→ Look for error messages in chat

---

## Need Help?

1. **Check Documentation**
   - README.md - Full guide
   - INSTALL.md - Installation help
   - EXAMPLES.md - Prompt examples
   - PROJECT_SUMMARY.md - Technical details

2. **Debug Issues**
   - Open Chrome DevTools (F12)
   - Check Console tab for errors
   - Look at Network tab for failed requests
   - Check Extension page for warnings

3. **Get Support**
   - Review code comments
   - Check settings are saved
   - Try with a simple workflow first
   - Test with different AI models

---

## Success Checklist

After setup, you should be able to:
- ✅ See green "Connected" status on n8n workflows
- ✅ Send messages and get AI responses
- ✅ See workflow details when you ask about it
- ✅ Receive confirmation dialogs for changes
- ✅ Approve or reject proposed modifications

If all of these work, you're good to go! 🎉

---

## Have Fun!

You now have an AI assistant for your n8n workflows. Start simple, experiment, and discover what's possible. The AI learns from your workflow patterns and gets better with use.

**Happy automating! 🤖**

---

**Pro Tip:** Keep the Settings page bookmarked - you'll want to add custom prompts and documentation as you learn what works best for your workflows.

**Another Tip:** Join the n8n community to share your experience and learn from others using similar tools!

---

Created with ❤️ for the n8n community
Version 1.0.0
