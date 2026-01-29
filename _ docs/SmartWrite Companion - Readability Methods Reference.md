This document explains the readability formulas used by SmartWrite Companion to analyze text complexity. Each method estimates the education level required to understand a text.

---

## 1. Flesch Reading Ease (FRE)

**Created by:** Rudolf Flesch (1948)  
**Published in:** "A New Readability Yardstick", Journal of Applied Psychology

### Formula

```
FRE = 206.835 - (1.015 × ASL) - (84.6 × ASW)
```

**Where:**

- **ASL** = Average Sentence Length (words ÷ sentences)
- **ASW** = Average Syllables per Word (syllables ÷ words)

### Score Interpretation

| Score  | Difficulty       | Grade Level     |
| ------ | ---------------- | --------------- |
| 90–100 | Very Easy        | 5th grade       |
| 80–89  | Easy             | 6th grade       |
| 70–79  | Fairly Easy      | 7th grade       |
| 60–69  | Standard         | 8th–9th grade   |
| 50–59  | Fairly Difficult | 10th–12th grade |
| 30–49  | Difficult        | College         |
| 0–29   | Very Difficult   | Graduate        |

### How to Improve Your Score

- **Shorten sentences** — break long sentences into shorter ones
- **Use simpler words** — replace polysyllabic words with shorter alternatives
- **Target 60–70** for general audiences

### References

