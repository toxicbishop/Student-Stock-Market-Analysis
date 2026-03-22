# Contributing to TradeLab

Thank you for your interest in contributing to TradeLab! We welcome contributions from the community to help make this AI-guided paper trading platform even better.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct: be respectful, inclusive, and professional.

## Getting Started

### Prerequisites
- **Node.js**: v18 or later
- **npm**: v9 or later
- **Git**

### Installation
1.  **Fork** the repository on GitHub.
2.  **Clone** your fork locally:
    ```bash
    git clone https://github.com/your-username/Student-Stock-Market-Analysis.git
    cd Student-Stock-Market-Analysis
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Set up environment**:
    Create a `.env` file based on `.env.example` and fill in your Gemini and Firebase keys.
5.  **Initialize Database**:
    ```bash
    npx prisma generate
    ```
6.  **Run Dev Server**:
    ```bash
    npm run dev
    ```

## How to Contribute

### 1. Finding an Issue
Check out our [GitHub Issues](https://github.com/toxicbishop/Student-Stock-Market-Analysis/issues). Look for the `good-first-issue` label if you are new to the project.

### 2. Creating a Branch
Create a descriptive branch for your changes:
```bash
git checkout -b feature/your-feature-name
# OR
git checkout -b fix/issue-description
```

### 3. Making Changes
- Ensure your code follows the existing style.
- Keep your commits atomic and descriptive.
- If you add a new feature, update the documentation!

### 4. Submitting a Pull Request (PR)
1.  Push your branch to your fork.
2.  Open a PR against the `main` branch of the original repository.
3.  Describe your changes in detail using our PR template.
4.  Ensure the **CodeQL** check passes.

## Style Guidelines

- **TypeScript**: We use TypeScript for everything. Avoid using `any` wherever possible.
- **Styling**: We use **Tailwind CSS** for UI components.
- **Backend**: New API logic should be placed in `pages/api/` using Prisma for database interactions.

## Questions?
If you have any questions, feel free to open a discussion or reach out to the project maintainers.

Happy coding!
