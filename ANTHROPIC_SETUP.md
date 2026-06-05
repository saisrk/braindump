# Anthropic API Setup Guide

## Environment Variable Setup

To enable LLM-based content analysis with Anthropic's Claude models, add the following environment variable to your project:

### Required Environment Variable

```
ANTHROPIC_API_KEY=sk-ant-...
```

**Where to add it:**
- Local development: Add to `.env.local` 
- Production: Add via Vercel Dashboard → Settings → Environment Variables
- Or add it to the `Vars` section in your v0 project settings

### Getting Your API Key

1. Visit [Anthropic Console](https://console.anthropic.com)
2. Sign up or log in with your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key starting with `sk-ant-`
6. Add it as `ANTHROPIC_API_KEY` to your environment

## How It's Used

The content analysis system uses Claude 3.5 Haiku (the fast, efficient model) for:

- **Blog/Article Analysis**: Extracts author, publication date, domain, content type, and key points
- **Video Metadata Extraction**: Analyzes video URLs to extract title, channel, duration, and learning points
- **Key Point Generation**: Creates concise takeaways from raw text content

All analysis happens server-side for security and performance.

## API Features

- **Model**: `claude-3-5-haiku-20241022` (Claude 3.5 Haiku)
- **Max Tokens**: 1024 for detailed analysis, 512 for simple point extraction
- **JSON Output**: Structured metadata in consistent JSON format
- **Graceful Fallbacks**: Returns minimal data if analysis fails

## Cost Considerations

Claude 3.5 Haiku is optimized for cost-effective operations:
- Input: $0.80 per million tokens
- Output: $4.00 per million tokens
- Fast processing: ~100-500ms per analysis

Typical blog analysis uses ~500-800 tokens, video ~200-300 tokens.

## Testing the Integration

Once `ANTHROPIC_API_KEY` is set, the following features work:

1. **Capture Page**: Navigate to `/capture` (requires auth)
2. **Paste a URL**: Enter a blog or article URL
3. **Click "Next: Organize"**: System will analyze the content
4. **View Extracted Metadata**: See author, domain, key points, and content type

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API returns null author | Content may not have clear author metadata; falls back to empty |
| Slow responses | Check Anthropic API status, verify network connection |
| JSON parse errors | Claude occasionally formats JSON differently; gracefully falls back |
| Missing key points | Text may be too short; ensure content is substantial |

## Files Updated

- `lib/ai/content-analysis.ts` - Now uses Anthropic SDK directly
- `package.json` - Added `@anthropic-ai/sdk` dependency
