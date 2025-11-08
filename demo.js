const { DashboardServer, SoblendStorage } = require('./dist/index');

async function main() {
  console.log('🚀 Starting Soblend Baileys Demo Dashboard...\n');
  
  const storage = new SoblendStorage('./demo_data', false);
  await storage.initialize();
  console.log('✅ Demo storage initialized\n');
  
  console.log('📊 Starting dashboard server on port 5000...\n');
  
  const dashboard = new DashboardServer({
    port: 5000,
    host: '0.0.0.0',
    secret: 'demo-secret-token',
    storage: storage,
  });
  
  dashboard.start();
  
  console.log('\n✨ Dashboard is running!');
  console.log('   View it in the Webview tab');
  console.log('   API Token: demo-secret-token');
  console.log('\n📝 Note: This is a demo dashboard showing the Soblend Baileys features.');
  console.log('   To use WhatsApp with WORKING BUTTONS, run:');
  console.log('   npm run build && node dist/example.js');
  console.log('\n💡 The buttons have been updated with GataBot-MD implementation');
  console.log('   They now use native flow messages that work correctly!');
}

main().catch((error) => {
  console.error('❌ Error starting demo:', error);
  process.exit(1);
});
