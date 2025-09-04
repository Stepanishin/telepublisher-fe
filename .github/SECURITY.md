# Security Policy

## Automated Security Auditing

This repository has automated security auditing enabled through GitHub Actions. Every pull request is automatically scanned for security vulnerabilities using Cursor AI-powered analysis.

## Security Workflows

### 1. Security Audit with Cursor AI (`security-audit.yml`)
- **Triggers**: Pull requests, manual dispatch
- **Features**:
  - npm vulnerability scanning
  - ESLint security rule checks
  - Sensitive data pattern detection
  - Dependency analysis
  - Comprehensive security reporting

### 2. Cursor AI Code Review (`cursor-ai-review.yml`)
- **Triggers**: Pull requests
- **Features**:
  - AI-powered code analysis
  - Security vulnerability detection
  - Code quality recommendations
  - TypeScript type checking
  - Security scoring (0-100)

### 3. Dependency Security Check (`dependency-security.yml`)
- **Triggers**: Package file changes, daily schedule, manual dispatch
- **Features**:
  - Comprehensive npm audit
  - Outdated package detection
  - License compliance checking
  - Malicious package detection
  - Security best practices recommendations

## Security Features

### Automated Checks
- ✅ **Vulnerability Scanning**: npm audit with multiple severity levels
- ✅ **Code Analysis**: ESLint with security-focused rules
- ✅ **Sensitive Data Detection**: Pattern matching for credentials, API keys, etc.
- ✅ **Dependency Monitoring**: Continuous monitoring of package security
- ✅ **License Compliance**: Checking for problematic licenses
- ✅ **Malware Detection**: Basic typosquatting and suspicious package detection

### AI-Powered Analysis
- 🤖 **Cursor AI Integration**: Advanced code review and security analysis
- 📊 **Security Scoring**: Automated scoring based on security findings
- 💡 **Smart Recommendations**: Context-aware security suggestions
- 🔍 **Deep Code Analysis**: Analysis of code patterns and potential vulnerabilities

## How It Works

### 1. Pull Request Creation
When you create a pull request, the following happens automatically:

1. **Security Audit** runs and scans for:
   - npm vulnerabilities
   - ESLint security issues
   - Sensitive data patterns
   - Dependency problems

2. **Cursor AI Review** analyzes:
   - Code changes for security issues
   - TypeScript type safety
   - React-specific security patterns
   - Performance considerations

3. **Comments are posted** with:
   - Detailed security findings
   - Recommendations for fixes
   - Security score (0-100)
   - Best practices suggestions

### 2. Continuous Monitoring
- **Daily scans** check for new vulnerabilities
- **Package updates** trigger security re-evaluation
- **Security scores** are tracked over time

## Security Rules and Standards

### ESLint Security Rules
The project uses `eslint-plugin-security` with the following rules:
- `security/detect-unsafe-regex`: Detects unsafe regular expressions
- `security/detect-eval-with-expression`: Prevents eval() usage
- `security/detect-non-literal-regexp`: Ensures regex safety
- `security/detect-object-injection`: Warns about object injection
- Custom React/TypeScript security rules

### Security Patterns Detected
- 🚨 **Critical**: eval(), Function(), code injection risks
- ⚠️ **High**: XSS vulnerabilities, unsafe regex, hardcoded credentials
- 💡 **Medium**: Insecure HTTP requests, missing input validation
- 📝 **Info**: Debug statements, TODO comments, outdated packages

## Manual Security Commands

You can run security checks locally:

```bash
# Run security-focused ESLint
npm run lint:security

# Run npm audit
npm run security:audit

# Auto-fix npm vulnerabilities
npm run security:audit:fix

# Run all linting (including security)
npm run lint
```

## Security Best Practices

### Development
1. **Never commit sensitive data** (API keys, passwords, tokens)
2. **Use environment variables** for configuration
3. **Keep dependencies updated** regularly
4. **Review security warnings** before dismissing them
5. **Use HTTPS** for all external API calls

### Code Review
1. **Check security scores** in PR comments
2. **Address critical/high severity issues** before merging
3. **Review AI recommendations** carefully
4. **Validate input/output** in new components
5. **Test security fixes** thoroughly

### Dependency Management
1. **Regular audits**: Run `npm audit` frequently
2. **Minimal dependencies**: Only add what you need
3. **Trusted sources**: Use well-maintained packages
4. **Lock file commits**: Always commit package-lock.json
5. **Update strategy**: Regular but cautious updates

## Reporting Security Issues

If you discover a security vulnerability that is not caught by our automated tools:

1. **Do not** create a public issue
2. **Contact** the security team privately
3. **Provide** detailed information about the vulnerability
4. **Wait** for confirmation before public disclosure

## Security Workflow Customization

You can customize the security workflows by:

1. **Modifying severity thresholds** in workflow files
2. **Adding custom security rules** to ESLint config
3. **Extending pattern detection** in audit scripts
4. **Configuring notification preferences** for your team

## Troubleshooting

### Common Issues

1. **False Positives**: If a security warning is incorrect, document the justification
2. **Performance Impact**: Security checks may increase CI time slightly
3. **Merge Blocks**: Critical security issues will prevent merging
4. **Dependency Conflicts**: Some security fixes may require code changes

### Getting Help

- Check the **Actions logs** for detailed error information
- Review the **security artifacts** uploaded with each run
- Consult the **AI-generated recommendations** in PR comments
- Contact the development team for complex security issues

---

*This security policy is automatically enforced through GitHub Actions and Cursor AI integration.*
