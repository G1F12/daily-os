import {test,expect} from '@playwright/test';
import {boot,tab,state,noOverflow} from './helpers';

test('one-time task: create, complete, edit and reload without changing routine completion',async({page})=>{
 await boot(page);const initial=await state(page);await page.getByRole('button',{name:'+ Add',exact:true}).first().click();
 await page.getByLabel('Task title').fill('Buy manga');await page.getByLabel('Due date').fill('2026-10-07');await page.getByLabel('Priority').selectOption('high');
 await page.getByRole('button',{name:'Add task',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Complete Buy manga'})).toBeVisible();await page.getByRole('button',{name:'Complete Buy manga'}).click();
 await expect(page.getByRole('button',{name:'Mark incomplete Buy manga'})).toBeVisible();
 const after=await state(page);expect(after.days).toEqual(initial.days);expect(after.life.actions).toHaveLength(1);
 await page.reload();await expect(page.getByRole('button',{name:'Mark incomplete Buy manga'})).toBeVisible();await noOverflow(page);
});

test('School: manage subjects and add homework with due date; appears in Today',async({page})=>{
 await boot(page);await page.getByRole('button',{name:'Open School'}).click();await expect(page.getByRole('heading',{name:'School',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Manage',exact:true}).click();await page.getByLabel('New subject').fill('Biology');
 await page.getByRole('button',{name:'Add',exact:true}).click();await expect(page.locator('.school-subject')).toContainText(['Biology']);
 await page.getByRole('button',{name:'+ Add',exact:true}).first().click();await page.getByLabel('Task title').fill('Read chapter 4');
 await page.getByLabel('Subject',{exact:true}).selectOption('Biology');await page.getByLabel('School task type').selectOption('homework');await page.getByLabel('Due date').fill('2026-10-07');
 await page.getByRole('button',{name:'Add task',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.getByRole('button',{name:'Back to Today'}).click();await expect(page.getByRole('button',{name:'Complete Read chapter 4'})).toBeVisible();
 await page.getByRole('button',{name:'Complete Read chapter 4'}).click();await expect(page.getByRole('button',{name:'Mark incomplete Read chapter 4'})).toBeVisible();await page.reload();const saved=await state(page);expect(saved.life.actions[0].subject).toBe('Biology');expect(saved.life.actions[0].completedAt).toBeTruthy();await noOverflow(page);
});

test('Daily Review and Weekly Report are derived from state, no duplicate report storage',async({page})=>{
 await boot(page);await page.locator('details.life-review').first().locator('summary').click();
 await expect(page.locator('.life-review-grid').first()).toContainText('Routines');
 await tab(page,'Progress');await expect(page.getByText('Weekly Report',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Previous week'}).click();await page.getByRole('button',{name:'Next week'}).click();
 const saved=await state(page);expect(saved.life).not.toHaveProperty('weeklyReports');expect(saved.life).not.toHaveProperty('dailyReports');await noOverflow(page);
});

test('future personal tasks remain editable, priorities sort and delete is confirmed',async({page,context})=>{
 await boot(page);const original=await state(page);
 for(const [title,priority] of [['Future errand','low'],['Urgent errand','high']]){
  await page.getByRole('button',{name:'+ Add',exact:true}).first().click();
  await page.getByLabel('Task title').fill(title);await page.getByLabel('Due date').fill('2026-10-09');await page.getByLabel('Priority').selectOption(priority);
  await page.getByRole('button',{name:'Add task',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 }
 await expect(page.getByRole('button',{name:'Complete Future errand',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'All tasks',exact:true}).click();
 const rows=page.locator('.life-panel').first().locator('.life-item');await expect(rows.first()).toContainText('Urgent errand');
 await page.getByRole('button',{name:/Future errand.*One-time/}).click();await page.getByLabel('Task title').fill('Edited errand');await page.getByLabel('Due date').fill('2026-10-06');await page.getByLabel('Task notes').fill('Keep this note offline');await page.getByRole('button',{name:'Save changes',exact:true}).click();
 await expect(rows.filter({hasText:'Edited errand'})).toContainText('Overdue');
 await page.getByRole('button',{name:'Complete Edited errand',exact:true}).click();await page.getByRole('button',{name:'Mark incomplete Edited errand',exact:true}).click();await expect(page.getByRole('button',{name:'Complete Edited errand',exact:true})).toBeVisible();
 await context.setOffline(true);await page.reload();await page.getByRole('button',{name:'All tasks',exact:true}).click();await expect(page.getByRole('button',{name:'Complete Edited errand',exact:true})).toBeVisible();
 await page.getByRole('button',{name:/Edited errand.*One-time/}).click();await expect(page.getByLabel('Task notes')).toHaveValue('Keep this note offline');await page.getByRole('button',{name:'Delete task',exact:true}).click();await page.getByRole('button',{name:'Cancel',exact:true}).click();expect((await state(page)).life.actions).toHaveLength(2);
 await page.getByRole('button',{name:/Edited errand.*One-time/}).click();await page.getByRole('button',{name:'Delete task',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Delete',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 const after=await state(page);expect(after.life.actions).toHaveLength(1);expect(after.days).toEqual(original.days);await noOverflow(page);
});
