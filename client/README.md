# Scribo Client

Frontend for the Scribo AI meeting summarization app.

## Stack

- React 19
- Vite
- Tailwind CSS
- React Router
- Framer Motion

## Development

Install dependencies:

```bash
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5001
VITE_UPLOAD_TOKEN=your_secure_upload_token_here
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Key Pages

- `/` home landing page
- `/app` upload workflow
- `/result` generated summary view
- `/features` pricing and feature comparison
- `/contact` contact form
