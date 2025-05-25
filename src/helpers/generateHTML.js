import { COLORS } from "../constants";
import { Platform } from "react-native";

const generateHTML = (markdownContent) => {
  const escapedData = JSON.stringify(markdownContent)
    .replace(/</g, '\\u003c')
    .replace(/\//g, '\\/');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/13.0.1/markdown-it.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markdown-it-texmath@1.0.0/texmath.min.js"></script>

    <style>
      html, body {
        overscroll-behavior-y: contain;
        -webkit-overflow-scrolling: touch;
        height: 100%;
        margin: 0;
        padding: 0;
      }
      body {
        padding: 0;
        margin: 0;
        font-family: -apple-system, sans-serif;
        line-height: 1.4;
        font-size: 17px;
        line-height: 25px;
        color: ${COLORS.text};
        font-weight: 400;
        user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        touch-action: pan-y;
        -ms-touch-action: pan-y;
        overflow-y: auto;
        overflow-x: hidden;
      }
      pre {
        background-color: ${COLORS.disabledBackground};
        padding: 8px;
        border-radius: 8px;
        overflow-x: auto;
        font-family: ${Platform.OS === 'ios' ? 'Menlo' : 'monospace'};
        font-size: 14px;
        color: ${COLORS.text};
      }
      code {
        background-color: ${COLORS.disabledBackground};
        padding: 1px 4px;
        border-radius: 3px;
        font-family: ${Platform.OS === 'ios' ? 'Menlo' : 'monospace'};
        font-size: 14px;
        color: ${COLORS.text};
      }
      h1 {
        font-size: 22px;
        font-weight: bold;
        color: ${COLORS.primary};
        margin: 10px 0 5px;
      }
      h2 {
        font-size: 20px;
        font-weight: bold;
        color: ${COLORS.primary};
        margin: 8px 0 5px;
      }
      img {
        max-width: 100%;
        height: auto;
      }
      /* KaTeX equation styling */
      .katex { font-size: 1em !important; }
      .katex-display {
        margin: 1em 0;
        overflow-x: auto;
        white-space: nowrap;
        display: block;
      }

      /* List styling for nested lists */
      ul, ol {
        margin: 12px 0;
        padding-left: 20px;
      }
      li {
        margin: 6px 0;
      }
      ul ul, ul ol, ol ul, ol ol {
        margin-top: 4px;
        margin-bottom: 4px;
        padding-left: 20px;
      }
      /* Optional custom bullet colors */
      ul li::marker {
        color: ${COLORS.primary};
      }
      ol li {
        color: ${COLORS.text};
      }

      /* Table styling */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0;
        display: block;
        overflow-x: auto;
      }
      thead {
        background-color: ${COLORS.disabledBackground};
      }
      th, td {
        border: 1px solid ${COLORS.border || '#ccc'};
        padding: 8px;
        text-align: left;
        font-size: 15px;
        color: ${COLORS.text};
      }
      th {
        background-color: ${COLORS.primary};
        color: ${COLORS.onPrimary || '#fff'};
        font-weight: bold;
      }
      td {
        background-color: ${COLORS.surface || '#fff'};
      }
      @media (max-width: 768px) {
        table { font-size: 14px; }
        th, td { padding: 6px; }
      }
    </style>
  </head>
  <body>
    <div id="content"></div>
    <div style="pointer-events:none;position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999"></div>
    <script>
      (function() {
        document.addEventListener('DOMContentLoaded', function() {
          const data = ${escapedData};

          const md = window.markdownit({
            html: true,
            linkify: true,
            typographer: true,
            breaks: true 
          });

          const tm = window.texmath.use(window.katex, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
              { left: "\\(", right: "\\)", display: false },
              { left: "\\[", right: "\\]", display: true }
            ]
          });

          md.use(tm);

          const contentDiv = document.getElementById('content');
          try {
            contentDiv.innerHTML = md.render(data);

            // Wrap tables for horizontal scrolling
            document.querySelectorAll('table').forEach((table) => {
              const wrapper = document.createElement('div');
              wrapper.style.overflowX = 'auto';
              wrapper.style.width = '100%';
              wrapper.appendChild(table.cloneNode(true));
              table.replaceWith(wrapper);
            });

            // Wrap display math for horizontal scrolling
            document.querySelectorAll('.katex-display').forEach((eq) => {
              const wrapper = document.createElement('div');
              wrapper.style.overflowX = 'auto';
              wrapper.style.width = '100%';
              wrapper.appendChild(eq.cloneNode(true));
              eq.replaceWith(wrapper);
            });
          } catch (error) {
            contentDiv.innerHTML = '<p>Error rendering content</p>';
            console.error('Markdown rendering error:', error);
          }

          document.querySelectorAll('img').forEach(img => {
            img.onerror = () => { img.style.display = 'none'; };
          });
        });
      })();
    </script>
  </body>
  </html>
    `;
};

export default generateHTML;
