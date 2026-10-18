type WorldbookBindings = {
  chat: string | null;
  character: CharWorldbooks | null;
  global: string[];
};

/** 角色主世界书优先于附加世界书；同级保留宿主给出的顺序。 */
export function selectWorldbookName(bindings: WorldbookBindings): string {
  const name = bindings.chat ?? bindings.character?.primary ?? bindings.character?.additional[0] ?? bindings.global[0];
  if (!name) throw new Error('未找到可用的聊天、角色卡或全局世界书。');
  return name;
}

/** 只用首个非空行生成名称，正文保留代码块的空白和换行。 */
export function createCodeEntry(content: string): Pick<WorldbookEntry, 'name' | 'content'> {
  const name = content
    .split(/\r\n|\r|\n/)
    .find(line => line.trim())
    ?.trim();
  if (!name) throw new Error('代码块为空，无法创建世界书条目。');
  return { name, content };
}
