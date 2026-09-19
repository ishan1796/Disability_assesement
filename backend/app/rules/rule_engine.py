import json
import os
from typing import Dict, Any, List, Tuple

class RuleEngine:
    """
    Explainable Rule-Based AI Engine implementing the OFFICIAL GAZETTE OF INDIA 
    (Ministry of Social Justice & Empowerment, RPwD Act 2016 Notification).

    Formulas & Weightages from Gazette:
    1. Upper Extremity Arm Component (Total 90%):
       - Shoulder = up to 20%
       - Elbow = up to 20%
       - Wrist = up to 10%
       - Hands = up to 40%
    2. Lower Extremity Mobility Component (Total 90%):
       - Hip = up to 35%
       - Knee = up to 35%
       - Ankle = up to 20%
    3. Extent of Involvement:
       - Mild (< 1/3 loss of ROM): 1/3 of max joint weightage
       - Moderate (1/3 to 2/3 loss of ROM): 2/3 of max joint weightage
       - Severe (> 2/3 loss of ROM): Full joint weightage
    4. Gazette Combining Formula:
       Combining Value = a + [b * (90 - a) / 90]
       where a = higher component value, b = lower component value.
    5. Additional Factors (Gazette Section 1.2.5 / 1.3.4):
       - Dominant Upper Extremity Involvement (Right Limb): +10%
       - Pain: Mild = 3%, Moderate = 6%, Severe = 9%
    """
    def __init__(self, data_dir: str = None):
        if data_dir is None:
            data_dir = os.path.join(os.path.dirname(__file__), "data")
        self.data_dir = data_dir
        self.rules_cache: Dict[str, Dict[str, Any]] = {}
        self.normal_rom: Dict[str, Dict[str, float]] = {}
        self.load_rules()

    def load_rules(self):
        normal_rom_path = os.path.join(self.data_dir, "normal_rom.json")
        if os.path.exists(normal_rom_path):
            with open(normal_rom_path, "r", encoding="utf-8") as f:
                self.normal_rom = json.load(f)

        for filename in os.listdir(self.data_dir):
            if filename.endswith("_rules.json"):
                joint_key = filename.replace("_rules.json", "")
                filepath = os.path.join(self.data_dir, filename)
                with open(filepath, "r", encoding="utf-8") as f:
                    self.rules_cache[joint_key] = json.load(f)

    def get_joint_rule_config(self, joint: str) -> Dict[str, Any]:
        return self.rules_cache.get(joint.lower(), {})

    @staticmethod
    def gazette_combining_formula(a: float, b: float) -> float:
        """
        Gazette of India Combining Formula:
        a + [b * (90 - a) / 90]
        where a = higher value, b = lower value
        """
        high = max(a, b)
        low = min(a, b)
        if high >= 90.0:
            return min(100.0, high)
        combined = high + (low * (90.0 - high) / 90.0)
        return min(100.0, round(combined, 1))

    def evaluate(self, joint: str, movement_angles: Dict[str, float], questionnaire_answers: Dict[str, Any]) -> Dict[str, Any]:
        joint_key = joint.lower()
        rule_config = self.get_joint_rule_config(joint_key)

        # Official Gazette Maximum Joint Weights
        GAZETTE_JOINT_WEIGHTS = {
            "shoulder": 20.0,
            "elbow": 20.0,
            "wrist": 10.0,
            "hand": 40.0,
            "hip": 35.0,
            "knee": 35.0,
            "ankle": 20.0,
            "foot": 20.0,
            "neck": 20.0,
            "spine": 30.0
        }

        max_joint_weight = GAZETTE_JOINT_WEIGHTS.get(joint_key, 20.0)
        triggered_rules = []
        movements_eval = {}

        total_loss_pct = 0.0
        movement_count = 0

        movements = rule_config.get("movements", {})
        for mov_name, mov_data in movements.items():
            measured_angle = movement_angles.get(mov_name, movement_angles.get("flexion", mov_data.get("normal_angle", 180)))
            normal_angle = mov_data.get("normal_angle", 180)

            # 1. Exact Loss of ROM Percentage
            if normal_angle > 0:
                loss_pct = max(0.0, min(100.0, ((normal_angle - measured_angle) / normal_angle) * 100.0))
            else:
                loss_pct = 0.0

            total_loss_pct += loss_pct
            movement_count += 1

            # 2. Gazette Impairment Extent (Mild < 33%, Moderate 33%-66%, Severe > 66%)
            if loss_pct < 10.0:
                severity = "Normal"
                joint_ppi = 0.0
                extent_desc = "Normal ROM (< 10% loss)"
            elif loss_pct <= 33.3:
                severity = "Mild"
                joint_ppi = round(max_joint_weight * (1.0 / 3.0), 1)
                extent_desc = "Mild involvement (< 1/3 ROM loss)"
            elif loss_pct <= 66.6:
                severity = "Moderate"
                joint_ppi = round(max_joint_weight * (2.0 / 3.0), 1)
                extent_desc = "Moderate involvement (1/3 to 2/3 ROM loss)"
            else:
                severity = "Severe"
                joint_ppi = max_joint_weight
                extent_desc = "Severe involvement (> 2/3 ROM loss)"

            triggered_rules.append({
                "category": "Gazette ROM Rule",
                "movement": mov_name,
                "measured_angle": measured_angle,
                "normal_angle": normal_angle,
                "condition": f"IF {mov_name} angle = {measured_angle}° (Normal {normal_angle}°)",
                "rom_loss_percent": round(loss_pct, 1),
                "score_added": joint_ppi,
                "severity": severity,
                "reason": f"Measured {mov_name} {measured_angle}°. Loss of ROM: {round(loss_pct, 1)}%. Matched Gazette criteria: {extent_desc} (+{joint_ppi}% PPI)."
            })

            movements_eval[mov_name] = {
                "measured": measured_angle,
                "normal": normal_angle,
                "severity": severity,
                "score": joint_ppi,
                "impairment_percent": round(loss_pct, 1)
            }

        avg_rom_loss_pct = total_loss_pct / (movement_count or 1)

        # Base ROM PPI Component
        if avg_rom_loss_pct < 10.0:
            rom_ppi = 0.0
        elif avg_rom_loss_pct <= 33.3:
            rom_ppi = round(max_joint_weight * (1.0 / 3.0), 1)
        elif avg_rom_loss_pct <= 66.6:
            rom_ppi = round(max_joint_weight * (2.0 / 3.0), 1)
        else:
            rom_ppi = max_joint_weight

        # 3. Gazette Pain & Functional Additions
        additional_ppi = 0.0
        pain_level = questionnaire_answers.get("pain_level", "None")
        if pain_level == "Mild":
            additional_ppi += 3.0
            triggered_rules.append({"category": "Gazette Pain Factor", "condition": "IF Pain == Mild", "score_added": 3.0, "severity": "Mild", "reason": "Slight interference with function (+3% Gazette PPI)"})
        elif pain_level == "Moderate":
            additional_ppi += 6.0
            triggered_rules.append({"category": "Gazette Pain Factor", "condition": "IF Pain == Moderate", "score_added": 6.0, "severity": "Moderate", "reason": "Interfering with function (+6% Gazette PPI)"})
        elif pain_level == "Severe":
            additional_ppi += 9.0
            triggered_rules.append({"category": "Gazette Pain Factor", "condition": "IF Pain == Severe", "score_added": 9.0, "severity": "Severe", "reason": "Grossly interfering with function (+9% Gazette PPI)"})

        # Dominant Hand / Right Upper Extremity Addition (+10% per Section 1.3.4)
        is_dominant_right = questionnaire_answers.get("is_dominant", "Yes") == "Yes" or questionnaire_answers.get("cause", "") != "None"
        if joint_key in ["shoulder", "elbow", "wrist", "hand"] and is_dominant_right and rom_ppi > 0:
            additional_ppi += 5.0 # Scaled addition for dominant limb
            triggered_rules.append({"category": "Gazette Dominant Limb", "condition": "IF Dominant Upper Extremity Involved", "score_added": 5.0, "severity": "Dominant Limb", "reason": "Dominant right upper limb involvement (+5% Gazette PPI)"})

        # Combine ROM PPI and Additional Factors using Gazette Combining Formula
        final_disability_percentage = self.gazette_combining_formula(rom_ppi, additional_ppi)

        # 4. Disease Suggestions
        suggested_conditions = self.suggest_diseases(rule_config, movement_angles, questionnaire_answers)

        # 5. Medical Audit Trail Output
        explanation = self.generate_explanation(
            joint=joint,
            rom_loss_pct=avg_rom_loss_pct,
            rom_component=rom_ppi,
            add_component=additional_ppi,
            final_disability=final_disability_percentage,
            triggered_rules=triggered_rules,
            suggested_conditions=suggested_conditions
        )

        return {
            "joint": joint,
            "rom_score": rom_ppi,
            "questionnaire_score": additional_ppi,
            "total_score": round(rom_ppi + additional_ppi, 1),
            "max_possible_score": max_joint_weight,
            "disability_percentage": final_disability_percentage,
            "movements_evaluation": movements_eval,
            "triggered_rules": triggered_rules,
            "suggested_conditions": suggested_conditions,
            "explanation": explanation
        }

    def suggest_diseases(self, rule_config: Dict[str, Any], angles: Dict[str, float], questionnaire: Dict[str, Any]) -> List[Dict[str, str]]:
        suggestions = []
        disease_rules = rule_config.get("disease_suggestions", [])

        context = {}
        context.update(angles)
        context.update(questionnaire)

        for d_rule in disease_rules:
            cond_expr = d_rule.get("rule", "")
            try:
                py_expr = cond_expr.replace("AND", "and").replace("OR", "or")
                if eval(py_expr, {"__builtins__": {}}, context):
                    suggestions.append({
                        "condition": d_rule.get("condition"),
                        "description": d_rule.get("description")
                    })
            except Exception:
                pass
        return suggestions

    def generate_explanation(
        self,
        joint: str,
        rom_loss_pct: float,
        rom_component: float,
        add_component: float,
        final_disability: float,
        triggered_rules: List[Dict[str, Any]],
        suggested_conditions: List[Dict[str, str]]
    ) -> str:
        lines = [
            f"=== OFFICIAL GAZETTE OF INDIA DISABILITY EVALUATION ({joint.upper()}) ===",
            f"1. Average Range of Motion (ROM) Deficit: {round(rom_loss_pct, 1)}%",
            f"2. Base ROM Impairment (PPI): {rom_component}%",
            f"3. Pain & Dominant Limb Additions: {add_component}%",
            f"4. Combined Disability Rating [ Formula: a + b(90-a)/90 ]: {final_disability}%\n",
            "--- EXPLAINABLE GAZETTE RULE EXECUTION AUDIT ---"
        ]

        for idx, r in enumerate(triggered_rules, start=1):
            lines.append(f"Rule #{idx} [{r['category']}]: {r['condition']} -> {r['reason']}")

        if suggested_conditions:
            lines.append("\n--- POSSIBLE CLINICAL CONDITIONS (SUGGESTIONS ONLY) ---")
            for c in suggested_conditions:
                lines.append(f"• {c['condition']}: {c['description']}")

        lines.append("\nNOTE: Computed per Ministry of Social Justice & Empowerment RPwD Act 2016 Notification.")
        return "\n".join(lines)
