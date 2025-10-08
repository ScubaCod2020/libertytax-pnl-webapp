# 🔧 Debugging Procedures for Virtual Team Infrastructure

## 🚨 **Quick Debugging Checklist**

### **1. Pipeline Issues**

```bash
# Check workflow status
gh run list --limit 10

# View specific workflow run
gh run view <run-id>

# Check workflow logs
gh run view <run-id> --log

# Rerun failed workflow
gh run rerun <run-id>
```

### **2. Test Execution Issues**

```bash
# Run tests locally
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:mobile

# Check test coverage
npm run test:unit -- --coverage

# Debug specific test
npm run test:unit -- --testNamePattern="specific test name"
```

### **3. Deployment Issues**

```bash
# Check Vercel status
vercel ls
vercel logs <deployment-url>

# Check environment variables
vercel env ls

# Redeploy specific environment
vercel --prod
vercel --target staging
```

## 🔍 **Common Issues & Solutions**

### **Issue: Tests Running After Deployment**

**Symptoms**: Deployment completes before tests finish
**Solution**: Check workflow dependencies in `.github/workflows/deploy-fixed.yml`

```yaml
# Ensure tests run before deployment
deploy-preview:
  needs: preview-quality-gates # This should be the test job
```

### **Issue: Resource Conflicts (Port Already in Use)**

**Symptoms**: "Port 3000 already in use" or similar errors
**Solution**: Use different ports for different stages

```yaml
# Preview: Port 3001
# Staging: Port 3002
# Production: Port 3000
```

### **Issue: Team Assignment Not Working**

**Symptoms**: Tasks not being assigned to @codex or other team members
**Solution**: Check CODEOWNERS file and team configuration

```bash
# Verify CODEOWNERS
cat .github/CODEOWNERS

# Check team configuration
cat team-roles.json
```

### **Issue: Quality Gates Failing**

**Symptoms**: Deployments blocked by quality gate failures
**Solution**: Check individual test results

```bash
# Check specific quality gate
gh run view <run-id> --log | grep "Quality Gate"
```

## 🛠️ **Debugging Tools & Commands**

### **Local Testing Commands**

```bash
# Test individual components
npm run test:unit -- --testPathPattern="App.test"
npm run test:integration -- --testNamePattern="calculation"
npm run test:e2e -- --grep "mobile"

# Debug with verbose output
npm run test:unit -- --verbose
npm run test:e2e -- --headed --debug
```

### **GitHub Actions Debugging**

```bash
# Enable debug logging
gh run view <run-id> --log | grep "debug"

# Check workflow syntax
gh workflow list
gh workflow view deploy-fixed.yml
```

### **Vercel Debugging**

```bash
# Check deployment status
vercel ls --scope <org-id>

# View deployment logs
vercel logs <deployment-url> --follow

# Check build logs
vercel logs <deployment-url> --build
```

## 📊 **Monitoring & Health Checks**

### **Pipeline Health Dashboard**

```bash
# Create monitoring script
cat > scripts/pipeline-health.js << 'EOF'
#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('🔍 Pipeline Health Check');
console.log('========================');

// Check recent workflow runs
try {
  const runs = execSync('gh run list --limit 5 --json status,conclusion,createdAt', { encoding: 'utf8' });
  const runsData = JSON.parse(runs);

  console.log('\n📊 Recent Workflow Runs:');
  runsData.forEach(run => {
    const status = run.status === 'completed' ? '✅' : '🔄';
    const conclusion = run.conclusion === 'success' ? '✅' : '❌';
    console.log(`${status} ${run.createdAt} - ${conclusion}`);
  });
} catch (error) {
  console.log('❌ Failed to fetch workflow runs');
}

// Check test coverage
try {
  const coverage = execSync('npm run test:unit -- --coverage --silent', { encoding: 'utf8' });
  console.log('\n📈 Test Coverage:');
  console.log(coverage);
} catch (error) {
  console.log('❌ Failed to run test coverage');
}
EOF

chmod +x scripts/pipeline-health.js
```

