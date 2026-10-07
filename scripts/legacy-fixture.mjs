import {execFileSync} from 'node:child_process';
import {mkdtempSync,symlinkSync,rmSync,mkdirSync,cpSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const dir=mkdtempSync(join(tmpdir(),'daily-os-v11-'));
try{const archive=execFileSync('git',['archive','68fcd44cc5fdd70411b98b0be93f21284bd7585f']);execFileSync('tar',['-x','-C',dir],{input:archive});symlinkSync(resolve('node_modules'),join(dir,'node_modules'));execFileSync('npm',['run','build'],{cwd:dir,stdio:'inherit'});mkdirSync('.test-fixtures',{recursive:true});cpSync(join(dir,'dist'),'.test-fixtures/v12',{recursive:true});}finally{rmSync(dir,{recursive:true,force:true});}
