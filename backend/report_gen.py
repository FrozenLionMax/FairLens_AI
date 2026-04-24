from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def generate_pdf(data, filename="FairLens_Certified_Audit.pdf"):
    doc = SimpleDocTemplate(str(filename), pagesize=letter, rightMargin=40, leftMargin=40, topMargin=42, bottomMargin=36)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("FAIRLENS AI - CERTIFIED FAIRNESS AUDIT", styles["Title"]))
    story.append(Paragraph(f"Audit Hash: {data['audit_hash']} | Timestamp: {data['timestamp']}", styles["Normal"]))
    story.append(Spacer(1, 16))

    summary = data["dataset_summary"]
    story.append(Paragraph("Dataset Summary", styles["Heading2"]))
    story.append(_table([
        ["Rows", summary["rows"]],
        ["Columns", summary["columns"]],
        ["Protected Attribute", summary["protected_attribute"]],
        ["Decision Attribute", summary["target_attribute"]],
    ]))
    story.append(Spacer(1, 12))

    quality = data.get("dataset_quality", {})
    story.append(Paragraph("Dataset Quality", styles["Heading2"]))
    story.append(_table([
        ["Quality Score", f"{quality.get('quality_score', 0)}/100"],
        ["Rows Removed During Cleaning", quality.get("rows_removed", 0)],
        ["Null Cells", quality.get("null_cells", 0)],
        ["Duplicate Rows", quality.get("duplicate_rows", 0)],
        ["Positive Decision Rate", f"{quality.get('positive_decision_rate', 0)}%"],
    ]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Before / After Fairness Metrics", styles["Heading2"]))
    story.append(_table([
        ["Metric", "Original Bias", "Mitigated"],
        ["Fairness Score", f"{data['original']['score']}/100", f"{data['mitigated']['score']}/100"],
        ["Privileged Selection Rate", f"{data['original']['majority_rate']}%", f"{data['mitigated']['majority_rate']}%"],
        ["Unprivileged Selection Rate", f"{data['original']['minority_rate']}%", f"{data['mitigated']['minority_rate']}%"],
        ["Disparate Impact Ratio", data["original"]["di_ratio"], data["mitigated"]["di_ratio"]],
        ["Statistical Parity Difference", data["original"]["statistical_parity_difference"], data["mitigated"]["statistical_parity_difference"]],
    ], header=True))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Active Mitigation Engine", styles["Heading2"]))
    story.append(Paragraph(
        f"Proxy detected: {data['proxy_detected']['feature']} "
        f"({data['proxy_detected']['correlation']}% correlation). "
        f"What-if result: +{data['what_if']['fairness_improvement']} fairness points.",
        styles["Normal"],
    ))
    story.append(Spacer(1, 12))

    scan = data.get("protected_attribute_scan", [])
    if scan:
        story.append(Paragraph("Multi-Attribute Bias Scan", styles["Heading2"]))
        rows = [["Attribute", "DI Ratio", "Score", "Severity"]]
        rows.extend([[item["attribute"], item["di_ratio"], item["score"], item["severity"]] for item in scan])
        story.append(_table(rows, header=True))
        story.append(Spacer(1, 12))

    methodology = data.get("methodology", {})
    if methodology:
        story.append(Paragraph("AIF360-Inspired Methodology", styles["Heading2"]))
        story.append(Paragraph(methodology.get("standard", "Fairness audit methodology"), styles["Normal"]))
        story.append(Paragraph(f"Active method: {methodology.get('active_method', 'N/A')}", styles["Normal"]))
        story.append(Paragraph(f"Reference: {methodology.get('source', 'N/A')}", styles["Normal"]))
        story.append(Spacer(1, 12))

    story.append(Paragraph("Alerts", styles["Heading2"]))
    for alert in data["alerts"]:
        story.append(Paragraph(f"- {alert}", styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Recommendations", styles["Heading2"]))
    for recommendation in data["recommendations"]:
        story.append(Paragraph(f"- {recommendation}", styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Final Verdict", styles["Heading2"]))
    story.append(Paragraph(data["final_verdict"], styles["Normal"]))
    story.append(Paragraph("We are not replacing AI. We are making AI accountable.", styles["Italic"]))

    doc.build(story)
    return str(filename)


def _table(rows, header=False):
    table = Table(rows, hAlign="LEFT", colWidths=[190, 150, 150] if header else [190, 300])
    style = [
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#334155")),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a") if header else colors.HexColor("#e2e8f0")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white if header else colors.black),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
    ]
    table.setStyle(TableStyle(style))
    return table
