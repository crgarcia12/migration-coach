# Migration Coach - Sales Enablement Application

A visually appealing React application designed to coach sellers on presenting migration assessments to customers. The app uses an assertive, challenger-style coaching approach to prepare sellers for tough customer conversations.

## Features

### 1. Customer Discovery Phase
- Interactive questionnaire capturing:
  - **Urgency**: Immediate, Planned, or Exploratory
  - **Timeline**: Optional deadline information
  - **Modernization Appetite**: Conservative, Balanced, or Aggressive
  - **Audience Type**: Technical, Business, or Mixed
  - **Pain Points**: Pre-defined and custom options
  - **Budget Sensitivity**: High, Medium, or Low

### 2. Coaching Interface
Split-screen layout with:

#### Left Panel - Slide Viewer
- Full-size slide display
- Sequential navigation with Previous/Next buttons
- Thumbnail strip for quick navigation to any slide
- Current slide counter

#### Right Panel - Dynamic Coaching Tabs
- **Coach Chat**: Real-time conversational coaching
  - AI-powered responses adapt to seller's answers
  - Challenging, supportive, or neutral feedback based on response quality
  - Sentiment indicators (🔥 challenging, ✅ supportive, 🎓 neutral)
  
- **Key Points**: What to emphasize on current slide
  - Contextually relevant based on customer profile
  
- **Objections**: Potential customer questions
  - Paired with suggested talking points
  
- **Red Flags**: What NOT to say
  - Audience-specific warnings

### 3. Intelligent Coaching Engine
The AI coach:
- Analyzes seller responses for weak language, jargon, brevity
- Detects red flag violations
- Provides context-aware feedback based on:
  - Customer urgency level
  - Audience type (technical vs. business)
  - Budget sensitivity
  - Modernization appetite
- Maintains conversational flow with varied response patterns
- Balances challenging with supportive feedback

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive styling
- **Type-safe** architecture with comprehensive TypeScript interfaces

## Sample Data

Currently uses 5 hardcoded slides covering:
1. Executive Summary
2. Current Architecture Assessment
3. Migration Strategy
4. Risk Analysis
5. Investment & ROI

Each slide includes key points, potential objections, talking points, and red flags.

## Getting Started

```bash
# Install dependencies
npm install

# Configure Azure OpenAI (optional but recommended)
cp .env.example .env
# Edit .env and add your Azure OpenAI credentials

# Run development server
npm run dev

# Build for production
npm run build
```

## Azure AI Foundry Setup

The app uses **Azure OpenAI** for intelligent coaching responses. To enable AI-powered coaching:

### 1. Create Azure OpenAI Resource
- Go to [Azure Portal](https://portal.azure.com)
- Create an "Azure OpenAI" resource
- Deploy a model (GPT-4 recommended, GPT-3.5-turbo also works)

### 2. Get Your Credentials
- Navigate to your Azure OpenAI resource
- Go to "Keys and Endpoint"
- Copy the **Endpoint** and **Key 1**
- Note your **Deployment name** from the "Model deployments" section

### 3. Configure the App
Create a `.env` file in the `src/frontend` directory:

```env
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
VITE_AZURE_OPENAI_API_KEY=your-api-key-here
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-4
```

### 4. Restart the Dev Server
The app will automatically use Azure AI for coaching if configured.

**Note**: If Azure OpenAI is not configured, the app falls back to rule-based coaching (still functional but less intelligent).

## User Flow

1. **Start**: Seller answers 5-step customer discovery questionnaire
2. **Coach**: App presents slides one-by-one with coaching panel
3. **Practice**: Seller types responses to coach's challenging questions
4. **Learn**: Coach provides assertive, real-time feedback
5. **Navigate**: Seller can jump between slides or go sequentially
6. **Tabs**: Switch between chat, key points, objections, and red flags

## Coaching Philosophy

The app employs a **challenger coaching style**:
- Direct and assertive tone
- Pushes sellers to think deeper
- Won't accept surface-level answers
- Contextualizes feedback to the specific customer scenario
- Balances tough love with genuine support when earned

## Future Enhancements

- Backend integration for PowerPoint upload
- AI-powered slide parsing
- Session persistence and replay
- Performance analytics and scoring
- Multi-user sessions with peer coaching
- Export coaching transcripts
- Integration with CRM systems

## Design Principles

- **Visual Appeal**: Modern gradient backgrounds, smooth transitions, clean UI
- **Usability**: Intuitive navigation, clear feedback, accessible controls
- **Performance**: Fast load times, smooth interactions
- **Responsiveness**: Adapts to different screen sizes (optimized for desktop)

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
