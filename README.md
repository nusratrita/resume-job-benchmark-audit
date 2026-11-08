# What Do Resume–Job Matching Benchmarks Actually Measure?

Code, data splits, human labels and result files for the paper
**"What Do Resume–Job Matching Benchmarks Actually Measure? Keywords, Embeddings and LLMs on Public Data"**
(Nusrat Jahan Rita, 2026).

The study compares keyword methods (TF-IDF, BM25), sentence embeddings (zero-shot and fine-tuned)
and a small open LLM judge on the public
[resume-job-description-fit](https://huggingface.co/datasets/cnamuangtoun/resume-job-description-fit)
dataset, and then asks what the benchmark rewards: resume leakage between training and test data,
a Good vs Potential Fit label that is set mostly by the job and the resume, low agreement between
people, and embedding scores that rise when markdown is added to a resume.

**No resume or job text is included in this repository.** The dataset is not redistributed;
Notebook 1 downloads it from Hugging Face, and every file here refers to jobs and resumes by ID only.

## Contents

| Path | Contents |
|---|---|
| `notebooks/` | Every experiment, numbered in run order (Google Colab). Saved outputs were removed because they printed parts of resumes. |
| `src/metrics.py` | Reference NDCG@k, P@k and MRR functions (each notebook carries its own copy, so it runs on its own) |
| `src/grid_perjob.mjs` | Per-job fit-vs-no AUC and test-list lengths for the 5 × 5 grid, from the released 6a scores (Node.js; `npm install hyparquet@1.13.6 hyparquet-compressors@1.1.1`, then `node src/grid_perjob.mjs`) |
| `release/splits/` | Pair-level split file and split summary |
| `release/labels/` | Human labels (author, second annotator, author self-check), IDs only |
| `release/results/` | Every result file behind the paper's tables and figures |

## IDs

The original dataset has no job or resume identifiers. Every `job_id` and `resume_id` is the first
10 hex digits of the MD5 hash of the cleaned text (Notebook 1), so the same IDs can be rebuilt from
the public data. A `pair_key` is `job_id` and `resume_id` joined by `|`.

## Splits (`release/splits/pairs.csv`)

One row per pair after cleaning (7,987 pairs, 351 jobs, 643 resumes).

| Column | Meaning |
|---|---|
| `job_id`, `resume_id` | IDs as above |
| `label`, `relevance` | Dataset label (Good / Potential / No Fit) and its grade (2 / 1 / 0) |
| `split` | Our split by job: `train` (245 jobs), `val` (53), `test` (53); `GroupShuffleSplit`, seed 42 |
| `source_file` | Which file of the original release the pair came from (not used for splitting: it shares 476 resumes between train and test) |
| `eval_usable` | Validation/test only: 1 if the job is usable for ranking (≥ 5 candidates, ≥ 1 fit candidate, ≥ 2 labels) |
| `in_strict_train` | Training rows only: 1 if the resume does not appear in the test split. The **strict split** is the same test jobs with training restricted to these rows. |

The 5 × 5 job × resume cross-validation grid (Notebook 6a) is built inside the notebook from these
IDs with seed 42; `release/results/06a_cv_design.csv` lists the size of every fold.

### Training-set sizes

| Model | Training pairs |
|---|---|
| BGE-base fine-tuned, standard split (Notebook 3) | 5,864 |
| BGE-base fine-tuned, strict split (Notebook 3) | 857 |
| 6a grid, standard (per fold) | 6,303–6,519 |
| 6a grid, strict and size-matched (per fold; size-matched is drawn to the strict size) | 4,956–5,346 |

## Human labels (`release/labels/`)

| File | Contents |
|---|---|
| `author_labels.csv` | The author's labels for 150 test-split pairs (50 per dataset label), given without seeing the dataset label: `pair_no`, IDs, `dataset_label`, `author_label` |
| `second_annotator_labels.csv` | A second annotator's labels for 40 of those pairs (stratified by the author's label, seed 20261006) |
| `self_check_labels.csv` | The author's second pass over 30 of the pairs (`self_check_id` S01–S30) |

