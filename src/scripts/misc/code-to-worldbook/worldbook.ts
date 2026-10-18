import { createCodeEntry, selectWorldbookName } from './entry';

/** 点击时固定目标；写入失败直接报错，避免意外写到更低优先级的世界书。 */
export async function saveCodeToWorldbook(content: string): Promise<{ worldbookName: string; entryName: string }> {
  const entry = createCodeEntry(content);
  const chat = SillyTavern.getCurrentChatId() ? getChatWorldbookName('current') : null;
  const character = !chat && getCurrentCharacterId() !== null ? getCharWorldbookNames('current') : null;
  const global = !chat && !character?.primary && !character?.additional.length ? getGlobalWorldbookNames() : [];
  const worldbookName = selectWorldbookName({ chat, character, global });

  // 显式设置插入位置与递归限制，其余字段由助手补全默认值。
  await createWorldbookEntries(worldbookName, [
    {
      ...entry,
      position: { type: 'before_character_definition' },
      recursion: { prevent_incoming: true, prevent_outgoing: true },
    },
  ]);
  return { worldbookName, entryName: entry.name };
}
