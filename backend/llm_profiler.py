import os
import json
import pandas as pd
from groq import Groq

def profile_dataset_with_llm(df: pd.DataFrame) -> dict:
    """
    Uses the Groq LLM to deduce the target attribute and protected attribute 
    from the dataset schema and first few rows.
    """
    groq_api_key = os.environ.get("GROQ_API_KEY", "")
    if not groq_api_key:
        return {"target": None, "protected": None}
        
    try:
        client = Groq(api_key=groq_api_key)
        
        columns = list(df.columns)
        # Take up to 3 rows of sample data, filling NaNs so JSON doesn't break
        sample_data = df.head(3).fillna("").to_dict(orient="records")
        
        prompt = f"""
        You are an AI fairness auditing tool. Analyze the following dataset schema and sample rows.
        Determine:
        1. The 'target' attribute: The column representing the final decision, outcome, label, or prediction (e.g., 'hired', 'approved', 'selection', 'status', 'promoted').
        2. The 'protected' attribute: The column most likely to contain sensitive demographic groups (e.g., 'gender', 'race', 'age', 'department', 'region', 'ethnicity').
        
        Columns: {columns}
        Sample Data:
        {json.dumps(sample_data, indent=2)}
        
        Respond ONLY with a valid JSON object in this exact format:
        {{
          "target": "column_name",
          "protected": "column_name"
        }}
        If you cannot confidently determine a column, return null for that value. Do not return any other text.
        """
        
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=100,
            temperature=0.0
        )
        
        response_text = completion.choices[0].message.content
        result = json.loads(response_text)
        return {
            "target": result.get("target"),
            "protected": result.get("protected")
        }
    except Exception as e:
        print(f"LLM Profiling failed: {e}")
        return {"target": None, "protected": None}

def generate_executive_summary(analysis_data: dict) -> str:
    """
    Uses the Groq LLM to write a 1-paragraph executive summary for non-technical stakeholders.
    """
    groq_api_key = os.environ.get("GROQ_API_KEY", "")
    if not groq_api_key:
        return "Executive summary generation requires a valid Groq API key."
        
    try:
        client = Groq(api_key=groq_api_key)
        
        # Extract key metrics safely
        bias_scores = analysis_data.get("bias_scores", {})
        overall_bias = bias_scores.get("overall", "Unknown")
        alerts = bias_scores.get("alerts", [])
        recs = [r.get("action") for r in analysis_data.get("recommendations", [])]
        
        prompt = f"""
        You are an AI fairness auditing tool. Write a concise, 1-paragraph executive summary (max 4 sentences) for a non-technical HR or Compliance leader explaining the results of a bias audit.
        
        Overall Bias Score: {overall_bias}%
        Critical Alerts: {alerts}
        Key Recommendations: {recs}
        
        The summary should explain what the score means, highlight any critical risks (or state if it's safe), and suggest the next step based on the recommendations. DO NOT use technical jargon like "disparate impact ratio" or "statistical parity". Be professional and objective.
        """
        
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.3
        )
        
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"LLM Summary failed: {e}")
        return "An error occurred while generating the executive summary."
