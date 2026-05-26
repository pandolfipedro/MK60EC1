import { useCallback, useMemo, useState } from 'react';
import { PART_NUMBERS, checkVinWhitelist, parsePartNumber } from './lib/part-numbers';
import { PROFILE_ORDER, PROFILES } from './data/profiles';
import type { ProfileId } from './lib/types';
import {
  applyVinToCoding,
  createEmptyCoding,
  decodeCoding,
  formatHexCoding,
  parseHexCoding,
  setByte,
  validateCoding,
} from './lib/coding-engine';
import { applyMirrorPairs } from './lib/mirror';
import { migrateCoding } from './lib/migrate';
import { t } from './i18n/pt-BR';
import { VinInput } from './components/VinInput';
import { HexOutput } from './components/HexOutput';
import { DecodeTable } from './components/DecodeTable';
import { ByteEditor } from './components/ByteEditor';
import { WarningsPanel } from './components/WarningsPanel';
import { MigratePanel } from './components/MigratePanel';
import './App.css';

type Tab = 'generate' | 'decode' | 'migrate';

function useCopy() {
  return useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }, []);
}

export default function App() {
  const [tab, setTab] = useState<Tab>('generate');
  const [vin, setVin] = useState('');
  const [partQuery, setPartQuery] = useState('BL');
  const [profileId, setProfileId] = useState<ProfileId>('len19');
  const [bytes, setBytes] = useState<number[]>(() => createEmptyCoding('len19'));
  const [decodeInput, setDecodeInput] = useState('');
  const [oldSuffix, setOldSuffix] = useState('AT');
  const [newSuffix, setNewSuffix] = useState('BM');
  const [migrateInput, setMigrateInput] = useState('');
  const [migrateResult, setMigrateResult] = useState<
    ReturnType<typeof migrateCoding> | null
  >(null);

  const copy = useCopy();

  const partEntry = useMemo(() => parsePartNumber(partQuery), [partQuery]);

  const onPartChange = (q: string) => {
    setPartQuery(q);
    const p = parsePartNumber(q);
    if (p) {
      setProfileId(p.profile);
      setBytes(createEmptyCoding(p.profile));
    }
  };

  const onProfileChange = (id: ProfileId) => {
    setProfileId(id);
    setBytes(createEmptyCoding(id));
  };

  const profile = PROFILES[profileId];

  const hexOut = formatHexCoding(bytes);
  const issues = useMemo(() => {
    const list = validateCoding(bytes, vin);
    if (partEntry && vin.length === 17) {
      const wl = checkVinWhitelist(vin, partEntry.suffix);
      if (!wl.ok && wl.message) list.push({ level: 'warning', message: wl.message });
      else if (wl.message)
        list.push({ level: 'info', message: wl.message });
    }
    return list;
  }, [bytes, vin, partEntry]);

  const decoded = useMemo(() => decodeCoding(bytes, profileId), [bytes, profileId]);

  const decodeFromInput = () => {
    const parsed = parseHexCoding(decodeInput);
    if (!parsed) return;
    setBytes(parsed);
    const p = PROFILE_ORDER.find((id) => PROFILES[id].byteCount === parsed.length);
    if (p) setProfileId(p);
    setTab('generate');
  };

  const runMigrate = () => {
    setMigrateResult(migrateCoding(migrateInput, oldSuffix, newSuffix));
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>{t.appTitle}</h1>
          <p className="subtitle">{t.appSubtitle}</p>
        </div>
        <p className="privacy">{t.privacy}</p>
      </header>

      <nav className="tabs">
        {(['generate', 'decode', 'migrate'] as Tab[]).map((id) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'tab active' : 'tab'}
            onClick={() => setTab(id)}
          >
            {id === 'generate' ? t.tabGenerate : id === 'decode' ? t.tabDecode : t.tabMigrate}
          </button>
        ))}
      </nav>

      <main className="layout">
        <section className="main-panel">
          {tab === 'generate' && (
            <>
              <div className="grid-2">
                <VinInput value={vin} onChange={setVin} label={t.vin} help={t.vinHelp} />
                <label className="field">
                  <span className="field-label">{t.partNumber}</span>
                  <input
                    className="input"
                    list="parts"
                    value={partQuery}
                    onChange={(e) => onPartChange(e.target.value)}
                    placeholder="1K0907379BL"
                  />
                  <datalist id="parts">
                    {PART_NUMBERS.map((p) => (
                      <option key={p.suffix} value={p.label} />
                    ))}
                  </datalist>
                </label>
              </div>

              <label className="field">
                <span className="field-label">{t.profile}</span>
                <select
                  className="input"
                  value={profileId}
                  onChange={(e) => onProfileChange(e.target.value as ProfileId)}
                >
                  {PROFILE_ORDER.map((id) => (
                    <option key={id} value={id}>
                      {PROFILES[id].label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="btn-row">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setBytes((b) => applyVinToCoding(b, vin))}
                >
                  {t.applyVin}
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setBytes((b) => applyMirrorPairs(b))}
                >
                  {t.applyMirror}
                </button>
              </div>

              <h3>{t.longCode}</h3>
              <HexOutput
                value={hexOut}
                copyLabel={t.copy}
                copyVcdsLabel={t.copyVcds}
                onCopy={() => copy(hexOut)}
                onCopySpaced={() => copy(formatHexCoding(bytes, true))}
              />

              <div className="byte-grid">
                {profile.bytes.map((def) => (
                  <ByteEditor
                    key={def.index}
                    def={def}
                    value={bytes[def.index] ?? 0}
                    onChange={(v) => setBytes((b) => setByte(b, def.index, v))}
                  />
                ))}
              </div>

              <h3>Decodificação</h3>
              <DecodeTable rows={decoded.decoded} />
            </>
          )}

          {tab === 'decode' && (
            <>
              <label className="field">
                <span className="field-label">{t.longCode}</span>
                <textarea
                  className="input mono textarea"
                  rows={3}
                  value={decodeInput}
                  onChange={(e) => setDecodeInput(e.target.value.toUpperCase())}
                  placeholder="163B400D09280002680C02E890210082350800"
                />
              </label>
              <button type="button" className="btn" onClick={decodeFromInput}>
                {t.decode}
              </button>
              {decodeInput && (
                <>
                  <DecodeTable
                    rows={
                      decodeCoding(parseHexCoding(decodeInput) ?? []).decoded
                    }
                  />
                </>
              )}
            </>
          )}

          {tab === 'migrate' && (
            <>
              <label className="field">
                <span className="field-label">{t.longCode}</span>
                <textarea
                  className="input mono textarea"
                  rows={3}
                  value={migrateInput}
                  onChange={(e) => setMigrateInput(e.target.value.toUpperCase())}
                />
              </label>
              <div className="grid-2">
                <label className="field">
                  <span className="field-label">{t.oldPart}</span>
                  <input
                    className="input"
                    value={oldSuffix}
                    onChange={(e) => setOldSuffix(e.target.value.toUpperCase())}
                    placeholder="AT"
                  />
                </label>
                <label className="field">
                  <span className="field-label">{t.newPart}</span>
                  <input
                    className="input"
                    value={newSuffix}
                    onChange={(e) => setNewSuffix(e.target.value.toUpperCase())}
                    placeholder="BM"
                  />
                </label>
              </div>
              <button type="button" className="btn" onClick={runMigrate}>
                {t.migrate}
              </button>
              <MigratePanel
                result={migrateResult}
                copyLabel={t.copy}
                copyVcdsLabel={t.copyVcds}
                stepsTitle={t.migrationSteps}
              />
            </>
          )}
        </section>

        <aside className="side-panel">
          <WarningsPanel issues={issues} title={t.warnings} />
          <div className="checklist">
            <h3>{t.postCoding}</h3>
            <ul>
              {t.postCodingItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="refs">
            <h3>{t.references}</h3>
            <ul>
              <li>
                <a
                  href="https://www.drive2.ru/l/549781928362902816/"
                  target="_blank"
                  rel="noreferrer"
                >
                  BrianOConner333 — MK60EC1
                </a>
              </li>
              <li>
                <a
                  href="https://www.drive2.ru/l/623620456359922967/"
                  target="_blank"
                  rel="noreferrer"
                >
                  lprot — coding consciente
                </a>
              </li>
              <li>
                <a
                  href="https://forums.ross-tech.com/index.php?threads/31859/"
                  target="_blank"
                  rel="noreferrer"
                >
                  etz2k — Ross-Tech label
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
