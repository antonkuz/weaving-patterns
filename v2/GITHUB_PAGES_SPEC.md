# GitHub Pages Deployment Spec

## Overview

This document outlines the plan for hosting the weaving patterns application on GitHub Pages, with a primary focus on making the auto gallery the landing page (`index.html`).

## How GitHub Pages Works

GitHub Pages is a static site hosting service that serves files directly from a GitHub repository. It supports:

1. **Repository-based hosting**: Serves files from a specific branch (typically `main` or `gh-pages`)
2. **Static files only**: HTML, CSS, JavaScript, images, etc. (no server-side processing)
3. **Automatic HTTPS**: All sites are served over HTTPS
4. **Custom domains**: Optional custom domain support
5. **Two deployment modes**:
   - **Root directory**: Serves from repository root (`/`)
   - **Docs folder**: Serves from `/docs` folder

## Current Project Structure

```
weaving-patterns/
├── v1/
│   └── gallery/
├── v2/
│   ├── index.html          (designer page, will become designer.html)
│   ├── autogallery.html    (target: public auto gallery, will become index.html)
│   ├── components/         (JS/CSS components)
│   ├── data/               (options.js, gallery-patterns.js)
│   └── utils/
└── README.md
```

## Path Analysis

### Current Path Structure

All paths in `autogallery.html` (which will become `index.html`) are **relative paths**:
- `components/applied-pattern-preview.css`
- `components/gallery.css`
- `data/options.js`
- `components/AppliedPatternPreview.js`
- `components/AutoGallery.js`
- `autogallery.js`

✅ **Good**: Relative paths will work correctly regardless of base URL.

### Component Dependencies

All components use relative paths internally:
- `AppliedPatternPreview.js` - no external dependencies
- `AutoGallery.js` - depends on `AppliedPatternPreview.js` (loaded via script tag)
- `autogallery.js` - depends on `OPTIONS` global from `data/options.js`

✅ **Good**: No absolute paths or CDN dependencies that could break.

## Deployment Options

### Option A: Serve from Repository Root (Recommended)

**Structure:**
```
weaving-patterns/
├── index.html              (redirect or landing page)
├── autogallery.html        (public auto gallery)
├── components/
├── data/
└── ...
```

**Pros:**
- Clean URLs: `username.github.io/weaving-patterns/` (auto gallery as landing page)
- Easy to add other pages at root level
- Standard GitHub Pages setup

**Cons:**
- Requires moving `v2/` contents to root (or symlink/copy)
- May conflict with existing root files

**Configuration:**
- GitHub Settings → Pages → Source: `main` branch, `/ (root)`

### Option B: Serve from `/docs` Folder

**Structure:**
```
weaving-patterns/
├── docs/
│   ├── index.html
│   ├── components/
│   ├── data/
│   └── ...
└── ...
```

**Pros:**
- Keeps project structure intact
- No need to move files
- Can keep `v2/` structure separate

**Cons:**
- URLs include `/docs`: `username.github.io/weaving-patterns/docs/`
- Less clean URLs

**Configuration:**
- GitHub Settings → Pages → Source: `main` branch, `/docs`

### Option C: Serve from `/v2` Subdirectory

**Structure:**
```
weaving-patterns/
├── v2/
│   ├── index.html
│   ├── components/
│   └── ...
└── ...
```

**Pros:**
- No file movement needed
- Maintains version structure

**Cons:**
- GitHub Pages doesn't natively support subdirectory serving
- Would require custom 404.html redirect or build step
- URLs: `username.github.io/weaving-patterns/v2/` (if configured)

**Configuration:**
- Requires custom setup (see "Alternative Approaches" below)

## Recommended Approach: Option A (Root)

For the cleanest public-facing URLs and simplest setup:

1. **Create deployment branch or use main**:
   - Option 1: Use `main` branch directly (simplest)
   - Option 2: Create `gh-pages` branch for deployment (keeps main clean)

2. **File organization**:
   - Copy `v2/` contents to root (or create symlinks)
   - Keep `v1/` in subdirectory (not served)
   - Update any internal references if needed

3. **GitHub Pages configuration**:
   - Repository Settings → Pages
   - Source: `main` branch (or `gh-pages`)
   - Folder: `/ (root)`
   - Save

4. **URL result**:
   - `https://username.github.io/weaving-patterns/` (index.html - auto gallery)

## Alternative Approaches

### Using 404.html Redirect (for subdirectory serving)

If we want to keep `v2/` structure, we can create a `404.html` that redirects:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Weaving Patterns</title>
  <script>
    // Redirect to v2/index.html
    window.location.replace('/weaving-patterns/v2/');
  </script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>
