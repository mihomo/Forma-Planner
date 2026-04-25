const { createApp, ref, computed } = Vue;

const POLARITIES = [
    { id: 'none', symbol: '∅', name: '无极性 (-)', shortName: '无', color: '#7f8794' },
    { id: 'madurai', symbol: 'V', name: 'Madurai (V)', shortName: 'V', color: '#ff5f6d' },
    { id: 'vazarin', symbol: 'D', name: 'Vazarin (D)', shortName: 'D', color: '#64e6ff' },
    { id: 'naramon', symbol: '—', name: 'Naramon (—)', shortName: '—', color: '#e8edf5' },
    { id: 'zenurik', symbol: '‖', name: 'Zenurik (‖)', shortName: '‖', color: '#58a6ff' },
    { id: 'unairu', symbol: 'R', name: 'Unairu (R)', shortName: 'R', color: '#ff9d57' },
    { id: 'penjaga', symbol: 'Y', name: 'Penjaga (Y)', shortName: 'Y', color: '#5ce08f' },
    { id: 'umbra', symbol: 'U', name: 'Umbra (U)', shortName: 'U', color: '#d5b56a' },
    { id: 'omni', symbol: '❂', name: '全能 (Omni)', shortName: '❂', color: '#ff9ee9' }
];

const POL_INDEX = {};
POLARITIES.forEach((p, i) => {
    POL_INDEX[p.id] = i;
});

const MAX_LOADOUTS = 5;
const NORMAL_SLOT_COUNT = 8;
const TOTAL_SLOT_COUNT = 9;
const SPECIAL_SLOT_INDEX = 8;
const MAX_SUGGESTIONS = 8;
const RAW_DATABASES = {
    'zh-hans': Array.isArray(window.WF_MOD_DATABASE) ? window.WF_MOD_DATABASE : [],
    en: Array.isArray(window.WF_MOD_DATABASE_EN) ? window.WF_MOD_DATABASE_EN : []
};
const SEARCH_LIMIT = 250000;
const SEARCH_TIMEOUT_MS = 12000;
const IMPOSSIBLE_COST = 1000000;

const I18N = {
    'zh-hans': {
        appTitle: '极化规划器',
        stepAria: '推演步骤',
        statLoadouts: '配置',
        statDatabase: '数据库',
        step1Title: '武器槽位',
        step2Title: '目标配置',
        step3Title: '极化结果',
        step1Desc: '先设定当前武器的已有极性与全局规则',
        step2Desc: '录入多套普通槽与劣化槽 MOD',
        step3Desc: '查看最省 Forma 的共同最优解',
        language: '语言',
        chinese: '中文',
        english: 'English',
        allowOverride: '允许覆盖已有极性',
        overrideMode: '覆盖模式',
        allow: '允许',
        protect: '保护',
        rareFormaStrategy: '稀有 Forma 策略',
        preferOmni: '优先使用全能福马',
        preferOmniHint: '多配置下节省 2 个及以上普通 Forma 时启用',
        preferUmbra: '优先使用 Umbra 福马',
        preferUmbraHint: '节省 2 个及以上普通 Forma 时启用',
        specialSlot: '特殊/劣化',
        specialSlotFull: '特殊/劣化槽',
        slotLabel: (n) => `槽位 ${n}`,
        copyCurrent: '复制当前',
        addLoadout: '新增配置',
        capacity: '容量',
        totalCapacity: '总容量',
        totalCapacityHint: '填写武器容量加上光环 MOD / 架势 MOD 后的总容量',
        syncCapacity: '同步容量',
        clearCurrent: '清空当前',
        dbLoaded: (count) => `中文 MOD 数据已载入：${count}`,
        dbOffline: '本地 MOD 数据库未载入',
        dbElementHint: '勾选“元素”的 MOD，在最终配卡中会保持相对顺序不变',
        dbTabHint: '输入完成后按 Tab，可快速移动到下一个位置',
        degradedSlot: '劣化槽',
        uninstall: '卸下',
        modName: 'MOD 名称',
        specialPlaceholder: '例如：机动瞄准',
        normalPlaceholder: '输入中文名',
        maxRank: '满级',
        customMeta: '保留当前填写的容量与极性',
        points: '点数',
        polarity: '极性',
        emptySlot: '空槽',
        element: '元素',
        recalc: '重新推演',
        times: '次',
        remaining: '剩余',
        short: '缺',
        capacityWarningTitle: '容量不足，但已给出最优站位',
        capacityWarningBody: (total, worst) => `即使按当前最优极化与站位，所有配置合计仍差 ${total} 点容量；单套配置最多差 ${worst} 点。`,
        formaWorkOrder: 'Forma 作业单',
        finalPlacement: '最终站位',
        needForma: '需极化',
        notInstalled: '未插卡',
        noResultTitle: '还没有结果',
        noResultHint: '完成前两步后开始推演。',
        wizardStep: (current) => `步骤 ${current} / 3`,
        prevStep: '上一步',
        nextStep: '下一步',
        startCalc: '开始推演',
        normalSlots: '普通槽',
        elementCount: (count) => `元素 ${count}`,
        specialSuffix: ' + 劣化槽',
        customLabel: (name) => `使用“${name}”作为自定义 MOD`,
        noValidLoadout: '请先至少录入一套有效配卡，再开始推演。',
        invalidCapacity: '存在非法总容量，请检查每套配置顶部填写的容量。',
        invalidModCost: '存在非法容量，请检查每张 MOD 的点数消耗。',
        timeout: '这组配置的搜索空间比较大，本次推演超时了。你可以先减少配置数量、取消部分元素顺序限制，或把明显不安装的劣化槽 MOD 卸下后再试。',
        noArrangement: '没有找到能同时兼容这些配置的共同极化站位。单套容量可能够，但多套配置、元素顺序或劣化槽限制之间发生了冲突。',
        headlineOver: (shortage) => `容量不足：最优站位仍差 ${shortage} 点`,
        headlineCompatible: '当前槽位已经兼容这些配置',
        headlineForma: (count) => `最少需要 ${count} 次极化`,
        loadoutLabel: (index) => `配置 ${index + 1}`,
        polNone: '无极性 (-)',
        polOmni: '全能 (Omni)'
    },
    en: {
        appTitle: 'Forma Planner',
        stepAria: 'Planner steps',
        statLoadouts: 'Builds',
        statDatabase: 'Database',
        step1Title: 'Weapon Slots',
        step2Title: 'Target Builds',
        step3Title: 'Results',
        step1Desc: 'Set current polarities and global rules',
        step2Desc: 'Enter normal-slot and Exilus builds',
        step3Desc: 'Review the lowest-Forma shared plan',
        language: 'Language',
        chinese: '中文',
        english: 'English',
        allowOverride: 'Allow overriding existing polarities',
        overrideMode: 'Override Mode',
        allow: 'Allow',
        protect: 'Protect',
        rareFormaStrategy: 'Rare Forma Strategy',
        preferOmni: 'Prefer Omni Forma',
        preferOmniHint: 'Use when it saves at least 2 regular Forma across multiple builds',
        preferUmbra: 'Prefer Umbra Forma',
        preferUmbraHint: 'Use when it saves at least 2 regular Forma',
        specialSlot: 'Exilus',
        specialSlotFull: 'Exilus Slot',
        slotLabel: (n) => `Slot ${n}`,
        copyCurrent: 'Duplicate',
        addLoadout: 'Add Build',
        capacity: 'Capacity',
        totalCapacity: 'Total Capacity',
        totalCapacityHint: 'Enter weapon capacity after Aura / Stance MOD bonus',
        syncCapacity: 'Sync Capacity',
        clearCurrent: 'Clear Build',
        dbLoaded: (count) => `English MOD database loaded: ${count}`,
        dbOffline: 'Local MOD database not loaded',
        dbElementHint: 'MODs marked as Element keep their relative order in the final layout',
        dbTabHint: 'Press Tab after typing a MOD name to jump to the next slot',
        degradedSlot: 'Exilus Slot',
        uninstall: 'Remove',
        modName: 'MOD Name',
        specialPlaceholder: 'e.g. Agile Aim',
        normalPlaceholder: 'Enter English name',
        maxRank: 'Max',
        customMeta: 'Keep current drain and polarity',
        points: 'Drain',
        polarity: 'Polarity',
        emptySlot: 'Empty',
        element: 'Element',
        recalc: 'Recalculate',
        times: 'times',
        remaining: 'Left',
        short: 'Short',
        capacityWarningTitle: 'Capacity is short, but the best layout is shown',
        capacityWarningBody: (total, worst) => `Even with the best current polarity layout, all builds are short by ${total} capacity total; the worst single build is short by ${worst}.`,
        formaWorkOrder: 'Forma Work Order',
        finalPlacement: 'Final Layout',
        needForma: 'Forma',
        notInstalled: 'Empty',
        noResultTitle: 'No result yet',
        noResultHint: 'Complete the first two steps, then calculate.',
        wizardStep: (current) => `Step ${current} / 3`,
        prevStep: 'Previous',
        nextStep: 'Next',
        startCalc: 'Calculate',
        normalSlots: 'normal slots',
        elementCount: (count) => `${count} elements`,
        specialSuffix: ' + Exilus',
        customLabel: (name) => `Use "${name}" as a custom MOD`,
        noValidLoadout: 'Enter at least one valid build before calculating.',
        invalidCapacity: 'Invalid total capacity. Check the capacity at the top of each build.',
        invalidModCost: 'Invalid drain. Check every MOD drain value.',
        timeout: 'This search space is large and the calculation timed out. Try fewer builds, fewer element-order constraints, or remove Exilus MODs you do not plan to install.',
        noArrangement: 'No shared polarity layout can satisfy these builds. A single build may fit, but multi-build, element-order, or Exilus constraints conflict.',
        headlineOver: (shortage) => `Capacity short: best layout still needs ${shortage}`,
        headlineCompatible: 'Current slots already fit these builds',
        headlineForma: (count) => `Minimum ${count} Forma`,
        loadoutLabel: (index) => `Build ${index + 1}`,
        polNone: 'None (-)',
        polOmni: 'Omni'
    }
};

