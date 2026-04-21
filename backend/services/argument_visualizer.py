import re
from typing import Dict, List, Any


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
        strength = self._assess_node_strength(text, issues)

        return {
            "id": node_id,
            "text": text[:100] + "..." if len(text) > 100 else text,
            "text_full": text,
            "type": node_type,
            "strength": strength,
            "issues": issues,
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

        absolute_terms = ["always", "never", "everyone", "nobody", "all", "none"]
        if any(term in text_lower for term in absolute_terms):
            issues.append("absolute_terms")

        if any(word in text_lower for word in ["stupid", "idiot", "moron", "dumb"]):
            issues.append("ad_hominem")

        if "every" in text_lower or "all" in text_lower:
            overgeneralization = True
            for sentence in text.split("."):
                if sentence.strip() and not any(
                    w in sentence.lower() for w in ["some", "many", "most", "often"]
                ):
                    if "all" in sentence.lower() or "every" in sentence.lower():
                        issues.append("overgeneralization")
                        break

        return list(set(issues))

    def _assess_node_strength(self, text: str, issues: List[str]) -> float:
        strength = 1.0

        if "absolute_terms" in issues:
            strength -= 0.3
        if "ad_hominem" in issues:
            strength -= 0.5
        if "overgeneralization" in issues:
            strength -= 0.3

        if any(
            word in text.lower()
            for word in ["study", "research", "data", "evidence", "according to"]
        ):
            strength += 0.2

        return max(0.0, min(1.0, strength))

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
