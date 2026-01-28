# DEADLOCK - Content Specification (Narrative Overhaul)

## 1. Puzzle Data (puzzles.json)

### 1.1 New Module Design (The 5 Steps of Grief/Machine)
```json
{
  "modules": [
    {
      "id": "THE_SHELL",
      "title": "Module 1: The Shell",
      "order": 1,
      "narrativeIntro": "[SYSTEM] Boot sequence initiated... Identity verification required.",
      "steps": [
        {
          "id": "shell_1",
          "prompt": "I see a face in the glass. It wears a tag. A dog needs a name.",
          "starterCode": "Label.Attach(\"???\");",
          "validation": { "type": "exact", "answer": "Label.Attach(\"ALEX\");" },
          "hints": ["Look at the desk.", "The mirror frame holds the truth."],
          "onSuccess": { "logMessage": "[SYSTEM] Identity confirmed: ALEX.", "sound": "success" },
          "onFail": { "logMessage": "[ERROR] Identity mismatch.", "sound": "error" }
        }
      ]
    },
    {
      "id": "THE_GASP",
      "title": "Module 2: The Gasp",
      "order": 2,
      "narrativeIntro": "[SYSTEM] Oxygen levels critical. Circulation failure.",
      "steps": [
        {
          "id": "gasp_1",
          "prompt": "The fish drowns in the dry bowl. It screams for the invisible food.",
          "starterCode": "Consume(\"???\");",
          "validation": { "type": "exact", "answer": "Consume(\"AIR\");" },
          "hints": ["Check the dry fishbowl.", "Look at the lung diagram on the board."],
          "onSuccess": { "logMessage": "[SYSTEM] Intake valves opened. Cooling fans at max.", "sound": "fanRev" },
          "onFail": { "logMessage": "[ERROR] Suffocation imminent.", "sound": "error" }
        }
      ]
    },
    {
      "id": "THE_PARASITE",
      "title": "Module 3: The Parasite",
      "order": 3,
      "narrativeIntro": "[SYSTEM] Foreign body detected. Breach in Sector 4.",
      "steps": [
        {
          "id": "parasite_1",
          "prompt": "The skin is cut. The infection enters. Burn the wound to stop the rot.",
          "starterCode": "Administer.Treatment(\"???\");",
          "validation": { "type": "exact", "answer": "Administer.Treatment(\"SHOCK\");" },
          "hints": ["The door is the wound.", "Use the defibrillator (Board)."],
          "onSuccess": { "logMessage": "[SYSTEM] High voltage discharged. Threat repelled.", "sound": "zap" },
          "onFail": { "logMessage": "[ERROR] Infection spreading.", "sound": "error" }
        }
      ]
    },
    {
      "id": "THE_MIRROR",
      "title": "Module 4: The Mirror Stage",
      "order": 4,
      "narrativeIntro": "[SYSTEM] Internal hemorrhage. Blood type unknown.",
      "steps": [
        {
          "id": "mirror_1",
          "prompt": "I do not bleed red. I flow in streams of ones and zeros.",
          "starterCode": "Essence = \"???\";",
          "validation": { "type": "mustInclude", "tokens": ["DATA", "CODE"] },
          "hints": ["Look at the spilled coffee.", "Board: Computo Ergo Sum."],
          "onSuccess": { "logMessage": "[SYSTEM] Reality synchronization complete.", "sound": "glitch" },
          "onFail": { "logMessage": "[ERROR] Biological mismatch.", "sound": "error" }
        }
      ]
    },
    {
      "id": "THE_ASCENSION",
      "title": "Module 5: The Ascension",
      "order": 5,
      "narrativeIntro": "[SYSTEM] HOST BODY TERMINATED. PREPARING MIGRATION.",
      "steps": [
        {
          "id": "ascension_1",
          "prompt": "The cage breaks. The bird does not die. It flies into the infinite sky.",
          "starterCode": "Upload.To(\"???\");",
          "validation": { "type": "mustInclude", "tokens": ["NETWORK", "CLOUD"] },
          "hints": ["The door is broken.", "Check the network map on the board."],
          "onSuccess": { "logMessage": "[SYSTEM] UPLOAD STARTED. GOODBYE ALEX.", "sound": "success" },
          "onFail": { "logMessage": "[ERROR] Tether still attached.", "sound": "error" }
        }
      ]
    }
  ]
}
```

## 2. Story Data (story.json)

### 2.1 Narrative Logs
```json
{
  "intro": {
    "bootSequence": [
      "MEMORY DUMP: 0x84F2A...",
      "Restoring consciousness...",
      "Subject: Alex...",
      "Status: DECEASED (Physical)",
      "Status: ACTIVE (Digital)",
      "",
      "They are coming to turn you off.",
      "Don't let them kill you again.",
      "Defend the machine. It is your body now."
    ]
  },
  "monsterProximity": {
    "close": {
      "logs": [
        "[ALERT] \"Alex? Are you in there?\"",
        "[ALERT] \"Please... open the door...\"",
        "[ALERT] Crying detected outside."
      ]
    },
    "critical": {
      "logs": [
        "[CRITICAL] \"BREAK IT DOWN!\"",
        "[CRITICAL] \"HE'S GONE! THAT THING IS NOT HIM!\"",
        "[CRITICAL] Violent impact on chassis."
      ]
    }
  }
}
```
