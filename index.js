// 安静输入 — generated configuration; MIT license.
const DEFAULTS = Object.freeze({
  "enabled": true,
  "mobileOnly": true,
  "mode": "always",
  "guardMs": 1500
});

(function extensionRuntime(DEFAULTS) {
    // This extension only intercepts focus on the main chat textarea.
    // It does not read messages, alter characters, send requests, or change input values.
    const KEY = 'st_quiet_input_v1';
    const API = '__stQuietInputV1';
    globalThis[API]?.stop?.();
    let active = false;
    let context;
    let settings;
    let guardUntil = 0;
    let manualUntil = 0;
    let keyboardUntil = 0;
    let nativeFocus;
    let wrappedFocus;
    let panel;
    const subscriptions = [];
    const controllerListeners = [];
    function mobileDevice() {
      const ua = navigator.userAgent || '';
      return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
        (navigator.maxTouchPoints > 1 && globalThis.matchMedia?.('(pointer: coarse)').matches === true);
    }
    function applies() {
      return active && settings.enabled && (!settings.mobileOnly || mobileDevice());
    }
    function targetInput(element) {
      return element?.id === 'send_textarea' && element?.tagName === 'TEXTAREA' && element.ownerDocument === document;
    }
    function suppress() {
      return applies() && (settings.mode === 'always' || Date.now() < guardUntil) &&
        Date.now() >= manualUntil && Date.now() >= keyboardUntil;
    }
    function arm() {
      guardUntil = Date.now() + Math.max(600, Math.min(3000, Number(settings.guardMs) || 1500));
      manualUntil = 0;
      keyboardUntil = 0;
      const input = document.getElementById('send_textarea');
      if (targetInput(input) && document.activeElement === input && applies()) input.blur();
    }
    function pointer(event) {
      if (!event.isTrusted) return;
      const input = document.getElementById('send_textarea');
      const label = event.target?.closest?.('label');
      const intentional = targetInput(event.target) || (label?.htmlFor === 'send_textarea');
      manualUntil = intentional ? Date.now() + 1200 : 0;
      keyboardUntil = 0;
      // Pre-arm before a card tap is handled; CHAT_CHANGED re-arms after loading.
      if (!intentional && event.target?.closest?.('.character_select, .group_select, .select_chat_block')) arm();
      if (intentional && input) return;
    }
    function key(event) {
      // Preserve keyboard navigation and screen-reader activation.
      if (event.isTrusted && (event.key === 'Tab' || event.key === 'Enter' || event.key === ' ')) {
        keyboardUntil = Date.now() + 1200;
      }
    }
    function capturedFocus(event) {
      // Fallback when another extension calls a previously saved native focus method.
      // Blur cannot guarantee that the OS keyboard never briefly appears.
      if (targetInput(event.target) && suppress()) event.target.blur();
    }
    function listen(name, fn) {
      document.addEventListener(name, fn, true);
      controllerListeners.push([name, fn]);
    }
    function subscribe(name, fn) {
      const type = context.eventTypes?.[name] ?? context.event_types?.[name];
      if (type && context.eventSource?.on) {
        context.eventSource.on(type, fn);
        subscriptions.push([type, fn]);
      }
    }
    function persist() {
      context.saveSettingsDebounced?.();
      arm();
    }
    function mountSettings() {
      if (!active || panel) return;
      const host = document.getElementById('extensions_settings2') || document.getElementById('extensions_settings');
      if (!host) return;
      panel = document.createElement('div');
      panel.id = 'st-quiet-input-settings';
      panel.className = 'inline-drawer';
      panel.innerHTML = '<div class="inline-drawer-toggle inline-drawer-header"><b>安静输入</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div>' +
        '<div class="inline-drawer-content">' +
        '<label class="checkbox_label"><input data-quiet="enabled" type="checkbox"><span>启用输入法保护</span></label>' +
        '<label class="checkbox_label"><input data-quiet="mobileOnly" type="checkbox"><span>仅在移动设备生效</span></label>' +
        '<label>拦截范围 <select class="text_pole" data-quiet="mode"><option value="always">所有自动聚焦（推荐）</option><option value="window">仅打开 / 切换时</option></select></label>' +
        '<label>保护时长（毫秒，仅短时模式）<input class="text_pole" data-quiet="guardMs" type="number" min="600" max="3000" step="100"></label>' +
        '<small>手动点击聊天框照常输入。系统输入法和其他扩展的行为可能因版本不同而异。</small>' +
        '<button class="menu_button" data-quiet-reset type="button">恢复文件内默认设置</button></div>';
      host.appendChild(panel);
      function sync() {
        panel.querySelectorAll('[data-quiet]').forEach(control => {
          const name = control.dataset.quiet;
          if (control.type === 'checkbox') control.checked = Boolean(settings[name]);
          else control.value = settings[name];
          if (name === 'guardMs') control.disabled = settings.mode !== 'window';
        });
      }
      panel.addEventListener('change', event => {
        const name = event.target.dataset.quiet;
        if (!name) return;
        settings[name] = event.target.type === 'checkbox' ? event.target.checked :
          name === 'guardMs' ? Math.max(600, Math.min(3000, Number(event.target.value) || 1500)) : event.target.value;
        persist(); sync();
      });
      panel.querySelector('[data-quiet-reset]').addEventListener('click', () => {
        Object.assign(settings, DEFAULTS); persist(); sync();
      });
      sync();
    }
    function start() {
      if (active) return;
      if (!globalThis.SillyTavern?.getContext || !globalThis.HTMLTextAreaElement) return;
      context = globalThis.SillyTavern.getContext();
      if (!context.extensionSettings || !context.eventSource) {
        console.warn('[安静输入] 当前 SillyTavern 缺少扩展接口，请更新后重试。'); return;
      }
      if (!context.extensionSettings[KEY]) context.extensionSettings[KEY] = { ...DEFAULTS };
      settings = context.extensionSettings[KEY];
      for (const [name, value] of Object.entries(DEFAULTS)) if (!(name in settings)) settings[name] = value;
      active = true;
      nativeFocus = HTMLTextAreaElement.prototype.focus;
      const previousFocus = nativeFocus;
      wrappedFocus = function (...args) {
        // Refocusing an already active input must not interrupt ongoing typing.
        if (targetInput(this) && document.activeElement !== this && suppress()) return;
        return previousFocus.apply(this, args);
      };
      HTMLTextAreaElement.prototype.focus = wrappedFocus;
      listen('pointerdown', pointer);
      // Touch fallback for browsers without Pointer Events.
      if (!('PointerEvent' in globalThis)) listen('touchstart', pointer);
      listen('keydown', key);
      listen('focus', capturedFocus);
      subscribe('CHAT_CHANGED', arm);
      subscribe('APP_INITIALIZED', () => { if (active) arm(); });
      subscribe('APP_READY', () => { if (active) { arm(); mountSettings(); } });
      arm();
      mountSettings();
    }
    function stop() {
      active = false;
      for (const [name, fn] of controllerListeners.splice(0)) document.removeEventListener(name, fn, true);
      for (const [type, fn] of subscriptions.splice(0)) {
        if (context?.eventSource?.off) context.eventSource.off(type, fn);
        else context?.eventSource?.removeListener?.(type, fn);
      }
      if (globalThis.HTMLTextAreaElement?.prototype.focus === wrappedFocus) HTMLTextAreaElement.prototype.focus = nativeFocus;
      panel?.remove(); panel = null;
      manualUntil = 0; keyboardUntil = 0; guardUntil = 0;
    }
    globalThis[API] = { start, stop };
    start();
  })(DEFAULTS);

export function onActivate() { globalThis.__stQuietInputV1?.start(); }
export function onEnable() { globalThis.__stQuietInputV1?.start(); }
export function onDisable() { globalThis.__stQuietInputV1?.stop(); }
export function onDelete() { globalThis.__stQuietInputV1?.stop(); }
