import jsPDF from 'jspdf';
import { statements, dimensionsData, DimensionKey, resolveDimensionKey } from '../data/statements';

interface PdfExportOptions {
  /** When true, stamp a subtle "gratisversjon" footer on every page. */
  watermark?: boolean;
}

interface DimNote {
  workExample: string;
  interviewStrength: string;
  awareness: string;
}

const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Build the interview briefing as a real, text-based PDF (searchable, crisp,
 * small file) directly from the stored data — the same source the on-screen
 * print layout uses. If a saved job analysis exists we render the full briefing;
 * otherwise a notes-only document. No DOM rasterization (no html2canvas).
 */
export const exportBriefingToPdf = async (
  filename?: string,
  options: PdfExportOptions = {}
): Promise<boolean> => {
  try {
    const answers = readJSON<Record<string, number>>('bigfive_prep_answers', {});
    const notes = readJSON<Record<string, DimNote>>('bigfive_prep_notes', {});
    const analysis = readJSON<any>('bigfive_prep_job_analysis', null);
    const jobTitle = (localStorage.getItem('bigfive_prep_job_title') || '').trim();

    const getScore = (dim: DimensionKey): number => {
      const ds = statements.filter((s) => s.dimensjon === dim);
      let sum = 0;
      ds.forEach((s) => {
        const a = answers[s.id] || 3;
        sum += s.keyed === 'negativ' ? 6 - a : a;
      });
      return sum / ds.length;
    };
    const getBand = (s: number) => (s <= 2.6 ? 'Lav' : s >= 3.7 ? 'Høy' : 'Moderat');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = 210;
    const pageH = 297;
    const M = 15;
    const contentW = pageW - 2 * M;
    let y = M;

    const lh = (size: number) => size * 0.42; // pt → mm line advance
    const ensure = (space: number) => {
      if (y + space > pageH - M) {
        pdf.addPage();
        y = M;
      }
    };

    const text = (
      str: string,
      size: number,
      opts: { bold?: boolean; italic?: boolean; color?: [number, number, number]; indent?: number; gap?: number } = {}
    ) => {
      const { bold = false, italic = false, color = [51, 65, 85], indent = 0, gap = 1.5 } = opts;
      pdf.setFont('helvetica', italic ? 'italic' : bold ? 'bold' : 'normal');
      pdf.setFontSize(size);
      pdf.setTextColor(color[0], color[1], color[2]);
      const lines = pdf.splitTextToSize(str || '', contentW - indent);
      lines.forEach((ln: string) => {
        ensure(lh(size));
        pdf.text(ln, M + indent, y);
        y += lh(size);
      });
      y += gap;
    };

    const heading = (str: string) => {
      ensure(lh(13) + 6);
      y += 3;
      text(str, 13, { bold: true, color: [15, 23, 42], gap: 1 });
      pdf.setDrawColor(226, 232, 240);
      pdf.line(M, y, pageW - M, y);
      y += 3;
    };

    // --- Header ---
    text('KANDIDAT-BRIEFING — KUN TIL PERSONLIG BRUK UNDER FORBEREDELSE', 8, {
      color: [100, 116, 139],
      gap: 1,
    });
    text(
      analysis ? 'Briefing til intervjudagen' : 'Mine forberedelser til jobbintervju (Big Five)',
      analysis ? 20 : 18,
      { bold: true, color: [15, 23, 42], gap: 1 }
    );
    let meta = `Dato: ${new Date().toLocaleDateString('no-NO')}`;
    if (jobTitle) meta = `Søkt stilling: ${jobTitle}   ·   ${meta}`;
    if (analysis?.matchBand) meta += `   ·   Match: ${analysis.matchBand}`;
    text(meta, 9, { color: [100, 116, 139], gap: 3 });

    // --- Analysis sections (only when an analysis exists) ---
    if (analysis) {
      heading('1. Overordnet match-analyse');
      text(analysis.matchAnalysis || '—', 10);

      if (Array.isArray(analysis.impliedTraits) && analysis.impliedTraits.length) {
        heading('2. Rolleanalyse og personlighetsprofil');
        analysis.impliedTraits.forEach((t: any) => {
          text(`Stillingens krav: ${t.trait}`, 10, { bold: true, color: [15, 23, 42], gap: 0.5 });
          if (t.evidenceInText) text(`"${t.evidenceInText}"`, 9, { italic: true, color: [100, 116, 139], indent: 3, gap: 0.5 });
          const key = resolveDimensionKey(t.trait || '');
          if (key) {
            const sc = getScore(key);
            text(`Din profil — ${dimensionsData[key].name}: ${getBand(sc)} tendens (${sc.toFixed(1)}/5)`, 9, {
              color: [67, 56, 202],
              indent: 3,
              gap: 2.5,
            });
          } else {
            y += 2;
          }
        });
      }

      if (Array.isArray(analysis.superpowers) && analysis.superpowers.length) {
        heading('3. Dine største superkrefter i denne rollen');
        analysis.superpowers.forEach((s: any, i: number) => {
          text(`${i + 1}. ${s.trait}`, 10, { bold: true, color: [15, 23, 42], gap: 0.5 });
          if (s.whyItFits) text(`Hvorfor det passer: ${s.whyItFits}`, 9, { indent: 3, gap: 0.5 });
          if (s.interviewTip) text(`Intervjutips: ${s.interviewTip}`, 9, { italic: true, color: [100, 116, 139], indent: 3, gap: 2.5 });
        });
      }

      if (Array.isArray(analysis.frictionPoints) && analysis.frictionPoints.length) {
        heading('4. Situasjonsbetingede friksjonspunkter');
        analysis.frictionPoints.forEach((f: any, i: number) => {
          text(`${i + 1}. Spenning: ${f.tension}`, 9, { color: [15, 23, 42], gap: 0.5 });
          if (f.compensationStrategy) text(`Kompenseringsstrategi: ${f.compensationStrategy}`, 9, { italic: true, color: [100, 116, 139], indent: 3, gap: 2.5 });
        });
      }

      if (Array.isArray(analysis.interviewQuestions) && analysis.interviewQuestions.length) {
        heading('5. Tøffe spørsmål fra rekruttereren');
        analysis.interviewQuestions.forEach((q: any, i: number) => {
          text(`Spørsmål ${i + 1}: "${q.question}"`, 9, { bold: true, color: [15, 23, 42], gap: 0.5 });
          if (q.suggestedAngle) text(`Foreslått vinkling: ${q.suggestedAngle}`, 9, { indent: 3, gap: 2.5 });
        });
      }

      heading('6. Dine personlige forberedelser og STAR-historier');
    }

    // --- Notes per dimension (briefing: only filled; notes-only doc: all) ---
    const dimKeys = Object.keys(dimensionsData) as DimensionKey[];
    let anyNotes = false;
    dimKeys.forEach((key) => {
      const n = notes[key] || { workExample: '', interviewStrength: '', awareness: '' };
      const has = !!(n.workExample || n.interviewStrength || n.awareness);
      if (analysis && !has) return; // briefing format skips empty dimensions
      anyNotes = anyNotes || has;

      ensure(lh(11) + 4);
      text(dimensionsData[key].name, 11, { bold: true, color: [15, 23, 42], gap: 1 });

      const field = (label: string, val: string) => {
        text(label, 8, { bold: true, color: [100, 116, 139], gap: 0.3 });
        if (val) text(val, 9, { indent: 2, gap: 2 });
        else text('Ingen notater skrevet.', 9, { italic: true, color: [148, 163, 184], indent: 2, gap: 2 });
      };
      field('Eksempel fra arbeidshverdagen / STAR-historie:', n.workExample);
      field('Styrke jeg kan forklare i intervju:', n.interviewStrength);
      field('Noe jeg bør være bevisst på (fallgruve):', n.awareness);
      y += 2;
    });

    if (analysis && !anyNotes) {
      text('Du har ikke skrevet egne notater ennå — legg dem inn under «Mine Notater».', 9, {
        italic: true,
        color: [148, 163, 184],
      });
    }

    // --- Free-version watermark on every page ---
    if (options.watermark) {
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(160, 160, 160);
        pdf.text(
          'Big Five Forberedelse – gratisversjon · Oppgrader til premium for PDF uten denne teksten',
          pageW / 2,
          pageH - 6,
          { align: 'center' }
        );
      }
    }

    pdf.save(filename || 'intervjubriefing.pdf');
    return true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    return false;
  }
};
