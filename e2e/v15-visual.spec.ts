import {test,expect} from '@playwright/test';
import {boot,tab,noOverflow} from './helpers';
test('More and all four module screens and forms retain mobile design',async({page})=>{
 await boot(page);
 for(const theme of ['dark','light']){
  await tab(page,'Settings');await page.getByLabel('Appearance').selectOption(theme);
  await tab(page,'Today');await page.getByRole('button',{name:'More →'}).click();await noOverflow(page);await expect(page).toHaveScreenshot('more-'+theme+'.png',{fullPage:true});
  for(const [name,button] of [['Ideas','+ Add idea'],['Wishlist','+ Add item'],['Nutrition','+ Log meal'],['Time Tracking','+ Manual entry']]){
   await tab(page,'Today');await page.getByRole('button',{name:'More →'}).click();await page.locator('.module-menu-item').filter({hasText:name}).click();await noOverflow(page);await expect(page).toHaveScreenshot(name.replaceAll(' ','-')+'-'+theme+'.png',{fullPage:true});
   await page.getByRole('button',{name:button,exact:true}).click();await noOverflow(page);await expect(page).toHaveScreenshot(name.replaceAll(' ','-')+'-form-'+theme+'.png');await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  }
 }
});
