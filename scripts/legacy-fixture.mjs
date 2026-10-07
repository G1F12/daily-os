import {execFileSync} from 'node:child_process';
import {mkdtempSync,symlinkSync,rmSync,mkdirSync,cpSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const dir=mkdtempSync(join(tmpdir(),'daily-os-v11-'));
try{const archive=execFileSync('git',['archive','4663288501e1a65efb048fffd810d0fdac759626']);execFileSync('tar',['-x','-C',dir],{input:archive});symlinkSync(resolve('node_modules'),join(dir,'node_modules'));execFileSync('npm',['run','build'],{cwd:dir,stdio:'inherit'});mkdirSync('.test-fixtures',{recursive:true});cpSync(join(dir,'dist'),'.test-fixtures/v11',{recursive:true});}finally{rmSync(dir,{recursive:true,force:true});}
