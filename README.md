# Ascended Director's Board

Static timing tracker for Ascended Action Scenes.

## Open Locally

Open `index.html` in a browser from this folder:

```text
deploy/directors-board/index.html
```

The board image must remain at:

```text
assets/Ascended Director Board v1.png
```

## Deploy To GitHub Pages

1. Create or use a GitHub repository named `deploy-ascended-directors-board`.
2. Publish the contents of this folder at the repository root:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `.nojekyll`
   - `assets/Ascended Director Board v1.png`
3. Commit with:

```text
Deploy Ascended Director's Board v1
```

4. Push to the `main` branch.
5. In GitHub, open the repository settings for Pages.
6. Set GitHub Pages to:
   - Source: Deploy from branch
   - Branch: `main`
   - Folder: root
7. After publishing, the public URL should be:

```text
https://wallacedt.github.io/deploy-ascended-directors-board/
```

## Squarespace Embed

In Squarespace, use a Code Block for the iframe if an Embed Block does not accept it.

Paste the iframe snippet into the Code Block on a dedicated page such as `/directors-board`.

Paste the button snippet on Home, Action Scenes, Mechanics, or Shop as desired.

Test while logged out or in an incognito browser, because embedded content may not always display normally while logged into Squarespace.

### Iframe Snippet

```html
<section class="ascended-directors-board-gate">
  <div class="ascended-directors-board-divider"></div>

  <div class="ascended-directors-board-intro">
    <h2>Enter the Director's Board</h2>
    <p>Track the heartbeat of an Action Scene.</p>
    <p class="ascended-directors-board-note">Everything below this point is live.</p>
  </div>

  <div class="ascended-directors-board-frame-wrap">
    <iframe
      src="https://wallacedt.github.io/deploy-ascended-directors-board/"
      title="Ascended Director's Board"
      loading="lazy"
      class="ascended-directors-board-frame">
    </iframe>
  </div>
</section>

<style>
  .ascended-directors-board-gate {
    margin: 32px auto;
    max-width: 1700px;
  }

  .ascended-directors-board-divider {
    border-top: 1px solid rgba(185, 146, 74, 0.35);
    margin: 28px auto 24px;
    width: 92%;
  }

  .ascended-directors-board-intro {
    text-align: center;
    margin: 0 auto 18px;
    max-width: 820px;
    color: #ead8b8;
  }

  .ascended-directors-board-intro h2 {
    margin: 0 0 8px;
    color: #d7b46a;
    font-size: 1.8rem;
    letter-spacing: 0.04em;
  }

  .ascended-directors-board-intro p {
    margin: 6px 0;
    font-size: 1rem;
  }

  .ascended-directors-board-note {
    opacity: 0.75;
    font-style: italic;
  }

  .ascended-directors-board-frame-wrap {
    background:
      radial-gradient(circle at top, rgba(185, 146, 74, 0.13), transparent 42%),
      linear-gradient(180deg, rgba(20, 15, 10, 0.96), rgba(8, 6, 4, 0.98));
    border: 1px solid rgba(185, 146, 74, 0.35);
    border-radius: 18px;
    padding: 14px;
    box-shadow:
      0 18px 48px rgba(0, 0, 0, 0.45),
      inset 0 1px 0 rgba(255, 245, 221, 0.06);
    overflow: hidden;
  }

  .ascended-directors-board-frame {
    display: block;
    width: 100%;
    min-height: 1150px;
    border: 0;
    border-radius: 12px;
    background: #120d09;
  }

  @media (max-width: 900px) {
    .ascended-directors-board-frame-wrap {
      padding: 8px;
      border-radius: 12px;
    }

    .ascended-directors-board-frame {
      min-height: 1450px;
      border-radius: 8px;
    }
  }
</style>
```

### Button Snippet

```html
<a
  href="https://wallacedt.github.io/deploy-ascended-directors-board/"
  target="_blank"
  rel="noopener"
  style="display:inline-block;padding:12px 18px;border-radius:12px;background:#b9924a;color:#1a140c;text-decoration:none;font-weight:bold;">
  Open the Director's Board
</a>
```

## Browser Storage

Board data saved with Save Board is stored in `localStorage`, which means it saves only in the visitor's current browser and device.

Users should use Export JSON if they want portable backups or want to move a board state between browsers or devices. Import JSON restores an exported board file.

## Security Note

Do not store passwords, Squarespace login information, GitHub tokens, or other secrets in this repository.
