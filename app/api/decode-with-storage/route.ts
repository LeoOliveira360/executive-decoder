import Groq from 'groq-sdk';
import { createChunks, cleanText, truncateText } from '@/lib/utils';
import pdfParse from 'pdf-parse';
import * as cheerio from 'cheerio';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const UPLOADS_DIR = join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Criar diretório de uploads se não existir
async function ensureUploadsDir() {
  try {
    await mkdir(UPLOADS_DIR, { recursive: true });
  } catch (error) {
    // Diretório já existe
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const shouldStore = formData.get('store') === 'true';
    const inputType = formData.get('inputType') as string;
    
    let content = '';
    let filePath = '';
  let originalFileName = '';

    if (inputType === 'pdf') {
      const file = formData.get('file') as File;
      
      if (!file) {
        return Response.json({ error: 'Arquivo PDF não fornecido' }, { status: 400 });
      }

      // Verificar tamanho
      if (file.size > MAX_FILE_SIZE) {
        return Response.json({ error: 'Arquivo muito grande. Máximo 10MB.' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Se deve salvar o arquivo
      if (shouldStore) {
        await ensureUploadsDir();
        
        const timestamp = Date.now();
        const safeFilename = file.name.replace(/[^a-z0-9.]/gi, '_');
        filePath = join(UPLOADS_DIR, `${timestamp}_${safeFilename}`);
        
        await writeFile(filePath, buffer);
        console.log(`💾 PDF salvo em: ${filePath}`);
      }
      originalFileName = file.name;
      
      const pdfResult = await pdfParse(buffer);
      content = cleanText(pdfResult.text);
    } else {
      return Response.json({ error: 'Este endpoint é apenas para PDF com armazenamento' }, { status: 400 });
    }

    if (content.length < 100) {
      return Response.json(
        { error: 'Conteúdo muito curto. Mínimo de 100 caracteres.' },
        { status: 400 }
      );
    }

    // Processar com Groq (mesma lógica de antes)
    const truncatedContent = truncateText(content, 12000);
    const chunks = createChunks(truncatedContent, 3000, 200);
    const contentToAnalyze = chunks.slice(0, 3).join('\n\n---\n\n');
    
    const MASTER_PROMPT = `Analise este documento e retorne insights acionáveis...`;
    const finalPrompt = MASTER_PROMPT.replace('{content}', contentToAnalyze);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: finalPrompt }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const result = completion.choices[0]?.message?.content || 'Erro ao gerar análise';

      return Response.json({
      success: true,
      analysis: result,
      filePath: shouldStore ? filePath : null,
      fileName: shouldStore ? originalFileName : null,
    });
  } catch (error: any) {
    console.error('❌ Erro:', error);
    return Response.json(
      { error: 'Erro ao processar', details: error.message },
      { status: 500 }
    );
  }
}
