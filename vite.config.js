import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mock-sheets-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/api/mock-sheets') && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                const mockFilePath = path.resolve(process.cwd(), 'mock_spreadsheet.json');
                
                let spreadsheet = { rsvps: [], pageViews: [] };
                if (fs.existsSync(mockFilePath)) {
                  spreadsheet = JSON.parse(fs.readFileSync(mockFilePath, 'utf8'));
                }
                
                const timestamp = new Date().toISOString();
                if (data.action === 'open') {
                  spreadsheet.pageViews.push({ timestamp, name: data.name });
                  console.log(`\n\x1b[36m👁️  [Mock Sheet] Link Opened by: \x1b[1m${data.name}\x1b[22m at ${timestamp}\x1b[0m`);
                } else if (data.action === 'rsvp') {
                  spreadsheet.rsvps.push({
                    timestamp,
                    name: data.name,
                    attendance: data.attendance,
                    guestsCount: data.guestsCount,
                    phone: data.phone,
                    message: data.message
                  });
                  console.log(`\n\x1b[32m💌 [Mock Sheet] RSVP Submitted: \x1b[1m${data.name}\x1b[22m - Attending: ${data.attendance} (${data.guestsCount} guests), Contact: ${data.phone}\x1b[0m`);
                }
                
                fs.writeFileSync(mockFilePath, JSON.stringify(spreadsheet, null, 2), 'utf8');
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success', message: 'Logged to mock sheet successfully' }));
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error writing mock sheet: ' + err.toString());
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  base: './',
});
