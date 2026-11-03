# arXiv Renamer

A Chrome / Edge extension that renames arXiv PDF downloads to `Paper Title [arXiv ID].pdf`.

**English** · [中文说明](README.zh-CN.md)

| Download URL | Saved as |
|---|---|
| `arxiv.org/pdf/1706.03762` | `Attention Is All You Need [1706.03762].pdf` |
| `arxiv.org/pdf/1706.03762v5` | `Attention Is All You Need [1706.03762v5].pdf` |
| `arxiv.org/pdf/hep-th/9901001` | `String Junctions and Their Duals in Heterotic String Theory [hep-th_9901001].pdf` |

## Install

1. Download this repo (`Code` → `Download ZIP` and unzip, or `git clone`)
2. Open `chrome://extensions` (or `edge://extensions`)
3. Turn on **Developer mode** (top right)
4. Click **Load unpacked** and select this folder

## Usage

- **Auto-rename**: download a PDF link directly, or use the download button in the browser's PDF viewer — the file is renamed automatically. Downloads that are not from arXiv are untouched.
- **Toolbar button**: on an abstract page (`/abs/`) or PDF page, click the extension icon to download that paper. On a non-arXiv page the icon flashes a `×`.

## How it works

- The title is fetched from the [arXiv API](https://info.arxiv.org/help/api/) first, falling back to the `citation_title` meta tag on the abstract page. If both fail, the file is named by arXiv ID only.
- Characters that are illegal in file names (`\ / : * ? " < > |`) are replaced with spaces, and titles are truncated to 180 characters.
- `/` in old-style IDs (`hep-th/9901001`) becomes `_` so the file stays flat in the download folder.
- To change the file name format, edit `formatName` in `background.js`, then hit refresh on the extension page:

  ```js
  const formatName = (title, id) => `${title}_${id}.pdf`;
  ```

- Firefox does not support `chrome.downloads.onDeterminingFilename`, so Firefox is not supported yet.

## Permissions

| Permission | Why |
|---|---|
| `downloads` | Rename the download and trigger downloads from the toolbar button |
| `https://arxiv.org/*`, `https://*.arxiv.org/*` | Fetch titles from the arXiv API and abstract pages |

No data is collected or sent anywhere except to arXiv itself.

## License

[MIT](LICENSE)
