# GitHub Actions CI/CD

This directory contains GitHub Actions workflows for automated building, testing, and releasing of the KNX Viewer application.

## Workflows

### 1. CI (`build.yml`)
**Triggers**: Push to main, Pull requests to main

**Purpose**: Continuous integration testing and development builds

**Jobs**:
- **Test**: Runs on Ubuntu
  - Linting (if configured)
  - Unit tests (if available)
  - TypeScript compilation check
  - Application build verification

- **Build**: Runs on all platforms (Ubuntu, Windows, macOS)
  - Only runs on push to main branch
  - Creates platform-specific builds
  - Uploads artifacts for 7 days

### 2. Release (`release.yml`)
**Triggers**: Git tags starting with `v*` (e.g., `v1.1.0`)

**Purpose**: Automated release builds and GitHub Releases

**Jobs**:
- **Release**: Multi-platform builds
  - Ubuntu: Creates AppImage and DEB packages
  - Windows: Creates NSIS installer (.exe)
  - macOS: Creates DMG disk image
  - Uploads platform-specific artifacts

- **Create Release**: 
  - Downloads all artifacts
  - Creates GitHub Release with generated notes
  - Attaches all platform binaries

### 3. Security (`security.yml`)
**Triggers**: Push to main, Pull requests, Weekly schedule

**Purpose**: Security scanning and dependency checks

**Jobs**:
- **Security**: 
  - npm audit for known vulnerabilities
  - CodeQL static analysis
  - Runs weekly to catch new vulnerabilities

- **Dependency Review**:
  - Reviews dependency changes in PRs
  - Fails on moderate+ severity issues

## Usage

### Creating a Release

To create a new release:

1. **Update version** in `package.json`:
   ```json
   {
     "version": "1.2.0"
   }
   ```

2. **Update CHANGELOG.md** with new features and fixes

3. **Commit changes**:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "Bump version to 1.2.0"
   ```

4. **Create and push tag**:
   ```bash
   git tag v1.2.0
   git push origin main --tags
   ```

5. **Automated process**:
   - GitHub Actions will automatically build for all platforms
   - Create GitHub Release with binaries attached
   - Generate release notes

### Development Workflow

1. **Pull Request**:
   - Creates PR → CI runs tests and builds
   - Security workflow checks dependencies
   - Must pass before merge

2. **Merge to Main**:
   - CI creates development builds
   - Artifacts available for testing

3. **Tag Release**:
   - Release workflow creates production builds
   - GitHub Release published automatically

## Build Artifacts

### Platform-Specific Outputs

- **Windows**: `knxview-setup-{version}.exe`
- **macOS**: `knxview-{version}.dmg`
- **Linux**: 
  - `knxview-{version}.AppImage`
  - `knxview_{version}_amd64.deb`

### Artifact Storage

- **CI Builds**: 7 days retention
- **Release Builds**: Permanent (attached to GitHub Releases)

## Environment Variables

### Required Secrets

- `GITHUB_TOKEN`: Automatically provided by GitHub
  - Used for: Creating releases, uploading artifacts
  - Permissions: Contents (write), Actions (read)

### Optional Secrets (for enhanced features)

- `CSC_LINK`: macOS code signing certificate (base64)
- `CSC_KEY_PASSWORD`: Certificate password
- `WINDOWS_CERT`: Windows code signing certificate
- `WINDOWS_CERT_PASSWORD`: Windows certificate password

## Troubleshooting

### Common Issues

**Build Failures**:
- Check Node.js version compatibility
- Verify all dependencies are properly locked
- Review TypeScript compilation errors

**Release Failures**:
- Ensure version tag format is correct (`v1.2.3`)
- Check electron-builder configuration
- Verify all platforms build successfully

**Security Failures**:
- Review npm audit output
- Update vulnerable dependencies
- Check CodeQL findings

### Build Logs

Access build logs through:
1. GitHub repository → Actions tab
2. Select specific workflow run
3. Expand job steps to see detailed output

## Configuration Files

### Electron Builder
Configuration in `package.json` under `build` section:
- Platform-specific settings
- File inclusion/exclusion
- Installer configuration

### TypeScript
- `tsconfig.json`: TypeScript compilation settings
- Affects build process and type checking

### Webpack
- `webpack.config.js`: Frontend build configuration
- Bundling and optimization settings

## Maintenance

### Regular Tasks

1. **Update Dependencies**:
   ```bash
   npm update
   npm audit fix
   ```

2. **Review Security Alerts**:
   - Check GitHub Security tab
   - Review Dependabot PRs
   - Update vulnerable packages

3. **Monitor Build Performance**:
   - Review build times
   - Optimize slow steps
   - Update GitHub Actions versions

### Updating Workflows

When modifying workflows:
1. Test in feature branch first
2. Check workflow syntax
3. Verify permissions and secrets
4. Monitor first production run

## Security Best Practices

- Never commit secrets or certificates
- Use GitHub Secrets for sensitive data
- Keep dependencies updated
- Review CodeQL security findings
- Monitor dependency vulnerabilities

## Support

For CI/CD issues:
1. Check workflow logs in GitHub Actions
2. Review this documentation
3. Check GitHub Actions documentation
4. Create issue with workflow logs attached