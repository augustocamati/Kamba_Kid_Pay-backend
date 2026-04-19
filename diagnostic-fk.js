// Crie um arquivo diagnostic-fk.js
const sequelize  = require('./src/config/database');

async function checkForeignKeys() {
    try {
        // Para SQLite, verifique a estrutura das tabelas
        const tables = ['missao', 'quiz', 'quiz_opcao', 'resposta_usuario', 'progresso_missao', 'logs_admin'];
        
        for (const table of tables) {
            try {
                const result = await sequelize.query(`PRAGMA table_info(${table})`);
                console.log(`\n📋 Tabela: ${table}`);
                console.log('Colunas:', result[0].map(col => col.name).join(', '));
                
                // Verificar foreign keys
                const fks = await sequelize.query(`PRAGMA foreign_key_list(${table})`);
                if (fks[0].length > 0) {
                    console.log('Foreign Keys:', fks[0]);
                }
            } catch (e) {
                console.log(`Tabela ${table} não encontrada`);
            }
        }
        
        await sequelize.close();
    } catch (error) {
        console.error('Erro:', error);
    }
}

checkForeignKeys();