The labelling rules are in the paper's Supplementary Information (Section S2). The free-text notes
written while labelling are not released. A first round of second-annotator labels was set aside
because an AI tool had been used; it was never analysed and is not included.

## Reproducing the results

All notebooks run on Google Colab and save their outputs to Google Drive under
`MyDrive/resume-job-matching/`; later notebooks read them from there. Run them in this order:

| Notebook | What it does | Runtime |
|---|---|---|
| `01_data_preparation` | Download, clean, assign IDs, remove duplicates, build the job-grouped split and the labelling sample | CPU |
| `02_baselines` | Random, TF-IDF and BM25 | CPU |
| `03_embeddings` | Zero-shot bi-encoders, cross-encoder, chunking, fine-tuning | T4 GPU |
| `03b_diagnostics` | Zero-shot methods on all usable jobs; resume-prior baseline | T4 GPU, 10–15 min |
| `04_llm_rerank` | Qwen3-4B (and Qwen3-1.7B) as a judge and as a top-10 re-ranker; latency | T4 GPU |
| `05_human_labels` | Human labels vs dataset labels (kappa, method scores on both) | CPU or T4, ~5 min |
| `06a_cv_memorisation` | Standard vs strict vs size-matched fine-tuning on the 5 × 5 grid (15 runs, resumable) | T4 GPU, 2–2.5 h |
| `06b_label_artifact` | What drives Good vs Potential Fit | CPU, ~5 min |
| `06c_checkpoint_tests` | Paired tests for 6a; technical vs non-technical jobs | CPU, 5–10 min |
| `08_ai_polished_resumes` | Phi-4-mini rewrites 200 resumes; score changes and fact checks | T4 GPU |
| `08b_cleaning_control` | Separates text cleaning from the rewrite | T4 GPU |
| `08c_markdown_injection` | Adds markdown to the original resumes without changing a word | T4 GPU, 10–15 min |
| `08d_markdown_models` | The markdown test on seven more embedding models (resumable) | T4 GPU, 25–35 min |
| `07_paper_tables_figures` | Rebuilds the tables and figures from the saved results | CPU, 10–15 min |
| `07b_figures_print_size` | Redraws the figures at print size (8 pt) | CPU |
| `09_review_checks` | Near-duplicate resumes and jobs, clean-subset re-test of 6a, job-clustered intervals | CPU, ~10 min |
| `09b_nearcopy_text_only` | Resume-text-only test with folds grouped by near-copy group | CPU |
| `10_prior_dissimilar_jobs` | Resume-prior computed only from jobs dissimilar to the target job (E5 / TF-IDF job similarity) | CPU, 5–10 min |

Random seeds are fixed (42 unless a notebook says otherwise). All GPU timings in the paper come from a
single NVIDIA T4 (16 GB); CPU timings from one thread on Colab.

**Human labels.** Notebook 1 writes `human_labelling_sample.xlsx` (the 150 pairs with an empty
`your_label` column). To rerun Notebook 5, fill `your_label` from `release/labels/author_labels.csv`
(match on `pair_no`). Notebook 9 carries the second annotator's labels in the notebook itself.

**Fine-tuned model.** The fine-tuned BGE weights are not released (about 420 MB); Notebook 3 retrains
them on a T4.

### Keyword lists

*Technical jobs* (Notebooks 6c and 9b). A job counts as technical when its text matches at least
3 of these 44 terms (case-insensitive; cut-offs 2 and 5 are reported as a sensitivity check):

```
software, developer(s), programmer/programming, javascript, typescript, python, java, sql, mysql,
postgres/postgresql, mongo/mongodb, html/html5, css/css3, php, .net/asp.net, c#, c++, react/react.js,
angular/angularjs, node.js, django, aws, azure, cloud, devops, docker, kubernetes, linux, database(s),
data science/analytics/engineering/warehousing, machine learning/deep learning,
network administration/engineering/security, cybersecurity, IT support/specialist/infrastructure/help desk,
information technology, full stack, front end, back end, web development/design/applications,
(REST) API(s), git/github, selenium/QA engineer/tester/analyst, tableau/power bi, sql server
```

The exact regular expressions are in the `TECH` dictionary in `06c_checkpoint_tests.ipynb`.

