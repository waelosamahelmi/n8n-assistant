# Installation & Setup Checklist

Use this checklist to ensure your n8n AI Assistant is properly configured.

## ☐ Pre-Installation

- [ ] Chrome browser installed (version 88 or higher)
- [ ] Access to an n8n instance
- [ ] OpenRouter account created (https://openrouter.ai)
- [ ] OpenRouter API key obtained (https://openrouter.ai/keys)
- [ ] n8n login credentials ready

## ☐ Step 1: Generate Icons

- [ ] Opened `generate-icons.html` in Chrome
- [ ] Icons appeared on the page
- [ ] Clicked "Download All" button
- [ ] Downloaded 3 files: `icon16.png`, `icon48.png`, `icon128.png`
- [ ] Moved all 3 files to the `icons/` folder
- [ ] Verified files are in correct location

## ☐ Step 2: Load Extension

- [ ] Opened Chrome and navigated to `chrome://extensions/`
- [ ] Enabled "Developer mode" (toggle in top-right)
- [ ] Clicked "Load unpacked" button
- [ ] Selected the `n8n-assistant` folder
- [ ] Extension appeared in the list
- [ ] No errors shown on the extension card
- [ ] Extension icon visible in Chrome toolbar

## ☐ Step 3: Configure OpenRouter

- [ ] Clicked extension icon in toolbar
- [ ] Clicked "Settings" button
- [ ] Pasted OpenRouter API key in the field
- [ ] Selected preferred AI model (Claude 3.5 Sonnet recommended)
- [ ] API key is not empty or showing errors

## ☐ Step 4: Configure n8n Instance

- [ ] Entered n8n instance URL (including https://)
- [ ] Entered n8n email address
- [ ] Entered n8n password
- [ ] Checked "Stay logged in" (optional)
- [ ] Clicked "Test Connection" - saw success message
- [ ] Clicked "Login to n8n" - saw success message
- [ ] Clicked "Fetch nodes.json" - saw success message

## ☐ Step 5: Optional Configuration

- [ ] Added custom instructions (if desired)
- [ ] Pasted reference markdown content (if desired)
- [ ] Reviewed and customized PROMPT_TEMPLATE.md (if desired)

## ☐ Step 6: Save Settings

- [ ] Clicked "Save All Settings" button
- [ ] Saw "Settings saved successfully!" message
- [ ] Settings remain after closing and reopening

## ☐ Step 7: Test Basic Functionality

- [ ] Opened n8n instance in browser
- [ ] Navigated to any workflow
- [ ] Clicked extension icon
- [ ] Status bar shows "Connected to n8n workflow" (green)
- [ ] Chat interface is visible
- [ ] Input box is enabled

## ☐ Step 8: Test AI Chat

- [ ] Typed a simple message (e.g., "Hello")
- [ ] Clicked "Send" button
- [ ] Saw "Thinking..." loading message
- [ ] Received AI response
- [ ] Response appears in chat area
- [ ] No error messages shown

## ☐ Step 9: Test Workflow Reading

- [ ] Asked: "What does this workflow do?"
- [ ] AI provided description of current workflow
- [ ] Description mentions actual nodes from workflow
- [ ] Response is relevant and accurate

## ☐ Step 10: Test Confirmation System

- [ ] Asked AI to add a simple node (e.g., "Add a Set node")
- [ ] AI proposed the action
- [ ] Saw confirmation dialog with JSON preview
- [ ] Both "Approve" and "Reject" buttons visible
- [ ] Clicked "Reject" to test (should show "Action rejected")
- [ ] Tried again and clicked "Approve" (should see success/error)

## ☐ Troubleshooting (if issues occur)

### Extension Won't Load
- [ ] Verified all icon files are present in `icons/` folder
- [ ] Checked Chrome extensions page for error messages
- [ ] Tried reloading the extension
- [ ] Checked manifest.json for syntax errors

### Connection Issues
- [ ] Verified n8n instance URL is correct
- [ ] Checked credentials are correct
- [ ] Refreshed n8n page
- [ ] Checked browser console for errors (F12)
- [ ] Verified n8n instance is accessible in normal tab

### API Issues
- [ ] Verified OpenRouter API key is correct
- [ ] Checked OpenRouter account has credits
- [ ] Tried different AI model
- [ ] Checked network tab for API errors

### Chat Not Working
- [ ] Verified on an actual n8n workflow page (not just n8n home)
- [ ] Refreshed the page
- [ ] Reloaded the extension
- [ ] Checked browser console for JavaScript errors

## ☐ Optional: Advanced Setup

- [ ] Customized PROMPT_TEMPLATE.md for my use case
- [ ] Tested with multiple AI models
- [ ] Configured multiple n8n instances
- [ ] Added team-specific documentation to settings
- [ ] Tested with various workflow types
- [ ] Verified error handling works correctly

## ☐ Final Verification

- [ ] Extension works consistently across browser restarts
- [ ] Settings persist after closing Chrome
- [ ] Can switch between different n8n workflows
- [ ] Confirmation system prevents unwanted changes
- [ ] All documentation is accessible and clear

## Common Issues & Solutions

### "Not on an n8n page"
**Solution:** Navigate to an actual workflow in n8n, not just the home page

### "OpenRouter API key not set"
**Solution:** Go to Settings and paste your API key, then Save

### "Failed to fetch nodes.json"
**Solution:** Check credentials, ensure you're logged into n8n, verify URL

### Changes Not Applying
**Solution:** Make sure you clicked "Approve", check n8n version compatibility

### Slow Responses
**Solution:** Try a faster model like GPT-3.5 Turbo or Gemini Pro

---

## ✅ Setup Complete!

If all items are checked, your n8n AI Assistant is ready to use!

**Next Steps:**
1. Read EXAMPLES.md for prompt ideas
2. Try QUICKSTART.md examples
3. Customize PROMPT_TEMPLATE.md for your workflows
4. Explore and experiment!

**Need Help?**
- Check README.md for full documentation
- Review PROJECT_SUMMARY.md for technical details
- Look at code comments for implementation info

---

**Date Completed:** _______________
**Version:** 1.0.0
**Setup By:** _______________
