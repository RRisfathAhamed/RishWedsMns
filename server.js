import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, 'dist');
const port = Number(process.env.PORT || 4173);

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.pdf', 'application/pdf'],
]);

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const requested = decoded === '/' ? '/index.html' : decoded;
  const fullPath = path.normalize(path.join(root, requested));
  return fullPath.startsWith(root) ? fullPath : path.join(root, 'index.html');
}

createServer(async (req, res) => {
  let filePath = safePath(req.url || '/');

  if (!existsSync(filePath)) {
    filePath = path.join(root, 'index.html');
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      filePath = path.join(root, 'index.html');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': contentTypes.get(ext) || 'application/octet-stream',
    });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`RM invitation is running at http://127.0.0.1:${port}`);
});
