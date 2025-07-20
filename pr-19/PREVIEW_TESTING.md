# PR Preview System Test

This document outlines how to test the PR preview deployment system.

## Automatic Testing

The GitHub Actions workflows will be triggered automatically when:

1. **PR Opened/Updated**: The `pr-preview.yml` workflow will run
2. **PR Closed**: The `cleanup-pr-preview.yml` workflow will run  
3. **Main Branch Updated**: The `deploy-pages.yml` workflow will run

## Manual Testing Steps

### Step 1: Enable GitHub Pages
1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. This enables the deployment workflows

### Step 2: Test PR Preview
1. Create a test PR with some changes to the application
2. Check that the workflow runs successfully in the Actions tab
3. Verify a comment is added to the PR with the preview link
4. Visit the preview link to confirm the app works
5. Make another commit to the PR and verify the preview updates

### Step 3: Test Cleanup
1. Close or merge the test PR
2. Check that the cleanup workflow runs
3. Verify the preview directory is removed from gh-pages branch

## Expected URLs

- **Main site**: `https://grepsedawk.github.io/planmy.hike/`
- **PR previews**: `https://grepsedawk.github.io/planmy.hike/pr-{number}/`
- **Preview index**: `https://grepsedawk.github.io/planmy.hike/` (lists all active previews)

## Troubleshooting

If previews don't work:

1. Check that GitHub Pages is enabled with "GitHub Actions" source
2. Verify the workflows have necessary permissions
3. Check the Actions tab for any workflow failures
4. Ensure the repository has GitHub Pages enabled

## Workflow Files

- `.github/workflows/pr-preview.yml` - Deploys PR previews
- `.github/workflows/cleanup-pr-preview.yml` - Cleans up closed PRs
- `.github/workflows/deploy-pages.yml` - Deploys main branch