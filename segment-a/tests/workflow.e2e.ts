import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { returned } from './fixtures';

test('Plan 02 shows local addresses and keeps physical B/runner gates unassigned',async({page})=>{
  await page.goto('/');await expect(page.locator('#topology li')).toHaveCount(20);
  await expect(page.locator('#topology')).toContainText('A2>G3: folder · RESERVED_DISABLED');
  await expect(page.locator('#topology')).toContainText('A5_G5: handoff-control · TEST_ONLY');
  await page.locator('#topology summary').click();await expect(page.locator('#topology')).toContainText('gate number undeclared');
  expect(await page.locator('#topology').innerText()).not.toMatch(/B1[<>_]G\d+/);
});

async function upload(page: Page, payload: string, name = 'runner.txt') {
  await page.locator('#incoming-files').setInputFiles({ name, mimeType: 'text/plain', buffer: Buffer.from(payload) });
  await page.locator('#import').click();
}
async function compile(page: Page,id='DSK-000001') {
  for(const [field,value] of Object.entries({'disk-id':id,label:'Operator systems search',version:'1.0.0',zip:'10001',radius:'25',naics:'541511 | Software',soc:'15-1252 | Software developers',keywords:'15-1252 | systems'}))await page.locator(`#${field}`).fill(value);
  await page.getByRole('button',{name:'Compile and validate search scope'}).click();
  await expect(page.locator('#compile-status')).toContainText('25 compiler checks passed');
}

test('A1/A2 repeated compiler outputs and complete manual copy, without a runner',async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/');await compile(page);
  await page.locator('#prepare-json').click();const first=JSON.parse(await page.locator('#outbound').inputValue());expect(first.certification.status).toBe('CERTIFIED');
  await page.locator('#copy-json').click();expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(await page.locator('#outbound').inputValue());
  await compile(page,'DSK-000002');await page.locator('#prepare-json').click();expect(JSON.parse(await page.locator('#outbound').inputValue()).definition.id).toBe('DSK-000002');
  await page.locator('#scope').selectOption('scope-1');await page.locator('#prepare-json').click();expect(JSON.parse(await page.locator('#outbound').inputValue()).definition.id).toBe('DSK-000001');
  await expect(page.getByRole('button',{name:'Folder destination · not configured'})).toBeDisabled();await expect(page.getByRole('button',{name:'Automated transport · not configured'})).toBeDisabled();
});

test('A3 multiple imports, duplicate identification, rejection warning and irreversible exclusion',async({page})=>{
  await page.goto('/');
  await page.locator('#incoming-files').setInputFiles([
    {name:'one.txt',mimeType:'text/plain',buffer:Buffer.from('UID: one\nDescription:\nShort source')},
    {name:'two.md',mimeType:'text/plain',buffer:Buffer.from('UID: two\nDescription:\n'+'Long source. '.repeat(3000))},
  ]);await page.locator('#import').click();await expect(page.locator('.job')).toHaveCount(2);
  await page.locator('[data-decision="job-1"]').selectOption('REJECT');await expect(page.locator('#warning')).toContainText('cannot be restored');await page.locator('#cancel-confirm').click();await expect(page.locator('[data-decision="job-1"]')).toHaveValue('PENDING');
  await page.locator('[data-decision="job-1"]').selectOption('REJECT');await page.locator('#affirm-confirm').click();await expect(page.locator('.job').first()).toHaveClass(/rejected/);await expect(page.locator('[data-decision="job-1"]')).toBeDisabled();
  await upload(page,'UID: one\nDescription:\nShort source');await expect(page.locator('.job')).toHaveCount(3);await expect(page.locator('.job').nth(2)).toHaveClass(/rejected/);await expect(page.locator('.job').nth(2)).toContainText('DUPLICATE');
  await page.locator('#reset').click();await expect(page.locator('#warning')).toContainText('will be lost');await page.locator('#cancel-confirm').click();await expect(page.locator('.job')).toHaveCount(3);
});

