# Analysis plan for Notebook 5 (human labels), fixed before the results

*Written 2026-09-30, when 53 of 150 pairs were labelled and **before** anyone had compared the human labels with the dataset labels or scored any method on them. The commit time of this file is the evidence. The rules below don't change after the results come in. If one has to change for a technical reason, the change is written here with the date and the reason, and the paper says so.*

## What is tested

The paper's claim going in (after Notebooks 3b, 6a, 6b, 6c): the dataset's **Good vs Potential** label mostly reflects **how strong the resume is overall**, not how well it fits *that* job. Resume-only scorers recover it, and job-aware methods don't.

Nusrat labelled 150 pairs (42 jobs) judging fit to *that specific job*, without seeing the dataset label. If her labels are a better job-specific ground truth, the resume-level signal should be weaker on her labels than on the dataset's.

## Pre-specified quantities (full 150 labels only)

| ID | Quantity | Role |
|---|---|---|
| **P1** | **Δ-prior** = AUC(Good vs Potential) of the **resume-prior** on her labels − the same AUC on the dataset labels, with a 95% bootstrap CI (Notebook 5, section 3b) | **Primary test**, α = 0.05, two-sided, no correction (it is the only primary test) |
| **P2** | Cohen's κ between her and the dataset on Good vs Potential (pairs both call a fit) | Primary description |
| S1 | AUC(Good vs Potential) of **E5-base** on her labels, and its shift | Secondary. E5 is fixed now as *the* content method, so we don't pick the best-looking one afterwards |
| S2 | The same shift for TF-IDF, BGE, MPNet and the Qwen3 judges | Exploratory. Holm-corrected, reported in full |
| S3 | κ on 3 labels and on fit vs no fit | Description of overall label reliability |
| S4 | Qwen3-4B macro-F1 against her labels vs against the dataset labels | Description |

## What each outcome means for the paper (decided now)

Checked in this order. The first one that matches applies.

**D. The labels are noisy overall:** κ on 3 labels < 0.20 **and** κ on fit vs no fit < 0.40.
→ The headline shifts to label reliability: even the coarse fit/no-fit decision is unstable, so this benchmark shouldn't be used for fine-grained evaluation. The resume-level analysis (6a/6b/6c) stays as supporting evidence of *how* it fails.

**A. Claim confirmed:** the P1 CI lies entirely below 0 (the resume-prior loses power on her labels) **and** E5's AUC on her labels is ≥ 0.60 **or** its shift CI lies entirely above 0.
→ Headline as planned: the fine-grained benchmark label measures resume strength; job-specific human labels behave differently, and content methods can pick them up.

**B. Direction supported, not proven:** P1 is negative but its CI includes 0, **or** the prior drops significantly but E5 stays near chance.
→ The main evidence stays the within-dataset analyses (6a, 6b, 6c). The human study is reported as consistent with the claim but underpowered, and that goes in Threats to validity.

**C. Not supported:** P1 ≥ 0, or the P1 CI's lower bound is above −0.05, **and** κ on Good vs Potential ≥ 0.40.
→ She sees the same Good/Potential split as the dataset, so the label reflects resume strength that a human also recognises, and is not an annotation artifact. **Reframe:** "fine-grained fit in this benchmark is resume-level quality, and job-aware matchers can't recover it". The title changes, and the finding is reported honestly as it is.

**Anything else** (for example P1 is positive but κ is low): reported as inconclusive, and the paper leans on 6a/6b/6c, as in B.

## Rules that hold whatever the outcome

1. Only the **full 150** count. The partial preview (about 60 labels) is only a check that the pipeline runs. It doesn't change any rule here.
2. No pairs are added, removed or relabelled after the results are seen. The only exception is fixing unreadable entries (typos), which Notebook 5 lists before scoring.
3. Every quantity above is reported, including the ones that go against the claim.
4. The 150-pair sample and the pair order were fixed in Notebook 1 / 5a, before labelling.
5. **Power, stated in advance:** about 40–60 pairs will be Good-vs-Potential cases on each side, so an AUC's 95% CI will be roughly ±0.12–0.15 wide. Outcome B is a realistic result, and it is **not** a failure.
6. If a **second labeller** relabels a subset: their κ with Nusrat is reported. If the human–human κ on Good vs Potential is below the human–dataset κ, the paper says the fine distinction is hard even for people.

## Addendum 2026-10-04: second labeller (fixed before any second labels exist)

Written after Notebook 5 (outcome D) and **before** the second labeller has seen a single pair.

