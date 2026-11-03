// arXiv 论文自动命名：下载 arxiv.org/pdf/... 时把文件名改成「标题 [arXiv号].pdf」

// 文件名格式，可按需修改
const formatName = (title, id) => `${title} [${id}].pdf`;

const NEW_ID = /^\d{4}\.\d{4,5}(v\d+)?$/;                    // 2401.12345v2
const OLD_ID = /^[a-z-]+(\.[a-z]{2})?\/\d{7}(v\d+)?$/i;      // hep-th/9901001, math.GT/0309136

const titleCache = new Map();

// 从 URL 中提取 arXiv 号；pdfOnly 时只认 /pdf/ 链接
function extractArxivId(urlStr, pdfOnly) {
  let u;
  try { u = new URL(urlStr); } catch { return null; }
  if (!/(^|\.)arxiv\.org$/i.test(u.hostname)) return null;
  const paths = pdfOnly ? 'pdf' : 'pdf|abs|html';
  const m = u.pathname.match(new RegExp(`^/(?:${paths})/(.+?)(?:\\.pdf)?/?$`, 'i'));
  if (!m) return null;
  const id = decodeURIComponent(m[1]);
  return NEW_ID.test(id) || OLD_ID.test(id) ? id : null;
}

function decodeEntities(s) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : all;
    }
    return named[e.toLowerCase()] ?? all;
  });
}

async function fetchText(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function fetchTitle(id) {
  const baseId = id.replace(/v\d+$/, '');
  if (titleCache.has(baseId)) return titleCache.get(baseId);

  let title = null;
  // 优先用官方 API
  try {
    const xml = await fetchText(`https://export.arxiv.org/api/query?id_list=${baseId}`);
    const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/);
    const t = entry && entry[1].match(/<title[^>]*>([\s\S]*?)<\/title>/);
    if (t && t[1].trim() !== 'Error') title = t[1];
  } catch (e) {
    console.warn('arXiv API 查询失败', e);
  }
  // 备用：抓摘要页的 citation_title
  if (!title) {
    try {
      const html = await fetchText(`https://arxiv.org/abs/${baseId}`);
      const t = html.match(/<meta\s+name="citation_title"\s+content="([^"]*)"/i);
      if (t) title = t[1];
    } catch (e) {
      console.warn('arXiv 摘要页抓取失败', e);
    }
  }
  if (title) titleCache.set(baseId, title);
  return title;
}

// 去掉 Windows/macOS/Linux 文件名中的非法字符
function sanitize(s) {
  return decodeEntities(s)
    .replace(/[\\/:*?"<>|\x00-\x1f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)
    .replace(/[. ]+$/, '');
}

async function buildFilename(id) {
  const title = await fetchTitle(id);
  const safeId = id.replace('/', '_');
  return title ? formatName(sanitize(title), safeId) : `${safeId}.pdf`;
}

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  const id = extractArxivId(item.finalUrl, true) || extractArxivId(item.url, true);
  if (!id) return; // 不是 arXiv PDF，保持默认文件名

  buildFilename(id)
    .then((filename) => suggest({ filename, conflictAction: 'uniquify' }))
    .catch((e) => {
      console.warn('重命名失败，使用默认文件名', e);
      suggest();
    });
  return true; // 异步调用 suggest
});

// 点击工具栏图标：在 arXiv 摘要页 / PDF 页直接下载并命名
chrome.action.onClicked.addListener((tab) => {
  const id = tab.url && extractArxivId(tab.url, false);
  if (!id) {
    chrome.action.setBadgeText({ tabId: tab.id, text: '×' });
    setTimeout(() => chrome.action.setBadgeText({ tabId: tab.id, text: '' }), 1500);
    return;
  }
  chrome.downloads.download({ url: `https://arxiv.org/pdf/${id}` });
});