test('PIN plain-text export/reimport preserves original source, UID and context',async({page})=>{
  await page.goto('/');const input=JSON.stringify(await returned());await upload(page,input);await page.locator('[data-decision="job-1"]').selectOption('PIN');
  const promise=page.waitForEvent('download');await page.locator('#export-pins').click();const file=await promise;expect(file.suggestedFilename()).toBe('MARA_PINNED_JOBS.txt');const text=await readFile((await file.path())!,'utf8');
  await page.locator('#reset').click();await page.locator('#affirm-confirm').click();await expect(page.locator('.job')).toHaveCount(0);await upload(page,text,'saved.txt');await expect(page.locator('.job')).toContainText('OBS-ONE');await expect(page.locator('[data-decision="job-1"]')).toHaveValue('PIN');await expect(page.locator('.job')).toContainText('OPERATOR-BATCH');
});

test('A4 commitment cancel is nondestructive; A5 local artifacts never imply accepted handoff',async({page})=>{
  const errors:string[]=[];const requests:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  const policy=JSON.parse(await readFile('vercel.json','utf8')).headers[0].headers;
  await page.route('http://127.0.0.1:4183/',async route=>{const response=await route.fetch();await route.fulfill({response,headers:{...response.headers(),...Object.fromEntries(policy.map((h:{key:string;value:string})=>[h.key.toLowerCase(),h.value]))}});});
  await page.goto('/');await upload(page,JSON.stringify(await returned()));await page.locator('[data-decision="job-1"]').selectOption('PUSH');
  for(const [id,value] of Object.entries({'run-id':'operator-run','candidate-id':'candidate-test','pipeline-version':'1.0.0'}))await page.locator(`#${id}`).fill(value);
  await page.locator('#commit').click();await expect(page.locator('#warning')).toContainText('Export PIN');await page.locator('#cancel-confirm').click();await expect(page.locator('.transaction')).toHaveCount(0);await expect(page.locator('.job')).toHaveCount(1);await expect(page.locator('[data-decision="job-1"]')).toHaveValue('PUSH');
  await page.locator('#commit').click();await page.locator('#affirm-confirm').click();await expect(page.locator('.transaction')).toHaveCount(1);await expect(page.locator('.job')).toHaveCount(1);
  await page.getByRole('button',{name:'Validate committed artifacts'}).click();await expect(page.locator('.transaction')).toContainText('LOCALLY_VERIFIED');await expect(page.locator('.transaction')).toContainText('ZERO ACCEPTED');
  const promise=page.waitForEvent('download');await page.getByRole('button',{name:'Download STAGE_A_SIDECAR.json'}).click();const download=await promise;const sidecar=JSON.parse(await readFile((await download.path())!,'utf8'));expect(sidecar.run_binding.target_id).toBe('OBS-ONE');expect(sidecar.raw_posting).toContain('Python systems');
  await page.getByRole('button',{name:'Check handoff readiness'}).click();await expect(page.locator('.transaction')).toContainText('BLOCKED');await expect(page.locator('.transaction')).toContainText('No artifacts were transmitted');await expect(page.getByRole('button',{name:'Transmit to B1 · receiver unresolved'})).toBeDisabled();
  expect(errors).toEqual([]);expect(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length}))).toEqual({local:0,session:0});
  expect(requests.every(r=>r.startsWith('http://127.0.0.1:4183/'))).toBe(true);
});

test('plain source lacks qualified taxonomy; A5 exposes the blocker without invented requirements',async({page})=>{
  await page.goto('/');await page.locator('#incoming-text').fill('UID: raw-only\nDescription:\nNo taxonomy supplied.');await page.locator('#import').click();await page.locator('[data-decision="job-1"]').selectOption('PUSH');
  for(const [id,value] of Object.entries({'run-id':'run','candidate-id':'candidate','pipeline-version':'1.0.0'}))await page.locator(`#${id}`).fill(value);
  await page.locator('#commit').click();await page.locator('#affirm-confirm').click();await page.getByRole('button',{name:'Validate committed artifacts'}).click();await expect(page.locator('.transaction')).toContainText('BLOCKED');await expect(page.getByRole('button',{name:'Download SEALED_A_ENVELOPE.json'})).toBeDisabled();await expect(page.locator('.job')).toHaveCount(1);
});
