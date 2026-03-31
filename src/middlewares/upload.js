const multer = require("multer");
const path = require("path");
const fs = require("fs");

const pastas = ["uploads", "uploads2", "uploadCampanhas"];
pastas.forEach(pasta => {
    if (!fs.existsSync(pasta)) {
        fs.mkdirSync(pasta, { recursive: true });
    }
});

// Configuração base do multer
const storage = (pastaDestino) => multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, pastaDestino);
    },
    filename: function (req, file, cb) {
        // Nome único: timestamp + nome original sem espaços
        const nomeLimpo = file.originalname.replace(/\s/g, '_');
        cb(null, Date.now() + '-' + nomeLimpo);
    }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF)'), false);
    }
};

// Criar middlewares para cada pasta
const upload = multer({
    storage: storage("uploads"),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const upload2 = multer({
    storage: storage("uploads2"),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadCampanhas = multer({
    storage: storage("uploadCampanhas"),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = {
    upload,          // para tarefas (comprovacao)
    upload2,         // para missões (foto tarefa)
    uploadCampanhas  // para campanhas
};

