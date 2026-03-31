const express = require("express");
const router = express.Router();
const responsavelController = require("../controllers/responsavelController");

router.post("/cadastrar", responsavelController.cadastrarResponsavel);

module.exports = router;

/*
-- ============================================
-- DADOS INICIAIS - KAMBA KID PAY
-- ============================================

-- 1. ITENS DA LOJA
-- ============================================
INSERT INTO shop_items (nome, tipo, preco, nivel_necessario, imagem_url) VALUES
-- Cabelos (nível 1)
('Cabelo Curto', 'cabelo', 0, 1, NULL),
('Cabelo Cacheado', 'cabelo', 100, 1, NULL),
('Cabelo Afro', 'cabelo', 150, 1, NULL),
('Tranças', 'cabelo', 200, 2, NULL),
('Cabelo Longo', 'cabelo', 250, 3, NULL),

-- Roupas (nível 1)
('Camiseta Básica', 'roupa', 0, 1, NULL),
('Camiseta Colorida', 'roupa', 100, 1, NULL),
('Vestido Azul', 'roupa', 200, 2, NULL),
('Fato Desportivo', 'roupa', 300, 3, NULL),
('Camisa Social', 'roupa', 400, 4, NULL),

-- Acessórios (nível 3)
('Óculos de Sol', 'acessorio', 150, 3, NULL),
('Chapéu', 'acessorio', 200, 3, NULL),
('Coroa', 'acessorio', 300, 5, NULL),
('Colar', 'acessorio', 250, 4, NULL),
('Mochila', 'acessorio', 500, 6, NULL);

-- 2. CONTEÚDOS EDUCATIVOS
-- ============================================
INSERT INTO conteudo (titulo, descricao, tipo, faixa_etaria, thumbnail_url, url, duracao, topico, xp_recompensa) VALUES
-- Faixa 6-8 anos
('O que é dinheiro?', 
 'Aprenda sobre a história do dinheiro e como ele surgiu', 
 'video', '6-8', 
 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e', 
 'https://youtube.com/watch?v=abc123', '3:45', 'introducao', 15),

('Os 3 potes: Gastar, Poupar e Ajudar', 
 'Descubra como dividir seu dinheiro em 3 partes importantes', 
 'video', '6-8', 
 'https://images.unsplash.com/photo-1554224155-6726b3ff858f', 
 'https://youtube.com/watch?v=def456', '4:20', 'potes', 20),

-- Faixa 9-10 anos
('Como fazer um orçamento', 
 'Aprenda a planejar seus gastos mensais e economizar', 
 'video', '9-10', 
 'https://images.unsplash.com/photo-1554224154-26032ffc0c07', 
 'https://youtube.com/watch?v=ghi789', '5:30', 'orcamento', 25),

('Poupar para o futuro', 
 'Entenda a importância de guardar dinheiro para metas', 
 'video', '9-10', 
 'https://images.unsplash.com/photo-1554224155-1696413565d3', 
 'https://youtube.com/watch?v=jkl012', '6:15', 'poupanca', 30),

('O poder da doação', 
 'Como ajudar os outros faz bem para você e para a comunidade', 
 'video', '9-10', 
 'https://images.unsplash.com/photo-1532629345422-94a3cb255f28', 
 'https://youtube.com/watch?v=mno345', '4:45', 'solidariedade', 20),

-- Faixa 11-12 anos
('Investimentos para iniciantes', 
 'Conceitos básicos sobre como fazer o dinheiro crescer', 
 'video', '11-12', 
 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc', 
 'https://youtube.com/watch?v=pqr678', '8:00', 'investimento', 40),

('Empreendedorismo jovem', 
 'Como transformar suas ideias em um negócio', 
 'video', '11-12', 
 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4', 
 'https://youtube.com/watch?v=stu901', '7:30', 'empreendedorismo', 45);

-- 3. CAMPANHAS DE EXEMPLO
-- ============================================
INSERT INTO campanhas (nome, descricao, meta_valor, valor_arrecadado, organizacao, causa, date_inicio, date_fim, status) VALUES
('Merenda Escolar', 
 'Ajude a fornecer merenda para 500 crianças em escolas rurais de Angola', 
 50000, 12500, 'ONG Kamba Solidário', 'educacao', 
 '2025-01-01', '2025-12-31', true),

('Água Potável', 
 'Construção de poços de água em comunidades do Huambo', 
 75000, 25000, 'Água para Todos', 'saude', 
 '2025-01-15', '2025-11-30', true),

('Reflorestamento', 
 'Plante uma árvore - Programa de reflorestamento no Bié', 
 30000, 8000, 'Verde Angola', 'ambiente', 
 '2025-02-01', '2025-10-31', true),

('Material Escolar', 
 'Distribuição de livros e material escolar para crianças carentes', 
 40000, 15000, 'Educar Angola', 'educacao', 
 '2025-01-10', '2025-09-30', true),

('Banco Alimentar', 
 'Combate à fome - distribuição de cestas básicas', 
 60000, 10000, 'Kamba Solidário', 'alimentacao', 
 '2025-01-20', '2025-12-31', true);

-- 4. MISSÕES DE EXEMPLO (para cada criança, ajustar id_crianca depois)
-- ============================================
-- NOTA: Estas missões serão criadas dinamicamente pelo responsável
-- Exemplos de como criar manualmente (substitua X pelo id da criança)
/*
INSERT INTO missao (titulo, descricao, tipo, objetivo_valor, progresso_atual, xp_recompensa, icone, id_crianca, ativa, concluida) VALUES
('Meta: Novo Jogo', 
 'Economize 6.000 Kz para comprar o novo jogo que você quer', 
 'poupanca', 6000, 0, 500, '🎮', X, true, false),

('Consumidor Consciente', 
 'Gaste com sabedoria e não exceda 4.000 Kz este mês', 
 'consumo', 4000, 0, 300, '🛒', X, true, false),

('Ajudar a Comunidade', 
 'Faça uma doação para uma campanha solidária', 
 'solidariedade', 500, 0, 200, '💝', X, true, false);


-- 5. VERIFICAÇÃO DOS DADOS
-- ============================================
SELECT '✅ Itens da loja: ' AS Status, COUNT(*) AS Quantidade FROM shop_items
UNION ALL
SELECT '✅ Conteúdos educativos: ', COUNT(*) FROM conteudo
UNION ALL
SELECT '✅ Campanhas ativas: ', COUNT(*) FROM campanhas WHERE status = true;
*/