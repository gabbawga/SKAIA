require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {OpenAI} = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

console.log('Aqui', process.env.OPENAI_API_KEY)

async function gerarEmbeddings() {
    const caminhoBase = path.join(__dirname,'..','data','base_conhecimento.json');
    const artigos = JSON.parse(fs.readFileSync(caminhoBase,'utf8'));

    const resultados = [];

    for(let i=0; i < artigos.length; i++){

        const {titulo, conteudo} = artigos[i];
        const texto = `${titulo}\n\n${conteudo}`

        try{
            const resposta = await openai.embeddings.create({
                model: 'text-embedding-ada-002',
                input: texto,
            });

            resultados.push({
                titulo,
                conteudo,
                embeddings: resposta.data[0].embedding
            })
            console.log(`✅ Embedding gerado: ${titulo}`);
        }catch(err){
            console.warn(`⚠️ Erro ao gerar embedding para "${titulo}":`, err.message);
        }
    }

    const caminhoSaida = path.join(__dirname,'base_embeddings.json');
    fs.writeFileSync(caminhoSaida, JSON.stringify(resultados,null,2));
    console.log('📦 base_embedded.json criado com sucesso!');
}

gerarEmbeddings()