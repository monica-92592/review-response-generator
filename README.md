# AI Review Response Generator

A modern web application that generates professional, contextually appropriate responses to customer reviews using AI. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **AI-Powered Responses**: Generate professional responses using OpenAI's GPT models
- **Smart Context Analysis**: Automatically detect review sentiment and context
- **Customizable Tones**: Choose from professional, friendly, formal, casual, or empathetic tones
- **Business-Specific**: Tailored responses for different business types (restaurant, retail, healthcare, etc.)
- **Response Length Control**: Generate short, medium, or long responses
- **Modern UI**: Beautiful, responsive design with excellent user experience
- **Copy & Export**: Easy copying and management of generated responses

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
cp .env.example .env.local
```

Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

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

- OpenAI for providing the GPT API
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icons