- **Who:** one colleague of Nusrat's, working alone, with no access to her labels, her notes or the dataset labels. Same three labels, written guide on the sheet's Instructions tab.
- **Sample:** 40 of the 150 pairs, stratified by Nusrat's label in proportion (11 Good, 10 Potential, 19 No), drawn with a fixed seed (20261004) by `src/make_second_labeller_sheet.js`; 24 jobs. Pair numbers: 13, 14, 15, 21, 22, 25, 27, 33, 34, 40, 42, 43, 48, 51, 52, 56, 60, 61, 62, 64, 71, 74, 75, 81, 84, 88, 94, 103, 105, 106, 109, 111, 113, 114, 120, 127, 128, 130, 135, 143.
- **Pre-specified quantities (on these 40):** κ (3 labels, fit vs no, Good vs Potential) for second labeller vs Nusrat (H2–H1), second labeller vs dataset (H2–D), and Nusrat vs dataset on the same 40 (H1–D), with bootstrap CIs and a paired bootstrap of κ(H2–H1) − κ(H2–D).
- **Reading, decided now:** if κ(H2–H1) > κ(H2–D) on fit vs no fit with the paired CI above 0, the two humans agree with each other more than with the dataset, which supports "the dataset labels are unreliable". If κ(H2–H1) is also low (< 0.20), the task is hard even for people, and the paper says so (rule 6 above). Anything in between is reported as inconclusive. With 40 pairs the CIs are wide; this is stated in Threats to validity.
- The 40 second labels are used as they come back; no pair is dropped or relabelled.

## Addendum 2026-10-06: round 1 set aside, round 2 on new pairs (fixed before round 2 starts)

- **What happened:** the round-1 sheet came back on 5 Oct with long, uniformly phrased notes. Before computing any agreement, Nusrat asked the second labeller whether an AI tool was used. On 6 Oct the answer was **yes**, although the sheet's rules said not to. Round 1 is therefore **set aside and not analysed**. No κ or any other comparison was ever computed on it. The file is kept, unused, at `data/second_labeller/round1_ai_assisted_NOT_USED.xlsx`.
- **Why new pairs, not the same 40:** the labeller has already seen AI judgements on the round-1 pairs, so a redo of those pairs would not be independent.
- **Round 2 sample:** 40 pairs drawn from the 110 of the 150 not used in round 1, with the same quota by Nusrat's label (11 Good, 10 Potential, 19 No), seed **20261006**, by `src/make_second_labeller_sheet_v2.js`; 27 jobs. Pair numbers: 4, 7, 8, 18, 23, 26, 29, 30, 31, 46, 54, 55, 58, 63, 66, 68, 70, 79, 80, 85, 89, 95, 97, 98, 101, 102, 104, 107, 112, 119, 124, 125, 126, 134, 136, 137, 139, 141, 144, 148.
- **Same labeller**, now explicitly told (in person and in bold on the sheet) that no AI tool may be used. The guide text is otherwise unchanged.
- **Analysis:** exactly the pre-specified quantities and reading of the 2026-10-04 addendum, applied to the round-2 pairs. The paper reports that a first round was discarded and why.

## Result 2026-10-09: round 2 analysed

