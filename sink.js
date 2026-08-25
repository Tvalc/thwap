// tiny local image sink: the game POSTs a PNG dataURL body here, we write it to disk.
// lets Claude actually SEE what the canvas renders (POST base64 -> file). dev-only.
const http=require('http'), fs=require('fs'), path=require('path');
const dir=process.argv[2]||'.';
http.createServer((req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','*');
  if(req.method==='OPTIONS'){ res.writeHead(204); res.end(); return; }
  if(req.method==='POST'){
    const u=new URL(req.url,'http://x');
    const name=(u.searchParams.get('name')||'shot').replace(/[^a-z0-9_-]/gi,'');
    let body=''; req.on('data',c=>body+=c);
    req.on('end',()=>{ try{ const b64=body.replace(/^data:image\/png;base64,/,'');
      fs.writeFileSync(path.join(dir,name+'.png'), Buffer.from(b64,'base64'));
      res.writeHead(200); res.end('ok '+name); }catch(e){ res.writeHead(500); res.end(String(e)); } });
    return;
  }
  res.writeHead(404); res.end('sink');
}).listen(8778,'127.0.0.1',()=>console.log('image sink on 127.0.0.1:8778 ->', dir));
