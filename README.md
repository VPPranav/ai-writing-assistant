# AI Writing Assistant

A modern, AI-powered writing assistant built with Next.js that uses OpenAI's API to enhance or auto-generate content. This application helps users create, edit, and refine their writing with the assistance of advanced AI models.

## ✨ Features

- **AI-Powered Text Generation**: Continue, rewrite, expand, or summarize your content using OpenAI's powerful models
- **Tone Adjustment**: Modify your writing tone (formal, casual, persuasive, informative, creative)
- **Document Management**: Save, load, and organize your documents in local storage
- **Dark/Light Theme**: Seamless theme switching for comfortable writing in any lighting condition
- **Responsive Design**: Fully responsive interface that works on desktop, tablet, and mobile devices
- **Fullscreen Mode**: Distraction-free writing experience with fullscreen toggle
- **Word and Character Count**: Real-time word and character counting
- **Copy Functionality**: Easily copy your content to clipboard
- **Error Handling**: Robust error handling and fallback for API issues

## 🛠️ Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI/Styling**: Tailwind CSS, shadcn/ui components
- **AI Integration**: OpenAI API (GPT-4o)
- **State Management**: React Hooks
- **Visual Effects**: Spline 3D models (with fallback)
- **Build/Dev Tools**: ESLint, PostCSS, Autoprefixer

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x or later
- npm, yarn, or pnpm package manager
- An OpenAI API key ([Get one here](https://platform.openai.com/account/api-keys))

## 🚀 Installation

1. **Clone the repository**

\`\`\`bash
git clone https://github.com/VPPranav/ai-writing-assistant.git
cd ai-writing-assistant
\`\`\`

2. **Install dependencies**

\`\`\`bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
\`\`\`

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the following content:

\`\`\`
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
\`\`\`

Replace `your_openai_api_key_here` with your actual OpenAI API key.

4. **Run the development server**

\`\`\`bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev
\`\`\`

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

## 📝 Usage

### Basic Usage

1. **Start Writing**: Click in the editor area and begin typing your content
2. **Generate Content**: Select an action (continue, rewrite, expand, summarize), add optional instructions, and click Generate
3. **Adjust Tone**: Select a tone option from the dropdown to change the style of generated content
4. **Save Document**: Click the Save button to store your document locally
5. **Manage Documents**: Switch to the Documents tab to view, load, or delete your saved documents

### API Key Management

- The application allows you to input your OpenAI API key directly in the interface
- Click the "API Key" button to open the dialog and enter your key
- Your key is stored securely in your browser's local storage
- If no API key is provided, the application runs in demo mode with limited functionality

### Fullscreen Mode

Toggle fullscreen mode by clicking the expand/collapse icon in the top right corner of the editor for a distraction-free writing experience.

## 🧩 Project Structure

\`\`\`
ai-writing-assistant/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page component
├── components/               # React components
│   ├── ui/                   # UI components (shadcn/ui)
│   ├── writing-assistant.tsx # Main writing assistant component
│   ├── header.tsx            # Header component
│   ├── footer.tsx            # Footer component
│   ├── spline-model.tsx      # 3D model component
│   └── fallback-3d-model.tsx # Fallback for 3D model
├── lib/                      # Utilities and helper functions
│   ├── document-storage.ts   # Document storage utilities
│   ├── openai.ts             # OpenAI integration
│   └── utils.ts              # General utilities
├── public/                   # Static files
├── next.config.js            # Next.js config (JS version)
├── postcss.config.js         # PostCSS config
├── tailwind.config.ts        # Tailwind CSS config
├── tsconfig.json             # TypeScript config
├── package.json              # Project dependencies and scripts
└── requirements.txt          # Python requirements (for AI/backend)
\`\`\`

## 📄 Dependencies

This project uses Next.js with React and various utilities. The main dependencies include:

- next
- react
- react-dom
- @ai-sdk/openai
- ai
- next-themes
- lucide-react
- @splinetool/runtime
- tailwind CSS and its plugins

For a complete list, see the `package.json` file.

## 🔄 API Integration

The AI Writing Assistant integrates with OpenAI's API to generate and modify text. The integration is handled in `lib/openai.ts` and `app/api/generate/route.ts`.

Key features of the API integration:
- Fallback to demo mode if API key is missing or invalid
- Error handling with appropriate user feedback
- Rate limiting and quota management detection
- Retry mechanism with exponential backoff

## 🎨 Customization

### Themes

The application supports both light and dark themes. You can customize the themes by modifying the color variables in `app/globals.css`.

### UI Components

Most UI components are built with shadcn/ui, which makes it easy to customize the look and feel of the application. You can modify these components in the `components/ui` directory.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for their powerful API
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Spline](https://spline.design/) for the 3D design tools
- [Lucide Icons](https://lucide.dev/) for the icon set

## Package Management

Since this is a Next.js project, we use `package.json` instead of `requirements.txt` for dependency management. Here's the content for your `package.json` file with all required dependencies:
\`\`\`
