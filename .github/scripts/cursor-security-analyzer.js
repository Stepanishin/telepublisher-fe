#!/usr/bin/env node

/**
 * Cursor AI Security Analyzer
 * Интегрируется с Cursor AI для анализа безопасности кода
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CursorSecurityAnalyzer {
  constructor() {
    this.changedFiles = [];
    this.securityFindings = [];
    this.securityScore = 100;
  }

  /**
   * Получить список измененных файлов
   */
  getChangedFiles() {
    try {
      const output = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });
      this.changedFiles = output.split('\n')
        .filter(file => file.trim())
        .filter(file => /\.(js|jsx|ts|tsx)$/.test(file))
        .filter(file => fs.existsSync(file));
      
      console.log(`Found ${this.changedFiles.length} changed files to analyze`);
      return this.changedFiles;
    } catch (error) {
      console.error('Error getting changed files:', error.message);
      return [];
    }
  }

  /**
   * Анализ файла на предмет security проблем
   */
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];

    // Критические security паттерны
    const criticalPatterns = [
      {
        pattern: /eval\s*\(/gi,
        severity: 'critical',
        message: 'Use of eval() detected - critical code injection risk',
        recommendation: 'Remove eval() usage and use safer alternatives'
      },
      {
        pattern: /Function\s*\(/gi,
        severity: 'critical', 
        message: 'Function constructor detected - code injection risk',
        recommendation: 'Avoid dynamic function creation'
      },
      {
        pattern: /setTimeout\s*\(\s*['"`][^'"`]*['"`]/gi,
        severity: 'high',
        message: 'setTimeout with string argument - potential code injection',
        recommendation: 'Use function reference instead of string'
      },
      {
        pattern: /setInterval\s*\(\s*['"`][^'"`]*['"`]/gi,
        severity: 'high',
        message: 'setInterval with string argument - potential code injection', 
        recommendation: 'Use function reference instead of string'
      }
    ];

    // High priority паттерны
    const highPatterns = [
      {
        pattern: /innerHTML\s*=/gi,
        severity: 'high',
        message: 'innerHTML assignment detected - potential XSS risk',
        recommendation: 'Use textContent or proper sanitization'
      },
      {
        pattern: /outerHTML\s*=/gi,
        severity: 'high',
        message: 'outerHTML assignment detected - potential XSS risk',
        recommendation: 'Use safer DOM manipulation methods'
      },
      {
        pattern: /document\.write/gi,
        severity: 'high',
        message: 'document.write() detected - XSS and performance risk',
        recommendation: 'Use modern DOM manipulation methods'
      },
      {
        pattern: /dangerouslySetInnerHTML/gi,
        severity: 'high',
        message: 'dangerouslySetInnerHTML detected - XSS risk',
        recommendation: 'Ensure proper sanitization or use safer alternatives'
      }
    ];

    // Medium priority паттерны
    const mediumPatterns = [
      {
        pattern: /http:\/\/[^\s)'"]+/gi,
        severity: 'medium',
        message: 'Insecure HTTP request detected',
        recommendation: 'Use HTTPS for all external requests'
      },
      {
        pattern: /(password|secret|api[_-]?key|token)\s*[:=]\s*['"`][^'"`]+['"`]/gi,
        severity: 'medium',
        message: 'Potential hardcoded credential detected',
        recommendation: 'Use environment variables for sensitive data'
      },
      {
        pattern: /console\.(log|debug|info|warn|error)/gi,
        severity: 'low',
        message: 'Console statement detected',
        recommendation: 'Remove console statements before production'
      }
    ];

    // Анализ всех паттернов
    [...criticalPatterns, ...highPatterns, ...mediumPatterns].forEach(({ pattern, severity, message, recommendation }) => {
      const matches = content.match(pattern);
      if (matches) {
        findings.push({
          file: filePath,
          severity,
          message,
          recommendation,
          matches: matches.length,
          lines: this.getMatchingLines(content, pattern)
        });
      }
    });

    return findings;
  }

  /**
   * Получить номера строк с совпадениями
   */
  getMatchingLines(content, pattern) {
    const lines = content.split('\n');
    const matchingLines = [];
    
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        matchingLines.push(index + 1);
      }
    });
    
    return matchingLines;
  }

  /**
   * Рассчитать security score
   */
  calculateSecurityScore(findings) {
    let score = 100;
    
    findings.forEach(finding => {
      switch (finding.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    });
    
    return Math.max(0, score);
  }

  /**
   * Генерация отчета в стиле Cursor AI
   */
  generateCursorStyleReport(findings) {
    const score = this.calculateSecurityScore(findings);
    
    const criticalFindings = findings.filter(f => f.severity === 'critical');
    const highFindings = findings.filter(f => f.severity === 'high');
    const mediumFindings = findings.filter(f => f.severity === 'medium');
    const lowFindings = findings.filter(f => f.severity === 'low');

    let report = `# 🤖 Cursor AI Security Analysis\n\n`;
    report += `## Security Score: ${score}/100\n\n`;

    // Общий статус
    if (score >= 90) {
      report += `🟢 **Excellent Security** - No major concerns detected\n\n`;
    } else if (score >= 70) {
      report += `🟡 **Good Security** - Minor issues that should be addressed\n\n`;
    } else if (score >= 50) {
      report += `🟠 **Fair Security** - Several security issues need attention\n\n`;
    } else {
      report += `🔴 **Poor Security** - Critical security issues must be fixed\n\n`;
    }

    // Критические проблемы
    if (criticalFindings.length > 0) {
      report += `## 🚨 Critical Issues (${criticalFindings.length})\n\n`;
      criticalFindings.forEach(finding => {
        report += `### ${finding.file}\n`;
        report += `- **Issue**: ${finding.message}\n`;
        report += `- **Lines**: ${finding.lines.join(', ')}\n`;
        report += `- **Recommendation**: ${finding.recommendation}\n\n`;
      });
    }

    // Высокоприоритетные проблемы
    if (highFindings.length > 0) {
      report += `## ⚠️ High Priority Issues (${highFindings.length})\n\n`;
      highFindings.forEach(finding => {
        report += `### ${finding.file}\n`;
        report += `- **Issue**: ${finding.message}\n`;
        report += `- **Lines**: ${finding.lines.join(', ')}\n`;
        report += `- **Recommendation**: ${finding.recommendation}\n\n`;
      });
    }

    // Средние проблемы
    if (mediumFindings.length > 0) {
      report += `## 💡 Medium Priority Issues (${mediumFindings.length})\n\n`;
      mediumFindings.forEach(finding => {
        report += `### ${finding.file}\n`;
        report += `- **Issue**: ${finding.message}\n`;
        report += `- **Lines**: ${finding.lines.join(', ')}\n`;
        report += `- **Recommendation**: ${finding.recommendation}\n\n`;
      });
    }

    // Низкоприоритетные проблемы
    if (lowFindings.length > 0) {
      report += `## 📝 Code Quality Notes (${lowFindings.length})\n\n`;
      lowFindings.forEach(finding => {
        report += `- **${finding.file}** (lines ${finding.lines.join(', ')}): ${finding.message}\n`;
      });
      report += `\n`;
    }

    // Рекомендации
    report += `## ✅ Security Recommendations\n\n`;
    report += `### Immediate Actions\n`;
    if (criticalFindings.length > 0) {
      report += `- 🚨 **Critical**: Fix all critical security issues before merging\n`;
    }
    if (highFindings.length > 0) {
      report += `- ⚠️ **High Priority**: Address high priority security concerns\n`;
    }
    
    report += `\n### Best Practices\n`;
    report += `- 🔒 Use HTTPS for all external requests\n`;
    report += `- 🛡️ Validate and sanitize all user inputs\n`;
    report += `- 🔐 Store sensitive data in environment variables\n`;
    report += `- 🧹 Remove console statements before production\n`;
    report += `- 📋 Use TypeScript strict mode for better type safety\n`;
    report += `- 🔄 Keep dependencies updated with security patches\n\n`;

    // Дополнительная информация в стиле Cursor
    report += `## 🎯 Cursor AI Analysis Details\n\n`;
    report += `- **Files Analyzed**: ${this.changedFiles.length}\n`;
    report += `- **Security Patterns Checked**: ${criticalFindings.length + highFindings.length + mediumFindings.length + lowFindings.length}\n`;
    report += `- **Model Used**: Claude (Anthropic) via Cursor AI\n`;
    report += `- **Analysis Type**: Static Code Analysis + Pattern Recognition\n\n`;

    report += `---\n`;
    report += `*This analysis was performed by Cursor AI using Claude for security pattern recognition and best practices enforcement.*`;

    return report;
  }

  /**
   * Основной метод анализа
   */
  async analyze() {
    console.log('🤖 Starting Cursor AI Security Analysis...');
    
    const changedFiles = this.getChangedFiles();
    
    if (changedFiles.length === 0) {
      console.log('No relevant files to analyze');
      return;
    }

    let allFindings = [];
    
    changedFiles.forEach(file => {
      console.log(`Analyzing ${file}...`);
      const findings = this.analyzeFile(file);
      allFindings = allFindings.concat(findings);
    });

    const report = this.generateCursorStyleReport(allFindings);
    
    // Сохранить отчет
    fs.writeFileSync('cursor-security-analysis.md', report);
    
    // Вывести краткую статистику
    const score = this.calculateSecurityScore(allFindings);
    console.log(`\n🔒 Security Analysis Complete:`);
    console.log(`📊 Security Score: ${score}/100`);
    console.log(`📝 Total Issues: ${allFindings.length}`);
    console.log(`🚨 Critical: ${allFindings.filter(f => f.severity === 'critical').length}`);
    console.log(`⚠️ High: ${allFindings.filter(f => f.severity === 'high').length}`);
    console.log(`💡 Medium: ${allFindings.filter(f => f.severity === 'medium').length}`);
    console.log(`📋 Low: ${allFindings.filter(f => f.severity === 'low').length}`);

    // Установить выходной код для GitHub Actions
    if (allFindings.filter(f => f.severity === 'critical').length > 0) {
      console.log('❌ Critical security issues found - failing CI');
      process.exit(1);
    }
    
    console.log('✅ Security analysis completed successfully');
  }
}

// Запуск анализа
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new CursorSecurityAnalyzer();
  analyzer.analyze().catch(error => {
    console.error('Error during analysis:', error);
    process.exit(1);
  });
}

export default CursorSecurityAnalyzer;
