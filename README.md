# LangScope

**Multi-domain LLM Evaluation Framework using TrueSkill + Plackett-Luce**

LangScope is a comprehensive framework for evaluating large language models across multiple domains including text, code, speech, and vision. It combines mathematical rigor with practical evaluation needs, featuring a unique hand-drawn "sketch UI" design aesthetic.

## Key Features

### Model Evaluation & Rankings
- **10-Dimensional Ratings** - Compare models on quality, cost, speed, reliability, and more
- **Domain-Specific Leaderboards** - Medical, legal, coding, multilingual, and custom domain rankings
- **Transfer Learning** - Get ratings for new domains via similar evaluated domains
- **Specialist Detection** - Identify models that excel in specific niches
- **Cost-Adjusted Scores** - Find the best model within your budget

### Arena - Interactive Model Comparison
- **Blind A/B Testing** - Compare model responses without knowing which model produced which
- **Multi-Model Battles** - Rank multiple model responses in a single session
- **Ground Truth Evaluation** - Objective metrics for ASR, TTS, code execution, and visual QA
- **Session Management** - Track evaluation history and voting patterns

### My Models - Test Your Own
- **Custom Model Registration** - Test your fine-tuned or self-hosted models
- **API Endpoint Testing** - Connect models via OpenAI-compatible APIs
- **Performance Tracking** - Monitor how your models rank against public models
- **Private Evaluations** - Keep your model results confidential

### User & Organization Management
- **User Profiles** - Customizable profiles with avatar, timezone, and preferences
- **Organizations** - Create teams and collaborate on evaluations
- **Team Management** - Invite members with role-based permissions (owner, admin, member, viewer)
- **Billing & Subscriptions** - Free, Pro, and Enterprise plans with usage tracking

## Project Structure

```
langscope/
├── Algorithm/                    # Backend API (Python/FastAPI)
│   ├── langscope/
│   │   ├── api/                  # FastAPI routes and schemas
│   │   │   ├── routes/           # API endpoints
│   │   │   │   ├── arena.py      # Arena evaluation endpoints
│   │   │   │   ├── billing.py    # Subscription & payment endpoints
│   │   │   │   ├── models.py     # Model management
│   │   │   │   ├── organizations.py  # Team management
│   │   │   │   ├── users.py      # User profile endpoints
│   │   │   │   └── ...
│   │   │   └── main.py           # FastAPI application
│   │   ├── core/                 # Core business logic
│   │   ├── database/             # MongoDB schemas and operations
│   │   ├── domain/               # Domain management
│   │   ├── feedback/             # User feedback processing
│   │   └── transfer/             # Transfer learning algorithms
│   ├── test/                     # Test suite
│   └── requirements.txt
│
└── frontend/                     # Frontend UI (React/TypeScript)
    ├── src/
    │   ├── api/                  # API client and React Query hooks
    │   │   ├── hooks/            # useProfile, useOrganization, useBilling, etc.
    │   │   └── types/            # TypeScript interfaces
    │   ├── components/
    │   │   ├── arena/            # Arena-specific components
    │   │   ├── layout/           # Page layout, sidebar
    │   │   ├── sketch/           # Sketch UI components
    │   │   ├── sticky/           # Sticky note components
    │   │   └── user/             # Profile, team, billing components
    │   ├── pages/
    │   │   ├── Arena/            # Model comparison arena
    │   │   ├── Rankings/         # Leaderboards
    │   │   ├── Models/           # Model explorer
    │   │   ├── MyModels/         # User's custom models
    │   │   ├── User/             # Profile, org, team, billing, settings
    │   │   └── ...
    │   ├── store/                # Zustand state management
    │   └── styles/               # Global styles and theme
    └── package.json
```

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional - for caching)

### Backend Setup

```bash
cd Algorithm
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp env.template .env
# Edit .env with your MongoDB URI and other settings

# Run the server
uvicorn langscope.api.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.example .env
# Edit .env with API URL and Supabase credentials (optional)

# Run development server
npm run dev
```

### Local Authentication (Development)

For local development without Supabase:

```bash
# Backend: Enable local auth mode
LOCAL_AUTH_MODE=true

# Use test credentials:
# Email: test@langscope.dev
# Password: TestPassword123!
```

## API Documentation

Once running, access the interactive API docs at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/models` | List all models with ratings |
| `GET /api/v1/rankings/{domain}` | Get domain-specific leaderboard |
| `POST /api/v1/arena/sessions` | Start an arena evaluation session |
| `POST /api/v1/arena/vote` | Submit comparison vote |
| `GET /api/v1/users/profile` | Get user profile |
| `GET /api/v1/organizations/my` | Get user's organization |
| `GET /api/v1/billing/subscription` | Get subscription status |

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - Document database for flexible schema
- **PyMongo** - MongoDB driver
- **Pydantic** - Data validation
- **Redis** - Caching layer (optional)
- **Qdrant** - Vector database for semantic search (optional)

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Query** - Server state management
- **Zustand** - Client state management
- **Vite** - Build tool
- **Rough.js** - Hand-drawn graphics
- **Phosphor Icons** - Icon library

### Authentication
- **Supabase Auth** - Production authentication
- **Local Auth** - Development mode with preset credentials

## Design Philosophy

LangScope features a unique "Sketch UI" design that combines:
- Hand-drawn borders and elements using Rough.js
- Pastel sticky note colors for different sections
- Handwriting-style fonts for a friendly feel
- Clean, accessible interface despite the playful aesthetic

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

See LICENSE file for details.

## Support

For questions or issues, please open a GitHub issue or contact the maintainers.
