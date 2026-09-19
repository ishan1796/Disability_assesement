from app.rules.rule_engine import RuleEngine

def test_rule_engine_shoulder():
    engine = RuleEngine()
    result = engine.evaluate(
        joint="shoulder",
        movement_angles={"flexion": 126.0, "abduction": 110.0},
        questionnaire_answers={"pain_level": "Moderate", "can_raise_arm": "Partial"}
    )
    assert result["disability_percentage"] >= 0
    assert len(result["triggered_rules"]) > 0
    assert "OFFICIAL GAZETTE OF INDIA DISABILITY EVALUATION" in result["explanation"]
