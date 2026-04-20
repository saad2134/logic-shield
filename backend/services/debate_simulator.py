from typing import Dict, List, Optional
import random
import logging

logger = logging.getLogger(__name__)


PERSONAS = {
    "logical": {
        "name": "Logical Challenger",
        "description": "Uses reason and evidence to counter arguments",
        "style": "focuses on facts, logic, and evidence-based reasoning",
        "prompt_prefix": "Present a well-reasoned counter-argument using logical analysis and evidence.",
    },
    "aggressive": {
        "name": "Aggressive Debater",
        "description": "Uses confrontational tactics to test debate skills",
        "style": "challenges assumptions and uses direct language",
        "prompt_prefix": "Present a strong, direct counter-argument that challenges the core assumptions.",
    },
    "skeptical": {
        "name": "Skeptic",
        "description": "Questions everything and demands proof",
        "style": "asks probing questions and demands evidence",
        "prompt_prefix": "Present skeptical counter-arguments by questioning the claims and demanding evidence.",
    },
    "devil_advocate": {
        "name": "Devil's Advocate",
        "description": "Argues the opposite extreme position",
        "style": "takes extreme positions to test robustness of arguments",
        "prompt_prefix": "Present an opposing viewpoint that challenges the argument from the opposite extreme.",
    },
}


