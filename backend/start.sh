#!/bin/sh
set -e

echo "⏳ Running database migrations..."
npx prisma migrate deploy

echo "⏳ Seeding admin user..."
node -e "
const { execSync } = require('child_process');
try {
  execSync('node dist/seed.js', { stdio: 'inherit' });
} catch(e) {
  console.log('Seed note:', e.message.split('\n')[0]);
}
"

echo "🚀 Starting backend server..."
exec node dist/index.js