```

**Note**: This only works if GitHub Pages serves 404.html from root, and the redirect path must be absolute.

### Using GitHub Actions for Deployment

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Copy v2 to root
        run: |
          cp -r v2/* .
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

This would copy `v2/` contents to root on each push, then deploy.

## Decisions Made

### 1. Deployment Option ✅

**Decision**: **Option A (Root)** - Serve from repository root

**Rationale**: Cleanest URLs (`username.github.io/weaving-patterns/autogallery.html`) and simplest setup.

### 2. Pages to Deploy ✅

**Decision**: **Just autogallery.html** for MVP

**Rationale**: Focus on making the auto gallery public first. Can add other pages later if needed.

### 3. Branch Strategy ✅

**Decision**: **main branch** for deployment

**Rationale**: Simplest approach. Can migrate to `gh-pages` branch later if needed for cleaner separation.

### 4. Custom Domain ✅

**Decision**: **Start with GitHub Pages URL**

**Rationale**: Use default `username.github.io/weaving-patterns/autogallery.html` initially. Can add custom domain later if desired.

### 5. Landing Page ✅

**Decision**: **Direct link** (no landing page initially)

**Rationale**: Share `autogallery.html` URL directly. Can add landing page later if we want to showcase multiple pages.

### 6. Update Workflow ✅

**Decision**: **Manual copy for MVP**

**Rationale**: Keep it simple initially. Can automate later with GitHub Actions if needed.

### 7. CORS and Security ✅

**Decision**: **No changes needed**

**Rationale**: All files are static with relative paths. No external resources or CORS issues.

### 8. Performance ✅

**Decision**: **Start as-is**

**Rationale**: Current performance is acceptable. Can optimize later if needed based on real-world usage.

### 9. Mobile Responsiveness ✅

**Status**: ✅ **Already implemented**

**Features**:
- ASCII art title scales on mobile
- Minimum 2 columns on mobile
- Masonry layout adapts to screen size

### 10. Analytics ✅

**Decision**: **Not required for MVP**

**Rationale**: Can add Google Analytics or similar later if desired.

## Proposed Repository Structure

### Current State

```
weaving-patterns/
├── v1/                          (legacy code, to be archived)
│   └── gallery/
│       ├── index.html
│       ├── patterns.js
│       └── sketch.js
├── v2/                          (current active code)
│   ├── index.html               (designer page)
│   ├── autogallery.html         (target: public deployment, will become index.html)
│   ├── components/
│   ├── data/
│   └── ...
└── README.md
```

### Target State (After Restructure)

```
weaving-patterns/
├── archive/                     (v1 code preserved)
│   └── v1/
│       └── gallery/
├── components/                  (moved from v2/)
│   ├── AppliedPatternPreview.js
│   ├── AutoGallery.js
│   └── ...
├── data/                        (moved from v2/)
│   ├── options.js
│   └── gallery-patterns.js
├── index.html                  (renamed from autogallery.html, public landing page)
├── designer.html               (renamed from index.html, designer page)
├── app.js                      (moved from v2/)
├── autogallery.js              (moved from v2/, used by index.html)
├── README.md
└── docs/                       (documentation)
    ├── ARCHITECTURE.md
    ├── ANIMATION_SPEC.md
    ├── GALLERY_SPEC.md
    ├── AUTOGALLERY_SPEC.md
    └── GITHUB_PAGES_SPEC.md
