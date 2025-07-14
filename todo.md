# vscode-hexo-github: Next Feature Roadmap

## 1. Tree View Enhancements
- Enable right-click context menus on posts/drafts tree items:
  - Rename post or page title
  - Move files across folders (e.g., from `_drafts/` to `_posts/`)

## 2. Image Management & Paste Upload
- Support pasting images from clipboard into Markdown editor
- Enable manual upload of local image files via UI
- Integrate third-party image hosting (CDN):
  - GitHub repository (default)
  - SM.MS, Imgur, Qiniu, etc.
- Allow users to configure preferred upload target in settings

## 3. Graphical Configuration Editor
- Provide GUI editor for Hexo `_config.yml`
  - Auto-generate form fields from YAML schema
  - Support validation and field descriptions
- Support both global config and theme-specific config (`_config.<theme>.yml`)

## 4. Custom Server Deployment
- Support deployment to self-hosted or custom servers
  - SCP, rsync, or Git-based workflows
- Provide server configuration UI
- Support SSH key setup and deploy logs display

## 5. Theme Customization Toolkit
- Allow custom overrides for CSS/layout/components
  - Auto-generate `source/_data/styles/custom.styl` or similar
- Support version-aware theme updates while retaining customizations

## 6. Theme Configuration Editor (Basic & Advanced)
- Provide GUI editor for theme configuration options:
  - Menus, logo, favicon, sidebar style, etc.
- Allow switching between Basic Mode and Advanced (raw YAML or JSON)
- Load field documentation from GitHub or official theme docs

## 7. Hexo Snippet System
- Provide writing-friendly snippets and autocompletion:
  - Front-matter templates (title, date, tags, categories)
  - Common shortcodes for images, code blocks, videos
- Show command hints for frequently used Hexo CLI commands

---

**Goal**: Seamlessly integrate Hexo, GitHub, and theme customization into an all-in-one VSCode GUI experience.
