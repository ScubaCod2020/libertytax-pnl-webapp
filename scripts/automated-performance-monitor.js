#!/usr/bin/env node

/**
 * Automated Performance Monitor
 * Continuous performance monitoring with AI-powered analysis
 * 
 * Usage: node scripts/automated-performance-monitor.js
 */

import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import { startFlow } from 'lighthouse/lighthouse-core/fraggle-rock/api.js';

class PerformanceMonitor {
  
  constructor() {
    this.browser = null;
    this.metrics = {
      loadTime: [],
      interactionTime: [],
      memoryUsage: [],
      bundleSize: {},
      lighthouse: {}
    };
  }
  
  async setup() {
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  
  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
  }
  
  /**
   * Monitor page load performance
   */
  async monitorPageLoad(url) {
    const page = await this.browser.newPage();
    
    try {
      console.log(`⏱️ Monitoring page load: ${url}`);
      
      // Start performance monitoring
      const startTime = Date.now();
      
      // Navigate and measure load time
      await page.goto(url, { waitUntil: 'networkidle' });
      
      const loadTime = Date.now() - startTime;
      
      // Get performance metrics
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByType('paint')
            .find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint')
            .find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          // Web Vitals approximation
          largestContentfulPaint: navigation.loadEventEnd - navigation.fetchStart
        };
      });
      
      // Memory usage
      const memoryUsage = await page.evaluate(() => {
        return performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        } : null;
      });
      
      const result = {
        url,
        timestamp: new Date().toISOString(),
        loadTime,
        performanceMetrics,
        memoryUsage
      };
      
      this.metrics.loadTime.push(result);
      
      console.log(`   • Load Time: ${loadTime}ms`);
      console.log(`   • First Contentful Paint: ${performanceMetrics.firstContentfulPaint.toFixed(1)}ms`);
      
      return result;
      
    } finally {
      await page.close();
    }
  }
  
  /**
   * Monitor user interaction performance
   */
  async monitorInteractions(url, interactions) {
    const page = await this.browser.newPage();
    
    try {
      console.log(`🖱️ Monitoring interaction performance: ${url}`);
      
      await page.goto(url, { waitUntil: 'networkidle' });
      
      const interactionResults = [];
      
      for (const interaction of interactions) {
        const startTime = Date.now();
        
        try {
          switch (interaction.type) {
            case 'click':
              await page.click(interaction.selector);
              break;
            case 'fill':
              await page.fill(interaction.selector, interaction.value);
              break;
            case 'select':
              await page.selectOption(interaction.selector, interaction.value);
              break;
            default:
              console.warn(`Unknown interaction type: ${interaction.type}`);
              continue;
          }
          
          // Wait for any potential updates
          await page.waitForTimeout(100);
          
          const responseTime = Date.now() - startTime;
          
          const result = {
            interaction: interaction.name,
            type: interaction.type,
            selector: interaction.selector,
            responseTime,
            timestamp: new Date().toISOString()
          };
          
          interactionResults.push(result);
          console.log(`   • ${interaction.name}: ${responseTime}ms`);
          
        } catch (error) {
          console.warn(`   ⚠️ Failed ${interaction.name}:`, error.message);
        }
      }
      
      this.metrics.interactionTime.push({
        url,
        interactions: interactionResults,
        timestamp: new Date().toISOString()
      });
      
      return interactionResults;
      
    } finally {
      await page.close();
    }
  }
  
  /**
   * Run Lighthouse audit
   */
  async runLighthouseAudit(url) {
    console.log(`🔍 Running Lighthouse audit: ${url}`);
    
    try {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      
      // Create Lighthouse flow
      const flow = await startFlow(page, {
        config: {
          extends: 'lighthouse:default',
          settings: {
            onlyCategories: ['performance', 'accessibility', 'best-practices']
          }
        }
      });
      
      await flow.navigate(url);
      
      const report = flow.generateReport();
      const results = flow.getFlowResult();
      
      // Extract key metrics
      const performanceScore = results.steps[0].lhr.categories.performance.score * 100;
      const accessibilityScore = results.steps[0].lhr.categories.accessibility.score * 100;
      const bestPracticesScore = results.steps[0].lhr.categories['best-practices'].score * 100;
      
      const metrics = {
        performance: performanceScore,
        accessibility: accessibilityScore,
        bestPractices: bestPracticesScore,
        firstContentfulPaint: results.steps[0].lhr.audits['first-contentful-paint'].numericValue,
        largestContentfulPaint: results.steps[0].lhr.audits['largest-contentful-paint'].numericValue,
        cumulativeLayoutShift: results.steps[0].lhr.audits['cumulative-layout-shift'].numericValue,
        speedIndex: results.steps[0].lhr.audits['speed-index'].numericValue,
        timestamp: new Date().toISOString()
      };
      
      this.metrics.lighthouse = metrics;
      
      console.log(`   • Performance Score: ${performanceScore.toFixed(1)}/100`);
      console.log(`   • Accessibility Score: ${accessibilityScore.toFixed(1)}/100`);
      console.log(`   • First Contentful Paint: ${metrics.firstContentfulPaint.toFixed(0)}ms`);
      console.log(`   • Largest Contentful Paint: ${metrics.largestContentfulPaint.toFixed(0)}ms`);
      
      await browser.close();
      
      return { metrics, report };
      
    } catch (error) {
      console.error('Failed to run Lighthouse audit:', error);
      return null;
    }
  }
  
  /**
   * Monitor bundle sizes
   */
  async monitorBundleSizes() {
    console.log('📦 Monitoring bundle sizes...');
    
    const fs = await import('fs');
    const path = await import('path');
    
    const distDir = 'dist/assets';
    
    if (!fs.existsSync(distDir)) {
      console.warn('   ⚠️ dist/assets directory not found. Run build first.');
      return;
    }
    
    const files = fs.readdirSync(distDir);
    const bundleSizes = {};
    
    files.forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.css')) {
        const filePath = path.join(distDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        
        bundleSizes[file] = {
          size: stats.size,
          sizeKB: parseFloat(sizeKB),
          timestamp: new Date().toISOString()
        };
        
        console.log(`   • ${file}: ${sizeKB}KB`);
      }
    });
    
    this.metrics.bundleSize = bundleSizes;
    return bundleSizes;
  }
  
  /**
   * Analyze performance trends and generate insights
   */
  analyzePerformanceTrends() {
    console.log('🧠 Analyzing performance trends...');
    
    const insights = [];
    
    // Bundle size analysis
    const bundleSizes = Object.values(this.metrics.bundleSize);
    const totalBundleSize = bundleSizes.reduce((sum, bundle) => sum + bundle.sizeKB, 0);
    
    if (totalBundleSize > 300) {
      insights.push({
        type: 'bundle_size',
        severity: 'warning',
        message: `Total bundle size (${totalBundleSize.toFixed(1)}KB) exceeds recommended 300KB`,
        recommendation: 'Consider code splitting or removing unused dependencies'
      });
    }
    
    // Load time analysis
    if (this.metrics.loadTime.length > 0) {
      const avgLoadTime = this.metrics.loadTime.reduce((sum, entry) => sum + entry.loadTime, 0) / this.metrics.loadTime.length;
      
      if (avgLoadTime > 3000) {
        insights.push({
          type: 'load_time',
          severity: 'error',
          message: `Average load time (${avgLoadTime.toFixed(0)}ms) exceeds 3 second threshold`,
          recommendation: 'Optimize images, enable compression, use CDN'
        });
      }
    }
    
    // Lighthouse score analysis
    if (this.metrics.lighthouse.performance) {
      if (this.metrics.lighthouse.performance < 90) {
        insights.push({
          type: 'lighthouse_performance',
          severity: this.metrics.lighthouse.performance < 70 ? 'error' : 'warning',
          message: `Lighthouse performance score (${this.metrics.lighthouse.performance.toFixed(1)}) below target`,
          recommendation: 'Focus on Core Web Vitals optimization'
        });
      }
    }
    
    return insights;
  }
  
  /**
   * Generate performance report
   */
  generateReport() {
    const insights = this.analyzePerformanceTrends();
    
    const report = `# 🚀 Automated Performance Report

**Generated**: ${new Date().toLocaleString()}

## 📊 Performance Summary

### Bundle Analysis
${Object.entries(this.metrics.bundleSize).map(([file, data]) => 
  `- **${file}**: ${data.sizeKB}KB`
).join('\n')}

**Total Bundle Size**: ${Object.values(this.metrics.bundleSize).reduce((sum, bundle) => sum + bundle.sizeKB, 0).toFixed(1)}KB

### Lighthouse Scores
${this.metrics.lighthouse.performance ? `
| Metric | Score |
|--------|-------|
| Performance | ${this.metrics.lighthouse.performance.toFixed(1)}/100 |
| Accessibility | ${this.metrics.lighthouse.accessibility.toFixed(1)}/100 |
| Best Practices | ${this.metrics.lighthouse.bestPractices.toFixed(1)}/100 |

### Core Web Vitals
- **First Contentful Paint**: ${this.metrics.lighthouse.firstContentfulPaint.toFixed(0)}ms
- **Largest Contentful Paint**: ${this.metrics.lighthouse.largestContentfulPaint.toFixed(0)}ms
- **Cumulative Layout Shift**: ${this.metrics.lighthouse.cumulativeLayoutShift.toFixed(3)}
- **Speed Index**: ${this.metrics.lighthouse.speedIndex.toFixed(0)}ms
` : '*Lighthouse data not available*'}

## 🎯 Performance Insights

${insights.length > 0 ? insights.map(insight => `
### ${insight.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (${insight.severity.toUpperCase()})

**Issue**: ${insight.message}
**Recommendation**: ${insight.recommendation}
`).join('') : '✅ **No performance issues detected!**'}

## 📈 Recommendations

${insights.filter(i => i.severity === 'error').length > 0 ? '### 🔴 Critical Issues' : ''}
${insights.filter(i => i.severity === 'error').map(i => `- ${i.message}`).join('\n')}

${insights.filter(i => i.severity === 'warning').length > 0 ? '### 🟡 Optimization Opportunities' : ''}
${insights.filter(i => i.severity === 'warning').map(i => `- ${i.message}`).join('\n')}

---

*This report was generated by the Automated Performance Monitor.*
`;

    return report;
  }
  
  /**
   * Run comprehensive performance monitoring
   */
  async runComprehensiveMonitoring(baseUrl = 'http://localhost:4173') {
    console.log('🤖 Starting Comprehensive Performance Monitor');
    console.log('============================================');
    
    try {
      // Monitor bundle sizes
      await this.monitorBundleSizes();
      
      // Monitor page load performance
      await this.monitorPageLoad(baseUrl);
      
      // Monitor key interactions
      const interactions = [
        { name: 'Region Selection', type: 'click', selector: '[data-testid="region-select"]' },
        { name: 'Input Field Entry', type: 'fill', selector: 'input[type="number"]', value: '125' },
        { name: 'Debug Panel Toggle', type: 'click', selector: '[data-testid="debug-toggle"]' }
      ];
      
      await this.monitorInteractions(baseUrl, interactions);
      
      // Run Lighthouse audit
      await this.runLighthouseAudit(baseUrl);
      
      // Generate insights and report
      const insights = this.analyzePerformanceTrends();
      const report = this.generateReport();
      
      console.log('\n📊 Performance Summary:');
      console.log(`   • Bundle Size: ${Object.values(this.metrics.bundleSize).reduce((sum, bundle) => sum + bundle.sizeKB, 0).toFixed(1)}KB`);
      if (this.metrics.lighthouse.performance) {
        console.log(`   • Lighthouse Performance: ${this.metrics.lighthouse.performance.toFixed(1)}/100`);
      }
      console.log(`   • Issues Found: ${insights.length}`);
      
      // Save results
      const fs = await import('fs');
      const outputDir = 'reports/performance';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFile = `${outputDir}/performance-report-${timestamp}.md`;
      const dataFile = `${outputDir}/performance-data-${timestamp}.json`;
      
      fs.writeFileSync(reportFile, report);
      fs.writeFileSync(dataFile, JSON.stringify(this.metrics, null, 2));
      
      console.log(`\n📁 Results saved:`);
      console.log(`   • Report: ${reportFile}`);
      console.log(`   • Data: ${dataFile}`);
      
      return {
        metrics: this.metrics,
        insights,
        report,
        reportFile,
        dataFile
      };
      
    } catch (error) {
      console.error('Performance monitoring failed:', error);
      throw error;
    }
  }
}

// CLI execution
async function main() {
  const monitor = new PerformanceMonitor();
  
  try {
    await monitor.setup();
    const results = await monitor.runComprehensiveMonitoring();
    
    // Exit with error if critical performance issues found
    const criticalIssues = results.insights.filter(i => i.severity === 'error');
    if (criticalIssues.length > 0) {
      console.log(`\n🚨 ${criticalIssues.length} critical performance issues found!`);
      process.exit(1);
    }
    
    console.log('\n✅ Performance monitoring completed successfully!');
    
  } catch (error) {
    console.error('❌ Performance monitoring failed:', error);
    process.exit(1);
  } finally {
    await monitor.teardown();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { PerformanceMonitor };
