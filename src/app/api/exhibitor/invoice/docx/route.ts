import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brand_name = 'Registered Exhibitor', mobile = '', stall_sqft = '200 sq ft', fascia_names = [], items = [], days = 2 } = body;

    const tmpDir = os.tmpdir();
    const randId = Math.random().toString(36).substring(2, 9);
    const jsonPath = path.join(tmpDir, `ste_inv_${randId}.json`);
    const docxPath = path.join(tmpDir, `ste_inv_${randId}.docx`);

    const invoiceData = {
      brand_name,
      mobile,
      stall_sqft,
      fascia_names,
      days,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      invoice_no: `STE/INV/2026/${mobile ? mobile.slice(-4) : '0001'}`,
      items,
    };

    fs.writeFileSync(jsonPath, JSON.stringify(invoiceData), 'utf-8');

    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_single_invoice_docx.py');
    
    // Execute python script to generate docx
    await execFileAsync('python', [scriptPath, jsonPath, docxPath]);

    if (!fs.existsSync(docxPath)) {
      return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
    }

    const fileBuffer = fs.readFileSync(docxPath);

    // Cleanup temp files
    try { fs.unlinkSync(jsonPath); } catch {}
    try { fs.unlinkSync(docxPath); } catch {}

    const cleanBrand = brand_name.replace(/[^a-zA-Z0-9]/g, '_') || 'Exhibitor';
    const filename = `STE_Tax_Invoice_${cleanBrand}_2026.docx`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate docx invoice:', error);
    return NextResponse.json({ error: 'Server error generating document' }, { status: 500 });
  }
}
