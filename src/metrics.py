"""Ranking metrics used in the evaluation: NDCG@k (graded), P@k and MRR.

Each function takes `ranked_rels`, the relevance grades of the candidates in
the order a model ranked them (Good Fit = 2, Potential Fit = 1, No Fit = 0).
The notebooks carry an identical copy so they run standalone on Colab.
"""
import numpy as np


def dcg(rels):
    rels = np.asarray(rels, dtype=float)
    return np.sum((2 ** rels - 1) / np.log2(np.arange(2, len(rels) + 2)))


def ndcg_at_k(ranked_rels, k):
    ideal = dcg(sorted(ranked_rels, reverse=True)[:k])
    return dcg(ranked_rels[:k]) / ideal if ideal > 0 else 0.0


def precision_at_k(ranked_rels, k, min_rel=2):
    return np.mean([r >= min_rel for r in ranked_rels[:k]])


def mrr(ranked_rels, min_rel=2):
    for i, r in enumerate(ranked_rels):
        if r >= min_rel:
            return 1.0 / (i + 1)
    return 0.0


def score_query(ranked_rels):
    return {
        "NDCG@5": ndcg_at_k(ranked_rels, 5),
        "NDCG@10": ndcg_at_k(ranked_rels, 10),
        "P@5": precision_at_k(ranked_rels, 5),
        "MRR": mrr(ranked_rels),
    }
