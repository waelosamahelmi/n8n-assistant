# Installation Instructions

## Quick Start

1. **Generate Icons** (Required)
   - Open `generate-icons.html` in your browser
   - Click "Download All" to download the icon files
   - Move the downloaded files to the `icons/` folder
   - You should have: `icon16.png`, `icon48.png`, `icon128.png`

2. **Install Extension**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `n8n-assistant` folder
   - The extension should now appear in your toolbar

3. **Configure Settings**
   - Click the extension icon
   - Click "Settings" button
   - Fill in required information:
     * OpenRouter API Key (get from https://openrouter.ai/keys)
     * Select AI model (Claude 3.5 Sonnet recommended)
     * n8n instance URL (e.g., https://n8n.helmies.fi)
     * Your n8n email and password
   - Click "Login to n8n"
   - Click "Fetch nodes.json"
   - Click "Save All Settings"

4. **Start Using**
   - Open any n8n workflow in your browser
   - Click the extension icon
   - Start chatting with the AI!

## Troubleshooting

### Icons Not Loading
- Make sure all three PNG files are in the `icons/` folder
- Files must be named exactly: `icon16.png`, `icon48.png`, `icon128.png`
- Reload the extension after adding icons

### Extension Won't Load
- Check the Chrome console for errors at `chrome://extensions/`
- Make sure all files are present in the folder
- Verify manifest.json is valid JSON

### Can't Connect to n8n
- Verify your n8n instance URL is correct (include https://)
- Check your email and password are correct
- Make sure you can access the n8n instance in your browser
- Some n8n instances may have CORS restrictions

## Custom Icons

If you want to use custom icons:
1. Create PNG files at 16x16, 48x48, and 128x128 pixels
2. Name them `icon16.png`, `icon48.png`, `icon128.png`
3. Place them in the `icons/` folder
4. Reload the extension

## Development Mode

To modify the extension:
1. Make changes to any file
2. Go to `chrome://extensions/`
3. Find "n8n AI Assistant"
4. Click the reload icon (circular arrow)
5. Test your changes

## Getting Help

- Check README.md for full documentation
- Review the code comments for implementation details
- Open an issue on GitHub if you find bugs
