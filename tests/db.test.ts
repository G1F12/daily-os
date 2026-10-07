import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {read,mutate} from '../src/db.ts';
import {localDate,saveWeight,toggle,exportBackup,validateBackup} from '../src/model.ts';
test('IndexedDB first launch, persistence and serialized updates',async()=>{const first=await read();assert.equal(first.days[localDate()].completedTaskIds.length,0);await mutate(s=>toggle(s,'omega'));const reload=await read();assert(reload.days[localDate()].completedTaskIds.includes('omega'));await Promise.all([mutate(s=>toggle(s,'zinc')),mutate(s=>saveWeight(s,76.8))]);const persisted=await read();assert(persisted.days[localDate()].completedTaskIds.includes('omega'));assert(persisted.days[localDate()].completedTaskIds.includes('zinc'));assert.equal(persisted.measurements[0].value,76.8);});
test('failed transactions preserve data; validated restore replaces atomically',async()=>{const before=await read();await assert.rejects(mutate(s=>{s.tasks=[];throw new Error('cancel')}));assert.deepEqual(await read(),before);const imported=validateBackup(JSON.parse(exportBackup(before)));imported.settings.theme='dark';await mutate(()=>imported);assert.equal((await read()).settings.theme,'dark');});
