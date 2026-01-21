require([
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
], function($, mvc) {
    'use strict';

    // ========================================
    // DOM Elements
    // ========================================
    var xmlInput = document.getElementById('xmlInput');
    var validateBtn = document.getElementById('validateBtn');
    var analyzeSPLBtn = document.getElementById('analyzeSPLBtn');
    var clearBtn = document.getElementById('clearBtn');
    var formatBtn = document.getElementById('formatBtn');
    var downloadBtn = document.getElementById('downloadBtn');
    var exportBtn = document.getElementById('exportBtn');
    var resultsContent = document.getElementById('resultsContent');
    var statusBadge = document.getElementById('statusBadge');
    var lineNumbers = document.getElementById('lineNumbers');
    var examplesDropdown = document.getElementById('examplesDropdown');
    var examplesContent = document.getElementById('examplesContent');
    var exportModal = document.getElementById('exportModal');
    var closeModal = document.getElementById('closeModal');

    var validationResult = null;
    var currentXML = '';

    // ========================================
    // Tab Navigation
    // ========================================
    document.querySelectorAll('.sl-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.sl-tab').forEach(function(t) { t.classList.remove('active'); });
            document.querySelectorAll('.sl-tab-content').forEach(function(c) { c.classList.remove('active'); });
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        });
    });

    // ========================================
    // Example Dashboards
    // ========================================
    var examples = {
        simple: {
            title: "Simple Dashboard",
            desc: "Basic dashboard with single value and table",
            xml: '<dashboard>\n  <label>Simple Dashboard</label>\n  <description>A basic dashboard example</description>\n  <row>\n    <panel>\n      <title>Total Events</title>\n      <single>\n        <search>\n          <query>index=main | stats count</query>\n          <earliest>-24h</earliest>\n          <latest>now</latest>\n        </search>\n        <option name="drilldown">none</option>\n      </single>\n    </panel>\n    <panel>\n      <title>Recent Events</title>\n      <table>\n        <search>\n          <query>index=main | head 100 | table _time, host, source, sourcetype</query>\n          <earliest>-1h</earliest>\n          <latest>now</latest>\n        </search>\n      </table>\n    </panel>\n  </row>\n</dashboard>'
        },
        advanced: {
            title: "Advanced Dashboard",
            desc: "Dashboard with charts, tokens, and drilldowns",
            xml: '<dashboard>\n  <label>Advanced Analytics Dashboard</label>\n  <description>Comprehensive dashboard with multiple visualizations</description>\n  <fieldset submitButton="true" autoRun="false">\n    <input type="time" token="time_range">\n      <label>Time Range</label>\n      <default>\n        <earliest>-24h@h</earliest>\n        <latest>now</latest>\n      </default>\n    </input>\n    <input type="dropdown" token="index_name">\n      <label>Index</label>\n      <choice value="*">All</choice>\n      <choice value="main">Main</choice>\n      <choice value="security">Security</choice>\n      <default>*</default>\n    </input>\n  </fieldset>\n  <row>\n    <panel>\n      <title>Event Volume Over Time</title>\n      <chart>\n        <search>\n          <query>index=$index_name$ | timechart count by sourcetype</query>\n          <earliest>$time_range.earliest$</earliest>\n          <latest>$time_range.latest$</latest>\n        </search>\n        <option name="charting.chart">line</option>\n        <option name="charting.legend.placement">right</option>\n        <drilldown>\n          <link target="_blank">/app/search/search?q=index=$index_name$</link>\n        </drilldown>\n      </chart>\n    </panel>\n  </row>\n  <row>\n    <panel>\n      <title>Top Sources</title>\n      <chart>\n        <search>\n          <query>index=$index_name$ | top limit=10 source</query>\n          <earliest>$time_range.earliest$</earliest>\n          <latest>$time_range.latest$</latest>\n        </search>\n        <option name="charting.chart">pie</option>\n      </chart>\n    </panel>\n    <panel>\n      <title>Error Events</title>\n      <single>\n        <search>\n          <query>index=$index_name$ (ERROR OR error) | stats count</query>\n          <earliest>$time_range.earliest$</earliest>\n          <latest>$time_range.latest$</latest>\n        </search>\n        <option name="rangeColors">["0x65A637","0xF7BC38","0xD93F3C"]</option>\n        <option name="rangeValues">[0,100]</option>\n      </single>\n    </panel>\n  </row>\n</dashboard>'
        },
        form: {
            title: "Form Dashboard",
            desc: "Interactive form with multiple input types",
            xml: '<form>\n  <label>Interactive Search Form</label>\n  <description>Use inputs to filter and analyze data</description>\n  <fieldset submitButton="true" autoRun="false">\n    <input type="text" token="search_term">\n      <label>Search Term</label>\n      <default>*</default>\n    </input>\n    <input type="multiselect" token="sourcetype">\n      <label>Source Types</label>\n      <choice value="access_combined">Apache Access</choice>\n      <choice value="secure">Secure Logs</choice>\n      <default>access_combined</default>\n    </input>\n  </fieldset>\n  <row>\n    <panel>\n      <title>Search Results</title>\n      <table>\n        <search>\n          <query>index=main $search_term$ | stats count by host</query>\n          <earliest>-24h</earliest>\n          <latest>now</latest>\n        </search>\n      </table>\n    </panel>\n  </row>\n</form>'
        },
        complex: {
            title: "Complex Dashboard",
            desc: "Multi-row dashboard with base searches",
            xml: '<dashboard>\n  <label>Complex Operations Dashboard</label>\n  <description>Dashboard demonstrating advanced patterns</description>\n  <search id="baseSearch">\n    <query>index=main | stats count by host, sourcetype</query>\n    <earliest>-24h</earliest>\n    <latest>now</latest>\n  </search>\n  <fieldset submitButton="true">\n    <input type="time" token="time">\n      <label>Time</label>\n      <default>\n        <earliest>-24h@h</earliest>\n        <latest>now</latest>\n      </default>\n    </input>\n  </fieldset>\n  <row>\n    <panel>\n      <title>Host Distribution</title>\n      <chart>\n        <search base="baseSearch">\n          <query>stats sum(count) as total by host</query>\n        </search>\n        <option name="charting.chart">pie</option>\n      </chart>\n    </panel>\n    <panel>\n      <title>Sourcetype Distribution</title>\n      <chart>\n        <search base="baseSearch">\n          <query>stats sum(count) as total by sourcetype</query>\n        </search>\n        <option name="charting.chart">bar</option>\n      </chart>\n    </panel>\n  </row>\n  <row>\n    <panel>\n      <title>Detail Table</title>\n      <table>\n        <search base="baseSearch">\n          <query>sort -count</query>\n        </search>\n        <option name="drilldown">row</option>\n        <drilldown>\n          <set token="selected_host">$row.host$</set>\n        </drilldown>\n      </table>\n    </panel>\n  </row>\n</dashboard>'
        }
    };

    Object.keys(examples).forEach(function(key) {
        var example = examples[key];
        var item = document.createElement('div');
        item.className = 'sl-dropdown-item';
        item.innerHTML = '<div class="sl-dropdown-item-title">' + example.title + '</div><div class="sl-dropdown-item-desc">' + example.desc + '</div>';
        item.onclick = function() {
            xmlInput.value = example.xml;
            updateLineNumbers();
            examplesDropdown.classList.remove('active');
            showToast('Example loaded successfully');
        };
        examplesContent.appendChild(item);
    });

    // ========================================
    // Core Utility Functions
    // ========================================
    function updateLineNumbers() {
        var lines = xmlInput.value.split('\n').length;
        var numbers = [];
        for (var i = 1; i <= lines; i++) { numbers.push(i); }
        lineNumbers.innerHTML = numbers.join('\n');
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showToast(message, type) {
        type = type || 'success';
        var toast = document.createElement('div');
        toast.className = 'sl-toast';
        toast.textContent = message;
        if (type === 'error') {
            toast.style.borderColor = 'var(--sl-accent-red)';
            toast.style.color = 'var(--sl-accent-red)';
        }
        document.body.appendChild(toast);
        setTimeout(function() {
            toast.style.animation = 'sl-toastSlide 0.3s ease-out reverse';
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }

    function formatXML(xml) {
        var serializer = new XMLSerializer();
        var xmlString = serializer.serializeToString(xml);
        xmlString = xmlString.replace(/></g, '>\n<');
        var lines = xmlString.split('\n');
        var formatted = '';
        var currentIndent = 0;
        lines.forEach(function(line) {
            var trimmed = line.trim();
            if (trimmed.startsWith('</')) { currentIndent--; }
            formatted += '  '.repeat(Math.max(0, currentIndent)) + trimmed + '\n';
            if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.includes('</')) {
                currentIndent++;
            }
        });
        return formatted.trim();
    }

    function parseXMLSafe(xmlText) {
        try {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            var parserError = xmlDoc.querySelector('parsererror');
            if (parserError) { return null; }
            return xmlDoc;
        } catch (e) { return null; }
    }

    // ========================================
    // Event Listeners - Basic
    // ========================================
    xmlInput.addEventListener('input', updateLineNumbers);
    xmlInput.addEventListener('scroll', function() { lineNumbers.scrollTop = xmlInput.scrollTop; });

    examplesDropdown.addEventListener('click', function(e) {
        if (!e.target.closest('.sl-dropdown-content')) {
            examplesDropdown.classList.toggle('active');
        }
    });

    document.addEventListener('click', function(e) {
        if (!examplesDropdown.contains(e.target)) {
            examplesDropdown.classList.remove('active');
        }
    });

    clearBtn.addEventListener('click', function() {
        xmlInput.value = '';
        updateLineNumbers();
        resultsContent.innerHTML = '<p class="sl-placeholder-text">Paste your XML and click "Validate XML" to check for issues.</p>';
        statusBadge.innerHTML = '';
        downloadBtn.disabled = true;
        exportBtn.disabled = true;
        analyzeSPLBtn.disabled = true;
        validationResult = null;
        showToast('Editor cleared');
    });

    formatBtn.addEventListener('click', function() {
        var xmlText = xmlInput.value.trim();
        if (!xmlText) { showToast('No XML to format', 'error'); return; }
        var xmlDoc = parseXMLSafe(xmlText);
        if (xmlDoc) {
            xmlInput.value = formatXML(xmlDoc);
            updateLineNumbers();
            showToast('XML formatted successfully');
        } else {
            showToast('Failed to format XML - fix syntax errors first', 'error');
        }
    });

    downloadBtn.addEventListener('click', function() {
        var xmlText = xmlInput.value.trim();
        if (!xmlText) return;
        var blob = new Blob([xmlText], { type: 'text/xml' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'dashboard.xml';
        a.click();
        URL.revokeObjectURL(url);
        showToast('XML downloaded');
    });

    xmlInput.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            validateXML();
        }
    });

    // ========================================
    // Export Modal
    // ========================================
    exportBtn.addEventListener('click', function() { exportModal.classList.add('active'); });
    closeModal.addEventListener('click', function() { exportModal.classList.remove('active'); });
    exportModal.addEventListener('click', function(e) {
        if (e.target === exportModal) { exportModal.classList.remove('active'); }
    });

    document.querySelectorAll('.sl-export-option').forEach(function(option) {
        option.addEventListener('click', function() {
            exportReport(option.dataset.format);
            exportModal.classList.remove('active');
        });
    });

    function exportReport(format) {
        if (!validationResult) return;
        var content, mimeType, filename;
        if (format === 'json') {
            content = JSON.stringify(validationResult, null, 2);
            mimeType = 'application/json';
            filename = 'splunklint-report.json';
        } else if (format === 'text') {
            content = generateTextReport(validationResult);
            mimeType = 'text/plain';
            filename = 'splunklint-report.txt';
        } else if (format === 'html') {
            content = generateHTMLReport(validationResult);
            mimeType = 'text/html';
            filename = 'splunklint-report.html';
        }
        var blob = new Blob([content], { type: mimeType });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Report exported as ' + format.toUpperCase());
    }

    function generateTextReport(result) {
        var text = '========================================\nSPLUNKLINT VALIDATION REPORT\n========================================\n\n';
        text += 'Date: ' + new Date().toLocaleString() + '\n';
        text += 'Status: ' + (result.valid ? 'VALID' : 'INVALID') + '\n\n';
        text += 'STATISTICS:\n- Panels: ' + result.stats.panels + '\n- Searches: ' + result.stats.searches + '\n';
        text += '- Rows: ' + result.stats.rows + '\n- Errors: ' + result.errors.length + '\n- Warnings: ' + result.warnings.length + '\n\n';
        if (result.errors.length > 0) {
            text += 'ERRORS:\n';
            result.errors.forEach(function(e, i) { text += (i+1) + '. ' + e.title + '\n   ' + e.message + '\n\n'; });
        }
        if (result.warnings.length > 0) {
            text += 'WARNINGS:\n';
            result.warnings.forEach(function(w, i) { text += (i+1) + '. ' + w.title + '\n   ' + w.message + '\n\n'; });
        }
        return text;
    }

    function generateHTMLReport(result) {
        return '<!DOCTYPE html><html><head><title>SplunkLint Report</title><style>body{font-family:monospace;background:#0a0e14;color:#e6edf3;padding:2rem}h1{color:#3fb950}.stat{display:inline-block;margin:1rem;padding:1rem;background:#151921;border:1px solid #30363d}.error{color:#f85149}.warning{color:#d29922}.success{color:#3fb950}</style></head><body><h1>SplunkLint Report</h1><p>Generated: ' + new Date().toLocaleString() + '</p><p class="' + (result.valid ? 'success' : 'error') + '">Status: ' + (result.valid ? 'VALID' : 'INVALID') + '</p><h2>Statistics</h2><div class="stat">Panels: ' + result.stats.panels + '</div><div class="stat">Searches: ' + result.stats.searches + '</div><div class="stat">Rows: ' + result.stats.rows + '</div>' + (result.errors.length ? '<h2>Errors</h2><ul>' + result.errors.map(function(e){return '<li class="error"><b>'+e.title+':</b> '+e.message+'</li>';}).join('') + '</ul>' : '') + (result.warnings.length ? '<h2>Warnings</h2><ul>' + result.warnings.map(function(w){return '<li class="warning"><b>'+w.title+':</b> '+w.message+'</li>';}).join('') + '</ul>' : '') + '</body></html>';
    }

    // ========================================
    // Validation
    // ========================================
    validateBtn.addEventListener('click', validateXML);

    function validateXML() {
        var xmlText = xmlInput.value.trim();
        if (!xmlText) {
            showResults({ valid: false, errors: [{ title: 'Empty Input', message: 'Please paste XML content to validate.' }], warnings: [], info: [], stats: { panels: 0, searches: 0, rows: 0, tokens: 0, drilldowns: 0 } });
            return;
        }
        validateBtn.innerHTML = '<span class="sl-loading"></span> Validating...';
        validateBtn.disabled = true;
        setTimeout(function() {
            var result = performValidation(xmlText);
            validationResult = result;
            currentXML = xmlText;
            showResults(result);
            validateBtn.innerHTML = '🔍 Validate XML';
            validateBtn.disabled = false;
            downloadBtn.disabled = false;
            exportBtn.disabled = false;
            analyzeSPLBtn.disabled = result.stats.searches === 0;
        }, 200);
    }

    function performValidation(xmlText) {
        var result = { valid: true, errors: [], warnings: [], info: [], stats: { panels: 0, searches: 0, rows: 0, tokens: 0, drilldowns: 0, baseSearches: 0, postProcessSearches: 0 } };
        var xmlDoc = parseXMLSafe(xmlText);
        if (!xmlDoc) {
            result.valid = false;
            result.errors.push({ title: 'XML Parse Error', message: 'Failed to parse XML. Check for syntax errors like unclosed tags or invalid characters.' });
            return result;
        }
        var rootElement = xmlDoc.documentElement;
        if (['dashboard', 'form'].indexOf(rootElement.tagName) === -1) {
            result.valid = false;
            result.errors.push({ title: 'Invalid Root Element', message: 'Root must be <dashboard> or <form>, found <' + rootElement.tagName + '>', suggestion: 'Change to <dashboard> or <form>' });
            return result;
        }
        result.info.push({ type: 'info', title: 'Root Element Valid', message: '✓ Valid <' + rootElement.tagName + '> element' });

        // Check label and description
        var label = xmlDoc.querySelector(':scope > label');
        if (!label || !label.textContent.trim()) {
            result.warnings.push({ title: 'Missing Dashboard Label', message: 'Add a <label> element for the dashboard title', suggestion: '<label>Your Dashboard Title</label>' });
        }
        if (!xmlDoc.querySelector(':scope > description')) {
            result.warnings.push({ title: 'Missing Description', message: 'Consider adding a <description> element', suggestion: '<description>Dashboard purpose</description>' });
        }

        // Count elements
        var rows = xmlDoc.querySelectorAll('row');
        var panels = xmlDoc.querySelectorAll('panel');
        var searches = xmlDoc.querySelectorAll('search');
        var drilldowns = xmlDoc.querySelectorAll('drilldown');
        result.stats.rows = rows.length;
        result.stats.panels = panels.length;
        result.stats.searches = searches.length;
        result.stats.drilldowns = drilldowns.length;

        // Count base vs post-process searches
        searches.forEach(function(s) {
            if (s.hasAttribute('id')) result.stats.baseSearches++;
            if (s.hasAttribute('base')) result.stats.postProcessSearches++;
        });

        // Count tokens
        var inputs = xmlDoc.querySelectorAll('input[token]');
        result.stats.tokens = inputs.length;

        if (panels.length === 0) {
            result.errors.push({ title: 'No Panels', message: 'Dashboard must have at least one panel', suggestion: 'Add <panel> elements with visualizations' });
            result.valid = false;
        }

        var validViz = ['single', 'table', 'chart', 'event', 'html', 'map', 'viz'];
        panels.forEach(function(panel, i) {
            var num = i + 1;
            var hasViz = validViz.some(function(v) { return panel.querySelector(v); });
            if (!hasViz) {
                result.errors.push({ title: 'Panel ' + num + ': Missing Visualization', message: 'Panel must have: ' + validViz.join(', '), suggestion: 'Add <chart>, <table>, or <single>' });
                result.valid = false;
            }
            if (!panel.querySelector('title')) {
                result.warnings.push({ title: 'Panel ' + num + ': Missing Title', message: 'Add <title> to the panel' });
            }
            ['searchName', 'searchString', 'searchTemplate'].forEach(function(dep) {
                if (panel.querySelector(dep)) {
                    result.warnings.push({ title: 'Panel ' + num + ': Deprecated <' + dep + '>', message: 'Use <search><query>...</query></search> instead' });
                }
            });
        });

        // Check searches
        searches.forEach(function(search, i) {
            var num = i + 1;
            var query = search.querySelector('query');
            if (!search.hasAttribute('base')) {
                if (!query) {
                    result.errors.push({ title: 'Search ' + num + ': Missing Query', message: 'Add <query> element' });
                    result.valid = false;
                } else if (!query.textContent.trim()) {
                    result.errors.push({ title: 'Search ' + num + ': Empty Query', message: 'Query cannot be empty' });
                    result.valid = false;
                }
            }
            if (!search.querySelector('earliest') && !search.querySelector('latest') && !search.hasAttribute('base')) {
                result.warnings.push({ title: 'Search ' + num + ': No Time Bounds', message: 'Specify <earliest> and <latest>' });
            }
            var refresh = search.querySelector('refresh');
            if (refresh && parseInt(refresh.textContent) < 30) {
                result.warnings.push({ title: 'Search ' + num + ': Aggressive Refresh', message: 'Refresh < 30s may impact performance' });
            }
        });

        // Security checks
        var securityPatterns = [
            { pattern: /password\s*=\s*["'][^"']+["']/i, msg: 'Hardcoded password detected' },
            { pattern: /api[_-]?key\s*=\s*["'][^"']+["']/i, msg: 'Hardcoded API key detected' },
            { pattern: /secret\s*=\s*["'][^"']+["']/i, msg: 'Hardcoded secret detected' },
            { pattern: /token\s*=\s*["'][a-zA-Z0-9]{20,}["']/i, msg: 'Possible hardcoded auth token' }
        ];
        securityPatterns.forEach(function(p) {
            if (p.pattern.test(xmlText)) {
                result.errors.push({ title: 'Security Issue', message: p.msg, suggestion: 'Remove credentials from XML' });
                result.valid = false;
            }
        });

        // Performance warnings
        if (result.stats.searches > 10) {
            result.warnings.push({ title: 'Many Searches (' + result.stats.searches + ')', message: 'Consider using base searches with post-process' });
        }
        if (result.stats.panels > 15) {
            result.warnings.push({ title: 'Many Panels (' + result.stats.panels + ')', message: 'Consider splitting into multiple dashboards' });
        }

        if (result.valid && result.errors.length === 0) {
            result.info.push({ type: 'success', title: '✓ Validation Successful', message: 'Dashboard XML is valid!' });
        }
        return result;
    }

    function showResults(result) {
        if (result.valid && result.errors.length === 0) {
            statusBadge.innerHTML = '<span class="sl-status-badge sl-status-success">✓ Valid</span>';
        } else if (result.errors.length > 0) {
            statusBadge.innerHTML = '<span class="sl-status-badge sl-status-error">✗ Errors</span>';
        } else {
            statusBadge.innerHTML = '<span class="sl-status-badge sl-status-warning">⚠ Warnings</span>';
        }
        var html = '<div class="sl-stats-grid">';
        html += '<div class="sl-stat-card"><div class="sl-stat-label">Panels</div><div class="sl-stat-value">' + result.stats.panels + '</div></div>';
        html += '<div class="sl-stat-card"><div class="sl-stat-label">Searches</div><div class="sl-stat-value">' + result.stats.searches + '</div></div>';
        html += '<div class="sl-stat-card"><div class="sl-stat-label">Rows</div><div class="sl-stat-value">' + result.stats.rows + '</div></div>';
        if (result.stats.tokens > 0) html += '<div class="sl-stat-card"><div class="sl-stat-label">Tokens</div><div class="sl-stat-value">' + result.stats.tokens + '</div></div>';
        if (result.stats.drilldowns > 0) html += '<div class="sl-stat-card"><div class="sl-stat-label">Drilldowns</div><div class="sl-stat-value">' + result.stats.drilldowns + '</div></div>';
        html += '<div class="sl-stat-card"><div class="sl-stat-label">Errors</div><div class="sl-stat-value sl-severity-high">' + result.errors.length + '</div></div>';
        html += '<div class="sl-stat-card"><div class="sl-stat-label">Warnings</div><div class="sl-stat-value sl-severity-medium">' + result.warnings.length + '</div></div>';
        html += '</div><div class="sl-message-list">';
        result.errors.forEach(function(e) {
            html += '<div class="sl-message-item sl-message-error"><div class="sl-message-header">' + e.title + '</div><div class="sl-message-body">' + e.message + '</div>' + (e.suggestion ? '<div class="sl-message-suggestion">💡 ' + e.suggestion + '</div>' : '') + '</div>';
        });
        result.warnings.forEach(function(w) {
            html += '<div class="sl-message-item sl-message-warning"><div class="sl-message-header">' + w.title + '</div><div class="sl-message-body">' + w.message + '</div>' + (w.suggestion ? '<div class="sl-message-suggestion">💡 ' + w.suggestion + '</div>' : '') + '</div>';
        });
        result.info.forEach(function(i) {
            var cls = i.type === 'success' ? 'sl-message-success' : 'sl-message-info';
            html += '<div class="sl-message-item ' + cls + '"><div class="sl-message-header">' + i.title + '</div><div class="sl-message-body">' + i.message + '</div></div>';
        });
        html += '</div>';
        resultsContent.innerHTML = html;
    }

    // ========================================
    // SPL Analysis
    // ========================================
    analyzeSPLBtn.addEventListener('click', function() {
        if (!currentXML) return;
        analyzeSPLBtn.innerHTML = '<span class="sl-loading"></span> Analyzing...';
        analyzeSPLBtn.disabled = true;
        setTimeout(function() {
            var analysis = analyzeSPL(currentXML);
            showSPLAnalysis(analysis);
            analyzeSPLBtn.innerHTML = '🔬 Analyze SPL';
            analyzeSPLBtn.disabled = false;
        }, 300);
    });

    function analyzeSPL(xmlText) {
        var analysis = { queries: [], recommendations: [] };
        var xmlDoc = parseXMLSafe(xmlText);
        if (!xmlDoc) return analysis;
        var queries = xmlDoc.querySelectorAll('query');
        queries.forEach(function(q, i) {
            var query = q.textContent.trim();
            var qa = { index: i + 1, query: query, issues: [], performance: 'good', score: 100 };
            
            // Performance checks
            if (/^\s*\*/.test(query)) { qa.issues.push({ severity: 'high', message: 'Leading wildcard - scans all data', suggestion: 'Add index= or specific terms first' }); qa.score -= 30; }
            if (!/index\s*=/i.test(query)) { qa.issues.push({ severity: 'medium', message: 'No index specified', suggestion: 'Add index=<name> for faster searches' }); qa.score -= 15; }
            if (/\|\s*transaction\b/i.test(query)) { qa.issues.push({ severity: 'high', message: 'transaction is resource-intensive', suggestion: 'Use stats with by clause' }); qa.score -= 25; }
            if (/\|\s*join\b/i.test(query)) { qa.issues.push({ severity: 'medium', message: 'join can be slow', suggestion: 'Consider stats or append' }); qa.score -= 15; }
            if (/\[.*\]/.test(query)) { qa.issues.push({ severity: 'medium', message: 'Subsearch limited to 50k results', suggestion: 'Consider using join or append instead' }); qa.score -= 10; }
            if (/\|\s*regex\b/i.test(query) && !/index\s*=/i.test(query)) { qa.issues.push({ severity: 'high', message: 'regex without index', suggestion: 'Specify index before regex' }); qa.score -= 25; }
            var orCount = (query.match(/\sOR\s/gi) || []).length;
            if (orCount > 5) { qa.issues.push({ severity: 'medium', message: orCount + ' OR clauses', suggestion: 'Use IN() operator' }); qa.score -= 10; }
            if (/\|\s*eval\b.*case\s*\(/i.test(query)) { qa.issues.push({ severity: 'low', message: 'Complex case() in eval', suggestion: 'Consider lookup tables' }); qa.score -= 5; }
            if (/\|\s*foreach\b/i.test(query)) { qa.issues.push({ severity: 'low', message: 'foreach can be slow on many fields', suggestion: 'Limit fields or use eval' }); qa.score -= 5; }
            if (/\|\s*mvexpand\b/i.test(query)) { qa.issues.push({ severity: 'low', message: 'mvexpand creates many rows', suggestion: 'Be cautious with large multivalue fields' }); qa.score -= 5; }
            if (/NOT\s+\w+/i.test(query) && !/index\s*=/i.test(query)) { qa.issues.push({ severity: 'medium', message: 'NOT without index is expensive', suggestion: 'Specify index first' }); qa.score -= 10; }
            
            qa.score = Math.max(0, qa.score);
            qa.performance = qa.score >= 80 ? 'good' : qa.score >= 50 ? 'fair' : 'poor';
            analysis.queries.push(qa);
        });
        
        var poorQueries = analysis.queries.filter(function(q) { return q.performance === 'poor'; }).length;
        if (poorQueries > 0) analysis.recommendations.push('Fix ' + poorQueries + ' poorly performing queries');
        var noIndex = analysis.queries.filter(function(q) { return q.issues.some(function(i) { return i.message.includes('No index'); }); }).length;
        if (noIndex > 0) analysis.recommendations.push('Add index= to ' + noIndex + ' queries');
        return analysis;
    }

    function showSPLAnalysis(analysis) {
        var html = '<h3 class="sl-spl-title">SPL Query Analysis</h3>';
        if (analysis.queries.length === 0) {
            html += '<p class="sl-placeholder-text">No queries found.</p>';
        } else {
            var avgScore = Math.round(analysis.queries.reduce(function(a, q) { return a + q.score; }, 0) / analysis.queries.length);
            html += '<div class="sl-overall-score"><span class="sl-score-label">Average Performance Score:</span> <span class="sl-score-value ' + (avgScore >= 80 ? 'sl-score-good' : avgScore >= 50 ? 'sl-score-fair' : 'sl-score-poor') + '">' + avgScore + '/100</span></div>';
            analysis.queries.forEach(function(qa) {
                var color = qa.performance === 'good' ? 'var(--sl-accent-green)' : qa.performance === 'fair' ? 'var(--sl-accent-yellow)' : 'var(--sl-accent-red)';
                html += '<div class="sl-message-item sl-message-info" style="border-left-color:' + color + '"><div class="sl-message-header">Query ' + qa.index + ' <span class="sl-perf-badge" style="background:' + color + '">' + qa.score + '/100</span></div><div class="sl-message-body"><code class="sl-query-code">' + escapeHtml(qa.query) + '</code>';
                if (qa.issues.length > 0) {
                    html += '<div class="sl-issues-list">';
                    qa.issues.forEach(function(issue) {
                        html += '<div class="sl-issue-item"><span class="sl-severity-' + issue.severity + '">⚠ ' + issue.message + '</span><br><span class="sl-suggestion">💡 ' + issue.suggestion + '</span></div>';
                    });
                    html += '</div>';
                } else {
                    html += '<div class="sl-no-issues">✓ Optimized query</div>';
                }
                html += '</div></div>';
            });
            if (analysis.recommendations.length > 0) {
                html += '<div class="sl-message-item sl-message-warning"><div class="sl-message-header">Recommendations</div><div class="sl-message-body"><ul class="sl-recommendations">';
                analysis.recommendations.forEach(function(r) { html += '<li>' + r + '</li>'; });
                html += '</ul></div></div>';
            }
        }
        resultsContent.innerHTML = html;
        statusBadge.innerHTML = '<span class="sl-status-badge sl-status-success">📊 Analysis Complete</span>';
    }

    // ========================================
    // COMPLEXITY ANALYZER
    // ========================================
    document.getElementById('analyzeComplexityBtn').addEventListener('click', function() {
        var xmlText = xmlInput.value.trim();
        if (!xmlText) { showToast('Please enter XML in the Validate tab first', 'error'); return; }
        var xmlDoc = parseXMLSafe(xmlText);
        if (!xmlDoc) { showToast('Invalid XML - fix errors first', 'error'); return; }
        
        var complexity = analyzeComplexity(xmlDoc, xmlText);
        showComplexityResults(complexity);
    });

    function analyzeComplexity(xmlDoc, xmlText) {
        var c = {
            score: 0,
            grade: 'A',
            metrics: {},
            issues: [],
            recommendations: []
        };

        // Count metrics
        c.metrics.panels = xmlDoc.querySelectorAll('panel').length;
        c.metrics.searches = xmlDoc.querySelectorAll('search').length;
        c.metrics.rows = xmlDoc.querySelectorAll('row').length;
        c.metrics.tokens = xmlDoc.querySelectorAll('input[token]').length;
        c.metrics.drilldowns = xmlDoc.querySelectorAll('drilldown').length;
        c.metrics.baseSearches = xmlDoc.querySelectorAll('search[id]').length;
        c.metrics.postProcessSearches = xmlDoc.querySelectorAll('search[base]').length;
        c.metrics.eventHandlers = xmlDoc.querySelectorAll('set, unset, link, eval').length;
        c.metrics.conditionalPanels = xmlDoc.querySelectorAll('panel[depends], panel[rejects]').length;
        c.metrics.htmlPanels = xmlDoc.querySelectorAll('html').length;
        c.metrics.charts = xmlDoc.querySelectorAll('chart').length;
        c.metrics.tables = xmlDoc.querySelectorAll('table').length;
        c.metrics.singles = xmlDoc.querySelectorAll('single').length;
        c.metrics.linesOfCode = xmlText.split('\n').length;
        c.metrics.nestedTokens = (xmlText.match(/\$[^$]+\$/g) || []).length;

        // Calculate complexity score (lower is simpler)
        c.score = 0;
        c.score += c.metrics.panels * 3;
        c.score += c.metrics.searches * 5;
        c.score += c.metrics.tokens * 4;
        c.score += c.metrics.drilldowns * 3;
        c.score += c.metrics.eventHandlers * 6;
        c.score += c.metrics.conditionalPanels * 8;
        c.score += c.metrics.htmlPanels * 5;
        c.score += Math.max(0, c.metrics.linesOfCode - 100) * 0.1;
        
        // Reduce score for good practices
        c.score -= c.metrics.baseSearches * 10; // Base searches are good
        c.score -= c.metrics.postProcessSearches * 5; // Post-process is efficient
        c.score = Math.max(0, Math.round(c.score));

        // Grade
        if (c.score <= 30) c.grade = 'A';
        else if (c.score <= 60) c.grade = 'B';
        else if (c.score <= 100) c.grade = 'C';
        else if (c.score <= 150) c.grade = 'D';
        else c.grade = 'F';

        // Generate issues and recommendations
        if (c.metrics.panels > 12) c.issues.push({ severity: 'high', message: 'Too many panels (' + c.metrics.panels + ')', impact: 'Slow load times, poor UX' });
        if (c.metrics.searches > 10 && c.metrics.baseSearches === 0) c.issues.push({ severity: 'high', message: 'Many searches without base search pattern', impact: 'Redundant queries, wasted resources' });
        if (c.metrics.tokens > 8) c.issues.push({ severity: 'medium', message: 'Many tokens (' + c.metrics.tokens + ')', impact: 'Complex dependencies, hard to debug' });
        if (c.metrics.htmlPanels > 3) c.issues.push({ severity: 'medium', message: 'Many HTML panels', impact: 'Security risks, maintenance burden' });
        if (c.metrics.conditionalPanels > 5) c.issues.push({ severity: 'medium', message: 'Many conditional panels', impact: 'Complex logic, harder testing' });
        if (c.metrics.linesOfCode > 500) c.issues.push({ severity: 'low', message: 'Large dashboard (' + c.metrics.linesOfCode + ' lines)', impact: 'Hard to maintain' });
        if (c.metrics.nestedTokens > 20) c.issues.push({ severity: 'medium', message: 'Heavy token usage (' + c.metrics.nestedTokens + ')', impact: 'Complex debugging' });

        // Recommendations
        if (c.metrics.searches > 5 && c.metrics.baseSearches === 0) c.recommendations.push('Use base searches with post-process to reduce load');
        if (c.metrics.panels > 10) c.recommendations.push('Split into multiple dashboards or use tabs');
        if (c.metrics.htmlPanels > 2) c.recommendations.push('Minimize custom HTML - use native visualizations');
        if (c.metrics.drilldowns === 0 && c.metrics.panels > 3) c.recommendations.push('Add drilldowns for better user experience');
        if (c.grade === 'A' || c.grade === 'B') c.recommendations.push('Dashboard complexity is well-managed!');

        return c;
    }

    function showComplexityResults(c) {
        var gradeColor = { A: '#3fb950', B: '#58a6ff', C: '#d29922', D: '#f85149', F: '#f85149' };
        var html = '<div class="sl-complexity-header"><div class="sl-grade-circle" style="background:' + gradeColor[c.grade] + '"><span class="sl-grade">' + c.grade + '</span></div><div class="sl-complexity-summary"><h3>Complexity Score: ' + c.score + '</h3><p>' + getGradeDescription(c.grade) + '</p></div></div>';
        
        html += '<div class="sl-metrics-grid">';
        html += '<div class="sl-metric"><span class="sl-metric-value">' + c.metrics.panels + '</span><span class="sl-metric-label">Panels</span></div>';
        html += '<div class="sl-metric"><span class="sl-metric-value">' + c.metrics.searches + '</span><span class="sl-metric-label">Searches</span></div>';
        html += '<div class="sl-metric"><span class="sl-metric-value">' + c.metrics.tokens + '</span><span class="sl-metric-label">Tokens</span></div>';
        html += '<div class="sl-metric"><span class="sl-metric-value">' + c.metrics.baseSearches + '</span><span class="sl-metric-label">Base Searches</span></div>';
        html += '<div class="sl-metric"><span class="sl-metric-value">' + c.metrics.drilldowns + '</span><span class="sl-metric-label">Drilldowns</span></div>';
        html += '<div class="sl-metric"><span class="sl-metric-value">' + c.metrics.linesOfCode + '</span><span class="sl-metric-label">Lines</span></div>';
        html += '</div>';

        if (c.issues.length > 0) {
            html += '<h4 class="sl-section-title">Issues Found</h4><div class="sl-issues-container">';
            c.issues.forEach(function(i) {
                html += '<div class="sl-issue-card sl-severity-' + i.severity + '-bg"><div class="sl-issue-message">' + i.message + '</div><div class="sl-issue-impact">Impact: ' + i.impact + '</div></div>';
            });
            html += '</div>';
        }

        if (c.recommendations.length > 0) {
            html += '<h4 class="sl-section-title">Recommendations</h4><ul class="sl-recommendations">';
            c.recommendations.forEach(function(r) { html += '<li>' + r + '</li>'; });
            html += '</ul>';
        }

        document.getElementById('complexityResults').innerHTML = html;
    }

    function getGradeDescription(grade) {
        var desc = { A: 'Excellent! Simple and maintainable.', B: 'Good. Minor optimizations possible.', C: 'Moderate complexity. Consider simplifying.', D: 'High complexity. Refactoring recommended.', F: 'Very complex. Major restructuring needed.' };
        return desc[grade] || '';
    }

    // ========================================
    // SPL OPTIMIZER
    // ========================================
    document.getElementById('optimizeSPLBtn').addEventListener('click', function() {
        var spl = document.getElementById('splInput').value.trim();
        if (!spl) { showToast('Enter an SPL query first', 'error'); return; }
        var optimized = optimizeSPL(spl);
        showOptimizeResults(optimized);
    });

    document.getElementById('extractFromXMLBtn').addEventListener('click', function() {
        var xmlText = xmlInput.value.trim();
        if (!xmlText) { showToast('Enter XML in Validate tab first', 'error'); return; }
        var xmlDoc = parseXMLSafe(xmlText);
        if (!xmlDoc) { showToast('Invalid XML', 'error'); return; }
        var queries = xmlDoc.querySelectorAll('query');
        var allQueries = [];
        queries.forEach(function(q) { if (q.textContent.trim()) allQueries.push(q.textContent.trim()); });
        if (allQueries.length === 0) { showToast('No queries found in XML', 'error'); return; }
        document.getElementById('splInput').value = allQueries.join('\n\n---\n\n');
        showToast('Extracted ' + allQueries.length + ' queries');
    });

    function optimizeSPL(spl) {
        var result = { original: spl, optimized: spl, suggestions: [], score: { before: 0, after: 0 } };
        var optimized = spl;

        // Optimization rules
        var rules = [
            { pattern: /^\s*\*\s*\|/i, replacement: 'index=main | ', suggestion: 'Added explicit index', impact: 'Prevents scanning all indexes' },
            { pattern: /\|\s*search\s+(\w+)/gi, replacement: '| search index=main $1', suggestion: 'Consider adding index to search command', impact: 'Faster filtering' },
            { pattern: /(\w+)=(\*\w+\*)/g, replacement: '$1=*$2', suggestion: 'Leading wildcards are expensive', impact: 'Very slow searches' },
            { pattern: /\|\s*sort\s+0\s+/gi, replacement: '| sort ', suggestion: 'Removed sort 0 (unlimited)', impact: 'Memory optimization' },
            { pattern: /\|\s*table\s+\*/gi, replacement: '| table _time host source sourcetype', suggestion: 'Specify fields instead of *', impact: 'Reduced data transfer' },
            { pattern: /\|\s*stats\s+count\s+by\s+(\w+)\s*\|\s*sort\s+-count/gi, replacement: '| top $1', suggestion: 'Use top instead of stats+sort', impact: 'More efficient' },
            { pattern: /\((\w+)=(\w+)\s+OR\s+\1=(\w+)\s+OR\s+\1=(\w+)\)/gi, replacement: '$1 IN ($2, $3, $4)', suggestion: 'Use IN() instead of multiple OR', impact: 'Cleaner syntax, same performance' }
        ];

        rules.forEach(function(rule) {
            if (rule.pattern.test(optimized)) {
                result.suggestions.push({ type: 'optimization', message: rule.suggestion, impact: rule.impact });
            }
        });

        // Calculate scores
        result.score.before = 100;
        result.score.after = 100;
        if (/^\s*\*/.test(spl)) result.score.before -= 30;
        if (!/index\s*=/i.test(spl)) result.score.before -= 20;
        if (/\|\s*transaction\b/i.test(spl)) result.score.before -= 25;
        if (/\|\s*join\b/i.test(spl)) result.score.before -= 15;
        
        // Apply some safe optimizations
        if (/^\s*\*\s*\|/.test(optimized) && !/index\s*=/.test(optimized)) {
            optimized = 'index=main ' + optimized.replace(/^\s*\*\s*/, '');
            result.score.after += 20;
        }

        result.optimized = optimized;
        result.score.before = Math.max(0, result.score.before);
        result.score.after = Math.min(100, Math.max(result.score.before, result.score.after));

        // Add best practices suggestions
        if (!/\|\s*fields\s+/i.test(spl) && /\|\s*table\s+/i.test(spl)) {
            result.suggestions.push({ type: 'bestpractice', message: 'Use fields command early to limit data', impact: 'Reduces memory usage in pipeline' });
        }
        if (/\|\s*eval\s+\w+\s*=\s*if\s*\(/i.test(spl)) {
            result.suggestions.push({ type: 'tip', message: 'Multiple if() evals can use case()', impact: 'More readable code' });
        }

        return result;
    }

    function showOptimizeResults(result) {
        var html = '<div class="sl-optimize-scores"><div class="sl-score-box"><span class="sl-score-title">Original Score</span><span class="sl-score-number ' + (result.score.before >= 70 ? 'sl-score-good' : result.score.before >= 40 ? 'sl-score-fair' : 'sl-score-poor') + '">' + result.score.before + '</span></div>';
        html += '<div class="sl-score-arrow">→</div>';
        html += '<div class="sl-score-box"><span class="sl-score-title">Optimized Score</span><span class="sl-score-number ' + (result.score.after >= 70 ? 'sl-score-good' : result.score.after >= 40 ? 'sl-score-fair' : 'sl-score-poor') + '">' + result.score.after + '</span></div></div>';

        if (result.suggestions.length > 0) {
            html += '<h4 class="sl-section-title">Optimization Suggestions</h4><div class="sl-suggestions-list">';
            result.suggestions.forEach(function(s) {
                var icon = s.type === 'optimization' ? '⚡' : s.type === 'bestpractice' ? '📋' : '💡';
                html += '<div class="sl-suggestion-item"><span class="sl-suggestion-icon">' + icon + '</span><div><div class="sl-suggestion-message">' + s.message + '</div><div class="sl-suggestion-impact">' + s.impact + '</div></div></div>';
            });
            html += '</div>';
        }

        if (result.optimized !== result.original) {
            html += '<h4 class="sl-section-title">Optimized Query</h4><pre class="sl-code-block">' + escapeHtml(result.optimized) + '</pre>';
            html += '<button class="sl-btn sl-btn-secondary sl-copy-btn" onclick="navigator.clipboard.writeText(\'' + result.optimized.replace(/'/g, "\\'") + '\');document.querySelector(\'.sl-toast\') || (function(){var t=document.createElement(\'div\');t.className=\'sl-toast\';t.textContent=\'Copied!\';document.body.appendChild(t);setTimeout(function(){t.remove();},2000);})();">📋 Copy Optimized Query</button>';
        }

        document.getElementById('optimizeResults').innerHTML = html;
    }

    // ========================================
    // TOKEN FLOW ANALYZER
    // ========================================
    document.getElementById('analyzeTokensBtn').addEventListener('click', function() {
        var xmlText = xmlInput.value.trim();
        if (!xmlText) { showToast('Enter XML in Validate tab first', 'error'); return; }
        var xmlDoc = parseXMLSafe(xmlText);
        if (!xmlDoc) { showToast('Invalid XML', 'error'); return; }
        var tokens = analyzeTokenFlow(xmlDoc, xmlText);
        showTokenResults(tokens);
    });

    function analyzeTokenFlow(xmlDoc, xmlText) {
        var result = { tokens: [], dependencies: [], issues: [], orphans: [] };

        // Find token definitions (inputs)
        var inputs = xmlDoc.querySelectorAll('input[token]');
        inputs.forEach(function(input) {
            var name = input.getAttribute('token');
            var type = input.getAttribute('type') || 'text';
            var label = input.querySelector('label');
            var defaultVal = input.querySelector('default');
            result.tokens.push({
                name: name,
                type: type,
                label: label ? label.textContent : name,
                hasDefault: !!defaultVal,
                source: 'input',
                usedIn: []
            });
        });

        // Find tokens set via drilldown
        var sets = xmlDoc.querySelectorAll('set[token]');
        sets.forEach(function(set) {
            var name = set.getAttribute('token');
            if (!result.tokens.find(function(t) { return t.name === name; })) {
                result.tokens.push({ name: name, type: 'drilldown', label: name, hasDefault: false, source: 'drilldown', usedIn: [] });
            }
        });

        // Find token usages
        var tokenPattern = /\$([^$]+)\$/g;
        var match;
        while ((match = tokenPattern.exec(xmlText)) !== null) {
            var tokenName = match[1].split('.')[0]; // Handle $token.earliest$ etc
            var token = result.tokens.find(function(t) { return t.name === tokenName; });
            if (token) {
                token.usedIn.push(match.index);
            } else if (!['earliest', 'latest', 'env', 'form', 'row', 'click', 'drilldown'].some(function(r) { return match[1].startsWith(r); })) {
                // Check if it's an orphan (used but not defined)
                if (!result.orphans.includes(tokenName)) {
                    result.orphans.push(tokenName);
                }
            }
        }

        // Find unused tokens
        result.tokens.forEach(function(t) {
            if (t.usedIn.length === 0) {
                result.issues.push({ type: 'unused', token: t.name, message: 'Token "' + t.name + '" is defined but never used' });
            }
            if (!t.hasDefault && t.source === 'input') {
                result.issues.push({ type: 'nodefault', token: t.name, message: 'Token "' + t.name + '" has no default value' });
            }
        });

        result.orphans.forEach(function(o) {
            result.issues.push({ type: 'orphan', token: o, message: 'Token "' + o + '" is used but not defined' });
        });

        // Build dependency graph
        var queries = xmlDoc.querySelectorAll('query');
        queries.forEach(function(q, i) {
            var queryText = q.textContent;
            var usedTokens = [];
            result.tokens.forEach(function(t) {
                if (queryText.includes('$' + t.name + '$') || queryText.includes('$' + t.name + '.')) {
                    usedTokens.push(t.name);
                }
            });
            if (usedTokens.length > 0) {
                result.dependencies.push({ query: i + 1, tokens: usedTokens });
            }
        });

        return result;
    }

    function showTokenResults(result) {
        var html = '<div class="sl-token-summary"><span class="sl-token-count">' + result.tokens.length + '</span> tokens defined</div>';

        if (result.tokens.length > 0) {
            html += '<h4 class="sl-section-title">Token Definitions</h4><div class="sl-token-grid">';
            result.tokens.forEach(function(t) {
                var statusClass = t.usedIn.length === 0 ? 'sl-token-unused' : 'sl-token-used';
                html += '<div class="sl-token-card ' + statusClass + '"><div class="sl-token-name">$' + t.name + '$</div><div class="sl-token-meta"><span class="sl-token-type">' + t.type + '</span><span class="sl-token-source">' + t.source + '</span></div><div class="sl-token-usage">Used ' + t.usedIn.length + ' time(s)</div></div>';
            });
            html += '</div>';
        }

        if (result.dependencies.length > 0) {
            html += '<h4 class="sl-section-title">Query Dependencies</h4><div class="sl-dependency-list">';
            result.dependencies.forEach(function(d) {
                html += '<div class="sl-dependency-item"><span class="sl-query-ref">Query ' + d.query + '</span> depends on: <span class="sl-dep-tokens">' + d.tokens.map(function(t) { return '$' + t + '$'; }).join(', ') + '</span></div>';
            });
            html += '</div>';
        }

        if (result.issues.length > 0) {
            html += '<h4 class="sl-section-title">Issues</h4><div class="sl-token-issues">';
            result.issues.forEach(function(i) {
                var icon = i.type === 'orphan' ? '❌' : i.type === 'unused' ? '⚠️' : '💡';
                var cls = i.type === 'orphan' ? 'sl-issue-error' : 'sl-issue-warning';
                html += '<div class="sl-token-issue ' + cls + '"><span class="sl-issue-icon">' + icon + '</span>' + i.message + '</div>';
            });
            html += '</div>';
        } else if (result.tokens.length > 0) {
            html += '<div class="sl-success-message">✓ No token issues detected</div>';
        }

        document.getElementById('tokenResults').innerHTML = html;
    }

    // ========================================
    // DASHBOARD CONVERTER
    // ========================================
    document.getElementById('convertToStudioBtn').addEventListener('click', function() {
        var xmlText = xmlInput.value.trim();
        if (!xmlText) { showToast('Enter XML in Validate tab first', 'error'); return; }
        var xmlDoc = parseXMLSafe(xmlText);
        if (!xmlDoc) { showToast('Invalid XML', 'error'); return; }
        var json = convertToStudio(xmlDoc);
        document.getElementById('convertOutput').textContent = JSON.stringify(json, null, 2);
        showToast('Converted to Dashboard Studio JSON');
    });

    document.getElementById('convertToSimpleBtn').addEventListener('click', function() {
        var xmlText = xmlInput.value.trim();
        if (!xmlText) { showToast('Enter XML first', 'error'); return; }
        var minified = xmlText.replace(/>\s+</g, '><').replace(/\n\s*/g, '');
        document.getElementById('convertOutput').textContent = minified;
        showToast('XML minified');
    });

    function convertToStudio(xmlDoc) {
        var root = xmlDoc.documentElement;
        var label = root.querySelector(':scope > label');
        var desc = root.querySelector(':scope > description');
        
        var studio = {
            visualizations: {},
            dataSources: {},
            defaults: { dataSources: { ds: { type: "ds.search" } } },
            inputs: {},
            layout: { type: "absolute", options: { width: 1440, height: 960 }, structure: [] },
            title: label ? label.textContent : "Converted Dashboard",
            description: desc ? desc.textContent : "",
            definition: { dataSources: {}, visualizations: {}, inputs: {} }
        };

        var vizId = 0;
        var dsId = 0;
        var yPos = 0;

        // Convert inputs
        var inputs = xmlDoc.querySelectorAll('input[token]');
        inputs.forEach(function(input, i) {
            var token = input.getAttribute('token');
            var type = input.getAttribute('type') || 'text';
            var label = input.querySelector('label');
            var inputDef = {
                type: type === 'dropdown' ? 'input.dropdown' : type === 'multiselect' ? 'input.multiselect' : type === 'time' ? 'input.timerange' : 'input.text',
                options: { token: token },
                title: label ? label.textContent : token
            };
            studio.inputs['input_' + i] = inputDef;
        });

        // Convert panels
        var panels = xmlDoc.querySelectorAll('panel');
        panels.forEach(function(panel, pIdx) {
            var title = panel.querySelector(':scope > title');
            var search = panel.querySelector('search');
            var vizType = null;
            ['chart', 'table', 'single', 'event', 'map'].forEach(function(v) {
                if (panel.querySelector(v)) vizType = v;
            });

            if (search) {
                var query = search.querySelector('query');
                var dsName = 'ds_' + dsId++;
                studio.dataSources[dsName] = {
                    type: "ds.search",
                    options: { query: query ? query.textContent.trim() : "" }
                };

                if (vizType) {
                    var vizName = 'viz_' + vizId++;
                    var studioVizType = vizType === 'chart' ? 'viz.line' : vizType === 'table' ? 'viz.table' : vizType === 'single' ? 'viz.singlevalue' : 'viz.table';
                    studio.visualizations[vizName] = {
                        type: studioVizType,
                        dataSources: { primary: dsName },
                        title: title ? title.textContent : "",
                        options: {}
                    };
                    studio.layout.structure.push({
                        item: vizName,
                        type: "block",
                        position: { x: 20, y: yPos, w: 1400, h: 250 }
                    });
                    yPos += 270;
                }
            }
        });

        return studio;
    }

    // ========================================
    // DASHBOARD COMPARE
    // ========================================
    document.getElementById('compareDashboardsBtn').addEventListener('click', function() {
        var xml1 = document.getElementById('compareXml1').value.trim();
        var xml2 = document.getElementById('compareXml2').value.trim();
        if (!xml1 || !xml2) { showToast('Enter both XMLs to compare', 'error'); return; }
        var diff = compareDashboards(xml1, xml2);
        showCompareResults(diff);
    });

    function compareDashboards(xml1, xml2) {
        var result = { added: [], removed: [], modified: [], stats: { panels1: 0, panels2: 0, searches1: 0, searches2: 0 } };
        var doc1 = parseXMLSafe(xml1);
        var doc2 = parseXMLSafe(xml2);
        if (!doc1 || !doc2) { result.error = 'Invalid XML in one or both inputs'; return result; }

        result.stats.panels1 = doc1.querySelectorAll('panel').length;
        result.stats.panels2 = doc2.querySelectorAll('panel').length;
        result.stats.searches1 = doc1.querySelectorAll('search').length;
        result.stats.searches2 = doc2.querySelectorAll('search').length;

        // Compare panel titles
        var titles1 = []; doc1.querySelectorAll('panel > title').forEach(function(t) { titles1.push(t.textContent); });
        var titles2 = []; doc2.querySelectorAll('panel > title').forEach(function(t) { titles2.push(t.textContent); });
        titles2.forEach(function(t) { if (titles1.indexOf(t) === -1) result.added.push({ type: 'panel', name: t }); });
        titles1.forEach(function(t) { if (titles2.indexOf(t) === -1) result.removed.push({ type: 'panel', name: t }); });

        // Compare queries
        var queries1 = []; doc1.querySelectorAll('query').forEach(function(q) { queries1.push(q.textContent.trim()); });
        var queries2 = []; doc2.querySelectorAll('query').forEach(function(q) { queries2.push(q.textContent.trim()); });
        queries2.forEach(function(q, i) { if (queries1.indexOf(q) === -1) result.added.push({ type: 'query', name: 'Query ' + (i+1), content: q.substring(0, 100) }); });
        queries1.forEach(function(q, i) { if (queries2.indexOf(q) === -1) result.removed.push({ type: 'query', name: 'Query ' + (i+1), content: q.substring(0, 100) }); });

        // Compare tokens
        var tokens1 = []; doc1.querySelectorAll('input[token]').forEach(function(i) { tokens1.push(i.getAttribute('token')); });
        var tokens2 = []; doc2.querySelectorAll('input[token]').forEach(function(i) { tokens2.push(i.getAttribute('token')); });
        tokens2.forEach(function(t) { if (tokens1.indexOf(t) === -1) result.added.push({ type: 'token', name: t }); });
        tokens1.forEach(function(t) { if (tokens2.indexOf(t) === -1) result.removed.push({ type: 'token', name: t }); });

        return result;
    }

    function showCompareResults(diff) {
        if (diff.error) {
            document.getElementById('compareResults').innerHTML = '<div class="sl-error-message">' + diff.error + '</div>';
            return;
        }

        var html = '<div class="sl-compare-stats"><div class="sl-compare-stat"><span class="sl-stat-title">Original</span><span>' + diff.stats.panels1 + ' panels, ' + diff.stats.searches1 + ' searches</span></div>';
        html += '<div class="sl-compare-stat"><span class="sl-stat-title">Modified</span><span>' + diff.stats.panels2 + ' panels, ' + diff.stats.searches2 + ' searches</span></div></div>';

        if (diff.added.length === 0 && diff.removed.length === 0 && diff.modified.length === 0) {
            html += '<div class="sl-success-message">✓ No differences found - dashboards are identical</div>';
        } else {
            if (diff.added.length > 0) {
                html += '<h4 class="sl-section-title sl-added">+ Added (' + diff.added.length + ')</h4><div class="sl-diff-list">';
                diff.added.forEach(function(a) { html += '<div class="sl-diff-item sl-diff-added"><span class="sl-diff-type">' + a.type + '</span> ' + a.name + (a.content ? '<div class="sl-diff-preview">' + escapeHtml(a.content) + '...</div>' : '') + '</div>'; });
                html += '</div>';
            }
            if (diff.removed.length > 0) {
                html += '<h4 class="sl-section-title sl-removed">- Removed (' + diff.removed.length + ')</h4><div class="sl-diff-list">';
                diff.removed.forEach(function(r) { html += '<div class="sl-diff-item sl-diff-removed"><span class="sl-diff-type">' + r.type + '</span> ' + r.name + (r.content ? '<div class="sl-diff-preview">' + escapeHtml(r.content) + '...</div>' : '') + '</div>'; });
                html += '</div>';
            }
        }
        document.getElementById('compareResults').innerHTML = html;
    }

    // ========================================
    // DOCUMENTATION GENERATOR
    // ========================================
    document.getElementById('generateDocsBtn').addEventListener('click', function() {
        var xmlText = xmlInput.value.trim();
        if (!xmlText) { showToast('Enter XML in Validate tab first', 'error'); return; }
        var xmlDoc = parseXMLSafe(xmlText);
        if (!xmlDoc) { showToast('Invalid XML', 'error'); return; }
        var format = document.getElementById('docFormat').value;
        var docs = generateDocs(xmlDoc, format);
        document.getElementById('docsOutput').textContent = docs;
        document.getElementById('copyDocsBtn').disabled = false;
        showToast('Documentation generated');
    });

    document.getElementById('copyDocsBtn').addEventListener('click', function() {
        var docs = document.getElementById('docsOutput').textContent;
        navigator.clipboard.writeText(docs);
        showToast('Copied to clipboard');
    });

    function generateDocs(xmlDoc, format) {
        var root = xmlDoc.documentElement;
        var label = root.querySelector(':scope > label');
        var desc = root.querySelector(':scope > description');
        var panels = xmlDoc.querySelectorAll('panel');
        var inputs = xmlDoc.querySelectorAll('input[token]');
        var searches = xmlDoc.querySelectorAll('search');

        if (format === 'markdown') {
            var md = '# ' + (label ? label.textContent : 'Dashboard') + '\n\n';
            md += desc ? desc.textContent + '\n\n' : '';
            md += '## Overview\n\n';
            md += '| Metric | Count |\n|--------|-------|\n';
            md += '| Panels | ' + panels.length + ' |\n';
            md += '| Searches | ' + searches.length + ' |\n';
            md += '| Input Tokens | ' + inputs.length + ' |\n\n';

            if (inputs.length > 0) {
                md += '## Inputs\n\n| Token | Type | Label |\n|-------|------|-------|\n';
                inputs.forEach(function(i) {
                    var lbl = i.querySelector('label');
                    md += '| `$' + i.getAttribute('token') + '$` | ' + (i.getAttribute('type') || 'text') + ' | ' + (lbl ? lbl.textContent : '-') + ' |\n';
                });
                md += '\n';
            }

            md += '## Panels\n\n';
            panels.forEach(function(p, idx) {
                var title = p.querySelector(':scope > title');
                var viz = ['chart', 'table', 'single', 'event', 'map', 'html'].find(function(v) { return p.querySelector(v); }) || 'unknown';
                md += '### ' + (idx + 1) + '. ' + (title ? title.textContent : 'Untitled Panel') + '\n\n';
                md += '- **Visualization**: ' + viz + '\n';
                var query = p.querySelector('query');
                if (query) md += '- **Query**: `' + query.textContent.trim().substring(0, 80) + '...`\n';
                md += '\n';
            });
            return md;
        } else if (format === 'html') {
            var html = '<!DOCTYPE html><html><head><title>' + (label ? label.textContent : 'Dashboard') + ' Documentation</title><style>body{font-family:sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}code{background:#f0f0f0;padding:2px 6px;border-radius:3px}</style></head><body>';
            html += '<h1>' + (label ? label.textContent : 'Dashboard') + '</h1>';
            html += desc ? '<p>' + desc.textContent + '</p>' : '';
            html += '<h2>Overview</h2><table><tr><th>Metric</th><th>Count</th></tr><tr><td>Panels</td><td>' + panels.length + '</td></tr><tr><td>Searches</td><td>' + searches.length + '</td></tr><tr><td>Tokens</td><td>' + inputs.length + '</td></tr></table>';
            if (inputs.length > 0) {
                html += '<h2>Inputs</h2><table><tr><th>Token</th><th>Type</th><th>Label</th></tr>';
                inputs.forEach(function(i) {
                    var lbl = i.querySelector('label');
                    html += '<tr><td><code>$' + i.getAttribute('token') + '$</code></td><td>' + (i.getAttribute('type') || 'text') + '</td><td>' + (lbl ? lbl.textContent : '-') + '</td></tr>';
                });
                html += '</table>';
            }
            html += '<h2>Panels</h2>';
            panels.forEach(function(p, idx) {
                var title = p.querySelector(':scope > title');
                html += '<h3>' + (idx + 1) + '. ' + (title ? title.textContent : 'Untitled') + '</h3>';
            });
            html += '</body></html>';
            return html;
        } else { // confluence
            var wiki = 'h1. ' + (label ? label.textContent : 'Dashboard') + '\n\n';
            wiki += desc ? desc.textContent + '\n\n' : '';
            wiki += 'h2. Overview\n\n|| Metric || Count ||\n| Panels | ' + panels.length + ' |\n| Searches | ' + searches.length + ' |\n| Tokens | ' + inputs.length + ' |\n\n';
            if (inputs.length > 0) {
                wiki += 'h2. Inputs\n\n|| Token || Type || Label ||\n';
                inputs.forEach(function(i) {
                    var lbl = i.querySelector('label');
                    wiki += '| {{$' + i.getAttribute('token') + '$}} | ' + (i.getAttribute('type') || 'text') + ' | ' + (lbl ? lbl.textContent : '-') + ' |\n';
                });
            }
            wiki += '\nh2. Panels\n\n';
            panels.forEach(function(p, idx) {
                var title = p.querySelector(':scope > title');
                wiki += 'h3. ' + (idx + 1) + '. ' + (title ? title.textContent : 'Untitled') + '\n\n';
            });
            return wiki;
        }
    }

    // ========================================
    // ACCESSIBILITY CHECKER
    // ========================================
    document.getElementById('checkA11yBtn').addEventListener('click', function() {
        var xmlText = xmlInput.value.trim();
        if (!xmlText) { showToast('Enter XML in Validate tab first', 'error'); return; }
        var xmlDoc = parseXMLSafe(xmlText);
        if (!xmlDoc) { showToast('Invalid XML', 'error'); return; }
        var a11y = checkAccessibility(xmlDoc, xmlText);
        showA11yResults(a11y);
    });

    function checkAccessibility(xmlDoc, xmlText) {
        var result = { score: 100, issues: [], passed: [], wcag: [] };

        // Check for labels on inputs
        var inputs = xmlDoc.querySelectorAll('input');
        inputs.forEach(function(input, i) {
            var label = input.querySelector('label');
            if (!label || !label.textContent.trim()) {
                result.issues.push({ level: 'A', criterion: '1.3.1', message: 'Input ' + (i+1) + ' missing label', impact: 'Screen readers cannot identify the input' });
                result.score -= 10;
            } else {
                result.passed.push('Input ' + (i+1) + ' has label');
            }
        });

        // Check for panel titles
        var panels = xmlDoc.querySelectorAll('panel');
        var panelsWithoutTitle = 0;
        panels.forEach(function(p) {
            if (!p.querySelector(':scope > title')) panelsWithoutTitle++;
        });
        if (panelsWithoutTitle > 0) {
            result.issues.push({ level: 'A', criterion: '2.4.6', message: panelsWithoutTitle + ' panels missing titles', impact: 'Users cannot understand panel purpose' });
            result.score -= panelsWithoutTitle * 5;
        } else if (panels.length > 0) {
            result.passed.push('All panels have titles');
        }

        // Check dashboard label
        var dashLabel = xmlDoc.querySelector(':scope > label');
        if (!dashLabel || !dashLabel.textContent.trim()) {
            result.issues.push({ level: 'A', criterion: '2.4.2', message: 'Dashboard missing title/label', impact: 'Page title not descriptive' });
            result.score -= 15;
        } else {
            result.passed.push('Dashboard has a title');
        }

        // Check for description
        var desc = xmlDoc.querySelector(':scope > description');
        if (!desc) {
            result.issues.push({ level: 'AA', criterion: '2.4.6', message: 'Dashboard missing description', impact: 'Users lack context about dashboard purpose' });
            result.score -= 5;
        } else {
            result.passed.push('Dashboard has description');
        }

        // Check color contrast in options (rangeColors)
        var rangeColors = xmlText.match(/rangeColors.*?\[([^\]]+)\]/g);
        if (rangeColors) {
            result.issues.push({ level: 'AA', criterion: '1.4.3', message: 'Custom colors detected - verify contrast ratio', impact: 'May fail 4.5:1 contrast requirement', type: 'warning' });
        }

        // Check for table drilldowns (keyboard accessibility)
        var tables = xmlDoc.querySelectorAll('table');
        var tablesWithDrilldown = 0;
        tables.forEach(function(t) {
            if (t.querySelector('drilldown')) tablesWithDrilldown++;
        });
        if (tablesWithDrilldown > 0) {
            result.passed.push(tablesWithDrilldown + ' tables have drilldown (keyboard accessible)');
        }

        // Check for time inputs
        var timeInputs = xmlDoc.querySelectorAll('input[type="time"]');
        if (timeInputs.length === 0 && xmlDoc.querySelectorAll('search').length > 0) {
            result.issues.push({ level: 'A', criterion: '3.2.2', message: 'No time picker - users cannot control time range', impact: 'Reduced user control', type: 'warning' });
        }

        result.score = Math.max(0, result.score);
        return result;
    }

    function showA11yResults(a11y) {
        var scoreColor = a11y.score >= 80 ? '#3fb950' : a11y.score >= 50 ? '#d29922' : '#f85149';
        var html = '<div class="sl-a11y-score" style="border-color:' + scoreColor + '"><div class="sl-a11y-score-value" style="color:' + scoreColor + '">' + a11y.score + '%</div><div class="sl-a11y-score-label">Accessibility Score</div></div>';

        if (a11y.issues.length > 0) {
            html += '<h4 class="sl-section-title">Issues Found</h4><div class="sl-a11y-issues">';
            a11y.issues.forEach(function(i) {
                var levelClass = i.level === 'A' ? 'sl-wcag-a' : i.level === 'AA' ? 'sl-wcag-aa' : 'sl-wcag-aaa';
                html += '<div class="sl-a11y-issue ' + (i.type === 'warning' ? 'sl-a11y-warning' : 'sl-a11y-error') + '"><span class="sl-wcag-level ' + levelClass + '">WCAG ' + i.level + '</span><span class="sl-wcag-criterion">' + i.criterion + '</span><div class="sl-a11y-message">' + i.message + '</div><div class="sl-a11y-impact">' + i.impact + '</div></div>';
            });
            html += '</div>';
        }

        if (a11y.passed.length > 0) {
            html += '<h4 class="sl-section-title">Passed Checks</h4><ul class="sl-a11y-passed">';
            a11y.passed.forEach(function(p) { html += '<li>✓ ' + p + '</li>'; });
            html += '</ul>';
        }

        html += '<div class="sl-a11y-resources"><h4 class="sl-section-title">Resources</h4><ul><li><a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank">WCAG 2.1 Quick Reference</a></li><li><a href="https://docs.splunk.com/Documentation/Splunk/latest/Viz/accessibility" target="_blank">Splunk Accessibility Guide</a></li></ul></div>';

        document.getElementById('a11yResults').innerHTML = html;
    }

    // Initialize
    updateLineNumbers();
});