let modIdSeed = 1;
let loadoutIdSeed = 1;

function getCost(modCost, modPol, slotPol) {
    if (modCost === 0) return 0;
    if (slotPol === 'none' || modPol === 'none') return modCost;
    if (modPol === slotPol || (slotPol === 'omni' && modPol !== 'umbra')) {
        return Math.ceil(modCost / 2);
    }
    return modCost + Math.ceil(modCost * 0.25);
}

function createMod(overrides = {}) {
    return {
        id: modIdSeed++,
        name: '',
        cost: 0,
        isElement: false,
        polarity: 'none',
        source: 'custom',
        dbKey: null,
        searchOpen: false,
        activeSuggestion: 0,
        isUtility: false,
        ...overrides
    };
}

function createEmptyMods() {
    return Array.from({ length: NORMAL_SLOT_COUNT }, () => createMod());
}

function createLoadout(overrides = {}) {
    return {
        id: loadoutIdSeed++,
        capacity: 60,
        mods: createEmptyMods(),
        specialMod: createMod(),
        ...overrides
    };
}

function normalizeKeyword(value) {
    return (value || '').trim().toLowerCase();
}

function stripPrimeSuffix(name) {
    return (name || '').replace(/\s*prime$/i, '').trim();
}

function sortScore(mod, keyword) {
    const rawName = mod.name || '';
    const name = rawName.toLowerCase();
    const baseName = stripPrimeSuffix(rawName).toLowerCase();
    let score = 0;

    if (!keyword) {
        score = mod.isPrime ? 40 : 0;
    } else if (name === keyword) {
        score = 1300 + (mod.isPrime ? 80 : 0);
    } else if (baseName === keyword) {
        score = 1200 + (mod.isPrime ? 80 : 0);
    } else if (baseName.startsWith(keyword)) {
        score = 950 + (mod.isPrime ? 80 : 0);
    } else if (name.startsWith(keyword)) {
        score = 900 + (mod.isPrime ? 80 : 0);
    } else if (baseName.includes(keyword)) {
        score = 760 + (mod.isPrime ? 80 : 0);
    } else if (name.includes(keyword)) {
        score = 720 + (mod.isPrime ? 80 : 0);
    }

    score -= rawName.length / 100;
    score += Math.min(mod.maxDrain || 0, 30) / 1000;
    return score;
}

