import { describe, it, expect } from 'vitest';
import { cellState, wrongIds, emptyProgress, recordAnswer } from './progress';

describe('cellState', () => {
  it('未回答 / 正解 / 不正解 を返す', () => {
    let p = emptyProgress();
    expect(cellState(p, 'a')).toBe('unanswered');
    p = recordAnswer(p, 'a', true);
    expect(cellState(p, 'a')).toBe('correct');
    p = recordAnswer(p, 'b', false);
    expect(cellState(p, 'b')).toBe('wrong');
  });
});

describe('wrongIds', () => {
  it('不正解のIDだけを入力順で返す', () => {
    let p = emptyProgress();
    p = recordAnswer(p, 'a', true);
    p = recordAnswer(p, 'b', false);
    p = recordAnswer(p, 'c', false);
    expect(wrongIds(p, ['c', 'b', 'a', 'd'])).toEqual(['c', 'b']);
  });
  it('不正解が無ければ空配列', () => {
    expect(wrongIds(emptyProgress(), ['a', 'b'])).toEqual([]);
  });
});
