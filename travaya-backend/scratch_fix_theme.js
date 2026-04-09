const fs = require('fs');
const path = require('path');

const dirPath = path.join('e:', 'Travaya overall', 'Travaya');

const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html') && f !== 'admin.html');

for (const file of files) {
  const filepath = path.join(dirPath, file);
  let html = fs.readFileSync(filepath, 'utf8');

  // Skip if we already put it inside a <li> to avoid running twice
  if (html.includes('<li><button class="theme-toggle"')) {
    continue;
  }

  // 1. Completely remove the floating toggle block
  // Pattern matches:
  // <!-- Theme Toggle Button -->
  // <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
  //     <i class="fas fa-moon"></i>
  // </button>
  const togglePattern = /<!--\s*Theme Toggle Button\s*-->\s*<button[^>]*class="theme-toggle"[^>]*>[\s\S]*?<\/button>/gi;
  html = html.replace(togglePattern, '');

  // 2. Insert it before <li class="auth-buttons">
  const injectionText = `
            <li style="display:flex; align-items:center;">
                <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
                    <i class="fas fa-moon"></i>
                </button>
            </li>`;
  
  if (html.includes('<li class="auth-buttons">')) {
    html = html.replace('<li class="auth-buttons">', injectionText + '\n            <li class="auth-buttons">');
  }

  fs.writeFileSync(filepath, html);
  console.log('Fixed', file);
}
