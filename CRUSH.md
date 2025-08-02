# FieldPro - Development Guidelines for Agentic Coding Agents

## Project Structure
- `backend/` - Node.js/Express API with TypeScript
- `web-dashboard/` - React/Tailwind dashboard
- `mobile/` - React Native mobile app (in progress)
- `database/` - SQL schemas and seed data

## Essential Commands
```bash
# Install all dependencies
npm run install:all

# Start development environment (API + Web Dashboard)
npm run dev

# Backend-specific commands
npm run dev --prefix backend        # Start backend in dev mode
npm run build --prefix backend      # Build backend TypeScript
npm run test --prefix backend       # Run backend tests
npm run lint --prefix backend       # Lint backend code

# Web Dashboard commands
npm run start --prefix web-dashboard # Start frontend dev server
npm run build --prefix web-dashboard # Build frontend for production
npm run test --prefix web-dashboard  # Run frontend tests

# Run a specific test file
npm test --prefix backend -- path/to/test/file.test.ts
npm test --prefix web-dashboard -- path/to/test/file.test.ts
```

## Code Style Guidelines

### General Principles
- Follow existing patterns in the codebase
- Prefer explicit types over implicit typing
- Use meaningful variable and function names
- Keep functions small and focused

### Backend (TypeScript/Node.js)
- Use TypeScript with strict typing
- Organize code in controllers, services, and routes
- Use async/await for asynchronous operations
- Implement proper error handling with try/catch
- Follow RESTful API design principles
- Use environment variables for configuration

### Frontend (TypeScript/React)
- Use TypeScript with React functional components
- Use Tailwind CSS for styling
- Follow existing component patterns
- Use React hooks appropriately
- Implement proper form validation with Formik/Yup
- Use Axios for API calls
- Handle loading states and errors gracefully

### Database
- Use PostgreSQL with proper relationships
- Follow existing table and column naming conventions
- Use indexes for performance optimization
- Implement proper data validation

### Naming Conventions
- camelCase for variables and functions
- PascalCase for components and classes
- UPPER_SNAKE_CASE for constants
- Descriptive names that explain purpose

### Error Handling
- Use appropriate HTTP status codes
- Provide meaningful error messages
- Log errors appropriately
- Implement proper validation

### Testing
- Write unit tests for services and utilities
- Write integration tests for API endpoints
- Use Jest for testing framework
- Test both success and error cases

### Git Workflow
- Create feature branches for new work
- Write clear, concise commit messages
- Keep commits focused on single changes
- Rebase on main before merging

## Additional Notes
- Check .env.example files for required environment variables
- Use Docker for database setup (db-docker-compose.yml)
- Refer to API_DOCUMENTATION.md for API details