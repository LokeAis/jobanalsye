// Tom stub. jspdf har html2canvas/canvg/dompurify som optionalDependencies og
// dynamisk-importerer dem KUN i .html()/SVG-metoder vi aldri bruker (vi lager ren
// tekst-PDF). Vi aliaser dem hit i vite.config.ts for å holde dem ute av bundelen.
export default {};
