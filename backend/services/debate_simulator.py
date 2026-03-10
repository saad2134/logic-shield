from typing import Dict, List, Optional
import random


PERSONAS = {
    "logical": {
        "name": "Logical Challenger",
        "description": "Uses reason and evidence to counter arguments",
        "style": "focuses on facts, logic, and evidence-based reasoning",
        "prompt_prefix": "Present a well-reasoned counter-argument using logical analysis and evidence."
    },
    "aggressive": {
        "name": "Aggressive Debater",
        "description": "Uses confrontational tactics to test debate skills",
        "style": "challenges assumptions and uses direct language",
        "prompt_prefix": "Present a strong, direct counter-argument that challenges the core assumptions."
    },
    "skeptical": {
        "name": "Skeptic",
        "description": "Questions everything and demands proof",
        "style": "asks probing questions and demands evidence",
        "prompt_prefix": "Present skeptical counter-arguments by questioning the claims and demanding evidence."
    },
    "devil_advocate": {
        "name": "Devil's Advocate",
        "description": "Argues the opposite extreme position",
        "style": "takes extreme positions to test robustness of arguments",
        "prompt_prefix": "Present an opposing viewpoint that challenges the argument from the opposite extreme."
    }
}


class DebateSimulator:
    def __init__(self):
        self.personas = PERSONAS
        self.argument_bank = self._initialize_argument_bank()
    
    def _initialize_argument_bank(self) -> Dict[str, List[str]]:
        return {
            "evidence_based": [
                "However, research shows that {evidence}.",
                "Studies have demonstrated that {evidence}.",
                "According to data, {evidence}.",
                "The evidence suggests otherwise: {evidence}.",
            ],
            "logical_challenges": [
                "This argument assumes {assumption}, but what about {counter}?",
                "If {premise}, then {conclusion} - but this doesn't account for {factor}.",
                "The logical gap here is {gap}.",
                "This reasoning overlooks {oversight}.",
            ],
            "questions": [
                "But have you considered {consideration}?",
                "What about {alternative}?",
                "How do you explain {evidence}?",
                "Why do you believe {claim} without {requirement}?",
            ],
            "counter_examples": [
                "Consider the case of {example}, which demonstrates {point}.",
                "A counter-example would be {example}.",
                "History shows {example}, which contradicts this.",
                "In contrast, {example} illustrates the opposite.",
            ]
        }
    
    def generate_counter_argument(
        self,
        topic: str,
        user_argument: str,
        user_stance: str,
        persona: str = "logical",
        context: str = ""
    ) -> str:
        persona_config = self.personas.get(persona, self.personas["logical"])
        
        counter_arg = self._build_counter_argument(
            topic=topic,
            user_argument=user_argument,
            user_stance=user_stance,
            persona_config=persona_config,
            context=context
        )
        
        return counter_arg
    
    def _build_counter_argument(
        self,
        topic: str,
        user_argument: str,
        user_stance: str,
        persona_config: Dict,
        context: str
    ) -> str:
        argument_type = random.choice([
            "evidence_based",
            "logical_challenges", 
            "questions",
            "counter_examples"
        ])
        
        template = random.choice(self.argument_bank[argument_type])
        
        replacements = {
            "evidence": f"this position has significant limitations when applied to {topic}",
            "assumption": "this is the only valid approach",
            "counter": "alternative perspectives",
            "factor": "practical implementation challenges",
            "gap": "between the premise and conclusion",
            "consideration": "alternative viewpoints on this matter",
            "alternative": "the opposite perspective",
            "requirement": "substantial proof",
            "example": "contrary evidence in similar situations",
            "point": "why this position may be flawed",
            "oversight": "key contextual factors"
        }
        
        for key, value in replacements.items():
            template = template.replace(f"{{{key}}}", value)
        
        opening = self._get_persona_opening(persona_config["name"])
        
        counter_argument = f"{opening} {template}"
        
        if len(counter_argument) < 50:
            counter_argument = f"{opening} While your point about {topic} is valid, there are several counter-arguments to consider. First, the evidence doesn't fully support this position. Second, alternative interpretations exist. Third, practical implementation shows challenges."
        
        return counter_argument
    
    def _get_persona_opening(self, persona_name: str) -> str:
        openings = {
            "Logical Challenger": "That's an interesting perspective,",
            "Aggressive Debater": "Let me challenge that directly:",
            "Skeptic": "I'd like to question this further:",
            "Devil's Advocate": "From the opposing viewpoint:"
        }
        return openings.get(persona_name, "I would counter that:")
    
    def generate_debate_intro(
        self,
        topic: str,
        user_stance: str,
        persona: str = "logical"
    ) -> str:
        persona_config = self.personas.get(persona, self.personas["logical"])
        
        stances = {
            "support": "in favor of",
            "oppose": "against",
            "neutral": "discussing"
        }
        
        stance_text = stances.get(user_stance, "discussing")
        
        intro = f"""I'm ready to debate on: **{topic}**

As the {persona_config['name']}, I will {persona_config['style']}.

You're presenting arguments {stance_text} this topic. Let's begin!

What is your first argument?"""
        
        return intro
    
    def get_available_personas(self) -> List[Dict]:
        return [
            {
                "id": key,
                "name": config["name"],
                "description": config["description"]
            }
            for key, config in self.personas.items()
        ]
    
    def suggest_improvements(self, argument: str, analysis: Dict) -> List[str]:
        suggestions = []
        
        if analysis.get("fallacy_detected"):
            fallacies = analysis["fallacy_detected"]
            suggestions.append(f"Consider addressing the potential {', '.join(fallacies)} issues in your argument.")
        
        strength = analysis.get("argument_strength", 0)
        if strength < 0.5:
            suggestions.append("Strengthen your argument with more evidence or examples.")
        
        if analysis.get("reputation_risk_level") in ["high", "critical"]:
            suggestions.append("Consider moderating your language to reduce potential backlash.")
        
        if not suggestions:
            suggestions.append("Your argument is well-structured! Keep refining your debate skills.")
        
        return suggestions
