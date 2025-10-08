#!/usr/bin/env node

/**
 * Virtual Team Template Setup Script
 * 
 * This script applies the virtual team template to a repository
 * Usage: node setup-template.js --config ./project-config.json
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TemplateSetup {
  constructor() {
    this.config = null;
    this.projectRoot = process.cwd();
    this.templateDir = path.join(__dirname, '..');
  }

  async run() {
    console.log('🚀 Virtual Team Template Setup');
    console.log('==============================\n');

    try {
      await this.loadConfig();
      await this.validateProject();
      await this.createDirectories();
      await this.copyWorkflows();
      await this.createTemplates();
      await this.updatePackageJson();
      await this.createDocumentation();
      await this.finalizeSetup();
      
      console.log('\n✅ Template setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Review and customize the generated files');
      console.log('2. Update team usernames in .github/CODEOWNERS');
      console.log('3. Configure GitHub secrets');
      console.log('4. Test the workflows with a small change');
      
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  async loadConfig() {
    const configPath = process.argv.find(arg => arg.startsWith('--config='))?.split('=')[1] || './project-config.json';
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }

    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log(`📋 Loaded configuration from ${configPath}`);
  }

  async validateProject() {
    console.log('🔍 Validating project structure...');
    
    // Check if it's a git repository
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    } catch {
      throw new Error('Not a git repository. Please run this from a git repository root.');
    }

    // Check for package.json
    if (!fs.existsSync('package.json')) {
      console.log('⚠️  No package.json found. Creating basic one...');
      this.createBasicPackageJson();
    }

    console.log('✅ Project validation passed');
  }

  async createDirectories() {
    console.log('📁 Creating directory structure...');
    
    const dirs = [
      '.github/workflows',
      '.github/ISSUE_TEMPLATE',
      'docs',
      'tests',
      'scripts'
    ];

    dirs.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`  Created: ${dir}`);
      }
    });
  }

  async copyWorkflows() {
    console.log('🔄 Copying workflow templates...');
    
    const workflows = [
      'ci-template.yml',
      'deploy-template.yml', 
      'virtual-team-template.yml',
      'security-template.yml'
    ];

    workflows.forEach(workflow => {
      const sourcePath = path.join(this.templateDir, 'workflows', workflow);
      const targetPath = path.join(this.projectRoot, '.github/workflows', workflow.replace('-template', ''));
      
      if (fs.existsSync(sourcePath)) {
        let content = fs.readFileSync(sourcePath, 'utf8');
        content = this.replacePlaceholders(content);
        fs.writeFileSync(targetPath, content);
        console.log(`  Created: .github/workflows/${workflow.replace('-template', '')}`);
      }
    });
  }

  async createTemplates() {
    console.log('📝 Creating issue and PR templates...');
    
    // Create CODEOWNERS
    const codeownersContent = this.generateCodeowners();
    fs.writeFileSync(path.join(this.projectRoot, '.github/CODEOWNERS'), codeownersContent);
    console.log('  Created: .github/CODEOWNERS');

    // Create issue templates
    const issueTemplates = [
      'bug_report.yml',
      'feature_request.yml',
      'security_issue.yml'
    ];

    issueTemplates.forEach(template => {
      const sourcePath = path.join(this.templateDir, 'ISSUE_TEMPLATE', template);
      const targetPath = path.join(this.projectRoot, '.github/ISSUE_TEMPLATE', template);
      
      if (fs.existsSync(sourcePath)) {
        let content = fs.readFileSync(sourcePath, 'utf8');
        content = this.replacePlaceholders(content);
        fs.writeFileSync(targetPath, content);
        console.log(`  Created: .github/ISSUE_TEMPLATE/${template}`);
      }
    });

    // Create PR template
    const prTemplatePath = path.join(this.templateDir, 'pull_request_template.md');
    const prTargetPath = path.join(this.projectRoot, '.github/pull_request_template.md');
    
    if (fs.existsSync(prTemplatePath)) {
      let content = fs.readFileSync(prTemplatePath, 'utf8');
      content = this.replacePlaceholders(content);
      fs.writeFileSync(prTargetPath, content);
      console.log('  Created: .github/pull_request_template.md');
    }
  }

  async updatePackageJson() {
    console.log('📦 Updating package.json...');
    
    const packagePath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Add virtual team scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'vt:setup': 'node templates/scripts/setup-template.js',
      'vt:configure': 'node templates/scripts/configure-teams.js',
      'vt:validate': 'node templates/scripts/validate-setup.js'
    };

    // Add virtual team dev dependencies
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      '@virtual-team/template': '^1.0.0'
    };

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('  Updated: package.json with virtual team scripts');
  }

  async createDocumentation() {
    console.log('📚 Creating documentation...');
    
    const docs = [
      'VIRTUAL_TEAM_GUIDE.md',
      'DEPLOYMENT_PIPELINE_STRATEGY.md',
      'TESTING_STRATEGY.md'
    ];

    docs.forEach(doc => {
      const sourcePath = path.join(this.templateDir, 'docs', doc);
      const targetPath = path.join(this.projectRoot, 'docs', doc);
      
      if (fs.existsSync(sourcePath)) {
        let content = fs.readFileSync(sourcePath, 'utf8');
        content = this.replacePlaceholders(content);
        fs.writeFileSync(targetPath, content);
        console.log(`  Created: docs/${doc}`);
      }
    });
  }

  async finalizeSetup() {
    console.log('🔧 Finalizing setup...');
    
    // Create .gitignore entries for virtual team
    const gitignorePath = path.join(this.projectRoot, '.gitignore');
    const gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
    
    const virtualTeamIgnores = [
      '',
      '# Virtual Team Template',
      'templates/',
      '.vt-config.json'
    ];

    if (!gitignoreContent.includes('Virtual Team Template')) {
      fs.writeFileSync(gitignorePath, gitignoreContent + virtualTeamIgnores.join('\n'));
      console.log('  Updated: .gitignore');
    }

    // Create configuration file
    const configPath = path.join(this.projectRoot, '.vt-config.json');
    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
    console.log('  Created: .vt-config.json');
  }

  replacePlaceholders(content) {
    const replacements = {
      '{{PROJECT_NAME}}': this.config.project.name,
      '{{PROJECT_TYPE}}': this.config.project.type,
      '{{FRAMEWORK}}': this.config.project.framework,
      '{{LANGUAGE}}': this.config.project.language,
      '{{PACKAGE_MANAGER}}': this.config.project.packageManager,
      '{{PROJECT_DESCRIPTION}}': this.config.project.description || '',
      '{{DEPLOYMENT_PLATFORM}}': this.config.deployment.platform,
      '{{PREVIEW_DOMAIN}}': this.config.deployment.domains.preview,
      '{{STAGING_DOMAIN}}': this.config.deployment.domains.staging,
      '{{PRODUCTION_DOMAIN}}': this.config.deployment.domains.production,
      '{{FRONTEND_USERNAME}}': this.config.teams.frontend ? 'FRONTEND_USERNAME' : '',
      '{{BACKEND_USERNAME}}': this.config.teams.backend ? 'BACKEND_USERNAME' : '',
      '{{QA_USERNAME}}': this.config.teams.qa ? 'QA_USERNAME' : '',
      '{{DEVOPS_USERNAME}}': this.config.teams.devops ? 'DEVOPS_USERNAME' : '',
      '{{SECURITY_USERNAME}}': this.config.teams.security ? 'SECURITY_USERNAME' : '',
      '{{SLACK_WEBHOOK_URL}}': this.config.notifications.slack.webhook || '',
      '{{EMAIL_RECIPIENTS}}': this.config.notifications.email.recipients || ''
    };

    let result = content;
    Object.entries(replacements).forEach(([placeholder, value]) => {
      result = result.replace(new RegExp(placeholder, 'g'), value);
    });

    return result;
  }

  generateCodeowners() {
    const teamRoles = JSON.parse(fs.readFileSync(path.join(this.templateDir, 'team-roles.json'), 'utf8'));
    let codeowners = '# Virtual Team CODEOWNERS\n# Generated by Virtual Team Template\n\n';

    Object.entries(teamRoles.teams).forEach(([teamKey, team]) => {
      if (this.config.teams[teamKey]) {
        codeowners += `# ${team.name}\n`;
        team.reviewPaths.forEach(path => {
          codeowners += `${path} `;
        });
        codeowners += `@${team.githubUsernames[0]}\n\n`;
      }
    });

    return codeowners;
  }

  createBasicPackageJson() {
    const basicPackage = {
      name: this.config.project.name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: this.config.project.description || '',
      main: 'index.js',
      scripts: {
        test: 'echo "Error: no test specified" && exit 1'
      },
      keywords: [],
      author: '',
      license: 'ISC'
    };

    fs.writeFileSync('package.json', JSON.stringify(basicPackage, null, 2));
  }
}

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
  new TemplateSetup().run().catch(console.error);
}

export default TemplateSetup;
