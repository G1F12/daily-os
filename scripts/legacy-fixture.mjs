import {execFileSync} from 'node:child_process';
import {mkdtempSync,symlinkSync,rmSync,mkdirSync,cpSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const dir=mkdtempSync(join(tmpdir(),'daily-os-v12-'));
try{const archive=join(dir,'source.tar');execFileSync('git',['archive','--output',archive,'68fcd44cc5fdd70411b98b0be93f21284bd7585f']);execFileSync('tar',['-xf',archive,'-C',dir]);symlinkSync(resolve('node_modules'),join(dir,'node_modules'));execFileSync('npm',['run','build'],{cwd:dir,stdio:'inherit'});mkdirSync('.test-fixtures',{recursive:true});cpSync(join(dir,'dist'),'.test-fixtures/v12',{recursive:true});}finally{rmSync(dir,{recursive:true,force:true});}