### **Team Performance Monitoring**

```bash
# Create team performance script
cat > scripts/team-performance.js << 'EOF'
#!/usr/bin/env node
const fs = require('fs');

console.log('👥 Team Performance Report');
console.log('==========================');

// Check team configuration
const teamRoles = JSON.parse(fs.readFileSync('team-roles.json', 'utf8'));
console.log('\n📋 Active Teams:');
Object.entries(teamRoles.teams).forEach(([team, config]) => {
  console.log(`✅ ${config.name}: ${config.githubUsernames.join(', ')}`);
});

// Check CODEOWNERS
const codeowners = fs.readFileSync('.github/CODEOWNERS', 'utf8');
console.log('\n🔍 CODEOWNERS Configuration:');
console.log(codeowners);
EOF

chmod +x scripts/team-performance.js
```

## 🚨 **Emergency Procedures**

### **Rollback Deployment**

```bash
# Rollback to previous deployment
vercel rollback <deployment-url>

# Or redeploy previous commit
git checkout <previous-commit>
vercel --prod
```

### **Disable Problematic Workflows**

```bash
# Temporarily disable workflow
mv .github/workflows/deploy-fixed.yml .github/workflows/deploy-fixed.yml.disabled

# Re-enable when fixed
mv .github/workflows/deploy-fixed.yml.disabled .github/workflows/deploy-fixed.yml
```

### **Emergency Team Assignment**

```bash
# Manually assign issue to @codex
gh issue edit <issue-number> --add-assignee @codex

# Or assign to specific team member
gh issue edit <issue-number> --add-assignee ScubaCod2020
```

## 🔧 **Advanced Debugging**

### **Workflow Debugging**

```yaml
# Add debug steps to workflows
- name: Debug Information
  run: |
    echo "Current directory: $(pwd)"
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Git status: $(git status --porcelain)"
    echo "Environment variables:"
    env | grep -E "(NODE|NPM|GITHUB|VERCEL)"
```

### **Test Debugging**

```bash
# Debug specific test with detailed output
npm run test:unit -- --testNamePattern="App" --verbose --no-coverage

# Debug E2E tests with browser
npm run test:e2e -- --headed --slowMo=1000

# Debug mobile tests
npm run test:mobile -- --headed --slowMo=1000
```

### **Deployment Debugging**

```bash
# Check Vercel configuration
vercel inspect

# Check build output
vercel build --debug

# Check environment variables
vercel env ls --scope <org-id>
```

## 📋 **Daily Health Check Routine**

### **Morning Checklist**

```bash
# 1. Check overnight pipeline status
gh run list --limit 5

# 2. Check test coverage
npm run test:unit -- --coverage

# 3. Check deployment status
vercel ls

# 4. Check team assignments
gh issue list --assignee @codex
```

### **Weekly Maintenance**

```bash
# 1. Update dependencies
npm update

# 2. Check security vulnerabilities
npm audit

# 3. Review team performance
node scripts/team-performance.js

# 4. Check pipeline health
node scripts/pipeline-health.js
```

## 🆘 **Getting Help**

### **When to Escalate**

- Multiple pipeline failures in a row
- Critical deployment issues
- Team assignment system not working
- Security vulnerabilities detected

### **Escalation Contacts**

- **@codex**: AI assistant for automated debugging
- **ScubaCod2020**: Project maintainer
- **GitHub Support**: For platform issues
- **Vercel Support**: For deployment issues

### **Debugging Resources**

- **GitHub Actions Logs**: Check workflow execution details
- **Vercel Dashboard**: Monitor deployment status
- **Test Reports**: Review test execution results
- **Team Performance**: Monitor collaboration metrics

---

_This debugging guide ensures quick resolution of issues and maintains smooth operation of the virtual team infrastructure._
