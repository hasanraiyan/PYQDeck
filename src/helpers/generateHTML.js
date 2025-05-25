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
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/13.0.1/markdown-it.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/markdown-it-texmath@1.0.0/texmath.min.js"></script>

    <script src="../../assets/libs/markdown-it/texmath.min.js"></script>
    <style>
      body {
        padding: 0px;
        margin: 0px;
        font-family: -apple-system, sans-serif;
        line-height: 1.4;
        font-size: 17px;
        line-height: 25px;
        color: ${COLORS.text};
        font-weight: 400;
      }
      pre {
        background-color: ${COLORS.disabledBackground};
        padding: 8px;
        border-radius: 8px;
        overflow-x: auto;
        font-family: ${Platform.OS === 'ios' ? 'Menlo' : 'monospace'};
        background-color: ${COLORS.disabledBackground};
        border-radius: 8px;
        padding: 8px;
        font-size: 14px;
        color: ${COLORS.text};
      }
      code {
        background-color: ${COLORS.disabledBackground};
        padding-horizontal: 4px;
        padding-vertical: 1px;
        border-radius: 3px;
        font-family: ${Platform.OS === 'ios' ? 'Menlo' : 'monospace'};
        font-size: 14px;
        color: ${COLORS.text};
      }
      h1 {
        font-size: 22px;
        font-weight: bold;
        color: ${COLORS.primary};
        margin-bottom: 5px;
        margin-top: 10px;
      }
      h2 {
        font-size: 20px;
        font-weight: bold;
        color: ${COLORS.primary};
        margin-bottom: 5px;
        margin-top: 8px;
      }
      img {
        max-width: 100%;
        height: auto;
      }
      .katex { font-size: 1em !important; }
      .katex-display { margin: 1em 0; }
    </style>
  </head>
  <body>
    <div id="content"></div>
  
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
              { left: "\\\(", right: "\\\)", display: false },
              { left: "\\\\[", right: "\\\\]", display: true }
            ]
          });
  
          md.use(tm);
  
          const contentDiv = document.getElementById('content');
          try {
            contentDiv.innerHTML = md.render(data);
          } catch (error) {
            contentDiv.innerHTML = '<p>Error rendering content</p>';
            console.error('Markdown rendering error:', error);
          }
  
          document.querySelectorAll('img').forEach(img => {
            img.onerror = () => {
              img.style.display = 'none';
            };
          });
        });
      })();
    </script>
  </body>
  </html>
    `;
};

export default generateHTML;