function normalizeDatabaseMod(mod) {
    return {
        ...mod,
        polarity: POL_INDEX[mod.polarity] !== undefined ? mod.polarity : 'none',
        baseDrain: Number.isFinite(mod.baseDrain) ? mod.baseDrain : 0,
        fusionLimit: Number.isFinite(mod.fusionLimit) ? mod.fusionLimit : 0,
        maxDrain: Number.isFinite(mod.maxDrain) ? mod.maxDrain : ((mod.baseDrain || 0) + (mod.fusionLimit || 0)),
        isPrime: Boolean(mod.isPrime),
        isUtility: Boolean(mod.isUtility)
    };
}

function getDatabaseVariantRank(mod) {
    const uniqueName = mod.uniqueName || '';
    if (uniqueName.includes('OnHeavyKill')) return 0;
    if (uniqueName.includes('/Beginner/')) return 1;
    if (uniqueName.includes('/Expert/')) return 2;
    return 3;
}

function isBetterDatabaseMod(candidate, existing) {
    const candidateRank = getDatabaseVariantRank(candidate);
    const existingRank = getDatabaseVariantRank(existing);
    if (candidateRank !== existingRank) {
        return candidateRank > existingRank;
    }
    return candidate.maxDrain > existing.maxDrain;
}

function buildDatabase(rawMods) {
    const deduped = new Map();

    for (const rawMod of rawMods) {
        const mod = normalizeDatabaseMod(rawMod);
        const key = [mod.name, mod.polarity, mod.type, mod.isPrime, mod.isUtility].join('::');
        const existing = deduped.get(key);
        if (!existing || isBetterDatabaseMod(mod, existing)) {
            deduped.set(key, mod);
        }
    }

    return Array.from(deduped.values());
}

function hasModData(mod) {
    return Boolean(mod && mod.name.trim());
}

function getDefaultLanguage() {
    const languages = Array.isArray(navigator.languages) && navigator.languages.length
        ? navigator.languages
        : [navigator.language || ''];
    return languages.some((language) => String(language).toLowerCase().startsWith('zh'))
        ? 'zh-hans'
        : 'en';
}

