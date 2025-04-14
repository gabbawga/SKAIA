require('dotenv').config();
const { OpenAI } = require('openai');
const path = require('path');

const { buscarArtigosSemelhantes } = require('./buscarSimilar');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const promptBase = `
Você é um assistente técnico especializado no sistema Syneco.

⚠️ Instruções importantes:
- Cada artigo possui um código no título, como "G0118", que serve apenas como identificador nunca relacionar esse código como parâmetro.
- Os parâmetros do sistema aparecem dentro dos artigos, como por exemplo: TypeData.Code = ListMultiDocuments.
- **Não confunda o código do artigo com os parâmetros.**
- Responda sempre de forma objetiva, clara e com base no conteúdo técnico apresentado.

Agora, com base na pergunta a seguir e nos artigos relevantes, gere uma resposta apropriada.
`;

async function gerarResposta(pergunta) {
  console.log(`\n🤖 Pergunta: ${pergunta}`);

  const artigos = await buscarArtigosSemelhantes(pergunta, 3);

  const contextoArtigos = artigos.map((a, i) => `📘 ${a.titulo}\n${a.conteudo}`).join('\n\n');

  const mensagens = [
    { role: 'system', content: promptBase },
    { role: 'user', content: `Pergunta: ${pergunta}\n\nArtigos:\n\n${contextoArtigos}` },
  ];

  const resposta = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', 
    messages: mensagens,
    temperature: 0.2, 
    max_tokens: 1000,
  });

  const respostaFinal = resposta.choices[0].message.content;
  console.log('\n💡 Resposta da IA:\n');
  console.log(respostaFinal);
  return respostaFinal;
}

module.exports = {gerarResposta};

// EXEMPLO
// const perguntaExemplo = 'Como acionar saida pelo indicador de qualidade?';
// gerarResposta(perguntaExemplo);
