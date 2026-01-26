# Contributing to Chore Tracker Backend

Thank you for considering contributing to the Chore Tracker Backend! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Firebase project with Firestore enabled
- Git installed and configured

### Setup Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/chore-tracker-backend.git
   cd chore-tracker-backend
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/chore-tracker-backend.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

6. **Verify setup**:
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

## 💻 Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

Before committing, ensure all tests pass:

```bash
# Run linter
npm run lint

# Run tests
npm run test

# Check coverage
npm run test:cov

# Build application
npm run build
```

### 4. Commit Your Changes

Follow the [commit message guidelines](#commit-message-guidelines):

```bash
git add .
git commit -m "feat: add new feature description"
```

### 5. Keep Your Branch Updated

Regularly sync with upstream:

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

1. Go to your fork on GitHub
2. Click "Pull Request"
3. Fill out the PR template completely
4. Link any related issues
5. Wait for CI checks to pass
6. Address any review feedback

## 📝 Pull Request Process

### Before Submitting

- [ ] All tests pass locally
- [ ] Linting passes without errors
- [ ] Code builds successfully
- [ ] Documentation is updated
- [ ] PR template is filled out
- [ ] Branch is up-to-date with main

### PR Requirements

1. **Descriptive Title**: Use conventional commit format
   - `feat: add user profile feature`
   - `fix: resolve authentication bug`
   - `docs: update API documentation`

2. **Complete Description**: Fill out the PR template with:
   - What changes were made
   - Why the changes are needed
   - How to test the changes
   - Screenshots (if applicable)

3. **Passing CI**: All GitHub Actions must pass:
   - ✅ Linting
   - ✅ Tests
   - ✅ Build
   - ✅ Security audit

4. **Code Review**: At least one approval from a maintainer

### After PR is Merged

1. Delete your feature branch
2. Update your local main branch:
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

## 🎨 Coding Standards

### TypeScript Guidelines

- Use strict TypeScript mode
- Provide explicit types for function parameters and return values
- Avoid using `any` (use `unknown` if type is truly unknown)
- Use interfaces for object shapes
- Use enums for fixed sets of values

### NestJS Best Practices

- **Modules**: Group related functionality
- **Controllers**: Handle HTTP requests only
- **Services**: Contain business logic
- **DTOs**: Validate all input data
- **Guards**: Handle authentication and authorization
- **Filters**: Handle exceptions consistently

### Code Style

This project uses:
- **ESLint** for linting
- **Prettier** for formatting

Run before committing:
```bash
npm run lint      # Check for issues
npm run format    # Auto-format code
```

### File Naming

- Use kebab-case for file names: `user-profile.service.ts`
- Use PascalCase for class names: `UserProfileService`
- Use camelCase for variables and functions: `getUserProfile`
- Use UPPER_SNAKE_CASE for constants: `MAX_RETRY_COUNT`

### Code Organization

```typescript
// 1. Imports (grouped by type)
import { Injectable } from '@nestjs/common';
import { SomeService } from './some.service';
import type { SomeType } from './types';

// 2. Class declaration
@Injectable()
export class MyService {
  // 3. Properties
  private readonly logger = new Logger(MyService.name);

  // 4. Constructor
  constructor(private readonly someService: SomeService) {}

  // 5. Public methods
  async publicMethod() {
    // ...
  }

  // 6. Private methods
  private privateMethod() {
    // ...
  }
}
```

## 🧪 Testing Guidelines

### Test Structure

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let mockDependency: jest.Mocked<DependencyType>;

  beforeEach(async () => {
    // Setup
  });

  describe('methodName', () => {
    it('should do something specific', async () => {
      // Arrange
      const input = 'test';

      // Act
      const result = await service.methodName(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should handle error case', async () => {
      // Test error scenarios
    });
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- Test happy paths and error cases
- Test edge cases and boundary conditions
- Mock external dependencies (Firebase, etc.)

### Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# Specific file
npm run test -- user.service.spec.ts
```

## 📋 Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test updates
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
feat: add user profile endpoint
fix: resolve token validation issue
docs: update API documentation
refactor: simplify authentication logic
test: add tests for registry service
chore: update dependencies
```

### Detailed Example

```
feat(auth): add refresh token support

- Implement refresh token generation
- Add refresh token validation endpoint
- Update authentication guards

Closes #123
```

## 🐛 Reporting Bugs

When reporting bugs, include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node version, etc.
6. **Screenshots**: If applicable
7. **Error Logs**: Relevant error messages

## 💡 Suggesting Features

When suggesting features:

1. **Use Case**: Explain the problem this solves
2. **Proposed Solution**: Describe your proposed solution
3. **Alternatives**: Any alternative solutions considered
4. **Additional Context**: Any other relevant information

## ❓ Questions

For questions:
- Check existing documentation
- Search closed issues
- Ask in discussions (if enabled)
- Open a new issue with the question label

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## 🙏 Thank You

Thank you for taking the time to contribute! Every contribution helps make this project better.
