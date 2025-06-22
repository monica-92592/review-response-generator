# AI Review Response Generator

A modern web application that generates professional, contextually appropriate responses to customer reviews using AI. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **AI-Powered Responses**: Generate professional responses using OpenAI's GPT-4 API
- **Smart Context Analysis**: Automatically detect review sentiment and context
- **Customizable Tones**: Choose from professional, friendly, formal, casual, or empathetic tones
- **Business-Specific**: Tailored responses for different business types (restaurant, retail, healthcare, etc.)
- **Response Length Control**: Generate short, medium, or long responses
- **Modern UI**: Beautiful, responsive design with excellent user experience
- **Copy & Export**: Easy copying and management of generated responses
- **Rate Limiting**: Built-in rate limiting to manage API usage
- **Error Handling**: Comprehensive error handling and user feedback

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: OpenAI GPT-4 API
- **Deployment**: Vercel (recommended)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/review-response-generator.git
cd review-response-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. **Configure OpenAI API Key:**
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Add it to your `.env.local` file:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 OpenAI API Setup

### Getting Your API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the generated key (starts with `sk-`)
5. Add it to your `.env.local` file

### API Usage & Costs

- **Model**: GPT-4 (most capable model)
- **Cost**: ~$0.03 per 1K tokens (approximately $0.01-0.05 per response)
- **Rate Limits**: 10 requests per minute, 100 per hour (configurable)
- **Token Usage**: 100-200 tokens per response depending on length

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-your-api-key-here

# Optional
NEXT_PUBLIC_APP_NAME="AI Review Response Generator"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎯 Usage

1. **Enter Review Details**: Paste the customer review in the text area
2. **Select Rating**: Choose the star rating (1-5 stars)
3. **Choose Business Type**: Select your business category
4. **Set Response Tone**: Pick the desired tone for your response
5. **Select Length**: Choose short, medium, or long response
6. **Generate Response**: Click "Generate Response" to create an AI-powered reply
7. **Copy & Use**: Copy the generated response and use it for your business

## 🏗️ Project Structure

```
review-response-generator/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── generate-response/
│   │       └── route.ts   # OpenAI API endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard page
├── components/            # Reusable components
│   └── ui/               # UI components
│       ├── Header.tsx    # Navigation header
│       ├── Button.tsx    # Button component
│       ├── Card.tsx      # Card container
│       ├── Input.tsx     # Input fields
│       ├── Select.tsx    # Dropdown select
│       └── Badge.tsx     # Status badges
├── lib/                  # Utility libraries
│   ├── openai.ts         # OpenAI client & functions
│   └── utils.ts          # Utility functions
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🎨 Design System

The application uses a consistent design system with:

- **Primary Colors**: Blue-based color scheme
- **Typography**: Inter font family
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable UI components with variants
- **Responsive**: Mobile-first responsive design

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### API Development

The application includes a robust API setup:

- **Rate Limiting**: Built-in rate limiting to prevent API abuse
- **Error Handling**: Comprehensive error handling for all API scenarios
- **Validation**: Input validation for all API endpoints
- **Security**: API key validation and secure request handling

### Component Development

All UI components are located in `components/ui/` and follow a consistent pattern:

- TypeScript interfaces for props
- Tailwind CSS for styling
- Responsive design
- Accessibility features
- Loading and error states

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

**Important**: Don't forget to set the `OPENAI_API_KEY` environment variable in your deployment platform.

## 📈 Roadmap

- [ ] Multiple response variations
- [ ] Response history and management
- [ ] Template library
- [ ] Analytics dashboard
- [ ] Team collaboration features
- [ ] Mobile app
- [ ] API integrations (Google Reviews, Yelp, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help, please:

1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/yourusername/review-response-generator/issues)
3. Create a new issue with details about your problem

## 🙏 Acknowledgments

- OpenAI for providing the GPT-4 API
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icons