// ==UserScript==
// @name         Synology Photos Bulk Rotate
// @namespace    https://github.com/tjsongwei/synology-photos-bulk-rotate
// @version      1.0.1
// @description  Bulk rotate selected photos in Synology Photos with R/L keyboard shortcuts.
// @author       tjsongwei
// @match        https://*/*
// @grant        none
// @run-at       document-idle
// @homepageURL  https://github.com/tjsongwei/synology-photos-bulk-rotate
// @supportURL   https://github.com/tjsongwei/synology-photos-bulk-rotate/issues
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const DEBUG = false;
    let busy = false;

    const log = (...args) => {
        if (DEBUG) console.log('[Synology Photos Bulk Rotate]', ...args);
    };

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    function isSynologyPhotosPage() {
        return location.href.includes('launchApp=SYNO.Foto.AppInstance') ||
            document.querySelector('.synofoto-selectable-wrapper, .synofoto-row-wrapper');
    }

    function isInputElement(el) {
        if (!el) return false;
        const tag = el.tagName?.toLowerCase();
        return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
    }

    function getSelectedPhotoIds() {
        return [...document.querySelectorAll('.synofoto-selectable-checkbox.checked')]
            .map(cb => {
                const wrapper = cb.closest('.synofoto-selectable-wrapper');
                const match = (wrapper?.dataset.testid || '').match(/^basic-selectable_(\d+)$/);
                return match ? Number(match[1]) : null;
            })
            .filter(Number.isFinite);
    }

    async function rotateByApi(ids, direction) {
        const form = new URLSearchParams();
        form.set('api', 'SYNO.FotoTeam.Browse.Item');
        form.set('method', 'set');
        form.set('version', '7');
        form.set('id', JSON.stringify(ids));
        form.set('rotate_action', JSON.stringify(direction));

        const response = await fetch('/webapi/entry.cgi/SYNO.FotoTeam.Browse.Item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            credentials: 'same-origin',
            body: form.toString()
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(`Synology API error: ${JSON.stringify(result)}`);
        }
        return result;
    }

    async function refreshThumbnails(ids) {
        const idSet = new Set(ids.map(String));
        await sleep(700);

        let count = 0;
        for (const wrapper of document.querySelectorAll('.synofoto-selectable-wrapper')) {
            const match = (wrapper.dataset.testid || '').match(/^basic-selectable_(\d+)$/);
            if (!match || !idSet.has(match[1])) continue;

            const img = wrapper.querySelector('img[data-testid="item-image"]');
            if (!img?.src) continue;

            try {
                const url = new URL(img.src);
                url.searchParams.set('_tm_refresh', `${Date.now()}_${match[1]}`);
                img.src = url.toString();
                count++;
            } catch (error) {
                console.warn('[Synology Photos Bulk Rotate] Thumbnail refresh failed:', match[1], error);
            }
        }
        log('Refreshed thumbnails:', count, '/', ids.length);
    }

    async function bulkRotate(direction) {
        if (busy) return true;

        const ids = getSelectedPhotoIds();
        if (!ids.length) return false;

        const label = direction === 'clockwise' ? '右' : '左';
        if (!confirm(`選択した ${ids.length} 枚の写真を${label}へ90°回転します。\n\n実行しますか？`)) {
            return true;
        }

        busy = true;
        try {
            await rotateByApi(ids, direction);
            await refreshThumbnails(ids);
            log(`Rotated ${ids.length} photo(s) ${direction}`);
        } catch (error) {
            console.error('[Synology Photos Bulk Rotate]', error);
            alert('回転処理に失敗しました。F12 → Console を確認してください。');
        } finally {
            busy = false;
        }
        return true;
    }

    function findMoreButton() {
        const candidates = [...document.querySelectorAll('button, [role="button"], div[class*="button"], span[class*="button"]')]
            .filter(el => {
                const r = el.getBoundingClientRect();
                return r.width > 0 && r.height > 0 &&
                    r.top < 180 && r.left > window.innerWidth * 0.65;
            })
            .sort((a, b) => b.getBoundingClientRect().left - a.getBoundingClientRect().left);
        return candidates[0] || null;
    }

    function findRotateMenu() {
        return [...document.querySelectorAll('[role="menuitem"], li, div, span')]
            .find(el => ['回転', 'Rotate'].includes(el.textContent?.trim()));
    }

    async function rotateViewerLeftOnce() {
        let rotate = findRotateMenu();
        if (!rotate) {
            const more = findMoreButton();
            if (!more) return false;
            more.click();

            for (let i = 0; i < 20; i++) {
                await sleep(100);
                rotate = findRotateMenu();
                if (rotate) break;
            }
        }

        if (!rotate) return false;
        rotate.click();
        await sleep(900);
        return true;
    }

    function getCurrentViewerPhotoId() {
        const img = document.querySelector('.synofoto-lightbox-image:not(.hidden)');
        if (!img?.src) return null;

        try {
            const id = new URL(img.src, location.href).searchParams.get('id');
            return id && /^\\d+$/.test(id) ? Number(id) : null;
        } catch (error) {
            log('Failed to get current viewer photo ID:', error);
            return null;
        }
    }

    async function rotateViewer(direction) {
        if (busy) return;
        busy = true;
        try {
            if (direction === 'clockwise') {
                const id = getCurrentViewerPhotoId();
                if (!Number.isFinite(id)) {
                    throw new Error('Could not determine the current photo ID.');
                }

                await rotateByApi([id], 'clockwise');
                log('Rotated viewer photo clockwise:', id);
                return;
            }

            if (!await rotateViewerLeftOnce()) {
                throw new Error('Could not find the Synology Photos rotate command.');
            }
        } catch (error) {
            console.error('[Synology Photos Bulk Rotate]', error);
            alert('回転処理に失敗しました。F12 → Console を確認してください。');
        } finally {
            busy = false;
        }
    }

    function getNavigationButtons() {
        return [...document.querySelectorAll('.nav-btn-icon')]
            .filter(el => {
                const r = el.getBoundingClientRect();
                return r.width > 0 && r.height > 0;
            })
            .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    }

    async function movePhoto(direction) {
        for (let i = 0; busy && i < 40; i++) await sleep(100);

        let buttons = getNavigationButtons();
        for (let i = 0; buttons.length < 2 && i < 30; i++) {
            await sleep(100);
            buttons = getNavigationButtons();
        }
        if (!buttons.length) return;

        const target = direction === 'next' ? buttons[buttons.length - 1] : buttons[0];
        (target.closest('button, [role="button"]') || target).click();
    }

    document.addEventListener('keydown', async event => {
        if (!isSynologyPhotosPage() || isInputElement(event.target)) return;
        if (event.ctrlKey || event.altKey || event.metaKey || event.repeat) return;

        const key = event.key.toLowerCase();

        if (key === 'r' || key === 'l') {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            const direction = key === 'r' ? 'clockwise' : 'counter_clockwise';
            if (!await bulkRotate(direction)) {
                await rotateViewer(direction);
            }
            return;
        }

        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            if (!getNavigationButtons().length) return;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            await movePhoto(event.key === 'ArrowRight' ? 'next' : 'prev');
        }
    }, true);

    log('v1.0.1 loaded');
})();
