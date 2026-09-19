from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ....rules.rule_engine import RuleEngine

router = APIRouter()
rule_engine = RuleEngine()

@router.get("/")
def list_available_rules():
    """Returns list of configured joint rule definitions."""
    return {"joints": list(rule_engine.rules_cache.keys())}

@router.get("/{joint}")
def get_joint_rules(joint: str):
    """Returns exact JSON rule configuration for specified joint."""
    config = rule_engine.get_joint_rule_config(joint)
    if not config:
        raise HTTPException(status_code=404, detail=f"No rules found for joint '{joint}'")
    return config