- **Before analysis:** 33 of 40 notes used curly apostrophes (none straight; Nusrat's own Excel notes use straight ones), so Nusrat asked the labeller, before any agreement was computed, which device was used and whether any AI tool was used. Answer: **Mac** (which turns apostrophes curly automatically) and **no AI**. Round 2 accepted as is; no pair dropped or relabelled.
- **Script:** `src/second_labeller_agreement.js` (same κ definitions as Notebook 5, checked to reproduce its 0.120 / 0.324 / −0.184 on all 150; 2,000 bootstrap resamples, seed 20261006). Output: `data/second_labeller/round2_agreement.json`.
- **Fit vs no fit (40 pairs):** κ(H2–H1) 0.093 [−0.191, 0.395], κ(H2–D) 0.319 [−0.003, 0.595], κ(H1–D) 0.340 [0.040, 0.632]; paired κ(H2–H1) − κ(H2–D) = −0.226 [−0.550, 0.119].
- **Three labels:** H2–H1 0.115, H2–D 0.225, H1–D 0.319. **Good vs Potential** (both say fit): H2–H1 0.270 (n 13), H2–D 0.143 (n 18), H1–D 0.422 (n 17), all CIs span 0.
- **Reading per the plan:** the "humans agree more with each other than with the dataset" condition is NOT met → **inconclusive**; κ(H2–H1) < 0.20, so the paper says fit judgement is hard even for people.
- **Exploratory (not pre-specified):** fit-vs-no AUC on the 40 pairs, H1 / H2 / D labels: TF-IDF 0.812 / 0.573 / 0.637, E5 0.717 / 0.734 / 0.626, Qwen3-4B judge 0.787 / 0.698 / 0.788.

## Addendum 2026-10-19: reviewer checks (fixed before Notebook 9 is run)

Prompted by Mr. Md. Shohel Arman's review of the outline (received 19 Oct). Notebook: `notebooks/09_review_checks.ipynb` (CPU).

- **Near-duplicates (review point B).** IDs are hashes of the exact cleaned text, so near-copies get different IDs. A near-duplicate is a pair of different texts with TF-IDF cosine >= 0.90 (paper TF-IDF settings) **or** word 5-shingle Jaccard >= 0.50; 0.80/0.95 are sensitivity only. A 6a grid test pair is *affected* if its resume has a near-duplicate among that fold's strict-training resumes or its job has one among that fold's training jobs. Under 2% affected → the paper says near-duplicates are rare and do not explain the result. Otherwise the paper reports the clean-subset numbers; the memorisation conclusion holds if size-matched − strict stays positive with a CI excluding 0 for both AUC fit-vs-no and NDCG@5 on the clean subset (6a's saved scores, no retraining). The same counts are reported for the standard/strict split.
- **Job-clustered intervals (review point D).** κ (author vs dataset, 150 pairs; second annotator, 40 pairs) and the Good-vs-Potential AUC shifts are re-bootstrapped by resampling whole jobs (2,000 resamples, seed 42). Point estimates are unchanged. Any CI that changes from excluding to including 0 (or the reverse) is reported in Section 6.3.
- **Resume-level features (review point C).** Already tested in Notebook 6b before the review (word count, stated years, degree level, distinct words, digits, lines/bullets; all |rho| <= 0.07, p >= 0.14, per-job AUC 0.44–0.52). The paper only needs to report it; no new test.

## Addendum 2026-10-19b: Notebook 9 result and follow-up (fixed before Notebook 9b is run)

- **Notebook 9 result:** 78 near-duplicate resume pairs (148 of 643 resumes have one; many word-for-word identical) and 18 job pairs (32 of 351 jobs). Standard/strict split: 25 of 434 test resumes have a near-copy in strict training (208 of 1,105 test pairs affected, with jobs). 6a grid: 384 of 1,630 test pairs affected (23.6%), so the clean-subset numbers are reported; the memorisation conclusion **holds** (size-matched − strict: AUC fit/no +0.026 [0.002, 0.051], NDCG@5 +0.057 [0.031, 0.083]). Job-clustered intervals change no κ conclusion; the Good-vs-Potential shifts keep CIs above 0 but E5 and BGE lose Holm significance (0.074).
- **Follow-up (Notebook 9b):** 6b/6c grouped the resume-text-only classifier by resume ID, so near-copies could leak across folds. Rerun with folds grouped by near-copy group. The claim "resume text alone predicts Good vs Potential on unseen resumes" is kept only if the per-job AUC over the 91 mixed jobs has a 95% CI above 0.5; otherwise it is withdrawn. Tech/non-tech figures are updated either way.
- **Notebook 9b result (2026-10-19):** 643 resume IDs form 568 near-copy groups (72 pairs + 1 group of 4); 351 job IDs form 334. Top near-copies differ only in separator characters ('–' vs '|') or moved date strings. Near-copies get closer Good shares than random pairs (mean |diff| 0.156 vs 0.246). Resume-text-only per-job AUC over the 91 mixed jobs, near-copy grouped: **0.598 [0.552, 0.645]** (was 0.635 by resume ID) → claim **KEPT**. Tech mixed 0.623 [0.570, 0.677], non-tech mixed 0.546 [0.464, 0.631] (p 0.29); tech words removed 0.603 [0.558, 0.650].

## Addendum 2026-10-19c: self-check (intra-rater) relabelling, fixed before the sheet is made

- **Purpose:** measure how consistent the author is with herself (test–retest), to read next to the low inter-annotator agreement. It never changes the original 150 labels.
- **Sample:** 30 of the 150 pairs, 10 per original author label (Good / Potential / No), drawn with seed 20261019 by `src/make_self_check_sheet.js`, after excluding the 26 strongest disagreements (dataset Good vs author No, dataset No vs author Good), so the check is not tilted toward the pairs the paper discusses most. Pairs get new IDs (S01–S30) and a new random order; no old label, note, dataset label or pair number is shown. Key: `data/self_check/key.csv`.
- **Conditions:** same guide and blind conditions as the original labelling, no AI tools, no looking at the old sheet. About two weeks after the original labelling, so some memory of the pairs is possible; the paper says so.
- **Analysis:** Cohen's κ, original vs self-check, on three labels and fit vs no fit, with 2,000 pair-bootstrap CIs, plus the 3×3 table. Reading: if self-agreement (fit vs no fit) is clearly higher than the two humans' 0.093, the low inter-annotator agreement reflects different judges rather than random labelling by the author; if it is also low (< 0.40), the paper says fit judgement is unstable even within one person. Reported in Supplementary S4 and one sentence in Section 6.3, only if the page budget allows; otherwise Supplementary only.
- **Self-check result (2026-10-19, `src/self_check_agreement.js`, data/self_check/):** 30/30 relabelled, every pair with a note. Original vs self-check: three labels κ 0.300 [0.061, 0.546] (raw 0.533); fit vs no fit κ **0.426 [0.146, 0.722]** (raw 0.700). Counts No/Potential/Good: original 10/10/10, self-check 17/10/3: the author became stricter (6 Potential→No, 2 Good→No, 5 Good→Potential, 1 No→Potential, no upward moves to Good). Reading per the rule: self-agreement on fit vs no fit (0.43, CI lower bound 0.15) is above the two humans' 0.093 and not below 0.40, so the low inter-annotator agreement reflects different judges more than random labelling; the downward drift shows the author's threshold is not fixed over time. Reported in Supplementary S4.

## Addendum 2026-11-08: blind-review checks (fixed before Notebook 10 is run)

A reviewer with no prior knowledge of the study read the 25-page draft. Two of its points are answered here.

- **Result (computed 2026-11-08 from 06a_cv_pair_scores.parquet, reviewer issues 2 and 10):** per-job fit-vs-no AUC on the 5x5 grid (179 jobs with both fit and no fit in their test list; mean over jobs, bootstrap CI over jobs, sign-flip p, Holm over 6 comparisons): standard − strict +0.104 [0.066, 0.141], size-matched − strict +0.087 [0.052, 0.122], standard − size-matched +0.017 [−0.001, 0.035] (Holm p 0.065), strict − zero-shot BGE +0.071, − E5 +0.088, − TF-IDF +0.088 (all Holm p < 0.001). The constant strict resume-prior scores exactly 0.500 per job, so its pooled 0.454 reflects fold composition. Grid test lists are short: 306 jobs, median 4 candidates (49% have 3 or fewer). NDCG@5 ties were already broken at random (6a). The memorisation conclusion holds per job.
- **Notebook 10 (reviewer issue 1):** the resume-prior may carry real fit if a resume's other jobs are related to the target job. Recompute the prior from the resume's other jobs whose E5 job–job cosine is below the target job's median similarity to all other jobs (primary). Variants: least-similar quarter, TF-IDF similarity, covered-candidates-only, and the similar half for contrast. Primary measure: per-job Good-vs-Potential AUC (mixed jobs, as in Notebook 3b; global-mean fallback as in 3b), bootstrap CI over jobs, seed 42.
  - **KEPT:** CI lower bound > 0.5 **and** (AUC − 0.5) / (0.727 − 0.5) ≥ 0.5 → the "follows the resume" claim stays, with this check added.
  - **PARTLY:** CI lower bound > 0.5 but less than half of the excess remains → say part of the prior's signal is fit on related jobs.
  - **WITHDRAWN:** CI includes 0.5 → the within-job "follows the resume" claim is withdrawn; keep only "set mostly by the job".
- **Result 2026-11-08 (Notebook 10 run):** reproduction of 3b exact (max diff 1e-16). Primary E5 dissimilar-half prior: per-job G/P AUC 0.637 [0.593, 0.681], 60% of the excess kept → **KEPT**. TF-IDF dissimilar half 0.659 (70%); least-similar quarter E5 0.584 / TF-IDF 0.592 (37–41%, CI > 0.5); similar half 0.716. Fit-vs-no from dissimilar jobs falls to chance (0.477 [0.448, 0.505]) vs 0.665 full. Reading: G/P keeps a resume-level signal that related-job fit does not explain, though part of the 0.727 is related-job fit and the signal shrinks with similarity; fit vs no fit behaves like real job-specific fit.
