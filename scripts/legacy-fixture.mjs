import {execFileSync} from 'node:child_process';
import {mkdtempSync,symlinkSync,rmSync,mkdirSync,cpSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
for(const [name,sha] of [['v11','4663288501e1a65efb048fffd810d0fdac759626'],['v12','68fcd44cc5fdd70411b98b0be93f21284bd7585f']]){
const dir=mkdtempSync(join(tmpdir(),'daily-os-legacy-'));
try{const archive=execFileSync('git',['archive',sha],{maxBuffer:32*1024*1024});execFileSync('tar',['-x','-C',dir],{input:archive});symlinkSync(resolve('node_modules'),join(dir,'node_modules'));execFileSync('npm',['run','build'],{cwd:dir,stdio:'inherit'});mkdirSync('.test-fixtures',{recursive:true});cpSync(join(dir,'dist'),'.test-fixtures/'+name,{recursive:true});}finally{rmSync(dir,{recursive:true,force:true});}

}
