# 🤝 CONTRIBUTING

Thank you for considering contributing to this project! This document will help you get started.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

---

## 📜 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards
- ✅ Be respectful and professional
- ✅ Welcome diverse perspectives
- ✅ Accept constructive criticism
- ✅ Focus on what's best for the community
- ❌ No harassment or discriminatory language
- ❌ No trolling or personal attacks

---

## 🚀 Getting Started

### 1. Fork & Clone
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/balkar-boilerplate-beckend-node.git
cd balkar-boilerplate-beckend-node

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/balkar-boilerplate-beckend-node.git
```

### 2. Setup Development Environment
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### 3. Create a Branch
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

---

## 🔄 Development Process

### Branch Naming Convention
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

Examples:
- `feature/add-email-verification`
- `fix/login-rate-limit-bug`
- `docs/update-api-documentation`

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```bash
feat(auth): add email verification

- Add email verification endpoint
- Send verification email on registration
- Update user schema with verification status

Closes #123
```

```bash
fix(posts): correct pagination calculation

- Fix off-by-one error in pagination
- Add tests for edge cases

Fixes #456
```

---

## 💻 Coding Standards

### TypeScript
```typescript
// ✅ DO: Use strict types
function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

// ❌ DON'T: Use 'any'
function getUserById(id: any): any {
  return prisma.user.findUnique({ where: { id } });
}
```

### Async/Await
```typescript
// ✅ DO: Use async/await
async function createUser(data: CreateUserDto): Promise<User> {
  const user = await prisma.user.create({ data });
  return user;
}

// ❌ DON'T: Use promises with .then()
function createUser(data: CreateUserDto): Promise<User> {
  return prisma.user.create({ data })
    .then(user => user);
}
```

### Error Handling
```typescript
// ✅ DO: Use try-catch in controllers
async function handler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.doSomething();
    res.json(ApiResponse.success('Success', result));
  } catch (error) {
    next(error);
  }
}

// ❌ DON'T: Unhandled errors
async function handler(req: Request, res: Response) {
  const result = await service.doSomething();
  res.json(result);
}
```

### Naming Conventions
```typescript
// ✅ DO: Use descriptive names
const isUserActive = user.isActive;
const getUserById = async (id: string) => { ... };

// ❌ DON'T: Use abbreviations
const isUsrAct = usr.isAct;
const getUsr = async (id: string) => { ... };
```

### Code Style
- Use Prettier for formatting (run `npm run format`)
- Use ESLint rules (run `npm run lint`)
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Max line length: 100 characters

---

## 📝 Submitting Changes

### 1. Make Your Changes
```bash
# Make changes
# Test your changes
npm run dev

# Format code
npm run format

# Lint code
npm run lint

# Build to check for errors
npm run build
```

### 2. Commit Your Changes
```bash
git add .
git commit -m "feat(scope): your commit message"
```

### 3. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 4. Create Pull Request
- Go to GitHub repository
- Click "New Pull Request"
- Select your branch
- Fill in the PR template

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added new tests
- [ ] All tests passing

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests pass
- [ ] Updated CHANGELOG.md

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Fixes #123
Relates to #456
```

---

## 🐛 Reporting Bugs

### Before Reporting
1. Check existing issues
2. Search documentation
3. Try latest version
4. Verify it's reproducible

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## To Reproduce
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 13.0]
- Node.js: [e.g., 20.11.0]
- npm: [e.g., 10.2.4]
- Database: [e.g., PostgreSQL 15.0]

## Error Messages
```
Paste error messages here
```

## Additional Context
Any other relevant information
```

---

## 💡 Feature Requests

### Feature Request Template
```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other solutions you've thought about

## Additional Context
Any other relevant information

## Implementation Ideas (optional)
Technical implementation suggestions
```

---

## 🧪 Testing Guidelines

### Writing Tests (Future)
```typescript
describe('UserController', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', ... };

      // Act
      const result = await userController.createUser(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
    });

    it('should throw error with duplicate email', async () => {
      // Test implementation
    });
  });
});
```

---

## 📚 Documentation

### When to Update Documentation
- Adding new features
- Changing existing functionality
- Fixing bugs that affect behavior
- Improving code clarity

### Documentation Files to Update
- `README.md` - Overview and quick start
- `API.md` - API endpoints
- `SECURITY.md` - Security features
- `CHANGELOG.md` - Version history
- Code comments - Complex logic

---

## 🏆 Recognition

### Contributors
All contributors will be recognized in:
- README.md contributors section
- GitHub contributors page
- Release notes

### Types of Contributions
- Code contributions
- Documentation improvements
- Bug reports
- Feature suggestions
- Code reviews
- Helping others

---

## ❓ Questions?

### Get Help
- Check documentation
- Search existing issues
- Ask in discussions
- Contact maintainers

### Contact
- GitHub Issues: [Project Issues](https://github.com/...)
- Email: support@your-domain.com

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🎉**

Your contributions help make this project better for everyone.
