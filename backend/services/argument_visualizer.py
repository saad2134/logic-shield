import re
from typing import Dict, List, Any, Optional
from app.config import settings


class ArgumentVisualizer:
    def __init__(self):
        self.node_counter = 0

    def parse_argument(self, text: str, context: str = "") -> Dict[str, Any]:
        self.node_counter = 0
        nodes = []
        edges = []

        sentences = self._split_into_sentences(text)

        if not sentences:
            return {
                "nodes": [],
                "edges": [],
                "summary": "No argument content found.",
                "overall_strength": 0.0,
                "weak_links": [],
            }

        conclusion_node = self._create_node(
            text=self._extract_conclusion(sentences),
            node_type="conclusion",
            text_full=text,
        )
        nodes.append(conclusion_node)

        premises = self._extract_premises(sentences)
        for i, premise in enumerate(premises):
            premise_node = self._create_node(
                text=premise, node_type="premise", text_full=text
            )
            nodes.append(premise_node)
            edges.append(
                {
                    "source": premise_node["id"],
                    "target": conclusion_node["id"],
                    "label": "supports" if i == 0 else "also supports",
                }
            )

        evidence = self._extract_evidence(text)
        for ev in evidence:
            evidence_node = self._create_node(
                text=ev, node_type="evidence", text_full=text
            )
            nodes.append(evidence_node)
            if premises:
                edges.append(
                    {
                        "source": evidence_node["id"],
                        "target": nodes[1]["id"]
                        if len(nodes) > 1
                        else conclusion_node["id"],
                        "label": "supports",
                    }
                )

        weak_links = self._identify_weak_links(nodes, edges)
        overall_strength = self._calculate_strength(nodes)

        return {
            "nodes": nodes,
            "edges": edges,
            "summary": self._generate_summary(text, len(premises), len(evidence)),
            "overall_strength": overall_strength,
            "weak_links": weak_links,
        }

    def _create_node(
        self, text: str, node_type: str, text_full: str = ""
    ) -> Dict[str, Any]:
        self.node_counter += 1
        node_id = f"node_{self.node_counter}"

        issues = self._detect_node_issues(text)
        strength = self._assess_node_strength(text, node_type, issues)
        
        suggestions, improved_text = self._generate_node_improvements(text, node_type, strength, issues)

        return {
            "id": node_id,
            "text": text[:100] + "..." if len(text) > 100 else text,
            "text_full": text,
            "type": node_type,
            "strength": strength,
            "issues": issues,
            "suggestions": suggestions,
            "improved_text": improved_text,
        }

    def _split_into_sentences(self, text: str) -> List[str]:
        sentences = re.split(r"(?<=[.!?])\s+", text)
        return [s.strip() for s in sentences if s.strip()]

    def _extract_conclusion(self, sentences: List[str]) -> str:
        conclusion_indicators = [
            "therefore",
            "thus",
            "hence",
            "so",
            "consequently",
            "in conclusion",
            "ultimately",
            "this means",
            "it follows",
        ]

        for sentence in reversed(sentences):
            sentence_lower = sentence.lower()
            if any(indicator in sentence_lower for indicator in conclusion_indicators):
                return sentence

        return sentences[-1] if sentences else "Main argument"

    def _extract_premises(self, sentences: List[str]) -> List[str]:
        premise_indicators = [
            "because",
            "since",
            "as",
            "given that",
            "considering",
            "for the reason",
            "due to",
            "owing to",
        ]

        premises = []
        for sentence in sentences:
            sentence_lower = sentence.lower()
            if any(indicator in sentence_lower for indicator in premise_indicators):
                premises.append(sentence)
            elif len(sentences) <= 2 and sentence != sentences[-1]:
                premises.append(sentence)

        return premises[:5]

    def _extract_evidence(self, text: str) -> List[str]:
        evidence_indicators = [
            "study",
            "research",
            "data",
            "statistics",
            "according to",
            "evidence shows",
            "studies show",
            "research shows",
            "for example",
            "for instance",
            "such as",
        ]

        evidence = []
        sentences = self._split_into_sentences(text)

        for sentence in sentences:
            sentence_lower = sentence.lower()
            if any(indicator in sentence_lower for indicator in evidence_indicators):
                evidence.append(sentence)

        return evidence[:3]

    def _detect_node_issues(self, text: str) -> List[str]:
        issues = []
        text_lower = text.lower()

        # Match absolute terms using word boundaries to avoid matching substrings like "all" inside "overall"
        absolute_pattern = re.compile(r'\b(always|never|everyone|nobody|all|none)\b', re.IGNORECASE)
        if absolute_pattern.search(text):
            issues.append("absolute_terms")

        if any(word in text_lower for word in ["stupid", "idiot", "moron", "dumb"]):
            issues.append("ad_hominem")

        # Match overgeneralization using word boundaries to avoid matching substrings like "all" inside "overall"
        general_pattern = re.compile(r'\b(every|all)\b', re.IGNORECASE)
        if general_pattern.search(text):
            for sentence in text.split("."):
                sentence_lower = sentence.lower()
                if sentence_lower.strip() and not any(
                    w in sentence_lower for w in ["some", "many", "most", "often", "generally", "typically"]
                ):
                    if general_pattern.search(sentence_lower):
                        issues.append("overgeneralization")
                        break

        return list(set(issues))

    def _assess_node_strength(self, text: str, node_type: str, issues: List[str]) -> float:
        strength = 1.0

        # Issues penalties
        if "absolute_terms" in issues:
            strength -= 0.3
        if "ad_hominem" in issues:
            strength -= 0.5
        if "overgeneralization" in issues:
            strength -= 0.3

        # Type-specific assessments
        text_lower = text.lower()
        words = text.split()
        
        # 1. Length penalty (too short means argument is underdeveloped)
        if len(words) < 6:
            strength -= 0.35
            
        # 2. Premise needs grounding / support indicators
        if node_type == "premise":
            # If it lacks logical reasoning words like 'because', 'since', 'due to', 'leads to', or 'if'
            reasoning_indicators = ["because", "since", "as", "given that", "considering", "due to", "leads to", "causes", "results in", "therefore", "thus", "if"]
            if not any(indicator in text_lower for indicator in reasoning_indicators):
                strength -= 0.2
                
        # 3. Evidence needs concrete grounding
        if node_type == "evidence":
            # Evidence should have data/source indicators or numbers
            evidence_indicators = ["study", "research", "data", "statistics", "percent", "%", "according to", "report", "show", "prove", "evidence", "found"]
            has_numbers = any(char.isdigit() for char in text)
            if not any(indicator in text_lower for indicator in evidence_indicators) and not has_numbers:
                strength -= 0.35
                
        # Positive evidence boost
        if any(
            word in text_lower
            for word in ["study", "research", "data", "evidence", "according to"]
        ):
            strength += 0.15

        return max(0.1, min(1.0, strength))

    def _generate_node_improvements(
        self, text: str, node_type: str, strength: float, issues: List[str]
    ) -> tuple[List[str], Optional[str]]:
        suggestions = []
        improved_text = text
        text_lower = text.lower()
        words = text.split()

        # 1. Address specific fallacy issues
        if "ad_hominem" in issues:
            suggestions.append("Focus on addressing the logical arguments rather than using personal attacks or insults.")
            replacements = {
                "stupid": "uninformed",
                "fool": "misguided",
                "idiot": "incorrect",
                "dumb": "flawed",
                "ignorant": "unaware",
                "moron": "unwise",
                "shit": "issues",
                "fuck": "disregard",
                "ass": "perspective",
                "bitch": "complain",
                "bastard": "individual",
                "crap": "substandard work",
                "suck": "is unsatisfactory",
                "hate": "disagree with",
                "garbage": "unhelpful",
                "trash": "poor quality",
                "you are wrong": "there may be another perspective",
                "wrong": "incorrect",
                "liar": "mistaken",
            }
            for word, rep in replacements.items():
                pattern = re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE)
                improved_text = pattern.sub(rep, improved_text)

        if "absolute_terms" in issues or "overgeneralization" in issues:
            suggestions.append("Qualify the assertion with words like 'generally', 'typically', or 'often' to avoid an easily falsifiable absolute claim.")
            abs_replacements = {
                "always": "often",
                "never": "rarely",
                "everyone": "most people",
                "nobody": "few people",
                "all": "most",
                "none": "few",
                "every": "most",
            }
            for word, rep in abs_replacements.items():
                pattern = re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE)
                improved_text = pattern.sub(rep, improved_text)

        # 2. General type-specific weak suggestions
        if strength < 0.7:
            # Underdeveloped node
            if len(words) < 6:
                suggestions.append("Expand this point with more detail and clear phrasing to make your reasoning easier to follow.")
                if node_type == "conclusion":
                    improved_text = f"Therefore, it is critical to address this issue because the current evidence points to a significant impact."
                elif node_type == "premise":
                    improved_text = f"This is supported by the fact that the primary drivers of this issue have been consistently documented."
                elif node_type == "evidence":
                    improved_text = f"For instance, recent statistical analysis and research data confirm this trend."

            # Lack of evidence in evidence node
            if node_type == "evidence":
                evidence_indicators = ["study", "research", "data", "statistics", "percent", "%", "according to", "report", "show", "prove", "evidence", "found"]
                has_numbers = any(char.isdigit() for char in text)
                if not any(indicator in text_lower for indicator in evidence_indicators) and not has_numbers:
                    suggestions.append("Add specific data, percentages, study references, or citations to make this evidence persuasive.")
                    if not has_numbers and "show" not in text_lower:
                        improved_text = f"Studies show that {improved_text[0].lower() + improved_text[1:] if len(improved_text) > 1 else improved_text}"

            # Lack of logical reasoning in premise node
            if node_type == "premise":
                reasoning_indicators = ["because", "since", "as", "given that", "considering", "due to", "leads to", "causes", "results in", "therefore", "thus"]
                if not any(indicator in text_lower for indicator in reasoning_indicators):
                    suggestions.append("Use logical connectors (like 'because', 'since', or 'leads to') to explicitly link this premise to your argument's flow.")
                    improved_text = f"This is because {improved_text[0].lower() + improved_text[1:] if len(improved_text) > 1 else improved_text}"

        # Clean punctuation in improved_text
        if improved_text != text:
            improved_text = improved_text.strip()
            if not improved_text.endswith((".", "!", "?")):
                improved_text += "."

        # If LLM is available, we can get an even better improvement
        try:
            from services.llm_generator import llm_generator
            if llm_generator.is_available_check() and not settings.DEMO_MODE:
                llm_res = llm_generator.refine_argument_node(text, node_type, issues)
                if llm_res:
                    if "improved_text" in llm_res and llm_res["improved_text"]:
                        improved_text = llm_res["improved_text"]
                    if "suggestions" in llm_res and llm_res["suggestions"]:
                        for sug in llm_res["suggestions"]:
                            if sug not in suggestions:
                                suggestions.append(sug)
        except Exception as e:
            pass

        # Return suggestions and improved_text
        # Limit suggestions to unique ones, at most 3
        seen_sug = set()
        unique_suggestions = []
        for s in suggestions:
            if s not in seen_sug:
                seen_sug.add(s)
                unique_suggestions.append(s)
                
        return unique_suggestions, improved_text if improved_text != text else None

    def _identify_weak_links(self, nodes: List[Dict], edges: List[Dict]) -> List[str]:
        weak = []
        for node in nodes:
            if node.get("strength", 1.0) < 0.7:
                weak.append(node["id"])
        return weak

    def _calculate_strength(self, nodes: List[Dict]) -> float:
        if not nodes:
            return 0.0
        total = sum(node.get("strength", 1.0) for node in nodes)
        return round(total / len(nodes), 2)

    def _generate_summary(self, text: str, num_premises: int, num_evidence: int) -> str:
        word_count = len(text.split())

        if word_count < 20:
            return "Short argument. Consider adding more supporting evidence."
        elif num_evidence == 0:
            return "Argument lacks statistical or research evidence. Add data to strengthen your case."
        elif num_premises < 2:
            return "Consider adding more premises to support your conclusion."
        else:
            return f"Argument with {num_premises} supporting points and {num_evidence} evidence items."


argument_visualizer = ArgumentVisualizer()
