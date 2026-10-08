import {execFileSync} from 'node:child_process';
import {mkdtempSync,symlinkSync,rmSync,mkdirSync,cpSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
for(const [version,sha] of [['v12','68fcd44cc5fdd70411b98b0be93f21284bd7585f'],['v13','177bcf7000122c12e697c0a7099344ec29d07ade'],['v14','1a74d3ab0a24bacc9318618e547f6a895912b0f7']]){
 const dir=mkdtempSync(join(tmpdir(),'daily-os-'+version+'-'));
 try{const archive=join(dir,'source.tar');execFileSync('git',['archive','--output',archive,sha]);execFileSync('tar',['-xf',archive,'-C',dir]);symlinkSync(resolve('node_modules'),join(dir,'node_modules'));execFileSync('npm',['run','build'],{cwd:dir,stdio:'inherit'});mkdirSync('.test-fixtures',{recursive:true});cpSync(join(dir,'dist'),'.test-fixtures/'+version,{recursive:true});}finally{rmSync(dir,{recursive:true,force:true});}
}