class DebateSimulator:
    def __init__(self):
        self.personas = PERSONAS
        self.argument_bank = self._initialize_argument_bank()

    def _initialize_argument_bank(self) -> Dict[str, List[str]]:
        return {
            "evidence_based": [
                "However, empirical evidence shows that {evidence}.",
                "Multiple studies have demonstrated that {evidence}.",
                "Recent data suggests {evidence}.",
                "Research indicates {evidence}.",
            ],
            "logical_challenges": [
                "This assumes {assumption}, but what about {counter}?",
                "Your argument doesn't account for {factor}.",
                "There's a logical gap: {gap}.",
                "This reasoning overlooks {oversight}.",
            ],
            "questions": [
                "But have you considered the opposite view?",
                "What about alternative solutions?",
                "How do you account for the evidence against this?",
                "What sources support this claim?",
            ],
            "counter_examples": [
                "Consider how {example}.",
                "A counter-example: {example}.",
                "History shows that {example}.",
                "In contrast, consider {example}.",
            ],
            "support_counter": [
                "While your concern is valid, have you considered the benefits? {topic} has also provided significant advantages.",
                "That's a fair point, but evidence shows mixed outcomes. Can you cite specific data?",
                "Your argument relies on {gap}. What about cases where this doesn't apply?",
            ],
            "oppose_counter": [
                "I understand your concern, but solutions exist. {topic} can be made safer with proper regulation.",
                "That's one perspective. However, complete prohibition would mean losing {benefit}.",
                "Your concern about {risk} is valid, but consider that {consideration}.",
            ],
        }

    def generate_counter_argument(
        self,
        topic: str,
        user_argument: str,
        user_stance: str,
        persona: str = "logical",
        context: str = "",
    ) -> str:
        # Try smart debate system first (enhanced template-based)
        try:
            from services.smart_debate import smart_debate_simulator

            smart_response = smart_debate_simulator.generate(
                topic=topic,
                user_argument=user_argument,
                user_stance=user_stance,
                persona=persona,
            )
            if smart_response:
                logger.info(f"Generated smart counter-argument for persona: {persona}")
                return smart_response
        except ImportError:
            pass
        except Exception as e:
            logger.warning(f"Smart debate failed, using templates: {e}")

        # Try LLM
        try:
            from services.llm_generator import llm_generator

            llm_response = llm_generator.generate_counter_argument(
                user_argument=user_argument,
                topic=topic,
                persona=persona,
                user_stance=user_stance,
            )
            if llm_response:
                logger.info(f"Generated LLM counter-argument for persona: {persona}")
                return llm_response
        except ImportError:
            pass
        except Exception as e:
            logger.warning(f"LLM generation failed, using templates: {e}")

        # Fallback to template-based
        persona_config = self.personas.get(persona, self.personas["logical"])
        counter_arg = self._build_counter_argument(
            topic=topic,
            user_argument=user_argument,
            user_stance=user_stance,
            persona_config=persona_config,
            context=context,
        )
        return counter_arg

    def _analyze_argument_type(self, user_argument: str, user_stance: str) -> Dict:
        """Analyze the user's argument to determine counter strategy"""
        user_lower = user_argument.lower()

        analysis = {
            "type": "general",
            "claim_type": "claim",
            "urgency": "medium",
            "emotion": "neutral",
        }

        # Detect claim type
        if any(word in user_lower for word in ["must", "should", "need to", "have to"]):
            analysis["type"] = "obligation"
        elif any(
            word in user_lower for word in ["always", "never", "everyone", "nobody"]
        ):
            analysis["type"] = "absolute"
        elif any(word in user_lower for word in ["will lead", "cause", "result in"]):
            analysis["type"] = "causation"

        # Detect urgency
        if any(
            word in user_lower for word in ["immediately", "now", "urgent", "crisis"]
        ):
            analysis["urgency"] = "high"

        # Detect emotion
        if any(
            word in user_lower for word in ["danger", "threat", "risk", "harm", "bad"]
        ):
            analysis["emotion"] = "fear"
        elif any(word in user_lower for word in ["good", "benefit", "help", "great"]):
            analysis["emotion"] = "positive"

        return analysis

    def _build_counter_argument(
        self,
        topic: str,
        user_argument: str,
        user_stance: str,
        persona_config: Dict,
        context: str,
    ) -> str:
        # Analyze the user's argument first
        analysis = self._analyze_argument_type(user_argument, user_stance)

        # Choose argument type based on analysis
        if analysis["emotion"] == "fear":
            argument_type = "questions"
        elif analysis["type"] == "obligation":
            argument_type = "logical_challenges"
        elif analysis["type"] == "absolute":
            argument_type = "counter_examples"
        else:
            argument_type = random.choice(
                [
                    "evidence_based",
                    "logical_challenges",
                    "questions",
                    "counter_examples",
                ]
            )

        template = random.choice(self.argument_bank[argument_type])

        # Generate topic-specific replacements
        topic_lower = topic.lower()

        # Analyze user stance and find counter points
        if user_stance == "support":
            counter_direction = "potential risks or alternative perspectives"
            benefit = "significant benefits this brings"
        elif user_stance == "oppose":
            counter_direction = "potential benefits or mitigating factors"
            benefit = "valuable advantages you'd lose"
        else:
            counter_direction = "both benefits and risks"
            benefit = "balanced outcomes"

        # Topic-specific counters
        replacements = {
            "evidence": f"AI has delivered {benefit} alongside concerns about {counter_direction}",
            "assumption": "this is the only correct view",
            "counter": "the full picture including tradeoffs",
            "factor": "implementation details and context",
            "gap": "between your claim and the actual evidence",
            "consideration": "the opposite scenario and its outcomes",
            "alternative": "the nuanced reality instead of binary thinking",
            "requirement": "specific examples and data",
            "example": "how AI is actually used in healthcare, education, and businesses",
            "point": "why this view oversimplifies a complex issue",
            "oversight": "the diverse impacts across different groups",
            "topic": topic,
            "risk": "potential negative consequences",
        }

        for key, value in replacements.items():
            template = template.replace(f"{{{key}}}", value)

        opening = self._get_persona_opening(persona_config["name"])

        counter_argument = f"{opening} {template}"

        if len(counter_argument) < 60 or "{" in counter_argument:
            counter_argument = f"{opening} While your point about {topic} is valid, I would counter that this involves nuanced tradeoffs. Evidence shows both benefits and risks depend heavily on implementation and context. A balanced perspective considers all stakeholders."

        return counter_argument

    def _get_persona_opening(self, persona_name: str) -> str:
        openings = {
            "Logical Challenger": "That's an interesting perspective,",
            "Aggressive Debater": "Let me challenge that directly:",
            "Skeptic": "I'd like to question this further:",
            "Devil's Advocate": "From the opposing viewpoint:",
        }
        return openings.get(persona_name, "I would counter that:")

    def generate_debate_intro(
        self, topic: str, user_stance: str, persona: str = "logical"
    ) -> str:
        persona_config = self.personas.get(persona, self.personas["logical"])

        stances = {
            "support": "in favor of",
            "oppose": "against",
            "neutral": "discussing",
        }

        stance_text = stances.get(user_stance, "discussing")

        intro = f"""I'm ready to debate on: **{topic}**

As the {persona_config["name"]}, I will {persona_config["style"]}.

You're presenting arguments {stance_text} this topic. Let's begin!

What is your first argument?"""

        return intro

    def get_available_personas(self) -> List[Dict]:
        return [
            {"id": key, "name": config["name"], "description": config["description"]}
            for key, config in self.personas.items()
        ]

    def suggest_improvements(self, argument: str, analysis: Dict) -> List[str]:
        suggestions = []

        if analysis.get("fallacy_detected"):
            fallacies = analysis["fallacy_detected"]
            suggestions.append(
                f"Consider addressing the potential {', '.join(fallacies)} issues in your argument."
            )

        strength = analysis.get("argument_strength", 0)
        if strength < 0.5:
            suggestions.append(
                "Strengthen your argument with more evidence or examples."
            )

        if analysis.get("reputation_risk_level") in ["high", "critical"]:
            suggestions.append(
                "Consider moderating your language to reduce potential backlash."
            )

        if not suggestions:
            suggestions.append(
                "Your argument is well-structured! Keep refining your debate skills."
            )

        return suggestions
