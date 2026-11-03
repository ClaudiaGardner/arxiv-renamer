# arXiv Renamer

一个 Chrome / Edge 浏览器插件：从 arXiv 下载论文 PDF 时，自动把文件名改成「论文标题 [arXiv号].pdf」。

A Chrome / Edge extension that renames arXiv PDF downloads to `Paper Title [arXiv ID].pdf`.

| 下载链接 | 保存的文件名 |
|---|---|
| `arxiv.org/pdf/1706.03762` | `Attention Is All You Need [1706.03762].pdf` |
| `arxiv.org/pdf/1706.03762v5` | `Attention Is All You Need [1706.03762v5].pdf` |
| `arxiv.org/pdf/hep-th/9901001` | `String Junctions and Their Duals in Heterotic String Theory [hep-th_9901001].pdf` |

## 安装

1. 下载本仓库（`Code` → `Download ZIP` 后解压，或 `git clone`）
2. 打开 `chrome://extensions`（Edge 为 `edge://extensions`）
3. 打开右上角「开发者模式」
4. 点「加载已解压的扩展程序」，选择本仓库文件夹

## 使用

- **自动改名**：直接点 PDF 链接下载，或在浏览器 PDF 阅读器里点下载按钮，都会自动改名。非 arXiv 的下载不受影响。
- **工具栏按钮**：在论文摘要页（`/abs/`）或 PDF 页点击插件图标，直接下载这篇论文的 PDF。当前页面不是 arXiv 论文时，图标上会闪一个 ×。

## 说明

- 标题优先通过 [arXiv API](https://info.arxiv.org/help/api/) 获取，失败时从论文摘要页的 `citation_title` 读取；都失败则只用 arXiv 号命名。
- 文件名中的非法字符（`\ / : * ? " < > |`）会替换为空格，标题超过 180 个字符会截断。
- 修改文件名格式：编辑 `background.js` 中的 `formatName`，然后在扩展页面点刷新。例如：

  ```js
  const formatName = (title, id) => `${title}_${id}.pdf`;
  ```

- Firefox 不支持 `chrome.downloads.onDeterminingFilename`，因此暂不支持 Firefox。

## License

[MIT](LICENSE)
