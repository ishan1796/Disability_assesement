import os
import io
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)

class PDFReportGenerator:
    """
    Generates professional, printable PDF Orthopaedic Disability Assessment Reports and Questionnaires using ReportLab.
    """

    @staticmethod
    def generate_assessment_report(data: Dict[str, Any]) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#475569'),
            spaceAfter=12
        )
        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=colors.HexColor('#1E3A8A'),
            spaceBefore=10,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor('#1E293B')
        )
        table_header = ParagraphStyle(
            'TableHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=11,
            textColor=colors.white
        )
        table_cell = ParagraphStyle(
            'TableCell',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor('#0F172A')
        )
        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#64748B')
        )

        elements = []

        # 1. Header
        elements.append(Paragraph("ORTHOPAEDIC DISABILITY ASSESSMENT REPORT", title_style))
        elements.append(Paragraph("AI-Assisted Explainable Motion & Rule-Based Disability Evaluation System", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563EB'), spaceAfter=12))

        # 2. Patient Info
        patient_info = [
            [
                Paragraph("<b>Patient ID:</b> " + str(data.get("patient_id", "N/A")), body_style),
                Paragraph("<b>Assessment Date:</b> " + datetime.now().strftime("%Y-%m-%d %H:%M"), body_style)
            ],
            [
                Paragraph("<b>Body Region:</b> " + str(data.get("body_region", "N/A")), body_style),
                Paragraph("<b>Joint & Side:</b> " + str(data.get("selected_joint", "N/A")).title() + " (" + str(data.get("body_side", "N/A")).title() + ")", body_style)
            ],
            [
                Paragraph("<b>Session ID:</b> " + str(data.get("session_uuid", "N/A")[:8]), body_style),
                Paragraph("<b>Assessment Type:</b> MediaPipe Pose + Gazette Rule Engine", body_style)
            ]
        ]
        meta_table = Table(patient_info, colWidths=[270, 270])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 10))

        # 3. Overall Disability Score Card Banner
        disability_pct = data.get("disability_percentage", 0.0)
        card_bg = colors.HexColor('#FEF2F2') if disability_pct >= 40 else (colors.HexColor('#FEFCE8') if disability_pct >= 15 else colors.HexColor('#F0FDF4'))
        card_border = colors.HexColor('#EF4444') if disability_pct >= 40 else (colors.HexColor('#EAB308') if disability_pct >= 15 else colors.HexColor('#22C55E'))

        score_text = f"<b>Estimated Orthopaedic Disability Rating: {disability_pct}%</b>"
        sub_score_text = f"ROM Score: {data.get('rom_score', 0)}% | Questionnaire Additions: {data.get('questionnaire_score', 0)}% | Joint Max Limit: {data.get('max_possible_score', 20)}%"

        score_banner = Table([
            [Paragraph(f"<font size=14 color='{card_border.hexval()}'>{score_text}</font>", body_style)],
            [Paragraph(sub_score_text, body_style)]
        ], colWidths=[540])
        score_banner.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), card_bg),
            ('BOX', (0, 0), (-1, -1), 1.5, card_border),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER')
        ]))
        elements.append(score_banner)
        elements.append(Spacer(1, 12))

        # 4. Joint Range of Motion Table
        elements.append(Paragraph("1. Joint Range of Motion (ROM) Analysis", section_heading))
        rom_rows = [[
            Paragraph("Movement", table_header),
            Paragraph("Measured Angle", table_header),
            Paragraph("Normal Reference", table_header),
            Paragraph("Impairment %", table_header),
            Paragraph("Severity", table_header)
        ]]

        movements_eval = data.get("movements_evaluation", {})
        for mov_name, mov_data in movements_eval.items():
            rom_rows.append([
                Paragraph(mov_name.replace("_", " ").title(), table_cell),
                Paragraph(f"{mov_data.get('measured', 0)}°", table_cell),
                Paragraph(f"{mov_data.get('normal', 0)}°", table_cell),
                Paragraph(f"{mov_data.get('impairment_percent', 0)}%", table_cell),
                Paragraph(mov_data.get('severity', 'Normal'), table_cell)
            ])

        rom_table = Table(rom_rows, colWidths=[130, 100, 110, 100, 100])
        rom_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(rom_table)
        elements.append(Spacer(1, 12))

        # 5. Triggered Rules
        elements.append(Paragraph("2. Triggered Rule Engine Execution Log", section_heading))
        rule_rows = [[
            Paragraph("Category", table_header),
            Paragraph("Evaluated IF-THEN Condition", table_header),
            Paragraph("Severity / Reason", table_header),
            Paragraph("Points", table_header)
        ]]

        for r in data.get("triggered_rules", []):
            rule_rows.append([
                Paragraph(r.get("category", "Rule"), table_cell),
                Paragraph(r.get("condition", ""), table_cell),
                Paragraph(r.get("reason", ""), table_cell),
                Paragraph(f"+{r.get('score_added', 0)}", table_cell)
            ])

        rule_table = Table(rule_rows, colWidths=[80, 210, 190, 60])
        rule_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F766E')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(rule_table)
        elements.append(Spacer(1, 12))

        # 6. Possible Conditions
        suggested = data.get("suggested_conditions", [])
        if suggested:
            elements.append(Paragraph("3. Rule-Suggested Clinical Conditions (Non-Diagnostic)", section_heading))
            sug_rows = []
            for s in suggested:
                sug_rows.append([
                    Paragraph(f"• <b>{s.get('condition')}</b>", body_style),
                    Paragraph(s.get("description", ""), body_style)
                ])
            sug_table = Table(sug_rows, colWidths=[200, 340])
            sug_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
                ('PADDING', (0, 0), (-1, -1), 4),
            ]))
            elements.append(sug_table)
            elements.append(Spacer(1, 12))

        # 7. Recommendations
        elements.append(Paragraph("4. Recommendations & Legal Disclaimer", section_heading))
        recs = Paragraph(
            "• Patient should follow up with a certified Orthopaedic Surgeon / Physical Therapist for formal clinical correlation.<br/>"
            "• Controlled physical therapy exercises recommended to improve Range of Motion.<br/>"
            "• Periodic re-assessment is advised after 4-6 weeks of conservative rehabilitation.",
            body_style
        )
        elements.append(recs)
        elements.append(Spacer(1, 10))

        disclaimer = Paragraph(
            "<b>DISCLAIMER:</b> This assessment report is generated by an Explainable AI system using computer vision pose tracking and RPwD Act 2016 Gazette rule logic. "
            "It does NOT constitute a final medical diagnosis or legal disability certificate. All findings must be validated by a licensed physician.",
            disclaimer_style
        )
        elements.append(disclaimer)

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_questionnaires_pdf(questionnaires_data: Dict[str, List[Dict[str, Any]]]) -> bytes:
        """
        Generates a clean PDF document listing all joint questionnaires, options, and Gazette PPI rule impacts.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor('#475569'),
            spaceAfter=12
        )
        joint_heading = ParagraphStyle(
            'JointHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=15,
            textColor=colors.HexColor('#1E3A8A'),
            spaceBefore=10,
            spaceAfter=6
        )
        table_header = ParagraphStyle(
            'TableHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=10,
            textColor=colors.white
        )
        table_cell = ParagraphStyle(
            'TableCell',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#0F172A')
        )

        elements = []

        # Title Header
        elements.append(Paragraph("RPwD ACT 2016 - FUNCTIONAL IMPACT QUESTIONNAIRES DATABASE", title_style))
        elements.append(Paragraph("Official Clinical Questionnaires & Gazette PPI Rule Scoring Reference", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563EB'), spaceAfter=10))

        for joint_name, q_list in questionnaires_data.items():
            elements.append(Paragraph(f"Target Joint / Region: {joint_name.upper()}", joint_heading))

            table_rows = [[
                Paragraph("Question ID", table_header),
                Paragraph("Question Text", table_header),
                Paragraph("Available Options", table_header),
                Paragraph("Gazette Rule Impact", table_header)
            ]]

            for q in q_list:
                options_str = ", ".join(q.get("options", []))
                
                # Rule impact mapping string
                if q["id"] == "pain_level":
                    impact_str = "Mild (+3%), Moderate (+6%), Severe (+9%)"
                elif q["id"] == "can_raise_arm":
                    impact_str = "Yes (0%), Partial (+4.5%), No (+9.0%)"
                elif q["id"] in ["can_lift_weight", "can_comb_hair", "can_wear_clothes"]:
                    impact_str = "Yes (0%), No (+4.5%)"
                elif q["id"] == "can_bend_arm":
                    impact_str = "Yes (0%), Partial (+4.5%), No (+9.0%)"
                elif q["id"] == "can_squat" or q["id"] == "can_climb_stairs":
                    impact_str = "Yes (0%), Partial (+5%), No (+10%)"
                elif q["id"] == "can_walk_unassisted":
                    impact_str = "Yes (0%), No (+10%)"
                elif q["id"] == "radiation_to_arm" or q["id"] == "radiation_to_leg":
                    impact_str = "No (0%), Yes (+8%)"
                elif q["id"] == "foot_drop_tendency":
                    impact_str = "No (0%), Yes (+10%)"
                else:
                    impact_str = "Clinical Etiology Record"

                table_rows.append([
                    Paragraph(q.get("id", ""), table_cell),
                    Paragraph(q.get("question", ""), table_cell),
                    Paragraph(options_str, table_cell),
                    Paragraph(impact_str, table_cell)
                ])

            q_table = Table(table_rows, colWidths=[80, 180, 160, 120])
            q_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
                ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
                ('PADDING', (0, 0), (-1, -1), 5),
            ]))
            elements.append(q_table)
            elements.append(Spacer(1, 10))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
