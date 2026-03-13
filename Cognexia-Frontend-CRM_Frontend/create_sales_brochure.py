"""
Generate a professional sales and marketing brochure PDF for CognexiaAI ERP
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak, 
                                Table, TableStyle, Image, KeepTogether, Frame, PageTemplate)
from reportlab.lib.colors import HexColor, Color, white, black
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.platypus.flowables import Flowable
import io

class NumberedCanvas(canvas.Canvas):
    """Custom canvas for headers and footers"""
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        # Header
        self.setFillColor(HexColor('#0066cc'))
        self.rect(0, A4[1] - 0.7*inch, A4[0], 0.7*inch, fill=True, stroke=False)
        
        self.setFillColor(white)
        self.setFont('Helvetica-Bold', 16)
        self.drawString(1*inch, A4[1] - 0.45*inch, "CognexiaAI ERP")
        
        self.setFont('Helvetica', 9)
        self.setFillColor(HexColor('#e6f2ff'))
        self.drawRightString(A4[0] - 1*inch, A4[1] - 0.45*inch, 
                           "Industry 5.0 Enterprise CRM Platform")
        
        # Footer
        self.setFillColor(HexColor('#f0f0f0'))
        self.rect(0, 0, A4[0], 0.5*inch, fill=True, stroke=False)
        
        self.setFillColor(HexColor('#666666'))
        self.setFont('Helvetica', 9)
        self.drawString(1*inch, 0.25*inch, "© 2026 CognexiaAI | Cognition Meets Precision")
        
        self.drawRightString(A4[0] - 1*inch, 0.25*inch, 
                           f"Page {self._pageNumber} of {page_count}")
        
        self.restoreState()


class IconBox(Flowable):
    """Custom flowable for icon boxes"""
    def __init__(self, text, color='#0066cc', width=2.5*inch, height=0.8*inch):
        Flowable.__init__(self)
        self.text = text
        self.color = HexColor(color)
        self.width = width
        self.height = height
    
    def draw(self):
        self.canv.saveState()
        # Draw rounded rectangle
        self.canv.setFillColor(self.color)
        self.canv.setStrokeColor(self.color)
        self.canv.roundRect(0, 0, self.width, self.height, 5, fill=1, stroke=1)
        
        # Draw text
        self.canv.setFillColor(white)
        self.canv.setFont('Helvetica-Bold', 10)
        
        # Center text
        text_width = self.canv.stringWidth(self.text, 'Helvetica-Bold', 10)
        x = (self.width - text_width) / 2
        y = self.height / 2 - 4
        
        self.canv.drawString(x, y, self.text)
        self.canv.restoreState()


def create_marketing_brochure():
    """Create a comprehensive marketing brochure"""
    
    # Read the markdown file
    with open('COMPLETE_FEATURE_LIST.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Create PDF
    pdf_file = 'CognexiaAI_ERP_Sales_Brochure_Updated.pdf'
    doc = SimpleDocTemplate(
        pdf_file, 
        pagesize=A4,
        topMargin=1*inch, 
        bottomMargin=0.75*inch,
        leftMargin=1*inch, 
        rightMargin=1*inch
    )
    
    # Container for elements
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Heading1'],
        fontSize=36,
        textColor=HexColor('#0066cc'),
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontSize=18,
        textColor=HexColor('#333333'),
        spaceAfter=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    cover_tagline = ParagraphStyle(
        'CoverTagline',
        parent=styles['Normal'],
        fontSize=14,
        textColor=HexColor('#666666'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Oblique'
    )
    
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading1'],
        fontSize=22,
        textColor=white,
        spaceAfter=15,
        spaceBefore=0,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        backColor=HexColor('#0066cc'),
        borderPadding=10
    )
    
    heading1 = ParagraphStyle(
        'CustomH1',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=HexColor('#0066cc'),
        spaceAfter=12,
        spaceBefore=15,
        fontName='Helvetica-Bold',
        borderWidth=2,
        borderColor=HexColor('#0066cc'),
        borderPadding=5,
        leftIndent=10
    )
    
    heading2 = ParagraphStyle(
        'CustomH2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=HexColor('#333399'),
        spaceAfter=10,
        spaceBefore=10,
        fontName='Helvetica-Bold',
        leftIndent=5
    )
    
    heading3 = ParagraphStyle(
        'CustomH3',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=HexColor('#0066cc'),
        spaceAfter=8,
        spaceBefore=8,
        fontName='Helvetica-Bold'
    )
    
    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=styles['Normal'],
        fontSize=10,
        leftIndent=25,
        spaceAfter=4,
        bulletIndent=10,
        leading=14
    )
    
    highlight_box = ParagraphStyle(
        'HighlightBox',
        parent=styles['Normal'],
        fontSize=11,
        textColor=HexColor('#0066cc'),
        backColor=HexColor('#e6f2ff'),
        borderWidth=1,
        borderColor=HexColor('#0066cc'),
        borderPadding=10,
        spaceAfter=15,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER
    )
    
    # ==================== COVER PAGE ====================
    elements.append(Spacer(1, 1.5*inch))
    elements.append(Paragraph('CognexiaAI ERP', cover_title))
    elements.append(Spacer(1, 0.3*inch))
    elements.append(Paragraph('Industry 5.0 Enterprise CRM Platform', cover_subtitle))
    elements.append(Paragraph('"Cognition Meets Precision"', cover_tagline))
    elements.append(Spacer(1, 0.5*inch))
    
    # Key highlights on cover
    highlights = [
        '🚀 83 Database Entities',
        '🤖 10+ AI/ML Services',
        '🌐 AR/VR/Holographic Tech',
        '🔐 Military-Grade Security',
        '⚡ Quantum Intelligence',
        '🔄 Universal CRM Migration'
    ]
    
    for highlight in highlights:
        elements.append(Paragraph(highlight, highlight_box))
        elements.append(Spacer(1, 0.1*inch))
    
    elements.append(Spacer(1, 0.5*inch))
    
    contact_info = """
    <b>Contact Us:</b><br/>
    Sales: sales@cognexiaai.com<br/>
    Phone: +91-9167422630<br/>
    Demo: www.cognexiaai.com/demo
    """
    elements.append(Paragraph(contact_info, ParagraphStyle(
        'Contact',
        parent=styles['Normal'],
        fontSize=11,
        alignment=TA_CENTER,
        textColor=HexColor('#666666')
    )))
    
    elements.append(PageBreak())
    
    # ==================== EXECUTIVE SUMMARY ====================
    elements.append(Paragraph('EXECUTIVE SUMMARY', section_title))
    elements.append(Spacer(1, 0.2*inch))
    
    exec_summary = """
    CognexiaAI ERP is the world's first Industry 5.0-ready Enterprise CRM platform, 
    combining cutting-edge artificial intelligence, quantum computing intelligence, 
    and immersive technologies (AR/VR/Holographic) to revolutionize customer relationship 
    management. With 83 comprehensive database entities, 60+ specialized services, and 
    200+ API endpoints, CognexiaAI ERP provides unmatched depth and breadth in enterprise 
    CRM capabilities.
    """
    elements.append(Paragraph(exec_summary, ParagraphStyle(
        'ExecSummary',
        parent=styles['Normal'],
        fontSize=11,
        alignment=TA_JUSTIFY,
        leading=16,
        spaceAfter=15
    )))
    
    # Stats table
    stats_data = [
        ['83', '60+', '200+', '100+'],
        ['Database\nEntities', 'Services', 'API\nEndpoints', 'Integrations']
    ]
    
    stats_table = Table(stats_data, colWidths=[1.5*inch]*4)
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#0066cc')),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 18),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, 1), 9),
        ('BACKGROUND', (0, 1), (-1, 1), HexColor('#e6f2ff')),
        ('GRID', (0, 0), (-1, -1), 1, HexColor('#0066cc')),
        ('ROWHEIGHT', (0, 0), (-1, 0), 0.6*inch),
        ('ROWHEIGHT', (0, 1), (-1, 1), 0.5*inch),
    ]))
    
    elements.append(stats_table)
    elements.append(Spacer(1, 0.3*inch))
    
    elements.append(PageBreak())
    
    # ==================== PARSE CONTENT ====================
    lines = content.split('\n')
    
    skip_lines = ['# CognexiaAI ERP - Complete Feature List', 
                  '## Industry 5.0 Enterprise CRM Platform',
                  '### "Cognition Meets Precision"']
    
    for line in lines:
        line = line.replace('\r', '')
        
        # Skip cover page content
        if line.strip() in skip_lines:
            continue
        
        if line.startswith('# '):
            # Major section - with colored background
            elements.append(Spacer(1, 0.2*inch))
            section_text = line[2:].strip()
            elements.append(Paragraph(section_text, section_title))
            elements.append(Spacer(1, 0.15*inch))
            
        elif line.startswith('## '):
            # Subsection
            elements.append(Paragraph(line[3:], heading1))
            
        elif line.startswith('### '):
            # Sub-subsection
            elements.append(Paragraph(line[4:], heading2))
            
        elif line.startswith('---'):
            # Section separator
            elements.append(Spacer(1, 0.15*inch))
            
        elif line.startswith('- **') and '**:' in line:
            # Highlighted bullet with service name
            # Extract service name and description
            parts = line[2:].split('**:')
            service_name = parts[0].replace('**', '').strip()
            description = parts[1].strip() if len(parts) > 1 else ''
            
            bullet_text = f'<b><font color="#0066cc">★ {service_name}</font></b>'
            if description:
                bullet_text += f': {description}'
            
            elements.append(Paragraph(bullet_text, bullet_style))
            
        elif line.startswith('- '):
            # Regular bullet point
            bullet_text = '• ' + line[2:]
            
            # Highlight important keywords
            keywords = ['AI', 'ML', 'Quantum', 'AR', 'VR', 'Holographic', 'Enterprise', 
                       'Real-Time', 'Automated', 'Advanced', 'Predictive', 'Intelligence']
            
            for keyword in keywords:
                if keyword in bullet_text:
                    bullet_text = bullet_text.replace(keyword, f'<b>{keyword}</b>')
            
            elements.append(Paragraph(bullet_text, bullet_style))
            
        elif line.strip().startswith('**') and line.strip().endswith('**'):
            # Bold standalone text - treat as emphasis
            emphasized_text = line.strip().replace('**', '')
            elements.append(Paragraph(f'<b><font color="#0066cc">{emphasized_text}</font></b>', 
                                    heading3))
            
        elif line.strip() and not line.startswith('#'):
            # Regular paragraph
            elements.append(Paragraph(line, styles['Normal']))
    
    # ==================== COMPETITIVE ADVANTAGES PAGE ====================
    elements.append(PageBreak())
    elements.append(Paragraph('WHY CHOOSE COGNEXIAAI ERP?', section_title))
    elements.append(Spacer(1, 0.2*inch))
    
    advantages = [
        ('Industry 5.0 Technology', 'First and only CRM with holographic and quantum intelligence capabilities'),
        ('Universal Migration', 'One-click migration from ANY CRM platform with zero data loss'),
        ('Deepest ERP Integration', '200+ ERP integration fields - the most comprehensive available'),
        ('AI-First Architecture', '10+ specialized AI services built-in from the ground up'),
        ('Military-Grade Security', 'Enterprise security with SOC 2 Type II compliance ready'),
        ('Immersive Sales', 'AR/VR sales experiences that transform customer engagement'),
        ('Quantum Intelligence', 'Next-generation customer insights with quantum computing'),
        ('Autonomous Workflows', 'Self-optimizing automation that learns and improves'),
        ('Comprehensive Data Model', '83 entities covering every aspect of customer relationships'),
        ('Enterprise Reliability', '99.9% uptime SLA with 24/7 support')
    ]
    
    for i, (title, desc) in enumerate(advantages, 1):
        adv_text = f'<b><font color="#0066cc" size="12">{i}. {title}</font></b><br/>{desc}'
        elements.append(Paragraph(adv_text, ParagraphStyle(
            'Advantage',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=12,
            leftIndent=10,
            borderWidth=1,
            borderColor=HexColor('#e6f2ff'),
            borderPadding=8,
            backColor=HexColor('#f9fcff')
        )))
    
    # ==================== CALL TO ACTION ====================
    elements.append(Spacer(1, 0.3*inch))
    
    cta_text = """
    <b><font size="16" color="#0066cc">Ready to Transform Your Business?</font></b><br/><br/>
    <font size="12">
    Schedule a demo today and experience the future of CRM.<br/><br/>
    <b>Contact our sales team:</b><br/>
    📧 sales@cognexiaai.com<br/>
    📞 +91-9167422630<br/>
    🌐 www.cognexiaai.com/demo<br/><br/>
    <i>Special offer: Get 3 months free with annual subscription!</i>
    </font>
    """
    
    elements.append(Paragraph(cta_text, ParagraphStyle(
        'CTA',
        parent=styles['Normal'],
        alignment=TA_CENTER,
        spaceAfter=20,
        borderWidth=3,
        borderColor=HexColor('#0066cc'),
        borderPadding=20,
        backColor=HexColor('#e6f2ff')
    )))
    
    # Build PDF with custom canvas
    doc.build(elements, canvasmaker=NumberedCanvas)
    
    print(f"✓ Professional sales brochure created: {pdf_file}")
    print(f"  - Cover page with key highlights")
    print(f"  - Executive summary with statistics")
    print(f"  - Complete feature list with formatting")
    print(f"  - Competitive advantages section")
    print(f"  - Call-to-action page")
    print(f"  - Professional headers and footers on every page")
    
    return pdf_file


if __name__ == '__main__':
    print("="*60)
    print("Creating CognexiaAI ERP Professional Sales Brochure")
    print("="*60)
    print()
    
    try:
        pdf_file = create_marketing_brochure()
        print()
        print("="*60)
        print("✓ Sales brochure generation complete!")
        print("="*60)
        print(f"\nFile created: {pdf_file}")
        print("\nThis brochure is ready for:")
        print("  • Sales presentations")
        print("  • Marketing campaigns") 
        print("  • Client proposals")
        print("  • Trade shows and events")
        print("  • Email marketing")
        print("  • Website downloads")
        
    except Exception as e:
        print(f"✗ Error creating brochure: {e}")
        import traceback
        traceback.print_exc()
