import { mountCodeWorldbookButtons } from './buttons';

let activeDestroy: (() => void) | undefined;

function initialize(): void {
  activeDestroy?.();
  const unmount = mountCodeWorldbookButtons();
  activeDestroy = () => {
    $(window).off('pagehide.codeToWorldbook');
    unmount();
    activeDestroy = undefined;
  };
  $(window).on('pagehide.codeToWorldbook', activeDestroy);
}

$(() => errorCatched(initialize)());