- Wikipedia: [Flesch–Kincaid readability tests](https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests)
- ReadabilityFormulas.com: [Flesch Reading Ease Formula](https://readabilityformulas.com/learn-about-the-flesch-reading-ease-formula/)
- Readable.com: [Flesch Reading Ease](https://readable.com/readability/flesch-reading-ease-flesch-kincaid-grade-level/)

---

## 2. Flesch-Kincaid Grade Level (FKGL)

**Created by:** J. Peter Kincaid et al. (1975)  
**Developed for:** U.S. Navy technical manuals

### Formula

```
FKGL = (0.39 × ASL) + (11.8 × ASW) - 15.59
```

**Where:**

- **ASL** = Average Sentence Length
- **ASW** = Average Syllables per Word

### Score Interpretation

The result corresponds directly to U.S. grade level:

- Score of **8.0** = 8th grade reading level
- Score of **12.0** = 12th grade (high school senior)
- Score of **16.0** = College graduate

### How to Improve Your Score

- Same strategies as Flesch Reading Ease
- **Target 7–8** for general public documents
- U.S. government documents aim for grade 8 or below

### References

- Wikipedia: [Flesch–Kincaid readability tests](https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests)
- Kincaid, J.P. et al. (1975). "Derivation of New Readability Formulas for Navy Enlisted Personnel"

---

## 3. Gunning Fog Index

**Created by:** Robert Gunning (1952)  
**Published in:** "The Technique of Clear Writing"

### Formula

```
Fog = 0.4 × (ASL + PHW)
```

**Where:**

- **ASL** = Average Sentence Length (words ÷ sentences)
- **PHW** = Percentage of Hard Words (words with 3+ syllables × 100 ÷ total words)

**Hard words exclude:**

- Proper nouns (e.g., "Baltimore", "Microsoft")
- Compound words (e.g., "bookkeeper", "sunflower")
- Words made complex by suffixes -ed, -es, -ing

### Score Interpretation

| Score | Reading Level    |
| ----- | ---------------- |
| ≤6    | Easy (6th grade) |
| 7–8   | Conversational   |
| 9–12  | High school      |
| 13–16 | College          |
| ≥17   | Graduate         |

### How to Improve Your Score

- **Reduce complex words** — replace 3+ syllable words when possible
- **Shorten sentences** — aim for 15–20 words per sentence
- **Target 7–8** for business writing

### References

- Wikipedia: [Gunning fog index](https://en.wikipedia.org/wiki/Gunning_fog_index)
- ReadabilityFormulas.com: [Gunning Fog Index](https://readabilityformulas.com/the-gunnings-fog-index-or-fog-readability-formula/)
- Readable.com: [Gunning Fog Index](https://readable.com/readability/gunning-fog-index/)

---

## 4. SMOG Index

**Created by:** G. Harry McLaughlin (1969)  
**Published in:** "SMOG Grading: A New Readability Formula", Journal of Reading

SMOG = "Simple Measure of Gobbledygook"

### Formula (Full)

```
SMOG = 1.043 × √(polysyllables × (30 ÷ sentences)) + 3.1291
```

### Formula (Simplified, for 30 sentences)

```
SMOG = √(polysyllables) + 3
```

**Where:**

- **Polysyllables** = words with 3 or more syllables
- Sample: 10 sentences from beginning, 10 from middle, 10 from end

### Score Interpretation

Result equals U.S. grade level. SMOG is calibrated for **100% comprehension** (stricter than other formulas).

### How to Improve Your Score

- **Replace polysyllabic words** — use simpler alternatives
- SMOG is the **gold standard in healthcare** — medical documents should target grade 6–7

### References

- Wikipedia: [SMOG](https://en.wikipedia.org/wiki/SMOG)
- Original paper (PDF): [SMOG Grading](https://ogg.osu.edu/media/documents/health_lit/WRRSMOG_Readability_Formula_G._Harry_McLaughlin__1969_.pdf)
- ReadabilityFormulas.com: [SMOG Readability Formula](https://readabilityformulas.com/the-smog-readability-formula/)
- Readable.com: [SMOG Index](https://readable.com/readability/smog-index/)

---

## 5. Coleman-Liau Index (CLI)

**Created by:** Meri Coleman and T. L. Liau (1975)  
**Published in:** "A computer readability formula designed for machine scoring", Journal of Applied Psychology

### Formula

```
CLI = (0.0588 × L) - (0.296 × S) - 15.8
```

**Where:**

- **L** = Average letters per 100 words = (letters ÷ words) × 100
- **S** = Average sentences per 100 words = (sentences ÷ words) × 100

### Key Advantage

**Does not require syllable counting** — uses character count instead, making it faster and more reliable for computer calculation.

### Score Interpretation

Result equals U.S. grade level.

### How to Improve Your Score

- **Use shorter words** — fewer characters per word lowers the score
- **Vary sentence length** — avoid consistently long sentences

### References

- Wikipedia: [Coleman–Liau index](https://en.wikipedia.org/wiki/Coleman%E2%80%93Liau_index)
- Coleman, M. & Liau, T.L. (1975). "A computer readability formula designed for machine scoring", Journal of Applied Psychology, Vol. 60, pp. 283–284
- ReadabilityFormulas.com: [Coleman-Liau Index](https://readabilityformulas.com/the-coleman-liau-readability-formula/)
- Readable.com: [Coleman-Liau Index](https://readable.com/readability/coleman-liau-readability-index/)

---

## 6. Automated Readability Index (ARI)

**Created by:** E. A. Smith and R. J. Senter (1967)  
**Developed for:** U.S. Air Force, Wright-Patterson Air Force Base

### Formula

```
ARI = (4.71 × (characters ÷ words)) + (0.5 × (words ÷ sentences)) - 21.43
```

**Where:**

- **Characters** = letters and numbers only (no spaces or punctuation)
- Round up non-integer results

### Key Advantage

Like Coleman-Liau, **no syllable counting required**. Originally designed for real-time monitoring on electric typewriters.

### Score Interpretation

| Score | Age   | Grade Level  |
| ----- | ----- | ------------ |
| 1     | 5–6   | Kindergarten |
| 2     | 6–7   | 1st grade    |
| 3     | 7–8   | 2nd grade    |
| ...   | ...   | ...          |
| 12    | 17–18 | 12th grade   |
| 13    | 18–22 | College      |
| 14    | 22+   | Graduate     |

### How to Improve Your Score

- **Shorten words** — use fewer characters per word
- **Shorten sentences** — reduce words per sentence
- **Target 7–8** for general audiences

### References

- Wikipedia: [Automated readability index](https://en.wikipedia.org/wiki/Automated_readability_index)
- Original report (PDF): [Automated Readability Index](https://apps.dtic.mil/sti/tr/pdf/AD0667273.pdf) — Senter, R.J. & Smith, E.A. (1967), AMRL-TR-66-220
- ReadabilityFormulas.com: [Automated Readability Index](https://readabilityformulas.com/the-automated-readability-index-ari/)
- Readable.com: [Automated Readability Index](https://readable.com/readability/automated-readability-index/)

---

## 7. Dale-Chall Readability Score

**Created by:** Edgar Dale and Jeanne Chall (1948)  
**Updated:** 1995 (expanded word list)  
**Published in:** "A Formula for Predicting Readability"

### Formula

```
Raw Score = (0.1579 × PDW) + (0.0496 × ASL)

If PDW > 5%:
    Adjusted Score = Raw Score + 3.6365
```

**Where:**

- **PDW** = Percentage of Difficult Words (words NOT in the Dale-Chall list)
- **ASL** = Average Sentence Length
- **Dale-Chall list** = ~3,000 words familiar to 4th graders

### Score Interpretation

| Score   | Grade Level        |
| ------- | ------------------ |
| ≤4.9    | 4th grade or below |
| 5.0–5.9 | 5th–6th grade      |
| 6.0–6.9 | 7th–8th grade      |
| 7.0–7.9 | 9th–10th grade     |
| 8.0–8.9 | 11th–12th grade    |
| 9.0–9.9 | College            |
| ≥10     | Graduate           |

### How to Improve Your Score

- **Use familiar words** — check if words are on the Dale-Chall list
- **Avoid jargon** — replace technical terms with common alternatives
- **Shorten sentences**

### References

- Wikipedia: [Dale–Chall readability formula](https://en.wikipedia.org/wiki/Dale%E2%80%93Chall_readability_formula)
- Dale-Chall Word List: [ReadabilityFormulas.com](https://readabilityformulas.com/word-lists/the-dale-chall-word-list-for-readability-formulas/)
- Dale, E. & Chall, J. (1948). "A Formula for Predicting Readability"
- Chall, J. & Dale, E. (1995). "Readability Revisited: The New Dale-Chall Readability Formula"

---

## 8. Linsear Write Formula

**Created by:** U.S. Air Force  
**Purpose:** Evaluating technical documents

### Formula (3 steps)

**Step 1:** Count words in a 100-word sample

- Easy words (1–2 syllables) = count × 1
- Hard words (3+ syllables) = count × 3

**Step 2:** Divide total by number of sentences

**Step 3:** Adjust result

```
If result > 20:
    Grade Level = result ÷ 2
Else:
    Grade Level = (result - 2) ÷ 2
```

### How to Improve Your Score

- **Reduce hard words** — replace 3+ syllable words
- **Balance easy and hard words** — aim for more simple vocabulary

### References

- Wikipedia: [Linsear Write](https://en.wikipedia.org/wiki/Linsear_Write)
- ReadabilityFormulas.com: [Readability Formulas](https://readabilityformulas.com/)

---

## 9. Flesch Reading Ease — Portuguese Adaptation

**Adapted by:** Martins, T.B.F. et al. (1996)  
**Institution:** ICMC-USP, Brazil

### Formula

```
IFLP = 248.835 - (1.015 × ASL) - (84.6 × ASW)
```

**Where:**

- **ASL** = Average Sentence Length (words per sentence)
- **ASW** = Average Syllables per Word

### Key Difference from Original

The constant **248.835** (vs. 206.835 in English) compensates for Portuguese having a higher average syllable count per word.

### Score Interpretation

| Score  | Difficulty     |
| ------ | -------------- |
| 75–100 | Very Easy      |
| 50–74  | Easy           |
| 25–49  | Difficult      |
| 0–24   | Very Difficult |

### References

- Martins, T.B.F. et al. (1996). "Readability formulas applied to textbooks in Brazilian Portuguese", ICMC-USP
- PMC: [Quality of information about oral cancer](https://pmc.ncbi.nlm.nih.gov/articles/PMC7211369/) — cites the adapted formula

---

## 10. Gulpease Index

**Created by:** Lucisano, P. and Piemontese, M.E. (1988)  
**Origin:** Italy  
**Applicable to:** Romance languages (Italian, Portuguese, Spanish)

### Formula

```
Gulpease = 89 + ((300 × sentences) - (10 × letters)) ÷ words
```

**Alternative form:**

```
Gulpease = 89 - (LP ÷ 10) + (3 × FS)
```

**Where:**

- **LP** = (letters × 100) ÷ words
- **FS** = (sentences × 100) ÷ words

### Key Advantage

**Does not require syllable counting** — uses character count instead. More accurate for Romance languages where syllable rules differ from English.

### Score Interpretation (by education level)

| Score  | Elementary | High School | College   |
| ------ | ---------- | ----------- | --------- |
| <80    | Difficult  | Difficult   | Difficult |
| 80–89  | Easy       | Difficult   | Difficult |
| 90–100 | Easy       | Easy        | Easy      |

### How to Improve Your Score

- **Shorten words** — use words with fewer letters
- **Use more sentences** — break up long sentences

### References

- Lucisano, P. & Piemontese, M.E. (1988). "GULPEASE: una formula per la predizione della difficoltà dei testi in lingua italiana"
- Wikipedia (Italian): [Indice Gulpease](https://it.wikipedia.org/wiki/Indice_Gulpease)

---

## General Tips to Improve Readability

1. **Use shorter sentences** — aim for 15–20 words on average
2. **Choose simple words** — prefer 1–2 syllable words when possible
3. **Avoid jargon** — use common alternatives to technical terms
4. **Use active voice** — "The team completed the project" vs. "The project was completed by the team"
5. **Break up long paragraphs** — use whitespace to improve visual readability
6. **Read aloud** — if you stumble, your readers will too

---

## Which Formula Should I Use?

| Purpose                 | Recommended Formula                |
| ----------------------- | ---------------------------------- |
| General English text    | Flesch-Kincaid Grade Level         |
| Healthcare/Medical      | SMOG Index                         |
| Technical documentation | ARI or Linsear Write               |
| Educational materials   | Dale-Chall                         |
| Portuguese text         | Flesch PT-BR or Gulpease           |
| Quick assessment        | Coleman-Liau or ARI (no syllables) |

---

_Document version: 1.0_  
_Last updated: December 2024_
