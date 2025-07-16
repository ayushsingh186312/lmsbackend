const fs = require('fs');
const path = require('path');

console.log('🚀 LMS Backend Deployment Readiness Check\n');

const checks = [
  {
    name: 'Package.json has start script',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json'));
      return pkg.scripts && pkg.scripts.start === 'node server.js';
    }
  },
  {
    name: 'Package.json has engines specified',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json'));
      return pkg.engines && pkg.engines.node;
    }
  },
  {
    name: 'Server.js uses process.env.PORT',
    check: () => {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      return serverContent.includes('process.env.PORT');
    }
  },
  {
    name: 'Server.js listens on 0.0.0.0',
    check: () => {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      return serverContent.includes('0.0.0.0');
    }
  },
  {
    name: 'CORS is configured',
    check: () => {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      return serverContent.includes('cors');
    }
  },
  {
    name: 'Error handling middleware exists',
    check: () => {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      return serverContent.includes('app.use((err, req, res, next)');
    }
  },
  {
    name: 'Health endpoint exists',
    check: () => {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      return serverContent.includes('/health');
    }
  },
  {
    name: 'MongoDB connection uses environment variable',
    check: () => {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      return serverContent.includes('process.env.MONGO_URI');
    }
  },
  {
    name: 'Deployment files exist',
    check: () => {
      return fs.existsSync('render.yaml') || fs.existsSync('Procfile') || fs.existsSync('vercel.json');
    }
  },
  {
    name: '.gitignore includes .env',
    check: () => {
      if (!fs.existsSync('.gitignore')) return false;
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      return gitignore.includes('.env');
    }
  }
];

let passed = 0;
const total = checks.length;

checks.forEach((check, index) => {
  try {
    const result = check.check();
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${check.name}: ${status}`);
    if (result) passed++;
  } catch (error) {
    console.log(`${index + 1}. ${check.name}: ❌ FAIL (${error.message})`);
  }
});

console.log('\n' + '='.repeat(50));
console.log(`📊 Results: ${passed}/${total} checks passed`);

if (passed === total) {
  console.log('🎉 Your app is ready for deployment!');
  console.log('\n📋 Next Steps:');
  console.log('1. Push code to GitHub');
  console.log('2. Choose deployment platform (Render recommended)');
  console.log('3. Set environment variables');
  console.log('4. Deploy!');
} else {
  console.log('⚠️  Please fix the failing checks before deployment.');
}

console.log('\n🔧 Required Environment Variables:');
console.log('- NODE_ENV=production');
console.log('- MONGO_URI=your_mongodb_connection_string');
console.log('- JWT_SECRET=your_secure_secret_32_characters_minimum');
console.log('- PORT=10000 (or platform default)');

console.log('\n🌐 Deployment Platforms:');
console.log('- Render: https://render.com (Free tier, recommended)');
console.log('- Railway: https://railway.app (Free tier)');
console.log('- Heroku: https://heroku.com (Paid)');
console.log('- Vercel: https://vercel.com (Serverless, free)');

console.log('\n📖 Read DEPLOYMENT.md for detailed instructions!');
