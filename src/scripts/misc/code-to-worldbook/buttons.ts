import { createLogger } from '@util/core/logger';
import { getHostDocument } from '@util/st/dom/host';
import { saveCodeToWorldbook } from './worldbook';

const logger = createLogger('代码块转世界书');
const buttonClass = 'resource-code-worldbook-button';
const codeSelector = '#chat .mes .mes_text pre > code';

/** 补充宿主代码块操作；观察重绘产生的节点，卸载时移除全部注入内容。 */
export function mountCodeWorldbookButtons(): () => void {
  const doc = getHostDocument();
  const $doc = $(doc);
  let destroyed = false;
  // 助手的追加操作包含读写过程，串行处理本脚本的写入以免相互覆盖。
  let saving = false;
  const $style = $('<style>')
    .attr('script_id', getScriptId())
    .text(`
    ${codeSelector}:has(> .${buttonClass}) { padding-top: 2.2em; }
    ${codeSelector} > .${buttonClass} {
      position: absolute; top: 0; right: 30px;
      display: inline-flex; align-items: center; justify-content: center;
      width: 22px; min-width: 22px; height: 22px; margin: 4px; padding: 0;
      border: 0; border-radius: 3px; background: none; color: inherit;
      font: inherit; line-height: 1; opacity: .4; cursor: pointer;
      white-space: nowrap; writing-mode: horizontal-tb;
    }
    ${codeSelector} > .${buttonClass}:hover,
    ${codeSelector} > .${buttonClass}:focus-visible { opacity: .8; }
    ${codeSelector} > .${buttonClass}:focus-visible { outline: 1px solid currentColor; }
    ${codeSelector} > .${buttonClass}:disabled { opacity: .2; cursor: wait; }
  `)
    .appendTo(doc.head);

  function addButtons(root: Element): void {
    const $codes = $(root).find('pre > code').add(root).filter(codeSelector);
    $codes.each((_, code) => {
      if ($(code).children(`.${buttonClass}`).length) return;
      $('<button>', {
        type: 'button',
        class: buttonClass,
        title: '创建世界书条目',
        'aria-label': '将代码块内容创建为世界书条目',
      })
        .prop('disabled', saving)
        // 按钮保持无文本，原生复制功能同样读取 code.textContent。
        .append($('<i>', { class: 'fa-solid fa-book-medical', 'aria-hidden': 'true' }))
        .appendTo(code);
    });
  }

  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === 1) addButtons(node as Element);
      }
    }
  });

  async function handleClick(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    if (destroyed || saving) return;
    const code = (event.currentTarget as HTMLElement).parentElement;
    if (!code) return;
    const content = code.textContent ?? '';
    saving = true;
    $doc.find(`.${buttonClass}`).prop('disabled', true);
    try {
      const result = await saveCodeToWorldbook(content);
      logger.info(`已在世界书「${result.worldbookName}」创建条目。`);
      if (!destroyed) {
        toastr.success(`已写入「${result.worldbookName}」：${result.entryName}`, '代码块转世界书', {
          escapeHtml: true,
        });
      }
    } catch (error) {
      logger.error('创建世界书条目失败。', error);
      if (!destroyed) {
        toastr.error(error instanceof Error ? error.message : '创建世界书条目失败，请查看控制台。', '代码块转世界书', {
          escapeHtml: true,
        });
      }
    } finally {
      saving = false;
      if (!destroyed) $doc.find(`.${buttonClass}`).prop('disabled', false);
    }
  }

  addButtons(doc.documentElement);
  observer.observe(doc.querySelector('#chat') ?? doc.body, { childList: true, subtree: true });
  $doc.on('click.codeToWorldbook', `.${buttonClass}`, handleClick);
  logger.info('代码块世界书按钮已加载。');

  return () => {
    if (destroyed) return;
    destroyed = true;
    observer.disconnect();
    $doc.off('click.codeToWorldbook', `.${buttonClass}`, handleClick);
    $doc.find(`.${buttonClass}`).remove();
    $style.remove();
  };
}
