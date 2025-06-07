# Team Instructions: Setting Up and Using Dotenv Vault

## What is Dotenv Vault?
Dotenv Vault is a secure tool that helps us share environment variables (.env files) across our team without sending sensitive information through insecure channels like Slack or email.

## Prerequisites
- Node.js installed on your computer
- Access to a terminal or command line
- Our project repository cloned to your local machine

## Required Packages

Before starting, make sure the necessary packages are installed in the project:

1. **Install dotenv package** (if not already in package.json):
   ```bash
   npm install dotenv --save
   ```

2. **Install dotenv-vault-core** (for using the encrypted vault):
   ```bash
   npm install dotenv-vault-core --save
   ```

These packages allow our application to read environment variables from the .env file and the encrypted vault.

## Initial Setup (One-time process)

1. **Open a terminal** and navigate to our project's root directory.

2. **Log in to Dotenv Vault**:
   ```bash
   npx dotenv-vault@latest login
   ```
   This will open a browser window where you'll need to log in or create an account.

3. **Join our project with this ID**:
   ```bash
   npx dotenv-vault@latest open vlt_d755a0cbac5a4ba07db2fa8679c5e85f441ac7e606dd3ab785c8b412ed37c12d
   ```
   Replace `[PROJECT_ID]` with the project ID that was shared with you. This links your account to our shared Dotenv Vault project.

3. **Pull our shared environment variables**:
   ```bash
   npx dotenv-vault@latest pull
   ```
   This will create a `.env` file in the project root with all the necessary variables.

4. **Verify setup**:
   Check that a `.env` file has been created in your project directory with the correct variables.

## Important Guidelines

- **NEVER commit the `.env` file to Git**. Our repository is already set up to ignore it.
- **NEVER share these environment variables via Slack, email, or screenshots**.
- **DO commit the `.env.vault` file** when you see changes to it.

## Workflow: When Environment Variables Change

### If you need to update environment variables:

1. **Update your local `.env` file** with the new values.

2. **Push your changes to the vault**:
   ```bash
   npx dotenv-vault@latest push
   ```

3. **Build the vault file**:
   ```bash
   npx dotenv-vault@latest build
   ```

4. **Commit the updated vault file**:
   ```bash
   git add .env.vault
   git commit -m "Update environment variables vault"
   git push
   ```

5. **Notify the team** that environment variables have been updated.

### If someone else updated the environment variables:

1. **Pull the latest changes** from our repository:
   ```bash
   git pull
   ```

2. **Pull the updated environment variables**:
   ```bash
   npx dotenv-vault@latest pull
   ```

## Troubleshooting

- **"Access denied" errors**: Make sure you've been invited to the project. Contact the project admin.
- **Merge conflicts in `.env.vault`**: Pull the latest changes, then run `npx dotenv-vault@latest pull` and `npx dotenv-vault@latest build` again.
- **Missing variables after pull**: Verify you're logged in with the correct account.

## Help and Support

If you encounter any issues, first check the [Dotenv Vault documentation](https://www.dotenv.org/docs/) or contact our team lead for assistance.