```

### Migration Plan

#### Step 1: Archive v1 Code
1. Create `archive/` directory
2. Move `v1/` → `archive/v1/`
3. Commit changes

#### Step 2: Create Archive Branch
1. Create branch `archive-v1` from current `main`
2. Push branch: `git push origin archive-v1`
3. This preserves v1 code in git history

#### Step 3: Restructure Main Branch
1. **Move v2 contents to root**:
   ```bash
   # Move components
   mv v2/components/* .
   rmdir v2/components
   
   # Move data
   mv v2/data/* .
   rmdir v2/data
   
   # Move JS files
   mv v2/*.js .
   
   # Rename HTML files: autogallery.html becomes index.html, index.html becomes designer.html
   mv v2/autogallery.html index.html
   mv v2/index.html designer.html
   
   # Move documentation
   mkdir docs
   mv v2/*.md docs/
   
   # Remove empty v2 directory
   rmdir v2
   ```

2. **Update paths** (if needed):
   - Check all HTML files for path references
   - All paths are already relative, so should work as-is
   - `index.html` (formerly autogallery.html) should work as-is since it uses relative paths

3. **Commit restructure**:
   ```bash
   git add .
   git commit -m "Restructure: Move v2 contents to root, make autogallery the landing page"
   ```

#### Step 4: Configure GitHub Pages
1. Go to repository Settings → Pages
2. Source: `main` branch
3. Folder: `/ (root)`
4. Save

#### Step 5: Verify Deployment
1. Visit `https://username.github.io/weaving-patterns/` (index.html - auto gallery)
2. Test all functionality:
   - Pattern generation
   - Endless scroll
   - Keyboard shortcuts (A, B)
   - Mobile responsiveness
3. Verify designer page: `https://username.github.io/weaving-patterns/designer.html`

### Benefits of This Structure

1. **Clean root**: All public-facing files at root level
2. **Simple URLs**: 
   - Landing page: `username.github.io/weaving-patterns/` (auto gallery)
   - Designer: `username.github.io/weaving-patterns/designer.html`
3. **Preserved history**: v1 code archived but accessible
4. **Organized docs**: Documentation in dedicated `docs/` folder
5. **No build step**: Direct deployment from source
6. **Easy updates**: Edit files directly, push to main, auto-deploy
7. **Auto gallery as default**: Visitors see the auto-generated gallery immediately

### File Organization Rationale

- **Root level**: Public HTML/JS files (what GitHub Pages serves)
- **components/**: Reusable JavaScript components
- **data/**: Data files (options.js, gallery-patterns.js)
- **docs/**: Documentation and specs
- **archive/**: Legacy code preserved for reference

## Implementation Checklist

### Phase 1: Archive v1 Code

- [ ] Create `archive/` directory
- [ ] Move `v1/` → `archive/v1/`
- [ ] Commit: `git add archive/ && git commit -m "Archive v1 code"`
- [ ] Create archive branch: `git checkout -b archive-v1`
- [ ] Push archive branch: `git push origin archive-v1`
- [ ] Return to main: `git checkout main`

### Phase 2: Restructure Repository

- [ ] Move `v2/components/` → `components/`
- [ ] Move `v2/data/` → `data/`
- [ ] Move `v2/*.js` → root
- [ ] Rename `v2/autogallery.html` → `index.html` (becomes landing page)
- [ ] Rename `v2/index.html` → `designer.html` (designer page)
- [ ] Create `docs/` directory
- [ ] Move `v2/*.md` → `docs/` (except root README.md)
- [ ] Remove empty `v2/` directory
- [ ] Verify all relative paths still work (they should, as paths are already relative)
- [ ] Test locally:
  - [ ] `index.html` (auto gallery) loads correctly
  - [ ] `designer.html` loads correctly
  - [ ] All CSS/JS files load
  - [ ] Options.js loads and patterns generate
  - [ ] Endless scroll works
  - [ ] Keyboard shortcuts work (A, B)
- [ ] Commit restructure: `git add . && git commit -m "Restructure: Move v2 contents to root, make autogallery the landing page"`

### Phase 3: Configure GitHub Pages

- [ ] Go to repository Settings → Pages
- [ ] Source: `main` branch
- [ ] Folder: `/ (root)`
- [ ] Save configuration
- [ ] Wait for deployment (usually takes 1-2 minutes)

### Phase 4: Verify Deployment

- [ ] Visit `https://username.github.io/weaving-patterns/` (index.html - auto gallery)
- [ ] Test all functionality:
  - [ ] `index.html` (auto gallery) loads correctly
  - [ ] All CSS/JS files load
  - [ ] Options.js loads and patterns generate
  - [ ] Endless scroll works
  - [ ] Keyboard shortcuts work (A, B)
  - [ ] Mobile responsiveness works (test on actual device or browser dev tools)
- [ ] Verify designer page: `https://username.github.io/weaving-patterns/designer.html`
- [ ] Check browser console for any errors
- [ ] Verify HTTPS is working

### Phase 5: Share Publicly

- [ ] Share URL: `https://username.github.io/weaving-patterns/` (auto gallery landing page)
- [ ] Update README.md with deployment info (optional)

### Phase 6: Future Enhancements (Optional)

- [ ] Add landing page (`index.html` at root with navigation)
- [ ] Set up custom domain (if desired)
- [ ] Add analytics (if desired)
- [ ] Optimize performance (if needed)
- [ ] Add more patterns to options.js

## Testing Plan

### Local Testing (Before Restructure)

1. **Test from v2/ directory**:
   ```bash
   cd v2
   python3 -m http.server 8000
   # Visit http://localhost:8000/autogallery.html
   ```

### Local Testing (After Restructure)

1. **Test from root**:
   ```bash
   # After moving v2/ contents to root
   python3 -m http.server 8000
   # Visit http://localhost:8000/ (index.html - auto gallery)
   # Visit http://localhost:8000/designer.html (designer page)
   ```

2. **Verify all paths work**:
   - Check browser console for 404 errors
   - Verify all CSS files load
   - Verify all JS files load
   - Verify data files load

### GitHub Pages Testing

1. **Deploy to GitHub Pages** (after restructure)
2. **Test on multiple devices**:
   - Desktop browser
   - Mobile browser (iPhone, Android)
   - Tablet
3. **Test features**:
   - Initial load (12 tiles)
   - Endless scroll
   - Animation toggle (A key)
   - Black/white toggle (B key)
   - Responsive layout
   - Masonry arrangement

## Expected URLs

### After Deployment (Root Structure):
- Landing Page (Auto Gallery): `https://username.github.io/weaving-patterns/` (index.html)
- Designer Page: `https://username.github.io/weaving-patterns/designer.html`

## Next Steps

1. **Decision**: Choose deployment option based on open questions
2. **Setup**: Configure GitHub Pages according to chosen option
3. **Test**: Verify deployment works correctly
4. **Deploy**: Make public and share URL
5. **Monitor**: Check for any issues and iterate

## References

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Pages Custom 404](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site)
- [GitHub Actions for Pages](https://github.com/peaceiris/actions-gh-pages)

