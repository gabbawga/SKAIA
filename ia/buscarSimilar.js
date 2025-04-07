require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Função para calcular a similaridade entre dois vetores (cosine similarity)
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Função principal de busca
async function buscarArtigosSemelhantes(pergunta, limite = 3) {
  const caminhoBase = path.join(__dirname, 'base_embedded.json');
  const base = JSON.parse(fs.readFileSync(caminhoBase, 'utf8'));
  // Gera embedding da pergunta com OpenAI
  const resposta = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: pergunta,
  });

  const vetorPergunta = resposta.data[0].embedding;

  // Compara com todos os artigos
  const resultados = base.map(artigo => {
    const similaridade = cosineSimilarity(vetorPergunta, artigo.embedding);
    return { ...artigo, similaridade };
  });

  // Ordena por similaridade (do maior pro menor)
  resultados.sort((a, b) => b.similaridade - a.similaridade);

  // Retorna os mais parecidos
  return resultados.slice(0, limite);
}

// EXEMPLO DE USO
(async () => {
  const pergunta = 'Como configurar o IO na produção?';
  const artigosRelevantes = await buscarArtigosSemelhantes(pergunta);

  console.log('\n🔍 Artigos mais parecidos com a pergunta:');
  artigosRelevantes.forEach((a, i) => {
    console.log(`\n${i + 1}. ${a.titulo}`);
    console.log(`Similaridade: ${a.similaridade.toFixed(4)}`);
    console.log(`Resumo: ${a.conteudo.slice(0, 300)}...\n`);
  });
})();
