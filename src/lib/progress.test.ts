import { describe, it, expect } from 'vitest';
import { emptyProgress, recordAnswer, categoryStats, serialize, deserialize } from './progress';

describe('progress', () => {
  it('records an answer and counts correctness per question', () => {
    let p = emptyProgress();
    p = recordAnswer(p, 'fund-001', true);
    p = recordAnswer(p, 'fund-002', false);
    expect(p.answers['fund-001']).toBe(true);
    expect(p.answers['fund-002']).toBe(false);
  });

  it('latest answer for the same question overrides the previous', () => {
    let p = emptyProgress();
    p = recordAnswer(p, 'fund-001', false);
    p = recordAnswer(p, 'fund-001', true);
    expect(p.answers['fund-001']).toBe(true);
  });

  it('categoryStats computes answered/correct/rate over the given question ids', () => {
    let p = emptyProgress();
    p = recordAnswer(p, 'a', true);
    p = recordAnswer(p, 'b', false);
    const stats = categoryStats(p, ['a', 'b', 'c']);
    expect(stats).toEqual({ answered: 2, correct: 1, total: 3, rate: 0.5 });
  });

  it('serialize/deserialize round-trips', () => {
    let p = emptyProgress();
    p = recordAnswer(p, 'a', true);
    expect(deserialize(serialize(p))).toEqual(p);
  });

  it('deserialize returns empty progress on malformed input', () => {
    expect(deserialize('not json')).toEqual(emptyProgress());
  });
});
