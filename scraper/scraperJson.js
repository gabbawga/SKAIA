const puppeteer = require('puppeteer');
const fs = require('fs');

// Esta função extrai dados da URL do syneco e gera um json com "titulo" e "conteudo" dos artigos
async function extrairConteudos() {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    await page.goto('http://synecoapp.ska.com.br:100/', {
        waitUntil: 'networkidle2',
      });

    await page.waitForSelector('span.node.children.font-config');

    const artigos = await page.$$('span.node.children.font-config');
    console.log(`${artigos.length} artigos encontrados.`)

    const resultados = [];

    for(let i = 0; i < artigos.length; i++){
        const artigo =  artigos[i];
        const titulo =  await artigo.evaluate(el => el.innerText.trim());
        console.log(`\n📘 Clicando no artigo ${i + 1}: ${titulo}`);

        await artigo.evaluate(el => el.scrollIntoView());
        await page.evaluate(el => el.click(), artigo);

        await new Promise(resolve => setTimeout(resolve, 1500));

        const iframeHandle = await page.$('iframe');
        if(!iframeHandle){
            console.warn(`❌ Iframe não encontrado para: ${titulo}`);
            continue;
        }

        const frame = await iframeHandle.contentFrame();
        if(!frame){
            console.warn(`❌ Não foi possível acessar o conteúdo do iframe: ${titulo}`);
        }

        await frame.waitForSelector('body');

        let conteudo = await frame.$$eval('article', artigos =>
            artigos.map(a => {
              const titulo = a.getAttribute('title')?.trim() || '';
              const texto = a.innerText?.trim() || '';
              return titulo + (texto ? '\n' + texto : '');
            }).join('\n\n')
          );
          

        resultados.push({titulo,conteudo})

        console.log(`📄 Conteúdo extraído (${titulo}):\n${conteudo.slice(0, 5000)}...\n`);
    }

    fs.writeFileSync('base_conhecimento.json', JSON.stringify(resultados, null, 2));
    console.log('Arquivo base_conhecimento.json criado com sucesso!')

    await browser.close();
}


 //extrairConteudos()


      

   