createApp({
    setup() {
        const currentLanguage = ref(getDefaultLanguage());
        const allowOverride = ref(true);
        const preferOmniForma = ref(false);
        const preferUmbraForma = ref(false);
        const slots = ref(new Array(TOTAL_SLOT_COUNT).fill('none'));
        const result = ref(null);
        const activeLoadoutIndex = ref(0);
        const viewResultLoadout = ref(0);
        const currentStep = ref(1);
        const modDatabases = {
            'zh-hans': buildDatabase(RAW_DATABASES['zh-hans']),
            en: buildDatabase(RAW_DATABASES.en)
        };
        const modDatabase = computed(() => modDatabases[currentLanguage.value] || []);
        const steps = computed(() => [
            { id: 1, title: t('step1Title'), desc: t('step1Desc') },
            { id: 2, title: t('step2Title'), desc: t('step2Desc') },
            { id: 3, title: t('step3Title'), desc: t('step3Desc') }
        ]);

        const loadouts = ref([
            createLoadout({
                capacity: 60,
                mods: createEmptyMods(),
                specialMod: createMod()
            })
        ]);

        const polarities = POLARITIES;
        const databaseReady = computed(() => modDatabase.value.length > 0);
        const activeLoadout = computed(() => loadouts.value[activeLoadoutIndex.value] || createLoadout());
        const totalFilledMods = computed(() => loadouts.value.reduce((sum, loadout) => sum + getFilledModCount(loadout), 0));
        const totalConfiguredLoadouts = computed(() => loadouts.value.filter((loadout) => hasAnyData(loadout)).length);
        const canGoNext = computed(() => {
            if (currentStep.value === 1) return true;
            if (currentStep.value === 2) return totalConfiguredLoadouts.value > 0;
            return false;
        });
        const canCalculate = computed(() => totalConfiguredLoadouts.value > 0);

        document.documentElement.lang = currentLanguage.value === 'en' ? 'en' : 'zh';

        function t(key, ...args) {
            const dict = I18N[currentLanguage.value] || I18N['zh-hans'];
            const fallback = I18N['zh-hans'];
            const value = dict[key] ?? fallback[key] ?? key;
            return typeof value === 'function' ? value(...args) : value;
        }

        function setLanguage(language) {
            currentLanguage.value = language;
            document.documentElement.lang = language === 'en' ? 'en' : 'zh';
            result.value = null;
        }

        function getPol(id) {
            return polarities.find((p) => p.id === id) || polarities[0];
        }

        function getPolName(id) {
            if (id === 'none') return t('polNone');
            if (id === 'omni') return t('polOmni');
            return getPol(id).name;
        }

        function getFilledModCount(loadout) {
            const normalCount = loadout.mods.filter(hasModData).length;
            return normalCount + (hasModData(loadout.specialMod) ? 1 : 0);
        }

        function hasAnyData(loadout) {
            return getFilledModCount(loadout) > 0;
        }

        function getLoadoutLabel(index) {
            return t('loadoutLabel', index);
        }

        function getLoadoutSummary(loadout) {
            const normalCount = loadout.mods.filter(hasModData).length;
            const specialInstalled = hasModData(loadout.specialMod);
            const elementCount = loadout.mods.filter((mod) => hasModData(mod) && mod.isElement).length;
            return `${normalCount}/8 ${t('normalSlots')}${specialInstalled ? t('specialSuffix') : ''}${elementCount ? ` · ${t('elementCount', elementCount)}` : ''}`;
        }

        function getEstimatedDrain(loadout) {
            const normalDrain = loadout.mods.reduce((sum, mod) => sum + (hasModData(mod) ? Number(mod.cost || 0) : 0), 0);
            return normalDrain + (hasModData(loadout.specialMod) ? Number(loadout.specialMod.cost || 0) : 0);
        }

        function addLoadout() {
            if (loadouts.value.length >= MAX_LOADOUTS) return;
            loadouts.value.push(createLoadout({
                capacity: activeLoadout.value.capacity || 60
            }));
            activeLoadoutIndex.value = loadouts.value.length - 1;
            result.value = null;
        }

        function removeLoadout(index) {
            loadouts.value.splice(index, 1);
            if (activeLoadoutIndex.value >= loadouts.value.length) {
                activeLoadoutIndex.value = Math.max(0, loadouts.value.length - 1);
            }
            result.value = null;
        }

        function clearMods() {
            activeLoadout.value.mods = createEmptyMods();
            activeLoadout.value.specialMod = createMod();
            result.value = null;
        }

        function markDirty() {
            result.value = null;
        }

        function cloneLoadout(index) {
            if (loadouts.value.length >= MAX_LOADOUTS) return;
            const source = loadouts.value[index];
            const cloned = createLoadout({
                capacity: source.capacity,
                mods: source.mods.map((mod) => createMod({
                    name: mod.name,
                    cost: mod.cost,
                    isElement: mod.isElement,
                    polarity: mod.polarity,
                    source: mod.source,
                    dbKey: mod.dbKey,
                    isUtility: mod.isUtility
                })),
                specialMod: createMod({
                    name: source.specialMod.name,
                    cost: source.specialMod.cost,
                    polarity: source.specialMod.polarity,
                    source: source.specialMod.source,
                    dbKey: source.specialMod.dbKey,
                    isUtility: source.specialMod.isUtility
                })
            });
            loadouts.value.splice(index + 1, 0, cloned);
            activeLoadoutIndex.value = index + 1;
            result.value = null;
        }

        function syncCapacityToAll() {
            const capacity = activeLoadout.value.capacity;
            loadouts.value.forEach((loadout) => {
                loadout.capacity = capacity;
            });
            result.value = null;
        }

        function setCustomMode(mod, customName = mod.name) {
            mod.source = 'custom';
            mod.dbKey = null;
            mod.name = customName;
            mod.searchOpen = false;
            mod.activeSuggestion = 0;
            mod.isUtility = false;
            result.value = null;
        }

        function clearSpecialMod(loadout) {
            loadout.specialMod = createMod();
            result.value = null;
        }

        function applyDatabaseMod(mod, dbMod) {
            mod.name = dbMod.name;
            mod.cost = dbMod.maxDrain;
            mod.polarity = dbMod.polarity;
            mod.source = 'database';
            mod.dbKey = dbMod.uniqueName;
            mod.searchOpen = false;
            mod.activeSuggestion = 0;
            mod.isUtility = Boolean(dbMod.isUtility);
            result.value = null;
        }

        function getSuggestions(mod, mode = 'normal') {
            const keyword = normalizeKeyword(mod.name);
            if (!keyword || !databaseReady.value) return [];

            const matches = modDatabase.value
                .filter((entry) => (mode === 'special' ? entry.isUtility : true))
                .map((entry) => ({ ...entry, score: sortScore(entry, keyword) }))
                .filter((entry) => entry.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, MAX_SUGGESTIONS)
                .map((entry) => ({
                    kind: 'database',
                    key: entry.uniqueName,
                    mod: entry
                }));

            matches.push({
                kind: 'custom',
                key: `${mode}:custom:${keyword}`,
                label: t('customLabel', mod.name.trim()),
                mod: null
            });

            return matches;
        }

        function selectSuggestion(mod, suggestion) {
            if (suggestion.kind === 'custom') {
                setCustomMode(mod, mod.name.trim());
                return;
            }
            applyDatabaseMod(mod, suggestion.mod);
        }

        function handleModNameInput(mod) {
            if (mod.source === 'database' && mod.dbKey) {
                mod.source = 'custom';
                mod.dbKey = null;
            }
            mod.searchOpen = Boolean(mod.name.trim());
            mod.activeSuggestion = 0;
            result.value = null;
        }

        function handleNameFocus(mod) {
            mod.searchOpen = Boolean(mod.name.trim());
        }

        function closeSearch(mod) {
            window.setTimeout(() => {
                mod.searchOpen = false;
            }, 120);
        }

        function openSearch(mod) {
            if (mod.name.trim()) {
                mod.searchOpen = true;
            }
        }

        function moveSuggestion(mod, direction, mode = 'normal') {
            const suggestions = getSuggestions(mod, mode);
            if (!suggestions.length) return;
            mod.searchOpen = true;
            mod.activeSuggestion = (mod.activeSuggestion + direction + suggestions.length) % suggestions.length;
        }

        function confirmSuggestion(mod, mode = 'normal') {
            const suggestions = getSuggestions(mod, mode);
            if (!suggestions.length) {
                setCustomMode(mod, mod.name.trim());
                return;
            }
            const suggestion = suggestions[mod.activeSuggestion] || suggestions[0];
            selectSuggestion(mod, suggestion);
        }

        function focusNextModName(currentTarget, mode, index) {
            const nextTarget = mode === 'normal'
                ? document.querySelector(`[data-mod-name="normal-${index + 1}"]`) || document.querySelector('[data-mod-name="special"]')
                : document.querySelector('[data-capacity-input]');

            if (nextTarget && nextTarget !== currentTarget) {
                nextTarget.focus();
                nextTarget.select?.();
            }
        }

        function handleNameTab(event, mod, mode = 'normal', index = 0) {
            if (event.shiftKey) return;

            if (mod.name.trim()) {
                const suggestions = getSuggestions(mod, mode);
                if (suggestions.length) {
                    const suggestion = suggestions[mod.activeSuggestion] || suggestions[0];
                    selectSuggestion(mod, suggestion);
                } else {
                    setCustomMode(mod, mod.name.trim());
                }
            } else {
                setCustomMode(mod, '');
            }

            event.preventDefault();
            focusNextModName(event.target, mode, index);
        }

        function getNormalPlan(mods, slotList) {
            const paddedMods = [];
            for (let i = 0; i < NORMAL_SLOT_COUNT; i++) {
                if (i < mods.length) {
                    paddedMods.push(mods[i]);
                } else {
                    paddedMods.push({ cost: 0, polarity: 'none', isPad: true });
                }
            }

            const costMatrix = [];
            for (let i = 0; i < NORMAL_SLOT_COUNT; i++) {
                const row = new Int32Array(NORMAL_SLOT_COUNT);
                for (let j = 0; j < NORMAL_SLOT_COUNT; j++) {
                    row[j] = getCost(paddedMods[i].cost, paddedMods[i].polarity, slotList[j]);
                }
                costMatrix.push(row);
            }

            const memo = new Map();
            const choice = new Map();

            function solve(modIdx, usedMask, lastElementSlot) {
                if (modIdx === NORMAL_SLOT_COUNT) {
                    return 0;
                }

                const key = `${modIdx}|${usedMask}|${lastElementSlot}`;
                if (memo.has(key)) {
                    return memo.get(key);
                }

                const mod = paddedMods[modIdx];
                let bestCost = 100000;
                let bestSlot = -1;

                for (let slotIdx = 0; slotIdx < NORMAL_SLOT_COUNT; slotIdx++) {
                    if (usedMask & (1 << slotIdx)) continue;
                    if (mod.isElement && !mod.isPad && slotIdx <= lastElementSlot) continue;

                    const nextLastElementSlot = (mod.isElement && !mod.isPad) ? slotIdx : lastElementSlot;
                    const totalCost = costMatrix[modIdx][slotIdx] + solve(modIdx + 1, usedMask | (1 << slotIdx), nextLastElementSlot);

                    if (totalCost < bestCost) {
                        bestCost = totalCost;
                        bestSlot = slotIdx;
                    }
                }

                memo.set(key, bestCost);
                choice.set(key, bestSlot);
                return bestCost;
            }

            const minCost = solve(0, 0, -1);
            const assignment = new Array(NORMAL_SLOT_COUNT);
            const assignmentCosts = new Array(NORMAL_SLOT_COUNT).fill(0);

            let usedMask = 0;
            let lastElementSlot = -1;
            for (let modIdx = 0; modIdx < NORMAL_SLOT_COUNT; modIdx++) {
                const key = `${modIdx}|${usedMask}|${lastElementSlot}`;
                const slotIdx = choice.get(key);
                const mod = paddedMods[modIdx];
                assignment[slotIdx] = mod;
                assignmentCosts[slotIdx] = costMatrix[modIdx][slotIdx];
                usedMask |= (1 << slotIdx);
                if (mod.isElement && !mod.isPad) {
                    lastElementSlot = slotIdx;
                }
            }

            return {
                cost: minCost,
                assignment,
                assignmentCosts
            };
        }

        function buildLoadoutPlan(loadout, slotList) {
            const normalPlan = getNormalPlan(loadout.mods, slotList.slice(0, NORMAL_SLOT_COUNT));
            const hasSpecialMod = hasModData(loadout.specialMod);
            const specialCost = hasSpecialMod
                ? getCost(loadout.specialMod.cost, loadout.specialMod.polarity, slotList[SPECIAL_SLOT_INDEX])
                : 0;

            return {
                cost: normalPlan.cost + specialCost,
                assignment: normalPlan.assignment,
                assignmentCosts: normalPlan.assignmentCosts,
                specialMod: hasSpecialMod ? loadout.specialMod : null,
                specialCost,
                capacity: loadout.capacity
            };
        }

        function assignOriginalSlotsToFinal(finalPols, originalSlots) {
            const availableByPol = new Map();
            originalSlots.forEach((pol, index) => {
                if (!availableByPol.has(pol)) {
                    availableByPol.set(pol, []);
                }
                availableByPol.get(pol).push(index);
            });

            const usedOriginals = new Set();
            const finalSlots = finalPols.map((finalPol, slotIndex) => ({
                slotIndex,
                originalPol: null,
                finalPol,
                isForma: true
            }));

            for (let slotIndex = 0; slotIndex < finalPols.length; slotIndex++) {
                const finalPol = finalPols[slotIndex];
                const matchingOriginals = availableByPol.get(finalPol) || [];
                while (matchingOriginals.length && usedOriginals.has(matchingOriginals[0])) {
                    matchingOriginals.shift();
                }
                if (!matchingOriginals.length) continue;

                const originalIndex = matchingOriginals.shift();
                usedOriginals.add(originalIndex);
                finalSlots[slotIndex].originalPol = originalSlots[originalIndex];
                finalSlots[slotIndex].isForma = false;
            }

            const unusedOriginals = [];
            originalSlots.forEach((pol, index) => {
                if (!usedOriginals.has(index)) {
                    unusedOriginals.push(pol);
                }
            });

            for (const slot of finalSlots) {
                if (slot.originalPol !== null) continue;
                slot.originalPol = unusedOriginals.shift() || 'none';
                slot.isForma = slot.originalPol !== slot.finalPol;
            }

            return finalSlots;
        }

        function countOmniSlots(counts) {
            return counts[POL_INDEX.omni] || 0;
        }

        function countUmbraSlots(counts) {
            return counts[POL_INDEX.umbra] || 0;
        }

        function getAddedPolarityCount(targetCounts, initialCounts, polarityId) {
            const index = POL_INDEX[polarityId];
            return Math.max(0, (targetCounts[index] || 0) - (initialCounts[index] || 0));
        }

        function isExpensiveFormaCandidateAllowed(candidate, baselineOrdinaryFormas, validLoadouts) {
            const usesOmni = candidate.addedOmniCount > 0;
            const usesUmbra = candidate.addedUmbraCount > 0;
            if (!usesOmni && !usesUmbra) return true;

            // If no ordinary-polarity route can solve the same problem, the expensive forma is genuinely required.
            if (baselineOrdinaryFormas === null) return true;

            if (usesOmni && !preferOmniForma.value) return false;
            if (usesUmbra && !preferUmbraForma.value) return false;
            // Omni mainly solves multi-config polarity conflicts. Umbra can be valuable even for one config.
            if (usesOmni && validLoadouts.length < 2) return false;

            return baselineOrdinaryFormas - candidate.formas > 1;
        }

        function getChangedSlotCount(originalCounts, targetCounts) {
            let keptSlots = 0;
            for (let i = 0; i < originalCounts.length; i++) {
                keptSlots += Math.min(originalCounts[i], targetCounts[i]);
            }
            return TOTAL_SLOT_COUNT - keptSlots;
        }

        function getCountSig(counts) {
            return counts.join(',');
        }

        function getNormalCountSig(counts) {
            return counts.join(',');
        }

        function getCountAssignmentCost(mods, counts) {
            if (mods.length === 0) return 0;

            const globalCache = getCountAssignmentCost.cache || new Map();
            getCountAssignmentCost.cache = globalCache;
            const globalKey = `${mods.map((mod) => `${mod.cost}:${mod.polarity}`).join('|')}::${counts.join(',')}`;
            if (globalCache.has(globalKey)) {
                return globalCache.get(globalKey);
            }

            const memo = new Map();

            function solve(modIndex, remainingCounts) {
                if (modIndex === mods.length) {
                    return 0;
                }

                const key = `${modIndex}|${remainingCounts.join(',')}`;
                if (memo.has(key)) {
                    return memo.get(key);
                }

                const mod = mods[modIndex];
                let bestCost = IMPOSSIBLE_COST;

                for (let polIndex = 0; polIndex < POLARITIES.length; polIndex++) {
                    if (remainingCounts[polIndex] <= 0) continue;

                    remainingCounts[polIndex]--;
                    const slotPolarity = POLARITIES[polIndex].id;
                    const totalCost = getCost(mod.cost, mod.polarity, slotPolarity) + solve(modIndex + 1, remainingCounts);
                    remainingCounts[polIndex]++;

                    if (totalCost < bestCost) {
                        bestCost = totalCost;
                    }
                }

                memo.set(key, bestCost);
                return bestCost;
            }

            const bestCost = solve(0, [...counts]);
            globalCache.set(globalKey, bestCost);
            return bestCost;
        }

        function getOptimisticLoadoutCost(loadout, targetCounts, cache) {
            const cacheKey = `${loadout.id}|${targetCounts.join(',')}`;
            if (cache.has(cacheKey)) {
                return cache.get(cacheKey);
            }

            let bestCost = IMPOSSIBLE_COST;
            const hasSpecialMod = hasModData(loadout.specialMod);

            for (let specialPolIdx = 0; specialPolIdx < POLARITIES.length; specialPolIdx++) {
                if (targetCounts[specialPolIdx] <= 0) continue;

                const normalCounts = [...targetCounts];
                normalCounts[specialPolIdx]--;
                const normalCost = getCountAssignmentCost(loadout.mods, normalCounts);
                if (normalCost >= IMPOSSIBLE_COST) continue;

                const specialCost = hasSpecialMod
                    ? getCost(loadout.specialMod.cost, loadout.specialMod.polarity, POLARITIES[specialPolIdx].id)
                    : 0;

                bestCost = Math.min(bestCost, normalCost + specialCost);
            }

            cache.set(cacheKey, bestCost);
            return bestCost;
        }

        function getCandidateOptimisticCost(candidate, validLoadouts, cache) {
            let worstShortage = 0;
            let totalShortage = 0;
            let totalCost = 0;

            for (const loadout of validLoadouts) {
                const optimisticCost = getOptimisticLoadoutCost(loadout, candidate.counts, cache);
                const shortage = Math.max(0, optimisticCost - loadout.capacity);

                worstShortage = Math.max(worstShortage, shortage);
                totalShortage += shortage;
                totalCost += optimisticCost;
            }

            return {
                possible: totalShortage === 0,
                worstShortage,
                totalShortage,
                totalCost
            };
        }

        function getPlanCapacitySummary(loadoutPlans) {
            return loadoutPlans.reduce((summary, plan) => {
                const shortage = Math.max(0, plan.cost - plan.capacity);
                return {
                    totalShortage: summary.totalShortage + shortage,
                    worstShortage: Math.max(summary.worstShortage, shortage),
                    totalCost: summary.totalCost + plan.cost
                };
            }, {
                totalShortage: 0,
                worstShortage: 0,
                totalCost: 0
            });
        }

        function compareCapacitySummary(a, b) {
            if (!b) return -1;
            return a.totalShortage - b.totalShortage
                || a.worstShortage - b.worstShortage
                || a.totalCost - b.totalCost;
        }

        function compareOverCapacityState(a, b) {
            if (!b) return -1;
            const summaryCompare = compareCapacitySummary(a.capacitySummary, b.capacitySummary);
            if (summaryCompare !== 0) return summaryCompare;

            return a.formas - b.formas
                || a.omniCount - b.omniCount
                || a.umbraCount - b.umbraCount
                || a.sig.localeCompare(b.sig);
        }

        function getNormalPermutations(normalCounts, cache) {
            const cacheKey = getNormalCountSig(normalCounts);
            if (cache.has(cacheKey)) {
                return cache.get(cacheKey);
            }

            const polOrder = POLARITIES
                .map((p, index) => ({ id: p.id, index }))
                .filter((entry) => entry.id !== 'none')
                .concat({ id: 'none', index: POL_INDEX.none });
            const workingCounts = [...normalCounts];
            const current = [];
            const results = [];

            function build() {
                if (current.length === NORMAL_SLOT_COUNT) {
                    results.push([...current]);
                    return;
                }

                for (const entry of polOrder) {
                    const i = entry.index;
                    if (workingCounts[i] <= 0) continue;
                    workingCounts[i]--;
                    current.push(entry.id);
                    build();
                    current.pop();
                    workingCounts[i]++;
                }
            }

            build();
            cache.set(cacheKey, results);
            return results;
        }

        function buildSlotListFromCounts(counts) {
            const polOrder = POLARITIES
                .map((p, index) => ({ id: p.id, index }))
                .filter((entry) => entry.id !== 'none')
                .concat({ id: 'none', index: POL_INDEX.none });
            const slotList = [];

            for (const entry of polOrder) {
                for (let i = 0; i < counts[entry.index]; i++) {
                    slotList.push(entry.id);
                }
            }

            return slotList;
        }

        function hasElementOrderConstraints(validLoadouts) {
            return validLoadouts.some((loadout) =>
                loadout.mods.some((mod) => hasModData(mod) && mod.isElement)
            );
        }

        function findArrangementForCounts(targetCounts, validLoadouts, deadline, allowOverCapacity = false, bestKnownSummary = null) {
            const permutationCache = findArrangementForCounts.permutationCache || new Map();
            findArrangementForCounts.permutationCache = permutationCache;
            let bestOverCapacityArrangement = null;
            const needsOrderedSearch = hasElementOrderConstraints(validLoadouts);

            function evaluateSlotList(slotList) {
                const loadoutPlans = [];
                let allValid = true;

                for (const loadout of validLoadouts) {
                    const plan = buildLoadoutPlan(loadout, slotList);
                    plan.capLeft = loadout.capacity - plan.cost;
                    if (plan.capLeft < 0) {
                        allValid = false;
                    }
                    loadoutPlans.push(plan);
                }

                const capacitySummary = getPlanCapacitySummary(loadoutPlans);
                const arrangement = {
                    slotList,
                    loadoutPlans,
                    capacitySummary
                };

                if (allValid) {
                    return arrangement;
                }

                if (!allowOverCapacity) return null;
                if (bestKnownSummary && compareCapacitySummary(bestKnownSummary, capacitySummary) <= 0) return null;
                if (bestOverCapacityArrangement && compareCapacitySummary(bestOverCapacityArrangement.capacitySummary, capacitySummary) <= 0) return null;

                bestOverCapacityArrangement = arrangement;
                return null;
            }

            for (let specialPolIdx = 0; specialPolIdx < POLARITIES.length; specialPolIdx++) {
                if (performance.now() > deadline) return null;
                if (targetCounts[specialPolIdx] <= 0) continue;

                const normalCounts = [...targetCounts];
                normalCounts[specialPolIdx]--;
                const specialPol = POLARITIES[specialPolIdx].id;

                if (!needsOrderedSearch) {
                    const normalSlotList = buildSlotListFromCounts(normalCounts);
                    const arrangement = evaluateSlotList([...normalSlotList, specialPol]);
                    if (arrangement) return arrangement;
                    continue;
                }

                const normalPermutations = getNormalPermutations(normalCounts, permutationCache);

                for (const normalSlotList of normalPermutations) {
                    if (performance.now() > deadline) return null;
                    const arrangement = evaluateSlotList([...normalSlotList, specialPol]);
                    if (arrangement) return arrangement;
                }
            }

            return bestOverCapacityArrangement;
        }

        function getEffectiveLoadouts() {
            return loadouts.value
                .map((loadout) => ({
                    ...loadout,
                    mods: loadout.mods.filter(hasModData),
                    specialMod: hasModData(loadout.specialMod) ? loadout.specialMod : createMod()
                }))
                .filter((loadout) => loadout.mods.length > 0 || hasModData(loadout.specialMod));
        }

        function calculate() {
            const validLoadouts = getEffectiveLoadouts();
            if (validLoadouts.length === 0) {
                result.value = { success: false, msg: t('noValidLoadout') };
                currentStep.value = 2;
                return;
            }

            const hasInvalidCapacity = validLoadouts.some((loadout) => !Number.isFinite(loadout.capacity) || loadout.capacity < 0);
            if (hasInvalidCapacity) {
                result.value = { success: false, msg: t('invalidCapacity') };
                currentStep.value = 2;
                return;
            }

            const hasInvalidMod = validLoadouts.some((loadout) =>
                [...loadout.mods, loadout.specialMod].some((mod) => hasModData(mod) && (!Number.isFinite(mod.cost) || mod.cost < 0))
            );
            if (hasInvalidMod) {
                result.value = { success: false, msg: t('invalidModCost') };
                currentStep.value = 2;
                return;
            }

            const currentSlots = slots.value;

            const initialCounts = new Array(POLARITIES.length).fill(0);
            for (const slotPol of currentSlots) {
                initialCounts[POL_INDEX[slotPol]]++;
            }

            let bestState = null;
            const deadline = performance.now() + SEARCH_TIMEOUT_MS;
            const candidates = [];
            const workingCounts = new Array(POLARITIES.length).fill(0);
            let generated = 0;
            let searchTimedOut = false;

            function generateCounts(polIndex, remainingSlots) {
                if (performance.now() > deadline || generated > SEARCH_LIMIT) return;

                if (polIndex === POLARITIES.length - 1) {
                    workingCounts[polIndex] = remainingSlots;
                    const formas = getChangedSlotCount(initialCounts, workingCounts);
                    const sig = getCountSig(workingCounts);
                    candidates.push({
                        counts: [...workingCounts],
                        formas,
                        omniCount: countOmniSlots(workingCounts),
                        umbraCount: countUmbraSlots(workingCounts),
                        addedOmniCount: getAddedPolarityCount(workingCounts, initialCounts, 'omni'),
                        addedUmbraCount: getAddedPolarityCount(workingCounts, initialCounts, 'umbra'),
                        sig
                    });
                    workingCounts[polIndex] = 0;
                    generated++;
                    return;
                }

                for (let count = 0; count <= remainingSlots; count++) {
                    workingCounts[polIndex] = count;
                    generateCounts(polIndex + 1, remainingSlots - count);
                    if (performance.now() > deadline || generated > SEARCH_LIMIT) break;
                }
                workingCounts[polIndex] = 0;
            }

            generateCounts(0, TOTAL_SLOT_COUNT);

            const optimisticCache = new Map();
            const reachableCandidates = candidates
                .filter((candidate) => {
                    if (!allowOverride.value) {
                        for (let i = 0; i < POLARITIES.length; i++) {
                            if (POLARITIES[i].id !== 'none' && candidate.counts[i] < initialCounts[i]) {
                                return false;
                            }
                        }
                    }
                    const optimistic = getCandidateOptimisticCost(candidate, validLoadouts, optimisticCache);
                    candidate.optimisticPossible = optimistic.possible;
                    candidate.optimisticCost = optimistic.totalCost;
                    candidate.optimisticTotalShortage = optimistic.totalShortage;
                    candidate.optimisticWorstShortage = optimistic.worstShortage;
                    return true;
                });

            const ordinaryFeasibleCandidates = reachableCandidates.filter((candidate) =>
                candidate.optimisticPossible
                && candidate.addedOmniCount === 0
                && candidate.addedUmbraCount === 0
            );
            const baselineOrdinaryFeasibleFormas = ordinaryFeasibleCandidates.length
                ? Math.min(...ordinaryFeasibleCandidates.map((candidate) => candidate.formas))
                : null;

            const feasibleCandidates = reachableCandidates
                .filter((candidate) => candidate.optimisticPossible)
                .filter((candidate) => isExpensiveFormaCandidateAllowed(candidate, baselineOrdinaryFeasibleFormas, validLoadouts))
                .sort((a, b) =>
                    a.formas - b.formas
                    || a.omniCount - b.omniCount
                    || a.umbraCount - b.umbraCount
                    || a.optimisticCost - b.optimisticCost
                    || a.sig.localeCompare(b.sig)
                );

            for (const candidate of feasibleCandidates) {
                if (performance.now() > deadline) {
                    searchTimedOut = true;
                    break;
                }

                const arrangement = findArrangementForCounts(candidate.counts, validLoadouts, deadline);
                if (!arrangement && performance.now() > deadline) {
                    searchTimedOut = true;
                    break;
                }

                if (arrangement) {
                    bestState = {
                        formas: candidate.formas,
                        omniCount: candidate.omniCount,
                        umbraCount: candidate.umbraCount,
                        sig: candidate.sig,
                        finalSlots: assignOriginalSlotsToFinal(arrangement.slotList, currentSlots),
                        loadoutPlans: arrangement.loadoutPlans,
                        capacitySummary: arrangement.capacitySummary,
                        overCapacity: false
                    };
                    break;
                }
            }

            if (!bestState && !searchTimedOut) {
                const ordinaryOverCapacityCandidates = reachableCandidates.filter((candidate) =>
                    candidate.addedOmniCount === 0
                    && candidate.addedUmbraCount === 0
                );
                const baselineOrdinaryOverCapacityFormas = ordinaryOverCapacityCandidates.length
                    ? Math.min(...ordinaryOverCapacityCandidates.map((candidate) => candidate.formas))
                    : null;
                const overCapacityCandidates = reachableCandidates
                    .filter((candidate) => isExpensiveFormaCandidateAllowed(candidate, baselineOrdinaryOverCapacityFormas, validLoadouts))
                    .sort((a, b) =>
                        a.optimisticTotalShortage - b.optimisticTotalShortage
                        || a.optimisticWorstShortage - b.optimisticWorstShortage
                        || a.optimisticCost - b.optimisticCost
                        || a.formas - b.formas
                        || a.omniCount - b.omniCount
                        || a.umbraCount - b.umbraCount
                        || a.sig.localeCompare(b.sig)
                    );

                let bestOverState = null;

                for (const candidate of overCapacityCandidates) {
                    if (performance.now() > deadline) {
                        searchTimedOut = true;
                        break;
                    }
                    if (bestOverState) {
                        const optimisticSummary = {
                            totalShortage: candidate.optimisticTotalShortage,
                            worstShortage: candidate.optimisticWorstShortage,
                            totalCost: candidate.optimisticCost
                        };
                        if (compareCapacitySummary(bestOverState.capacitySummary, optimisticSummary) <= 0) {
                            break;
                        }
                    }

                    const arrangement = findArrangementForCounts(
                        candidate.counts,
                        validLoadouts,
                        deadline,
                        true,
                        bestOverState?.capacitySummary || null
                    );

                    if (!arrangement && performance.now() > deadline) {
                        searchTimedOut = true;
                        break;
                    }
                    if (!arrangement) continue;

                    const overState = {
                        formas: candidate.formas,
                        omniCount: candidate.omniCount,
                        umbraCount: candidate.umbraCount,
                        sig: candidate.sig,
                        finalSlots: assignOriginalSlotsToFinal(arrangement.slotList, currentSlots),
                        loadoutPlans: arrangement.loadoutPlans,
                        capacitySummary: arrangement.capacitySummary,
                        overCapacity: arrangement.capacitySummary.totalShortage > 0
                    };

                    if (compareOverCapacityState(overState, bestOverState) < 0) {
                        bestOverState = overState;
                    }
                }

                bestState = bestOverState;
            }

            if (!bestState) {
                result.value = {
                    success: false,
                    msg: searchTimedOut
                        ? t('timeout')
                        : t('noArrangement')
                };
                currentStep.value = 3;
                return;
            }

            const formaActions = bestState.finalSlots
                .filter((slot) => slot.isForma)
                .map((slot) => ({
                    slotIndex: slot.slotIndex,
                    oldPolarity: slot.originalPol,
                    newPolarity: slot.finalPol
                }));

            result.value = {
                success: true,
                plan: {
                    formasNeeded: bestState.formas,
                    formaActions,
                    finalSlots: bestState.finalSlots,
                    loadoutPlans: bestState.loadoutPlans,
                    overCapacity: bestState.overCapacity,
                    capacityShortage: bestState.capacitySummary?.totalShortage || 0,
                    worstCapacityShortage: bestState.capacitySummary?.worstShortage || 0
                }
            };
            viewResultLoadout.value = 0;
            currentStep.value = 3;
        }

        function goToStep(stepId) {
            currentStep.value = stepId;
        }

        function nextStep() {
            if (!canGoNext.value) return;
            currentStep.value = Math.min(3, currentStep.value + 1);
        }

        function prevStep() {
            currentStep.value = Math.max(1, currentStep.value - 1);
        }

        function getPlacedMod(fs, viewIdx) {
            if (!result.value || !result.value.plan.loadoutPlans[viewIdx]) return null;
            const plan = result.value.plan.loadoutPlans[viewIdx];
            if (fs.slotIndex === SPECIAL_SLOT_INDEX) {
                if (!plan.specialMod) return null;
                return {
                    mod: plan.specialMod,
                    effectiveCost: plan.specialCost,
                    originalCost: plan.specialMod.cost
                };
            }
            const mod = plan.assignment[fs.slotIndex];
            if (!mod || mod.isPad) return null;
            return {
                mod,
                effectiveCost: plan.assignmentCosts[fs.slotIndex],
                originalCost: mod.cost
            };
        }

        function getResultHeadline() {
            if (!result.value?.success) return '';
            if (result.value.plan.overCapacity) {
                return t('headlineOver', result.value.plan.capacityShortage);
            }
            if (result.value.plan.formasNeeded === 0) {
                return t('headlineCompatible');
            }
            return t('headlineForma', result.value.plan.formasNeeded);
        }

        return {
            currentLanguage,
            allowOverride,
            preferOmniForma,
            preferUmbraForma,
            slots,
            steps,
            loadouts,
            activeLoadoutIndex,
            activeLoadout,
            result,
            polarities,
            viewResultLoadout,
            currentStep,
            modDatabase,
            databaseReady,
            totalFilledMods,
            totalConfiguredLoadouts,
            canGoNext,
            canCalculate,
            t,
            setLanguage,
            addLoadout,
            removeLoadout,
            clearMods,
            markDirty,
            cloneLoadout,
            syncCapacityToAll,
            calculate,
            getPol,
            getPolName,
            getPlacedMod,
            getSuggestions,
            selectSuggestion,
            handleModNameInput,
            handleNameFocus,
            closeSearch,
            openSearch,
            moveSuggestion,
            confirmSuggestion,
            setCustomMode,
            clearSpecialMod,
            handleNameTab,
            hasAnyData,
            hasModData,
            getLoadoutLabel,
            getLoadoutSummary,
            getEstimatedDrain,
            getFilledModCount,
            getResultHeadline,
            goToStep,
            nextStep,
            prevStep
        };
    }
}).mount('#app');
