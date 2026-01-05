# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/9f734f43-7113-4d89-8e7f-88f44b6ccf24

## Indigenous Rising AI - Business Support Platform

A culturally respectful AI-powered platform supporting Indigenous entrepreneurs across Canada. Built with React, TypeScript, and Tailwind CSS.

### Key Features
- ✅ PIPEDA-compliant data privacy
- ✅ Accessible WCAG 2.1 Level AA
- ✅ Responsive design (mobile-first)
- ✅ SEO optimized with structured data
- ✅ Image optimization (WebP, lazy loading)
- ✅ Error boundaries and loading states
- ✅ Form validation with React Hook Form + Zod

### Development Roadmap

#### Phase 1 (Current - MVP Launch)
- [x] Core business platform features
- [x] Contact forms and data request handling
- [x] Newsletter subscription
- [x] PIPEDA compliance implementation
- [x] Accessibility features (toolbar, keyboard nav)
- [x] SEO optimization and meta tags
- [x] Image optimization and responsive images

#### Phase 2 (Coming Soon)
- [ ] **Multi-language support** (English, French, Ojibwe, Cree, Inuktitut, Mi'kmaq)
- [ ] User authentication and accounts
- [ ] Business planning tools
- [ ] Funding database and matching
- [ ] AI-powered business insights
- [ ] Community features and networking

#### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with government portals
- [ ] Elder wisdom knowledge base
- [ ] Virtual mentorship programs

### Note on Multi-Language Support
The platform currently displays English content with cultural terms in Indigenous languages. Full multi-language translation is planned for Phase 2. The LanguageSelector component has been removed from navigation to avoid confusion until this feature is fully implemented.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9f734f43-7113-4d89-8e7f-88f44b6ccf24) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Running tests

This project uses `vitest` and `@testing-library/react` for unit tests. Run tests with:

```sh
npm run test
```

Run tests in watch mode during development:

```sh
npm run test:watch
```

New tests added cover core scaffolds: Dashboard components, Plan stepper, Funding list, and Impact logs. Analytics events are stored to a local queue (`analytics-queue-v1`) for batching in production.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9f734f43-7113-4d89-8e7f-88f44b6ccf24) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
