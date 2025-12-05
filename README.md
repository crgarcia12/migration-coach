<div align="center">
  <img src="src/frontend/public/icon/logo.png" alt="Migration Coach Logo" width="200"/>
  
  # Migration Coach
  
  An AI-powered sales coaching platform that helps sellers deliver compelling migration assessment presentations tailored to each customer's unique context.
  
  ![Migration Coach Interface](readme-media/screenshot.png)

  ---
  
  🔒 **Security First**: No API keys are ever deployed. Users configure their own Azure credentials, stored only in their browser.
  
  ---
</div>

## What is Migration Coach?

Migration Coach is an interactive training tool that simulates real customer interactions, helping sales professionals practice and perfect their migration assessment presentations. Using Azure OpenAI, it provides real-time coaching feedback based on customer context, slide content, and sales best practices.

## Key Features

### 🎯 Customer Discovery
Before the presentation, the coach guides you through a discovery process to understand:
- Customer's urgency level and timeline
- Modernization appetite
- Audience type (technical vs business)
- Budget sensitivity
- Specific pain points

### 🎤 Interactive Presentation Practice
- **Real-time Coaching**: Get immediate feedback on your responses
- **Slide-by-Slide Guidance**: Practice with actual presentation materials
- **OCR Integration**: Automatically extracts slide content using Azure OpenAI Vision
- **Adaptive Flow**: AI optimally orders slides based on customer context

### ⚙️ Flexible Configuration
- **In-App Settings Page**: Configure Azure services directly in the browser
- **Environment Variables**: Support for .env file configuration
- **Custom Override**: Save custom settings in browser localStorage
- **Real-time Updates**: Changes take effect immediately
- **Secure Display**: Mask API keys with option to show/hide

### 🧠 Intelligent AI Coach
The coach provides:
- **Direct, challenging feedback** - pushes sellers to excellence
- **Context-aware responses** - tailored to customer situation
- **Red flag detection** - calls out weak language or problematic statements
- **Specific guidance** - demands confidence and specificity

### 📊 Multi-Tab Interface
- **Chat**: Interactive coaching conversation
- **Key Points**: Important messages for the current slide
- **Objections**: Potential customer concerns to address
- **Red Flags**: What NOT to say
- **Flow**: AI-generated presentation order with reasoning

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling

### AI & Azure Services
- **Azure OpenAI** (GPT-5.1) for coaching intelligence and slide text extraction (Vision API)
- Configurable through environment variables or in-app settings

## Getting Started

### Prerequisites
- Node.js (v18+) - for local development
- Azure OpenAI access (with Vision-enabled model like GPT-5.1)

### Option 1: Use the Deployed Version

Visit the deployed application at: **[Your Azure Static Web App URL]**

On first visit, you'll be prompted to configure your Azure OpenAI credentials. These are:
- 🔒 Stored only in your browser (localStorage)
- 🚫 Never sent to any server or repository
- ✅ Completely private and secure
- 💾 Cached so you don't need to re-enter them

### Option 2: Local Development

1. Clone the repository:
```bash
git clone https://github.com/crgarcia12/migration-coach.git
cd migration-coach/src/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (Optional for local dev):
Create a `.env` file in `src/frontend` (see `.env.example`):
```env
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
VITE_AZURE_OPENAI_API_KEY=your-api-key
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-5.1
```

**Important Security Notes**:
- Environment variables are only for local development convenience
- They are NOT included in production builds
- `.env` files are gitignored and never committed
- In production, users configure their own credentials via the Settings page

**Alternatively**, skip the `.env` file and configure through the in-app Settings page (⚙️ icon):
- Works the same for local development and production
- Settings saved in browser localStorage
- No risk of accidentally committing credentials

4. Run the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

## How It Works

1. **Discovery Phase**: Answer questions about your customer to establish context
2. **AI Processing**: The system:
   - Extracts text from all slides using OCR
   - Generates an optimized presentation flow
   - Creates talking points for each slide
3. **Practice Mode**: Navigate through slides, respond to coaching prompts
4. **Real-time Feedback**: Get challenging, context-aware coaching on your responses

## Project Structure

```
src/frontend/
├── src/
│   ├── components/
│   │   ├── CoachingInterface.tsx  # Main coaching interface
│   │   └── CustomerDiscovery.tsx  # Customer context gathering
│   ├── utils/
│   │   ├── azureAICoach.ts        # Azure OpenAI integration
│   │   ├── slideOCR.ts            # Document Intelligence OCR
│   │   ├── presentationFlow.ts    # AI flow generation
│   │   └── coachingEngine.ts      # Fallback coaching logic
│   ├── data/
│   │   └── slides.ts              # Sample presentation slides
│   └── types/
│       └── index.ts               # TypeScript definitions
└── public/
    └── slides/                    # Presentation slide images
```

## Key Components

### Customer Context
Captures essential customer information:
- Urgency and timeline
- Modernization appetite
- Audience characteristics
- Budget sensitivity
- Specific pain points

### Slide Intelligence
Each slide includes:
- Key talking points
- Potential objections
- Red flags to avoid
- OCR-extracted content

### AI Coach Personality
- **Assertive and challenging** - pushes for excellence
- **Context-aware** - tailors feedback to customer situation
- **Specific and demanding** - calls out weak language
- **Results-focused** - demands confidence and clarity

## Development

### Build for Production
```bash
cd src/frontend
npm run build
```

### Run Linter
```bash
npm run lint
```

### Preview Production Build
```bash
npm run preview
```

## Deployment

This project uses GitHub Actions to automatically deploy to Azure Static Web Apps.

### Quick Deploy

1. Create an Azure Static Web App
2. Add the deployment token to GitHub Secrets as `AZURE_STATIC_WEB_APPS_API_TOKEN`
3. Push to the `main` branch

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Security Model

**No credentials are ever deployed:**
- The production build contains NO Azure API keys
- Users provide their own Azure OpenAI credentials
- Credentials are stored only in the user's browser (localStorage)
- Each user brings their own Azure subscription
- Zero credential management on your part

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

Built with Azure AI services to help sales professionals deliver exceptional migration assessment presentations.
