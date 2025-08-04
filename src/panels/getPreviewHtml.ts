export function getPreviewHtml(previewUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="zh">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hexo Preview</title>
      <style>
        html, body, iframe {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          border: none;
        }
      </style>
    </head>
    <body>
      <iframe id="preview" src="${previewUrl}" frameborder="0"></iframe>
      <script>
        window.addEventListener('message', (event) => {
          if (event.data.type === 'refresh-preview') {
          const iframe = document.getElementById('preview');
          if (event.data.previewUrl) {
            iframe.src = event.data.previewUrl;
          } else if (event.data.host) {
            try {
            const url = new URL(iframe.src);
            url.host = event.data.host;
            iframe.src = url.toString();
            } catch (e) {
            // ignore invalid URL
            }
          }
          return;
          }
        });
      </script>
    </body>
    </html>
  `;
}
