# Contributing to NDPA-Toolkit

Thank you for considering contributing to the Nigeria Data Protection Act (NDPA) Compliance Toolkit! This document outlines the process for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue in the GitHub repository with the following information:

1. A clear, descriptive title
2. Steps to reproduce the bug
3. Expected behavior
4. Actual behavior
5. Screenshots (if applicable)
6. Environment information (browser, OS, etc.)

### Suggesting Features

We welcome feature suggestions! Please create an issue with:

1. A clear, descriptive title
2. Detailed description of the proposed feature
3. Any relevant examples or mockups
4. Explanation of why this feature would be useful to the project

### Pull Requests

We follow a standard GitHub workflow:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Write or update tests as needed
5. Ensure all tests pass
6. Commit your changes using conventional commit messages
7. Push to your fork
8. Submit a pull request

### Commit Message Convention

We use conventional commits to automate versioning and changelog generation. Please format your commit messages as follows:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types include:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to the build process or auxiliary tools

Example:
```
feat(consent): add ability to customize consent banner colors
```

## Development Setup

1. Clone your fork of the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Make your changes
5. Run tests: `npm test`

## Release Process

Releases are managed by the maintainers using semantic versioning. The process is automated through GitHub Actions.

## Questions?

If you have any questions about contributing, please open an issue with your question.

Thank you for contributing to the NDPA-Toolkit!
