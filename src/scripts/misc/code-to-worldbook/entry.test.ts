import { describe, expect, it } from 'vitest';
import { createCodeEntry, selectWorldbookName } from './entry';

describe('代码块目标世界书', () => {
  it('聊天绑定优先于角色卡和全局', () => {
    expect(
      selectWorldbookName({
        chat: '当前聊天',
        character: { primary: '角色主世界书', additional: ['附加世界书'] },
        global: ['全局一', '全局二'],
      }),
    ).toBe('当前聊天');
  });

  it('依次选取角色卡的主世界书和首个附加世界书', () => {
    expect(
      selectWorldbookName({
        chat: null,
        character: { primary: '角色主世界书', additional: ['附加一', '附加二'] },
        global: ['全局'],
      }),
    ).toBe('角色主世界书');
    expect(
      selectWorldbookName({
        chat: null,
        character: { primary: null, additional: ['附加一', '附加二'] },
        global: ['全局'],
      }),
    ).toBe('附加一');
  });

  it('没有聊天或角色世界书时使用首个全局世界书', () => {
    expect(selectWorldbookName({ chat: null, character: null, global: ['全局一', '全局二'] })).toBe('全局一');
    expect(
      selectWorldbookName({
        chat: null,
        character: { primary: null, additional: [] },
        global: ['全局一'],
      }),
    ).toBe('全局一');
  });

  it('没有任何绑定时失败', () => {
    expect(() => selectWorldbookName({ chat: null, character: null, global: [] })).toThrow('未找到');
  });
});

describe('代码块条目正文', () => {
  it('以首个非空行命名并保留缩进、换行与特殊字符', () => {
    const content = '\r\n  标题 <b>&\r\n    正文\r\n';
    expect(createCodeEntry(content)).toEqual({ name: '标题 <b>&', content });
  });

  it('JSON 也按原文保存，不解析为条目字段', () => {
    const content = '{"name":"另一个名称","content":"内容"}';
    expect(createCodeEntry(content)).toEqual({ name: content, content });
  });

  it('空白内容不能创建条目', () => {
    expect(() => createCodeEntry(' \n\t\r\n')).toThrow('代码块为空');
  });
});
