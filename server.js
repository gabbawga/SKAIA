require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {gerarResposta} = require('./ia/gerarResposta');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/responder', async(req, res)=>{
    const {pergunta} = req.body;

    if(!pergunta){
        return res.status(400).json({erro: 'A pergunta é obrigatória. '})
    }

    try{
        const resposta = await gerarResposta(pergunta);
        return res.json({ resposta });
    } catch (err) {
        console.error('Erro ao gerar resposta', err);
        return res.status(500).json({erro: 'Erro ao gerar resposta com IA'})
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
});


