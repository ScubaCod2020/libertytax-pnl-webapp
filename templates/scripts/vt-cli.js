#!/usr/bin/env node

/**
 * Virtual Team CLI Tool
 * 
 * A command-line interface for managing virtual team templates
 * Usage: vt <command> [options]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VirtualTeamCLI {
  constructor() {
    this.projectRoot = process.cwd();
    this.templateDir = path.join(__dirname, '..');
  }

  async run() {
    const command = process.argv[2];
    const args = process.argv.slice(3);

    switch (command) {
      case 'init':
        await this.init(args);
        break;
      case 'apply':
        await this.apply(args);
        break;
      case 'configure':
        await this.configure(args);
        break;
      case 'validate':
        await this.validate(args);
        break;
      case 'update':
        await this.update(args);
        break;
      case 'status':
        await this.status(args);
        break;
      case 'help':
        this.help();
        break;
      default:
        console.log('❌ Unknown command. Use "vt help" for available commands.');
        process.exit(1);
    }
  }

  async init(args) {
    console.log('🚀 Initializing Virtual Team Template...\n');

    // Check if already initialized
    if (fs.existsSync('.vt-config.json')) {
      console.log('⚠️  Virtual Team template already initialized.');
      console.log('   Use "vt apply" to update or "vt configure" to modify settings.\n');
      return;
    }

    // Create default configuration
    const defaultConfig = {
      project: {
        name: this.getProjectName(),
        type: 'react-app',
        framework: 'React',
        language: 'TypeScript',
        packageManager: 'npm',
        description: ''
      },
      deployment: {
        platform: 'vercel',
        stages: ['preview', 'staging', 'production'],
        domains: {
          preview: '{{PROJECT_NAME}}-preview.vercel.app',
          staging: '{{PROJECT_NAME}}-staging.vercel.app',
          production: '{{PROJECT_NAME}}.vercel.app'
        }
      },
      testing: {
        unit: true,
        integration: true,
        e2e: true,
        mobile: true,
        performance: true,
        security: true
      },
      teams: {
        frontend: true,
        backend: false,
        qa: true,
        devops: true,
        security: false
      }
    };

    fs.writeFileSync('.vt-config.json', JSON.stringify(defaultConfig, null, 2));
    console.log('✅ Created .vt-config.json');
    console.log('📝 Please edit the configuration file and run "vt apply" to continue.\n');
  }

  async apply(args) {
    console.log('🔄 Applying Virtual Team Template...\n');

    if (!fs.existsSync('.vt-config.json')) {
      console.log('❌ No configuration found. Run "vt init" first.\n');
      return;
    }

    const config = JSON.parse(fs.readFileSync('.vt-config.json', 'utf8'));
    
    // Run the setup script
    const setupScript = path.join(__dirname, 'setup-template.js');
    execSync(`node "${setupScript}" --config .vt-config.json`, { stdio: 'inherit' });
  }

  async configure(args) {
    console.log('⚙️  Configuring Virtual Team Template...\n');

    if (!fs.existsSync('.vt-config.json')) {
      console.log('❌ No configuration found. Run "vt init" first.\n');
      return;
    }

    const config = JSON.parse(fs.readFileSync('.vt-config.json', 'utf8'));

    // Interactive configuration
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    try {
      console.log('📋 Project Configuration:');
      config.project.name = await question(`Project name (${config.project.name}): `) || config.project.name;
      config.project.type = await question(`Project type (${config.project.type}): `) || config.project.type;
      config.project.framework = await question(`Framework (${config.project.framework}): `) || config.project.framework;
      config.project.language = await question(`Language (${config.project.language}): `) || config.project.language;

      console.log('\n🚀 Deployment Configuration:');
      config.deployment.platform = await question(`Platform (${config.deployment.platform}): `) || config.deployment.platform;
      config.deployment.domains.preview = await question(`Preview domain (${config.deployment.domains.preview}): `) || config.deployment.domains.preview;
      config.deployment.domains.staging = await question(`Staging domain (${config.deployment.domains.staging}): `) || config.deployment.domains.staging;
      config.deployment.domains.production = await question(`Production domain (${config.deployment.domains.production}): `) || config.deployment.domains.production;

      console.log('\n👥 Team Configuration:');
      config.teams.frontend = await question(`Enable Frontend team? (${config.teams.frontend ? 'y' : 'n'}): `).then(answer => answer.toLowerCase() === 'y' || answer === '');
      config.teams.backend = await question(`Enable Backend team? (${config.teams.backend ? 'y' : 'n'}): `).then(answer => answer.toLowerCase() === 'y');
      config.teams.qa = await question(`Enable QA team? (${config.teams.qa ? 'y' : 'n'}): `).then(answer => answer.toLowerCase() === 'y' || answer === '');
      config.teams.devops = await question(`Enable DevOps team? (${config.teams.devops ? 'y' : 'n'}): `).then(answer => answer.toLowerCase() === 'y' || answer === '');
      config.teams.security = await question(`Enable Security team? (${config.teams.security ? 'y' : 'n'}): `).then(answer => answer.toLowerCase() === 'y');

      // Save configuration
      fs.writeFileSync('.vt-config.json', JSON.stringify(config, null, 2));
      console.log('\n✅ Configuration updated!');
      console.log('🔄 Run "vt apply" to apply the changes.\n');

    } finally {
      rl.close();
    }
  }

  async validate(args) {
    console.log('🔍 Validating Virtual Team Setup...\n');

    const checks = [
      { name: 'Configuration file', check: () => fs.existsSync('.vt-config.json') },
      { name: 'Git repository', check: () => this.isGitRepo() },
      { name: 'Package.json', check: () => fs.existsSync('package.json') },
      { name: 'GitHub workflows', check: () => fs.existsSync('.github/workflows') },
      { name: 'Issue templates', check: () => fs.existsSync('.github/ISSUE_TEMPLATE') },
      { name: 'CODEOWNERS', check: () => fs.existsSync('.github/CODEOWNERS') }
    ];

    let allPassed = true;

    checks.forEach(({ name, check }) => {
      const passed = check();
      console.log(`${passed ? '✅' : '❌'} ${name}`);
      if (!passed) allPassed = false;
    });

    if (allPassed) {
      console.log('\n🎉 All checks passed! Your virtual team setup is ready.');
    } else {
      console.log('\n⚠️  Some checks failed. Please run "vt apply" to fix issues.');
    }
  }

  async update(args) {
    console.log('🔄 Updating Virtual Team Template...\n');

    // This would pull the latest template version
    console.log('📥 Pulling latest template version...');
    // Implementation would go here
    
    console.log('🔄 Applying updates...');
    await this.apply(args);
  }

  async status(args) {
    console.log('📊 Virtual Team Status\n');

    if (!fs.existsSync('.vt-config.json')) {
      console.log('❌ Not initialized. Run "vt init" to start.');
      return;
    }

    const config = JSON.parse(fs.readFileSync('.vt-config.json', 'utf8'));

    console.log('📋 Project:', config.project.name);
    console.log('🏗️  Type:', config.project.type);
    console.log('⚙️  Framework:', config.project.framework);
    console.log('💻 Language:', config.project.language);
    console.log('🚀 Platform:', config.deployment.platform);

    console.log('\n👥 Teams:');
    Object.entries(config.teams).forEach(([team, enabled]) => {
      console.log(`  ${enabled ? '✅' : '❌'} ${team.charAt(0).toUpperCase() + team.slice(1)}`);
    });

    console.log('\n🧪 Testing:');
    Object.entries(config.testing).forEach(([test, enabled]) => {
      if (typeof enabled === 'boolean') {
        console.log(`  ${enabled ? '✅' : '❌'} ${test.charAt(0).toUpperCase() + test.slice(1)}`);
      }
    });
  }

  help() {
    console.log('🤖 Virtual Team CLI Tool\n');
    console.log('Commands:');
    console.log('  init        Initialize virtual team template');
    console.log('  apply       Apply template to current repository');
    console.log('  configure   Interactive configuration');
    console.log('  validate    Validate current setup');
    console.log('  update      Update to latest template version');
    console.log('  status      Show current status');
    console.log('  help        Show this help message\n');
    console.log('Examples:');
    console.log('  vt init                    # Initialize template');
    console.log('  vt configure               # Configure settings');
    console.log('  vt apply                   # Apply template');
    console.log('  vt validate                # Check setup');
  }

  getProjectName() {
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return packageJson.name || 'my-project';
    }
    return 'my-project';
  }

  isGitRepo() {
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

// Run the CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  new VirtualTeamCLI().run().catch(console.error);
}

export default VirtualTeamCLI;
