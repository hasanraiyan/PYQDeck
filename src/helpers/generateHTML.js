// src/helpers/generateHTML.js
import { COLORS } from "../constants";
import { Platform } from "react-native";

const generateHTML = (markdownContent) => {
  const escapedData = JSON.stringify(markdownContent)
    .replace(/</g, '\\u003c')
    .replace(/\//g, '\\/');

  const bodyBackgroundColor = COLORS.surfaceAlt2 || '#F9F9F9';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
    
    <!-- KaTeX -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.js"></script>

    <!-- Markdown-it & TexMath -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/13.0.1/markdown-it.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markdown-it-texmath@1.0.0/texmath.min.js"></script>

    <!-- Highlight.js -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css"> 
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>

    <style>
      html, body {
        overscroll-behavior-y: contain;
        -webkit-overflow-scrolling: touch;
        height: 100%;
        margin: 0;
        padding: 0;
      }
      body {
        padding: ${Platform.OS === 'ios' ? '10px 12px' : '8px 10px'}; /* Add some padding to body */
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6; /* Increased line height for readability */
        font-size: 16px; /* Slightly smaller for potentially dense content */
        color: ${COLORS.text || '#212121'};
        font-weight: 400;
        user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        touch-action: pan-y;
        -ms-touch-action: pan-y;
        overflow-y: auto;
        overflow-x: hidden;
        background-color: ${bodyBackgroundColor};
      }
      pre {
        /* This will be the background of the <pre> container */
        /* The Highlight.js theme will style the <code> inside it */
        background-color: ${COLORS.disabledBackground || '#f0f0f0'}; 
        padding: 12px; 
        border-radius: 8px;
        overflow-x: auto;
        font-family: ${Platform.OS === 'ios' ? 'Menlo, Monaco' : 'monospace'};
        font-size: 14px;
        /* Text color for pre if not overridden by hljs */
        color: ${COLORS.text || '#212121'}; 
        border: 1px solid ${COLORS.borderLight || '#e0e0e0'}; 
      }
      /* If using github.min.css, the pre code background is usually #f6f8fa. */
      /* You might want to make your 'pre' background match or complement it. */
      /* For example, if COLORS.disabledBackground is #f0f0f0, it will be slightly different */
      /* from github.min.css's #f6f8fa. This is usually fine. */

      code:not(pre code) { /* Inline code */
        background-color: ${COLORS.disabledBackground || '#f0f0f0'};
        padding: 2px 5px; 
        border-radius: 4px; 
        font-family: ${Platform.OS === 'ios' ? 'Menlo, Monaco' : 'monospace'};
        font-size: 0.9em; 
        color: ${COLORS.primary || '#4338ca'}; 
      }
      h1, h2, h3, h4, h5, h6 {
        color: ${COLORS.primary || '#4338ca'};
        margin-top: 1.2em;
        margin-bottom: 0.6em;
        line-height: 1.3;
      }
      h1 { font-size: 1.8em; font-weight: 600; }
      h2 { font-size: 1.5em; font-weight: 600; }
      h3 { font-size: 1.3em; font-weight: 600; }
      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px; 
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        border: 1px solid ${COLORS.border || '#e5e7eb'}; 
      }
      .katex { font-size: 1.05em !important; } 
      .katex-display {
        margin: 1em 0;
        padding: 0.5em 0; 
        overflow-x: auto;
        white-space: nowrap; 
        display: block;
        -webkit-overflow-scrolling: touch; 
      }
      ul, ol {
        margin: 1em 0;
        padding-left: 25px; 
      }
      li {
        margin-bottom: 0.5em; 
      }
      ul ul, ul ol, ol ul, ol ol {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        padding-left: 20px;
      }
      ul li::marker {
        color: ${COLORS.primary || '#4338ca'};
      }
      .table-wrapper {
        overflow-x: auto;
        width: 100%;
        border-radius: 8px;
        border: 1px solid ${COLORS.border || '#e5e7eb'};
        margin: 1.5em 0;
      }
      table {
        width: 100%;
        border-collapse: collapse; 
      }
      thead {
        background-color: ${COLORS.disabledBackground || '#f3f4f6'};
      }
      th, td {
        border: 1px solid ${COLORS.borderLight || '#e0e0e0'};
        padding: 10px 12px; 
        text-align: left;
        font-size: 15px;
        color: ${COLORS.text || '#1f2937'};
        background-color: transparent; 
      }
      th {
        font-weight: 600; 
        color: ${COLORS.textSecondary || '#6b7280'};
      }
      th:first-child, th:last-child, tr:last-child td:first-child, tr:last-child td:last-child {
        border-radius: 0;
      }
      @media (max-width: 768px) {
        body { font-size: 15px; padding: 8px 10px; }
        table { font-size: 14px; }
        th, td { padding: 8px 10px; }
        h1 { font-size: 1.6em; }
        h2 { font-size: 1.4em; }
        h3 { font-size: 1.2em; }
      }
      .katex-display::-webkit-scrollbar {
        height: 6px;
      }
      .katex-display::-webkit-scrollbar-track {
        background: rgba(0,0,0,0.05);
        border-radius: 3px;
      }
      .katex-display::-webkit-scrollbar-thumb {
        background: rgba(0,0,0,0.2);
        border-radius: 3px;
      }
    </style>
  </head>
  <body>
    <div id="content"></div>
    <div style="pointer-events:none;position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999"></div>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const data = ${escapedData};

        const md = window.markdownit({
          html: true,
          linkify: false, // Disable automatic linking of URLs
          typographer: true,
          breaks: true,
          highlight: (str, lang) => {
            if (lang && hljs.getLanguage(lang)) {
              try {
                // The 'hljs' class is often added by highlight.js itself to the <code>
                // or <pre> tag. The theme CSS targets these classes.
                return '<pre><code class="language-' + lang + '">' 
                  + hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
                  + '</code></pre>';
              } catch (_) {}
            }
            // Ensure this fallback also has a class that hljs might recognize, or style it consistently
            return '<pre><code>' + md.utils.escapeHtml(str) + '</code></pre>';
          }
        });

        const tm = window.texmath.use(window.katex, {
          delimiters: 'dollars', 
          macros: {"\\\\": "\\\\"} 
        });

        md.use(tm);

        const contentDiv = document.getElementById('content');
        try {
          contentDiv.innerHTML = md.render(data || "No content provided."); 

          document.querySelectorAll('table').forEach((table) => {
            if (!table.parentNode.classList.contains('table-wrapper')) { 
                const wrapper = document.createElement('div');
                wrapper.className = 'table-wrapper';
                table.parentNode.insertBefore(wrapper, table); 
                wrapper.appendChild(table); 
            }
          });

      
          if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach(block => {
              // If the block doesn't already have 'hljs' from a theme or manual add,
              // add it. Many themes key off 'hljs' on the <code> element.
              if (!block.classList.contains('hljs')) {
              }
            
            });
          }


        } catch (error) {
          contentDiv.innerHTML = '<p style="color: red; padding: 10px;">Error rendering content. Please try again or report this issue.</p>';
          console.error('Markdown rendering error:', error, 'Input data:', data);
        }

        document.querySelectorAll('img').forEach(img => {
          const originalSrc = img.src;
          img.onerror = () => { 
            img.style.display = 'none'; 
            const altText = img.alt || 'Image failed to load';
            const errorMsg = document.createElement('p');
            errorMsg.textContent = \`[\${altText}: \${originalSrc}]\`;
            errorMsg.style.color = 'gray';
            errorMsg.style.fontSize = '0.9em';
            errorMsg.style.fontStyle = 'italic';
            errorMsg.style.padding = '5px';
            errorMsg.style.border = '1px dashed #ccc';
            errorMsg.style.borderRadius = '4px';
            img.parentNode.insertBefore(errorMsg, img.nextSibling);
          };
        });
      });
    </script>
  </body>
  </html>
  `;
};

export default generateHTML;