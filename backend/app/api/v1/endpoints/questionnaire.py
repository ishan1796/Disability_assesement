from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

router = APIRouter()

QUESTIONNAIRE_DATABASE: Dict[str, List[Dict[str, Any]]] = {
    "shoulder": [
        {"id": "cause", "question": "Was condition caused by?", "type": "select", "options": ["Birth", "Accident", "Surgery", "Sports Injury", "Degenerative", "None"]},
        {"id": "pain_level", "question": "Current pain level in shoulder?", "type": "select", "options": ["None", "Mild", "Moderate", "Severe"]},
        {"id": "can_raise_arm", "question": "Can you raise your arm overhead?", "type": "select", "options": ["Yes", "Partial", "No"]},
        {"id": "can_lift_weight", "question": "Can you lift a 2kg weight sideways?", "type": "select", "options": ["Yes", "No"]},
        {"id": "can_comb_hair", "question": "Can you comb your hair independently?", "type": "select", "options": ["Yes", "No"]},
        {"id": "can_wear_clothes", "question": "Can you dress / wear a shirt without help?", "type": "select", "options": ["Yes", "No"]}
    ],
    "elbow": [
        {"id": "cause", "question": "Was condition caused by?", "type": "select", "options": ["Trauma", "Surgery", "Repetitive Strain", "None"]},
        {"id": "pain_level", "question": "Pain level when flexing elbow?", "type": "select", "options": ["None", "Mild", "Moderate", "Severe"]},
        {"id": "can_bend_arm", "question": "Can you fully bend arm to touch shoulder?", "type": "select", "options": ["Yes", "Partial", "No"]},
        {"id": "can_carry_objects", "question": "Can you carry a cup or bag with arm extended?", "type": "select", "options": ["Yes", "No"]},
        {"id": "can_touch_face", "question": "Can you bring hand to face for eating?", "type": "select", "options": ["Yes", "No"]}
    ],
    "knee": [
        {"id": "cause", "question": "Onset / cause of knee pain?", "type": "select", "options": ["Ligament Tear", "Arthritis", "Meniscus Injury", "Trauma", "None"]},
        {"id": "pain_level", "question": "Pain level while standing or walking?", "type": "select", "options": ["None", "Mild", "Moderate", "Severe"]},
        {"id": "can_squat", "question": "Can you perform a deep squat?", "type": "select", "options": ["Yes", "Partial", "No"]},
        {"id": "can_climb_stairs", "question": "Can you negotiate stairs without handrail support?", "type": "select", "options": ["Yes", "Partial", "No"]},
        {"id": "can_walk_unassisted", "question": "Can you walk 100 meters unassisted?", "type": "select", "options": ["Yes", "No"]}
    ],
    "hip": [
        {"id": "cause", "question": "Cause of hip impairment?", "type": "select", "options": ["Osteoarthritis", "AVN", "Trauma/Fracture", "None"]},
        {"id": "pain_level", "question": "Hip pain severity during movement?", "type": "select", "options": ["None", "Mild", "Moderate", "Severe"]},
        {"id": "can_sit_comfortably", "question": "Can you sit in a standard chair for 30 minutes?", "type": "select", "options": ["Yes", "Partial", "No"]},
        {"id": "can_walk_distance", "question": "Can you walk without limp or cane?", "type": "select", "options": ["Yes", "Partial", "No"]}
    ],
    "ankle": [
        {"id": "cause", "question": "Ankle condition cause?", "type": "select", "options": ["Sprain/Fracture", "Nerve Injury", "Tendinitis", "None"]},
        {"id": "pain_level", "question": "Ankle weight-bearing pain?", "type": "select", "options": ["None", "Mild", "Moderate", "Severe"]},
        {"id": "can_walk_heel_toe", "question": "Can you perform heel-to-toe gait walk?", "type": "select", "options": ["Yes", "Partial", "No"]},
        {"id": "foot_drop_tendency", "question": "Do you experience foot dragging / foot drop?", "type": "select", "options": ["No", "Yes"]}
    ],
    "neck": [
        {"id": "cause", "question": "Cervical neck condition onset?", "type": "select", "options": ["Whiplash/Trauma", "Disc Herniation", "Postural", "None"]},
        {"id": "pain_level", "question": "Neck pain level?", "type": "select", "options": ["None", "Mild", "Moderate", "Severe"]},
        {"id": "radiation_to_arm", "question": "Do you experience tingling/radiation into fingers?", "type": "select", "options": ["No", "Yes"]},
        {"id": "can_turn_head", "question": "Can you check shoulder blind-spots while driving?", "type": "select", "options": ["Yes", "Partial", "No"]}
    ],
    "spine": [
        {"id": "cause", "question": "Spine condition cause?", "type": "select", "options": ["Disc Herniation", "Scoliosis/Kyphosis", "Spinal Stenosis", "None"]},
        {"id": "pain_level", "question": "Lower back pain level?", "type": "select", "options": ["None", "Mild", "Moderate", "Severe"]},
        {"id": "can_bend_forward", "question": "Can you bend forward to touch knees/toes?", "type": "select", "options": ["Yes", "Partial", "No"]},
        {"id": "radiation_to_leg", "question": "Do you have leg numbness or sciatica radiation?", "type": "select", "options": ["No", "Yes"]}
    ]
}

@router.get("/{joint}")
def get_questionnaire_for_joint(joint: str):
    """Returns functional questionnaire schema for specified joint."""
    q = QUESTIONNAIRE_DATABASE.get(joint.lower())
    if not q:
        # Generic fallback
        return [
            {"id": "pain_level", "question": "Pain level in joint?", "type": "select", "options": ["None", "Mild", "Moderate", "Severe"]},
            {"id": "functional_impact", "question": "Does it restrict daily activities?", "type": "select", "options": ["No", "Partial", "Yes"]}
        ]
    return q
