import { NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/google';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    // MVP: exibir tokens ao usuário para copiar e configurar no email-monitor
    return NextResponse.json({
      message: 'Autorizado com sucesso. Copie os tokens abaixo.',
      tokens,
      instructions:
        'Use refresh_token no email-monitor (.env) como GOOGLE_REFRESH_TOKEN; GMAIL_USER = email autorizado.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'OAuth callback error' }, { status: 400 });
  }
}