*AI/ML jobs* (Notebook 7, Supplementary Section S3). A job is in the AI/ML subset when its text matches
(case-insensitive):

```
machine learning|deep learning|artificial intelligence|\bAI\b|data scientist|data science|\bNLP\b|
natural language processing|computer vision|\bLLMs?\b|large language model|neural network|
tensorflow|pytorch|scikit-learn
```

The subset was to be reported only if it had at least 30 usable jobs (it has 35).

### Models

All models are open and downloaded from Hugging Face at run time:

- **Embeddings:** `intfloat/e5-base-v2`, `BAAI/bge-base-en-v1.5`,
  `sentence-transformers/all-mpnet-base-v2`, `sentence-transformers/all-MiniLM-L6-v2`,
  `nomic-ai/nomic-embed-text-v1.5`
- **Cross-encoder:** `cross-encoder/ms-marco-MiniLM-L-6-v2`
- **LLM judge:** `Qwen/Qwen3-4B-Instruct-2507`, `Qwen/Qwen3-1.7B`
- **Resume rewriter (Notebook 8):** `microsoft/Phi-4-mini-instruct`
- **Extra models in Notebook 8d:** `intfloat/e5-large-v2`, `intfloat/multilingual-e5-base`,
  `BAAI/bge-large-en-v1.5`, `thenlper/gte-base`, `sentence-transformers/all-MiniLM-L6-v2`,
  `Qwen/Qwen3-Embedding-0.6B` (`nomic-ai/nomic-embed-text-v1.5` failed to load; see `08d_failed.csv`)

### Library versions

The notebooks install the newest `transformers`, `accelerate`, `sentence-transformers`, `rank-bm25`,
`datasets`, `openpyxl` and `einops` with `pip -U` on top of the Colab image, and use Colab's own
`torch`, `scikit-learn`, `scipy`, `numpy`, `pandas` and `matplotlib`. The experiments ran between
27 Sep and 19 Oct 2026; the versions were not logged at run time. The versions below were recorded on a
fresh Colab runtime with the same install line on 8 Nov 2026 and are pinned in `requirements.txt`.
Versions in use during the runs may differ slightly, mainly for `transformers` and
`sentence-transformers`.

| Library | Version |
|---|---|
| Python | 3.13.18 |
| torch | 2.14.1 |
| transformers | 5.22.2 |
| sentence-transformers | 6.2.0 |
| accelerate | 1.15.0 |
| scikit-learn | 1.6.1 |
| scipy | 1.16.3 |
| numpy | 2.4.6 |
| pandas | 2.2.3 |
| pyarrow | 26.0.1 |
| matplotlib | 3.10.0 |
| rank-bm25 | 0.2.2 |
| datasets | 5.1.0 |
| openpyxl | 3.1.5 |
| einops | 0.8.2 |

## Analysis plan

[`ANALYSIS-PLAN.md`](ANALYSIS-PLAN.md) is the analysis plan for the human-label comparison
(primary test, secondary measures and the reading of each outcome), copied unchanged from the
project's private working repository. Its parts were committed there before the data they concern
were seen:

| Part | Committed |
|---|---|
| Main plan (Notebook 5) | 30 Sep 2026, before any comparison of the human labels with the dataset labels or a model |
| Second annotator: sample and analysis | 4 Oct 2026, before any second labels |
| Second annotator round 2 | 6 Oct 2026, before round-2 labelling |
| Review checks (Notebook 9), self-check | 19 Oct 2026, before running / before the self-check sheet existed |
| Resume-prior over dissimilar jobs (Notebook 10) | 8 Nov 2026, before running |

Results added to the file after each analysis are marked as such in the file.

## Citation

```
@article{rita2026benchmarks,
  author = {Rita, Nusrat Jahan},
  title  = {What Do Resume--Job Matching Benchmarks Actually Measure?
            Keywords, Embeddings and LLMs on Public Data},
  year   = {2026},
  note   = {Under review}
}
```

## Licence

Code: MIT (see `LICENSE`). Released labels, splits and result files: CC BY 4.0. The original dataset
keeps its own terms on Hugging Face.
