const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('🔄 Testando conexão com MongoDB...');
  console.log(`📡 URI: ${process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);
  console.log('');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB com sucesso!');
    console.log(`📊 Banco de dados: ${mongoose.connection.db.databaseName}`);
    
    // Listar coleções
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Coleções disponíveis:');
    if (collections.length === 0) {
      console.log('  (Nenhuma coleção criada ainda)');
    } else {
      collections.forEach(c => console.log(`  - ${c.name}`));
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Teste concluído!');
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.log('\n🔍 Possíveis causas:');
    console.log('  1. String de conexão incorreta');
    console.log('  2. Usuário ou senha errados');
    console.log('  3. IP não liberado no MongoDB Atlas');
    console.log('  4. Cluster está pausado ou desligado');
  }
}

testConnection();