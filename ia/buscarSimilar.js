require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Função para calcular a similaridade entre dois vetores
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Função principal
async function buscarArtigosSemelhantes(pergunta, limite = 3) {
  const caminhoBase = path.join(__dirname, 'base_conhecimento.json');
  const base = JSON.parse(fs.readFileSync(caminhoBase, 'utf8'));

  console.log('🧪 Artigos carregados:', base.length);

  // Gera embedding da pergunta
  const resposta = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: pergunta,
  });

  const vetorPergunta = resposta.data[0].embedding;

  console.log('✅ Embedding da pergunta gerado com tamanho:', vetorPergunta.length);

  const resultados = base
    .filter(artigo => {
      const valido = Array.isArray(artigo.embeddings) && artigo.embeddings.length === vetorPergunta.length;
      if (!valido) {
        console.warn('❌ Embedding inválido em:', artigo.titulo);
      }
      return valido;
    })
    .map(artigo => {
      const similaridade = cosineSimilarity(vetorPergunta, artigo.embeddings);
      return { ...artigo, similaridade };
    });

  resultados.sort((a, b) => b.similaridade - a.similaridade);

  return resultados.slice(0, limite);
}

// EXEMPLO DE USO
// (async () => {
//   const pergunta = 'Como configurar a saida e exibir alerta';
//   const artigosRelevantes = await buscarArtigosSemelhantes(pergunta);

//   console.log('🔢 Quantidade de artigos relevantes:', artigosRelevantes.length);

//   console.log('\n🔍 Artigos mais parecidos com a pergunta:');
//   artigosRelevantes.forEach((a, i) => {
//     console.log(`\n${i + 1}. ${a.titulo}`);
//     console.log(`Similaridade: ${a.similaridade.toFixed(4)}`);
//     console.log(`Resumo: ${a.conteudo.slice(0, 300)}...\n`);
//   });
// })();


module.exports = {
  buscarArtigosSemelhantes
};

