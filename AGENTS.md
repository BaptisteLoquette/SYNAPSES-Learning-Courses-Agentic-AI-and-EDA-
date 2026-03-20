# AGENTS.md

## Cursor Cloud specific instructions

### Repository Overview

This is a greenfield repository for an interactive HTML/CSS/JS course on **Agentic AI and EDA (Event-Driven Architecture / Electronic Design Automation)**. As of initial setup, the repo contains only a `README.md`. The planned architecture (per PR #1) is a static site with:

- `index.html` — landing page
- `module1.html` through `module6.html` — course modules
- `css/style.css` — unified design system
- `js/main.js` — interactivity (quiz engine, progress tracking, animations)

### Development Environment

- **Tech stack**: Static HTML, CSS, JavaScript (no build tools or package managers required).
- **No dependencies to install**: There is no `package.json`, `requirements.txt`, or similar dependency file.
- **Serving locally**: Once HTML files exist, use any static file server (e.g., `python3 -m http.server 8000` or `npx serve .`) to preview the site.
- **No lint/test/build tooling** is configured yet. If added later, update this section accordingly.

### Running the Project

Since this is a static site with no build step, open `index.html` in a browser or serve the directory:

```sh
python3 -m http.server 8000
```

Then navigate to `http://localhost:8000`.
