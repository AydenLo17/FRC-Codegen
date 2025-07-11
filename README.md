# FRC Codegen

A modern React web application for FRC (FIRST Robotics Competition) code generation, built with Vite and deployed on GitHub Pages.

## 🚀 Features

- **Modern React**: Built with React 18 and Vite for fast development
- **Responsive Design**: Works great on desktop and mobile devices
- **GitHub Pages Ready**: Automatically deploys to GitHub Pages
- **ESLint Integration**: Code quality and consistency
- **Hot Module Replacement**: Fast development with instant updates

## 🛠️ Development

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/AydenLo17/frc-codegen.git
   cd frc-codegen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the app running.

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run deploy` - Deploy to GitHub Pages (manual deployment)

## 🚀 Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment

The app automatically deploys to GitHub Pages when you push to the `main` branch. The workflow is defined in `.github/workflows/deploy.yml`.

### Manual Deployment

You can also deploy manually using:

```bash
npm run deploy
```

## 📁 Project Structure

```
frc-codegen/
├── public/           # Static assets
├── src/              # Source code
│   ├── App.jsx       # Main App component
│   ├── App.css       # App styles
│   ├── main.jsx      # Entry point
│   └── index.css     # Global styles
├── .github/          # GitHub workflows
├── package.json      # Dependencies and scripts
├── vite.config.js    # Vite configuration
└── README.md         # This file
```

## 🔧 Configuration

### GitHub Pages Setup

1. Go to your repository settings
2. Navigate to "Pages" in the sidebar
3. Under "Source", select "GitHub Actions"
4. The app will automatically deploy when you push to the main branch

### Vite Configuration

The `vite.config.js` file is configured with:
- React plugin for JSX support
- Base path set to `/frc-codegen/` for GitHub Pages
- Build output directory set to `dist`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Live Demo**: [https://aydenlo17.github.io/frc-codegen/](https://aydenlo17.github.io/frc-codegen/)
- **Repository**: [https://github.com/AydenLo17/frc-codegen](https://github.com/AydenLo17/frc-codegen)