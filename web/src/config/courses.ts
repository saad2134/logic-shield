export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIdx: number;
  explanation: string;
}

export interface Slide {
  type: "concept" | "puzzle" | "quiz";
  title: string;
  content: string;
  visualType: "argument-flow" | "dialogue-fallacy" | "causal-sun" | "reframe-scale" | "highlight-rhetoric" | "objection-handshake" | "none";
  puzzleData?: {
    items?: string[];
    correctSequence?: number[];
    dialogue?: { speaker: string; text: string; fallacy?: boolean }[];
    options?: string[];
    correctAnswerIdx?: number;
    explanation?: string;
  };
  quiz?: QuizQuestion;
}

export interface Lesson {
  id: string;
  title: string;
  slides: Slide[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  lessons: Lesson[];
  finalQuiz: QuizQuestion[];
}

export const courses: Course[] = [
  {
    id: "intro-arguments",
    title: "Introduction to Arguments",
    description: "Master the fundamental building blocks of logical thought. Learn how to structure and deconstruct arguments effectively.",
    difficulty: "Beginner",
    duration: "20 mins",
    lessons: [
      {
        id: "what-is-argument",
        title: "What is an Argument?",
        slides: [
          {
            type: "concept",
            title: "Arguments vs. Assertions",
            content: `In debate and logic, an **argument** is not a dispute or a complaint. It is a structured claim supported by reasons.

An argument must contain:
1. **Premises**: Supporting facts or reasons.
2. **Conclusion**: The primary claim you are attempting to prove.

Without support (premises), a statement is merely an **assertion** or an opinion.`,
            visualType: "none"
          },
          {
            type: "puzzle",
            title: "Build the Syllogism",
            content: "Click on the statements below in the correct order to construct a valid deductive argument (Premise 1, Premise 2, then Conclusion):",
            visualType: "argument-flow",
            puzzleData: {
              items: [
                "Socrates is human",
                "Therefore, Socrates is mortal",
                "All humans are mortal"
              ],
              correctSequence: [2, 0, 1],
              explanation: "All humans are mortal (general rule) + Socrates is human (specific fact) leads logically to: Therefore, Socrates is mortal (conclusion)."
            }
          },
          {
            type: "quiz",
            title: "Concept Review",
            content: "Test your understanding of assertions vs. arguments:",
            visualType: "none",
            quiz: {
              question: "Which of the following describes the core difference between an assertion and an argument?",
              options: [
                "An assertion is always true, while an argument can be false.",
                "An argument contains supporting premises, whereas an assertion is a standalone statement of belief.",
                "An assertion must be written down, while arguments are only spoken.",
                "An argument is a hostile disagreement, whereas an assertion is peaceful."
              ],
              correctAnswerIdx: 1,
              explanation: "An assertion is simply a claim without backing. An argument must contain at least one supporting premise to defend the conclusion."
            }
          }
        ]
      },
      {
        id: "premises-conclusions",
        title: "Premises and Conclusions",
        slides: [
          {
            type: "concept",
            title: "Identifying Indicators",
            content: `To analyze arguments, look for indicator words that act as road signs.

**Premise Indicators:**
- *Because, since, for, given that, on the grounds that.*

**Conclusion Indicators:**
- *Therefore, thus, so, consequently, as a result, it follows that.*`,
            visualType: "none"
          },
          {
            type: "quiz",
            title: "Concept Review",
            content: "Check your indicator reading skills:",
            visualType: "none",
            quiz: {
              question: "In the sentence: 'Since inflation is rising, the central bank will likely raise interest rates.' what is the conclusion?",
              options: [
                "Since inflation is rising",
                "Inflation is rising",
                "The central bank will likely raise interest rates",
                "Raise interest rates"
              ],
              correctAnswerIdx: 2,
              explanation: "'Since' indicates that 'inflation is rising' is a premise. The result/conclusion that follows is that the bank will likely raise interest rates."
            }
          }
        ]
      },
      {
        id: "deductive-inductive",
        title: "Deductive vs. Inductive",
        slides: [
          {
            type: "concept",
            title: "Certainty vs. Probability",
            content: `Arguments are categorized by how their premises support their conclusions.

**Deductive Arguments**: Aim for strict certainty. If premises are true, the conclusion *must* be true.
*Example*: All squares are rectangles. A is a square. Therefore, A is a rectangle.

**Inductive Arguments**: Aim for probability. Premises make the conclusion likely, but not guaranteed.
*Example*: Every crow observed so far has been black. Therefore, the next crow we see will probably be black.`,
            visualType: "none"
          },
          {
            type: "quiz",
            title: "Reasoning Check",
            content: "Classify the logical reasoning type:",
            visualType: "none",
            quiz: {
              question: "Analyze this statement: 'The database has crashed on Tuesday three weeks in a row. Therefore, it will crash next Tuesday.' This is an example of:",
              options: [
                "Deductive reasoning (it is absolutely guaranteed to happen)",
                "Inductive reasoning (it is likely based on patterns, but not guaranteed)",
                "Ad hominem reasoning",
                "Circular reasoning"
              ],
              correctAnswerIdx: 1,
              explanation: "This is inductive reasoning. It builds a conclusion based on past observations (a pattern), representing probability rather than mathematical certainty."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "What are the two primary components that make up any logical argument?",
        options: [
          "Hypothesis and experiment",
          "Premises and conclusion",
          "Opinion and facts",
          "Introduction and summary"
        ],
        correctAnswerIdx: 1,
        explanation: "Every argument must consist of at least one premise (supporting evidence) and a conclusion (the main claim being made)."
      },
      {
        question: "Identify the conclusion in this statement: 'Emperor penguins are facing extinction. Global warming is melting their sea ice habitat, which is required for breeding.'",
        options: [
          "Global warming is melting their sea ice habitat.",
          "Sea ice is required for breeding.",
          "Emperor penguins are facing extinction.",
          "Habitat loss is causing breeding failures."
        ],
        correctAnswerIdx: 2,
        explanation: "The claim that penguins are facing extinction is the main conclusion. The melting sea ice and breeding requirement act as premises explaining *why* they face extinction."
      }
    ]
  },
  {
    id: "logical-fallacies",
    title: "Logical Fallacies Masterclass",
    description: "Learn to detect and defend against the 9 most common rhetorical tricks. Protect yourself from manipulation and faulty reasoning.",
    difficulty: "Intermediate",
    duration: "45 mins",
    lessons: [
      {
        id: "ad-hominem",
        title: "Ad Hominem (Personal Attack)",
        slides: [
          {
            type: "concept",
            title: "Attacking the Person",
            content: `**Ad Hominem** (Latin for "to the man") occurs when someone attacks the character, background, or physical traits of the person making an argument, rather than addressing the substance of their claims.`,
            visualType: "none"
          },
          {
            type: "puzzle",
            title: "Spot the Ad Hominem",
            content: "Click on the chat bubble where a character commits an Ad Hominem fallacy:",
            visualType: "dialogue-fallacy",
            puzzleData: {
              dialogue: [
                { speaker: "Dr. Evans", text: "According to current data, green energy investment creates more long-term jobs than fossil fuels." },
                { speaker: "Senator", text: "You shouldn't listen to him! Dr. Evans was fired from his university position years ago, so he is clearly bitter and unqualified.", fallacy: true }
              ],
              explanation: "Instead of refuting the green energy employment data, the Senator attacks Dr. Evans' past employment status, which is irrelevant to the validity of the data itself."
            }
          },
          {
            type: "quiz",
            title: "Concept Review",
            content: "Check your fallacy detection:",
            visualType: "none",
            quiz: {
              question: "Which of the following represents an Ad Hominem fallacy?",
              options: [
                "We shouldn't invest in this energy company because their financial audits show they are in debt.",
                "You cannot believe his proposal for environmental protection; he was once arrested for shoplifting years ago.",
                "If we don't fix the roof now, the ceiling will leak and destroy the living room furniture.",
                "Drinking water is healthy because most medical journals recommend 8 glasses a day."
              ],
              correctAnswerIdx: 1,
              explanation: "Attacking someone's past shoplifting arrest to discredit their environmental protection plan is an Ad Hominem fallacy, as the personal background is irrelevant to the plan's details."
            }
          }
        ]
      },
      {
        id: "straw-man",
        title: "The Straw Man Fallacy",
        slides: [
          {
            type: "concept",
            title: "Caricaturing the Claim",
            content: `A **Straw Man** fallacy occurs when an opponent distorts, oversimplifies, or exaggerates your argument, then attacks this weak caricature instead of your actual claims.`,
            visualType: "none"
          },
          {
            type: "puzzle",
            title: "Spot the Straw Man",
            content: "Click on the chat bubble where a character commits a Straw Man fallacy:",
            visualType: "dialogue-fallacy",
            puzzleData: {
              dialogue: [
                { speaker: "Alice", text: "I think we should allocate a small portion of our budget to public bicycle lanes." },
                { speaker: "Bob", text: "So what you're saying is we should take all money away from hospitals and schools to buy bikes? That is irresponsible!", fallacy: true }
              ],
              explanation: "Bob exaggerates Alice's bike lane request into an extreme claim about defunding hospitals and schools, creating a 'straw man' that is easy to knock down."
            }
          }
        ]
      },
      {
        id: "false-dilemma",
        title: "False Dilemma",
        slides: [
          {
            type: "concept",
            title: "Forced Binaries",
            content: `A **False Dilemma** (either/or fallacy) incorrectly limits the available options to just two extremes, ignoring reasonable middle-ground possibilities.`,
            visualType: "none"
          },
          {
            type: "puzzle",
            title: "Spot the False Dilemma",
            content: "Click on the chat bubble containing a False Dilemma:",
            visualType: "dialogue-fallacy",
            puzzleData: {
              dialogue: [
                { speaker: "Advisor", text: "We need to address our high carbon emissions." },
                { speaker: "CEO", text: "We either ban fossil fuels immediately and go bankrupt, or we do nothing and let the planet burn. There's no other way.", fallacy: true }
              ],
              explanation: "The CEO restricts the choice to two extreme options (bankruptcy vs doing nothing), ignoring transition options like carbon offsets, hybrid operations, or gradual phase-outs."
            }
          }
        ]
      },
      {
        id: "slippery-slope",
        title: "Slippery Slope",
        slides: [
          {
            type: "concept",
            title: "The Chain Reaction",
            content: `A **Slippery Slope** fallacy assumes that a relatively small initial step will inevitably lead to a chain of extreme and disastrous events, without proving that link.`,
            visualType: "none"
          },
          {
            type: "puzzle",
            title: "Spot the Slippery Slope",
            content: "Click on the chat bubble containing a Slippery Slope fallacy:",
            visualType: "dialogue-fallacy",
            puzzleData: {
              dialogue: [
                { speaker: "Teacher A", text: "I think we should allow students to wear casual shoes on Fridays." },
                { speaker: "Teacher B", text: "If we let them wear sneakers, next they'll wear pajamas, then swimsuits, and soon our entire educational environment will collapse into chaos!", fallacy: true }
              ],
              explanation: "Teacher B predicts an extreme, chaotic progression from casual shoes to total school collapse without showing any causal link, representing a Slippery Slope."
            }
          }
        ]
      },
      {
        id: "circular-reasoning",
        title: "Circular Reasoning",
        slides: [
          {
            type: "concept",
            title: "Begging the Question",
            content: `**Circular Reasoning** occurs when the arguer's premise is identical to their conclusion. Instead of proving the claim, they simply restate it in different words.`,
            visualType: "none"
          },
          {
            type: "puzzle",
            title: "Spot the Circular Claim",
            content: "Click on the bubble that contains circular reasoning:",
            visualType: "dialogue-fallacy",
            puzzleData: {
              dialogue: [
                { speaker: "Citizen", text: "Why do you think this candidate is the most honest?" },
                { speaker: "Supporter", text: "Because he is a deeply truthful person who would never lie to us, and that is why he is completely honest!", fallacy: true }
              ],
              explanation: "The Supporter defends the candidate's honesty by stating he is truthful and would not lie, which is circular and assumes what it sets out to prove."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "An opponent claims that 'If we legalize bicycle lanes, it will lead to banning all cars, turning roads into dirt paths, and destroying the automotive economy.' What fallacy is this?",
        options: [
          "Ad Hominem",
          "Straw Man",
          "Circular Reasoning",
          "Slippery Slope"
        ],
        correctAnswerIdx: 3,
        explanation: "This argument predicts an extreme, catastrophic chain of events from a small initial step (bicycle lanes) without providing logical links, making it a Slippery Slope."
      },
      {
        question: "When a manager says, 'You can either agree with my restructuring plan, or show that you don't care about our company's survival,' they are committing which fallacy?",
        options: [
          "False Dilemma",
          "Appeal to Authority",
          "Hasty Generalization",
          "Red Herring"
        ],
        correctAnswerIdx: 0,
        explanation: "The manager presents only two extreme choices (agree or don't care about survival), ignoring options like suggesting alterations, representing a False Dilemma."
      }
    ]
  },
  {
    id: "evidence-support",
    title: "Evidence & Support",
    description: "Learn how to find, evaluate, and deploy empirical evidence to back your claims. Understand source credibility and causal links.",
    difficulty: "Beginner",
    duration: "25 mins",
    lessons: [
      {
        id: "correlation-causation",
        title: "Correlation vs. Causation",
        slides: [
          {
            type: "concept",
            title: "Coincidental Trends",
            content: `Assuming that because two variables trend together, one causes the other is a core logic error (**Correlation is not Causation**).

Look for the **confounding variable**—the hidden factor driving both variables.`,
            visualType: "none"
          },
          {
            type: "puzzle",
            title: "Identify the Confounder",
            content: "Ice cream sales and sunburns are highly correlated. Select the actual causal driver:",
            visualType: "causal-sun",
            puzzleData: {
              options: [
                "Ice cream triggers skin sensitivity to sun",
                "Sunburns make people crave ice cream",
                "Hot summer weather causes both sales and sunburns"
              ],
              correctAnswerIdx: 2,
              explanation: "Hot summer weather is the confounding variable that independently increases both ice cream consumption and outdoor sun exposure."
            }
          }
        ]
      },
      {
        id: "source-credibility",
        title: "Evaluating Source Credibility",
        slides: [
          {
            type: "concept",
            title: "Sourcing Integrity",
            content: `Not all evidence is created equal. To evaluate a source, assess:
1. **Expertise**: Does the author have credentials in this specific field?
2. **Conflict of Interest**: Does the author or sponsor benefit financially from the results?
3. **Consensus**: Is the claim supported by peer-reviewed, reproducible research, or is it an outlier?`,
            visualType: "none"
          },
          {
            type: "quiz",
            title: "Sourcing Review",
            content: "Compare the reliability of these sources:",
            visualType: "none",
            quiz: {
              question: "Which of the following represents the most credible source for health data on a new compound?",
              options: [
                "A fitness blogger's article summarizing their personal routine.",
                "A double-blind, peer-reviewed clinical trial published in a major medical journal with disclosed funding.",
                "A press release from the company selling the compound.",
                "A social media survey of 500 consumers."
              ],
              correctAnswerIdx: 1,
              explanation: "Double-blind, peer-reviewed clinical trials in major journals are the gold standard because they are scrutinized by independent experts and disclose standard bias controls."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "What does the phrase 'Correlation does not imply causation' mean?",
        options: [
          "Two things cannot happen at the same time.",
          "Just because two trends move together doesn't mean one is causing the other to happen.",
          "Statistical data is always incorrect.",
          "Causation is impossible to prove in any study."
        ],
        correctAnswerIdx: 1,
        explanation: "Correlation simply means two variables move together. Causation requires showing a direct mechanism where one changes the other."
      }
    ]
  },
  {
    id: "counter-strategy",
    title: "Counter-Argument Strategy",
    description: "Learn how to actively listen, construct strong rebuttals, strategically concede minor points, and reframe debates to your advantage.",
    difficulty: "Intermediate",
    duration: "30 mins",
    lessons: [
      {
        id: "framing-reframing",
        title: "Framing and Re-framing",
        slides: [
          {
            type: "concept",
            title: "Control the Lens",
            content: `**Framing** is the perspective or lens through which you define an issue. If your opponent establishes an unfavorable frame, you must **re-frame** the issue to your advantage.`,
            visualType: "none"
          },
          {
            type: "puzzle",
            title: "Re-frame the Issue",
            content: "Opponent's frame: 'Remote work makes employees lazy.' Select the most effective re-frame:",
            visualType: "reframe-scale",
            puzzleData: {
              options: [
                "No it doesn't, everyone is working hard.",
                "Lazy employees are the manager's fault, not remote work.",
                "Remote work removes commute stress, allowing workers to channel energy into focused, objective output."
              ],
              correctAnswerIdx: 2,
              explanation: "This re-frames 'lazy' into 'focused objective output' by focusing on the removal of commute stress as an efficiency asset."
            }
          }
        ]
      },
      {
        id: "strategic-concessions",
        title: "Strategic Concessions",
        slides: [
          {
            type: "concept",
            title: "Agreeing to Win",
            content: `A **Strategic Concession** involves agreeing with a minor, true point made by your opponent to show objectivity, and then immediately pivoting to show why your primary claim remains unaffected.

*Formula*: "Yes, [minor concession is true], BUT [primary point outweighs it]."`,
            visualType: "none"
          },
          {
            type: "quiz",
            title: "Concession Check",
            content: "Choose the strongest strategic concession:",
            visualType: "none",
            quiz: {
              question: "If an opponent argues that 'Transitioning to wind energy requires high initial capital costs,' which of the following is the best strategic concession?",
              options: [
                "No, wind turbines are actually very cheap to build now.",
                "You are right that turbine installation is expensive, but long-term fuel savings and carbon reduction make it highly profitable overall.",
                "I agree, it's way too expensive. We should stick to coal.",
                "Cost is irrelevant when we are trying to save the climate."
              ],
              correctAnswerIdx: 1,
              explanation: "This admits the high upfront cost (concession showing objectivity) but pivots to the long-term operational and environmental profitability (primary point outweighs it)."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "Which of the following is the best example of a strategic concession?",
        options: [
          "I admit my data is wrong, so your conclusion must be correct.",
          "You are right that public transit takes time to construct, but studies show the traffic reduction is worth the transition phase.",
          "I agree that climate change is real, so we should stop all industrial activity immediately.",
          "Everything you said is correct, but I still believe I am right."
        ],
        correctAnswerIdx: 1,
        explanation: "This concedes the minor point (construction takes time) but re-asserts the main benefit (traffic reduction outweighs construction time), representing a strategic concession."
      }
    ]
  },
  {
    id: "advanced-persuasion",
    title: "Advanced Persuasion",
    description: "Deep dive into classical rhetorical modes (ethos, pathos, logos), cognitive biases, audience psychology, and non-verbal tone dynamics.",
    difficulty: "Advanced",
    duration: "35 mins",
    lessons: [
      {
        id: "ethos-pathos-logos",
        title: "Ethos, Pathos, and Logos",
        slides: [
          {
            type: "concept",
            title: "The Modes of Persuasion",
            content: `Aristotle defined three persuasion appeals:
1. **Ethos**: Credibility and expert authority.
2. **Pathos**: Emotional connection and shared values.
3. **Logos**: Logical reasoning, facts, and structure.`,
            visualType: "none"
          },
          {
            type: "puzzle",
            title: "Identify the Mode",
            content: "Analyze this statement and identify the sentence that primarily appeals to Pathos:",
            visualType: "highlight-rhetoric",
            puzzleData: {
              options: [
                "As a physician with 15 years of practice... (Ethos)",
                "I urge you to support child healthcare to stop children from suffering... (Pathos)",
                "Medical statistics show it saves 40% more lives... (Logos)"
              ],
              correctAnswerIdx: 1,
              explanation: "Focusing on preventing children from suffering targets the emotions, empathy, and values of the listener (Pathos)."
            }
          }
        ]
      },
      {
        id: "cognitive-biases",
        title: "Cognitive Biases in Action",
        slides: [
          {
            type: "concept",
            title: "Audience Filters",
            content: `Audiences do not hear arguments objectively; they filter them through cognitive shortcuts.

**Confirmation Bias**: The tendency to seek out and remember information that confirms existing beliefs while ignoring contradictory evidence.
**Anchoring Bias**: Relying too heavily on the first piece of information offered when making decisions.`,
            visualType: "none"
          },
          {
            type: "quiz",
            title: "Bias Identification",
            content: "Analyze confirmation bias:",
            visualType: "none",
            quiz: {
              question: "If a manager reads a project report and highlights only the two positive metrics while ignoring five failing metrics because they want to believe the project is successful, they are committing:",
              options: [
                "Anchoring bias",
                "Confirmation bias",
                "Ad hominem logic",
                "Slippery slope reasoning"
              ],
              correctAnswerIdx: 1,
              explanation: "This is confirmation bias. The manager actively filters evidence to support their pre-conceived belief (that the project is successful) while disregarding counter-evidence."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "An argument that relies on 'appealing to the audience's fears, hopes, and empathy' is utilizing which Aristotle mode?",
        options: [
          "Ethos",
          "Pathos",
          "Logos",
          "Begging the question"
        ],
        correctAnswerIdx: 1,
        explanation: "Pathos is the rhetorical appeal that targets emotions, values, values, and empathy."
      }
    ]
  },
  {
    id: "business-comm",
    title: "Business Communication",
    description: "Apply rhetoric and fallacy detection to professional settings. Learn pitching, negotiation, professional emailing, and resolving objections.",
    difficulty: "Advanced",
    duration: "25 mins",
    lessons: [
      {
        id: "client-objections",
        title: "Handling Client Objections",
        slides: [
          {
            type: "concept",
            title: "Objections as Opportunities",
            content: `When a client objects to cost or timeline, do not defend. Use the **LAER** method:
1. **Listen** fully.
2. **Acknowledge** the concern (de-escalates friction).
3. **Explore** the root issue.
4. **Respond** with a solution.`,
            visualType: "none"
          },
          {
            type: "puzzle",
            title: "Acknowledge the objection",
            content: "Client says: 'Your software contract is way too expensive.' Choose the correct Acknowledging response:",
            visualType: "objection-handshake",
            puzzleData: {
              options: [
                "It's not expensive, look at the ROI we generate!",
                "I understand that budget alignment is a high priority for your team right now.",
                "Can you tell me what competitor offered you a cheaper rate?"
              ],
              correctAnswerIdx: 1,
              explanation: "This directly validates and acknowledges the budget constraint without becoming defensive or interrogation-oriented."
            }
          }
        ]
      },
      {
        id: "negotiation-value",
        title: "Interest-Based Bargaining",
        slides: [
          {
            type: "concept",
            title: "Positions vs. Interests",
            content: `Traditional bargaining is **positional**: "I demand X; you demand Y."
Interest-based bargaining is **collaborative**: "What are the needs and concerns driving your demand?"

By uncovering the *interest* behind the *position*, you can construct win-win deals.`,
            visualType: "none"
          },
          {
            type: "quiz",
            title: "Negotiation Review",
            content: "Select the collaborative approach:",
            visualType: "none",
            quiz: {
              question: "During contract negotiation, a client insists on a 25% discount. Which of the following represents an interest-based bargaining response?",
              options: [
                "Refusing and telling them our prices are non-negotiable.",
                "Agreeing immediately to the discount to keep them happy.",
                "Saying: 'Can you help me understand what cash-flow or timeline factors are driving this specific budget level so we can explore package adjustments?'",
                "Offering a 5% discount and walking away if they object."
              ],
              correctAnswerIdx: 2,
              explanation: "This explores the *interest* (cash-flow constraints or project scope limits) behind their *position* (the 25% discount request), opening up paths for mutually beneficial adjustments."
            }
          }
        ]
      }
    ],
    finalQuiz: [
      {
        question: "Which framework is recommended for resolving client objections in a constructive manner?",
        options: [
          "Monroe's Motivated Sequence",
          "LAER (Listen, Acknowledge, Explore, Respond)",
          "BLUF (Bottom Line Up Front)",
          "Ethos, Pathos, Logos"
        ],
        correctAnswerIdx: 1,
        explanation: "LAER (Listen, Acknowledge, Explore, Respond) is the standard method for resolving customer/client concerns."
      }
    ]
  }
];
