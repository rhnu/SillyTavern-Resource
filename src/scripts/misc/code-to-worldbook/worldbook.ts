import { createCodeEntry, selectWorldbookName } from './entry';

/** 点击时固定目标；写入失败直接报错，避免意外写到更低优先级的世界书。 */
export async function saveCodeToWorldbook(content: string): Promise<{ worldbookName: string; entryName: string }> {
  const entry = createCodeEntry(content);
  const chat = SillyTavern.getCurrentChatId() ? getChatWorldbookName('current') : null;
  const character = !chat && getCurrentCharacterId() !== null ? getCharWorldbookNames('current') : null;
  const global = !chat && !character?.primary && !character?.additional.length ? getGlobalWorldbookNames() : [];
  const worldbookName = selectWorldbookName({ chat, character, global });

  // 交给助手补全条目默认值，只追加条目，不创建或重新绑定世界书。
  await createWorldbookEntries(worldbookName, [entry]);
  return { worldbookName, entryName: entry.name };
}
