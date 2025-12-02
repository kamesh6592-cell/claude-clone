# Claude Clone - AI Chat Interface

A beautiful Claude-style chat interface built with Next.js, Assistant UI, and Google's Gemini AI.

## Features

- 🎨 **Claude-inspired Design**: Authentic orange color scheme and clean typography
- 🤖 **AI Integration**: Powered by Google's Gemini AI model
- 💬 **Real-time Chat**: Streaming responses with markdown support
- 📱 **Responsive**: Mobile-optimized layout
- 🔧 **Modern Stack**: Next.js 15, TypeScript, Tailwind CSS
- ♿ **Accessible**: High contrast and accessible design patterns

## Tech Stack

- **Framework**: Next.js 15
- **AI SDK**: Vercel AI SDK with Google Gemini
- **UI**: Assistant UI components
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel-ready

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/kamesh6592-cell/claude-clone.git
   cd claude-clone
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Add your Google Generative AI API key to `.env.local`:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/chat/           # AI chat API endpoint
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx           # Main page
├── components/
│   ├── claude.tsx         # Main Claude interface
│   ├── markdown-text.tsx  # Markdown rendering
│   └── runtime-provider.tsx # AI runtime provider
└── lib/
    └── utils.ts           # Utility functions
```

## Key Components

### Claude Interface (`components/claude.tsx`)
- Main chat interface with Claude's distinctive styling
- Message bubbles with user/assistant differentiation
- Action bars with copy, edit, and feedback buttons
- Attachment support

### AI Integration (`app/api/chat/route.ts`)
- Google Gemini AI integration
- Streaming responses
- System prompt configuration

### Runtime Provider (`components/runtime-provider.tsx`)
- Connects UI to AI SDK
- Manages chat state and API calls

## Customization

### Styling
The interface uses Claude's signature design elements:
- Orange accent color (`#ae5630`)
- Serif fonts for content
- Clean, minimalist layout
- Subtle shadows and borders

### AI Model
Currently configured for Gemini 1.5 Pro. To change:
1. Update the model in `app/api/chat/route.ts`
2. Modify the system prompt as needed

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
The project is a standard Next.js app and can be deployed to any platform supporting Node.js.

## Environment Variables

- `GOOGLE_GENERATIVE_AI_API_KEY`: Your Google AI API key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Assistant UI](https://github.com/Yonom/assistant-ui)
- Powered by [Vercel AI SDK](https://github.com/vercel/ai)
- Inspired by [Claude](https://claude.ai) by Anthropic