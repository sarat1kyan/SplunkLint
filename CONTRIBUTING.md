# Contributing to SplunkLint

Thank you for considering contributing to SplunkLint! We appreciate your time and effort to help make this tool better for the Splunk community.

## 🎯 How Can I Contribute?

There are many ways to contribute to SplunkLint:

### 1. Report Bugs 🐛
Found a bug? Help us fix it by:
- Checking if the issue already exists in [Issues](https://github.com/sarat1kyan/splunklint/issues)
- Creating a new issue with:
  - Clear, descriptive title
  - Steps to reproduce
  - Expected vs actual behavior
  - Browser and OS information
  - Sample XML that causes the issue (if applicable)

### 2. Suggest Features 💡
Have an idea? We'd love to hear it:
- Check existing feature requests first
- Create a new issue with the `enhancement` label
- Describe the feature and its use case
- Explain why it would be valuable

### 3. Improve Documentation 📚
Help others understand SplunkLint:
- Fix typos or unclear instructions
- Add examples
- Improve code comments
- Translate documentation

### 4. Submit Code 💻
Want to code? Awesome! See the guide below.

---

## 🚀 Getting Started

### Prerequisites
- Git
- A modern web browser (Chrome, Firefox, Edge)
- A text editor or IDE (VS Code recommended)

### Setup
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/splunklint.git
cd splunklint

# Create a branch for your changes
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-description
```

### Making Changes
1. **Edit `index.html`** - All code is in this single file
2. **Test locally** - Open `index.html` in your browser
3. **Verify** - Ensure all existing functionality still works
4. **Test edge cases** - Try various XML inputs

---

## 📝 Code Guidelines

### JavaScript Style
```javascript
// Use descriptive variable names
const xmlInput = document.getElementById('xmlInput');

// Add comments for complex logic
// Parse XML and check for deprecated elements
const parser = new DOMParser();

// Use consistent formatting
function validateXML() {
    // 4-space indentation
    if (condition) {
        // Do something
    }
}
```

### Validation Rules
When adding new validation rules:

```javascript
// Follow this pattern
if (someIssueDetected) {
    result.errors.push({  // or warnings/info
        type: 'error',
        title: 'Short descriptive title',
        message: 'Detailed explanation of the issue',
        suggestion: 'How to fix it (optional)'
    });
    result.valid = false;  // for errors only
}
```

### Severity Levels
- **Errors**: Must be fixed (breaks functionality)
- **Warnings**: Should be fixed (best practices)
- **Info**: Nice to have (suggestions)

---

## 🧪 Testing

Before submitting, test with:

### Basic Cases
```xml
<!-- Valid dashboard -->
<dashboard>
  <label>Test</label>
  <row><panel><single><search><query>index=main | stats count</query></search></single></panel></row>
</dashboard>

<!-- Invalid XML -->
<dashboard>
  <label>Unclosed tag
</dashboard>

<!-- Missing elements -->
<dashboard>
  <row><panel></panel></row>
</dashboard>
```

### Edge Cases
- Empty input
- Very large XML files (1MB+)
- Deeply nested structures
- Special characters in queries
- Multiple errors in one file

### Browser Testing
Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

---

## 📤 Submitting Changes

### Pull Request Process

1. **Commit your changes**
```bash
git add index.html
git commit -m "Add validation for deprecated searchTemplate element"
```

2. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

3. **Create Pull Request**
- Go to the original repository
- Click "New Pull Request"
- Select your branch
- Fill in the template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- Tested in Chrome/Firefox/Edge
- Validated with sample dashboards
- No existing functionality broken

## Screenshots (if applicable)
Add before/after screenshots
```

### PR Guidelines
- Keep changes focused (one feature/fix per PR)
- Update README if adding features
- Add examples for new validation rules
- Ensure code is formatted consistently
- All tests should pass

---

## 🎨 Adding Features

### Example: Adding a New Validation Rule

```javascript
// Location: Inside performValidation() function

// Check for missing option elements in charts
const charts = xmlDoc.querySelectorAll('chart');
charts.forEach((chart, index) => {
    const options = chart.querySelectorAll('option');
    if (options.length === 0) {
        result.warnings.push({
            type: 'warning',
            title: `Chart ${index + 1}: No Options`,
            message: 'Chart has no display options configured',
            suggestion: 'Add <option name="charting.chart">line</option> to specify chart type'
        });
    }
});
```

### Example: Adding SPL Analysis

```javascript
// Location: Inside analyzeSPL() function

// Check for stats without by clause
if (query.toLowerCase().includes('| stats') && 
    !query.toLowerCase().includes('by ')) {
    queryAnalysis.issues.push({
        severity: 'low',
        message: 'Stats command without grouping',
        suggestion: 'Consider adding a "by" clause to group results'
    });
}
```

---

## 🐛 Debugging Tips

### Browser Console
Open developer tools (F12) to:
- See JavaScript errors
- Inspect XML parsing
- Debug validation logic

### Common Issues
```javascript
// XML parsing error?
console.log('XML Doc:', xmlDoc);
console.log('Parse error:', xmlDoc.querySelector('parsererror'));

// Validation not working?
console.log('Result:', result);
console.log('Errors:', result.errors);
```

---

## 📋 Roadmap Contributions

Interested in roadmap items? Check these out:

### High Priority
- [ ] Syntax highlighting in editor
- [ ] Dashboard preview/rendering
- [ ] Custom validation rules

### Medium Priority
- [ ] Dark/light theme toggle
- [ ] Dashboard comparison tool
- [ ] Export to CSV

### Low Priority
- [ ] VS Code extension
- [ ] API mode
- [ ] Multi-language support

Pick one and create an issue saying you're working on it!

---

## 💬 Communication

### Questions?
- Open a [Discussion](https://github.com/sarat1kyan/splunklint/discussions)
- Create an issue with the `question` label
- Comment on existing issues

### Stuck?
Don't hesitate to ask for help! We're here to support you.

---

## 🏆 Recognition

Contributors are recognized in:
- GitHub contributors page
- Future CONTRIBUTORS.md file
- Release notes

---

## 📜 Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone, regardless of:
- Age, body size, disability
- Ethnicity, gender identity
- Experience level
- Nationality, personal appearance
- Race, religion, sexual identity

### Our Standards
**Positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behavior:**
- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

### Enforcement
Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to: [your-email@example.com]

---

## ✅ Checklist

Before submitting your PR, ensure:

- [ ] Code works in multiple browsers
- [ ] No console errors
- [ ] Existing tests pass
- [ ] New features are documented
- [ ] README updated (if needed)
- [ ] Commit messages are clear
- [ ] Code follows existing style
- [ ] No unnecessary changes included

---

## 🙏 Thank You!

Every contribution, no matter how small, helps make SplunkLint better for everyone. We appreciate your support!

**Happy coding!** 🚀

---

<div align="center">

Questions? Open an issue or discussion!

[Issues](https://github.com/sarat1kyan/splunklint/issues) • 
[Discussions](https://github.com/sarat1kyan/splunklint/discussions) • 
[Pull Requests](https://github.com/sarat1kyan/splunklint/pulls)

</div>
