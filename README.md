# Helmies n8n Assistant - Chrome Extension

An AI-powered Chrome extension that helps you work with n8n workflows using OpenRouter API integration.

**Powered by [Helmies.fi](https://helmies.fi)** - Your n8n automation experts.

## Features

- 🤖 **AI-Powered Assistance**: Chat with AI about your n8n workflows
- 🔍 **Workflow Analysis**: Automatically reads and analyzes current workflow JSON
- ✏️ **Node Management**: Add, edit, and debug nodes with AI guidance
- 🔐 **Secure Configuration**: Store OpenRouter API key and n8n credentials
- 📝 **Custom Instructions**: Add custom prompts and markdown reference files
- ✅ **Confirmation System**: Review and approve all changes before they're applied
- 🔌 **Multiple AI Models**: Choose from Claude, GPT-4, Gemini, Llama, and more

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `n8n-assistant` folder

### Required Icons

Before loading the extension, you need to add icon files to the `icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can create simple icons or use placeholder images initially.

## Setup

1. Click the extension icon and go to **Settings**
2. Configure your **OpenRouter API**:
   - Enter your OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys)
   - Select your preferred AI model
3. Configure your **n8n Instance**:
   - Enter your n8n instance URL (e.g., `https://n8n.helmies.fi`)
   - Enter your email and password
   - Click "Login to n8n" to authenticate
   - Click "Fetch nodes.json" to download node definitions
4. (Optional) Add **Custom Instructions** or markdown reference files

## Usage

### Basic Chat

1. Navigate to any n8n workflow in your browser
2. Click the extension icon to open the chat
3. Start chatting with the AI about your workflow

### Example Commands

- **Debug errors**: "Node 'Hello World' shows an error"
- **Add nodes**: "Add a Google Sheets node after Google Drive to create a spreadsheet"
- **Complete workflows**: "Complete the workflow after the Hello node to send an email"
- **Analyze issues**: "Why is my HTTP Request node failing?"

### Confirmation System

When the AI proposes changes:
1. The AI explains what it wants to do
2. You see a JSON preview of the action
3. You can approve ✓ or reject ✗ the change
4. Only approved changes are applied to your workflow

## Architecture

### Files Structure

```
n8n-assistant/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for API calls
├── content.js            # Injected script for n8n pages
├── popup.html            # Main chat interface
├── popup.js              # Chat logic and AI integration
├── settings.html         # Settings page UI
├── settings.js           # Settings management
├── icons/                # Extension icons
└── README.md             # This file
```

### How It Works

1. **Content Script** (`content.js`):
   - Injects into n8n pages
   - Reads workflow JSON from the page
   - Provides methods to modify nodes

2. **Background Worker** (`background.js`):
   - Handles OpenRouter API calls
   - Manages n8n authentication
   - Fetches nodes.json definitions

3. **Popup Interface** (`popup.js`):
   - Chat UI for user interaction
   - Builds context from workflow + nodes.json
   - Parses AI responses for actions
   - Shows confirmation dialogs

4. **Settings Page** (`settings.js`):
   - Stores OpenRouter configuration
   - Manages n8n credentials
   - Allows custom prompt configuration

## Security Notes

- API keys and credentials are stored using Chrome's `chrome.storage.sync` API
- Credentials are only used to authenticate with your n8n instance
- No data is sent to third parties except OpenRouter for AI processing
- Always review proposed changes before approving them

## Supported AI Models

- Anthropic Claude 3.5 Sonnet (recommended)
- Anthropic Claude 3 Opus
- OpenAI GPT-4 Turbo
- OpenAI GPT-4
- OpenAI GPT-3.5 Turbo
- Google Gemini Pro
- Meta Llama 3 70B
- Mistral Large

## Limitations

- Currently works best with n8n instances that expose workflow data
- Some n8n features may require additional development
- Node modification depends on n8n's internal APIs
- Rate limits apply based on your OpenRouter plan

## Development

### Extending the Extension

1. **Add new node types**: Update the action parsing in `popup.js`
2. **Custom integrations**: Modify `content.js` to access more n8n features
3. **UI improvements**: Edit `popup.html` and styles
4. **API enhancements**: Update `background.js` for new API endpoints

### Testing

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the reload icon on the extension card
4. Test your changes in an n8n workflow

## Troubleshooting

### "Not on an n8n page"
- Make sure you're on an actual n8n workflow page
- Try refreshing the page
- Check that the n8n instance is accessible

### "OpenRouter API key not set"
- Go to Settings and enter your API key
- Save the settings before trying again

### "Failed to fetch nodes.json"
- Verify your n8n credentials are correct
- Make sure you're logged in to the n8n instance
- Check that the instance URL is correct (include https://)

### Changes not applying
- Make sure you approved the change
- Check the browser console for errors
- Verify you have edit permissions in n8n

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Documentation

- **GETTING_STARTED.md** - Quick 5-minute setup guide
- **QUICKSTART.md** - Overview and quick reference
- **INSTALL.md** - Detailed installation instructions
- **EXAMPLES.md** - Example prompts and use cases
- **PROMPT_TEMPLATE.md** - Template for custom instructions
- **CHECKLIST.md** - Installation verification checklist
- **PROJECT_SUMMARY.md** - Technical overview and architecture

## License

MIT License - feel free to use and modify as needed.

## Credits

Built by [Helmies.fi](https://helmies.fi) for the n8n community with ❤️

- **Helmies.fi**: [https://helmies.fi](https://helmies.fi)
- **OpenRouter API**: [openrouter.ai](https://openrouter.ai)
- **n8n**: [n8n.io](https://n8n.io)

## About Helmies.fi

Helmies.fi specializes in n8n workflow automation, providing tools, extensions, and expertise to help you get the most out of your n8n instances.
