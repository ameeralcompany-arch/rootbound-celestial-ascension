// Tiny dependency-free WebSocket test client.
const http=require('http'),crypto=require('crypto');
class C{constructor(port,path='/ws'){this.msgs=[];this.waiters=[];this.buf=Buffer.alloc(0);this.closed=false;this.port=port;this.path=path}
 connect(){return new Promise((res,rej)=>{const key=crypto.randomBytes(16).toString('base64');const req=http.request({host:'127.0.0.1',port:this.port,path:this.path,headers:{Connection:'Upgrade',Upgrade:'websocket','Sec-WebSocket-Key':key,'Sec-WebSocket-Version':'13'}});
  req.on('upgrade',(r,sock,head)=>{this.sock=sock;sock.on('data',d=>this._data(d));if(head&&head.length)this._data(head);sock.on('close',()=>{this.closed=true});sock.on('error',()=>{this.closed=true});res(this)});req.on('response',r=>rej(new Error('status '+r.statusCode)));req.on('error',rej);req.end()})}
 _data(d){this.buf=Buffer.concat([this.buf,d]);for(;;){const b=this.buf;if(b.length<2)return;let len=b[1]&127,off=2;if(len==126){if(b.length<4)return;len=b.readUInt16BE(2);off=4}else if(len==127){if(b.length<10)return;len=b.readUInt32BE(6);off=10}if(b.length<off+len)return;const op=b[0]&15,pl=b.subarray(off,off+len);this.buf=b.subarray(off+len);
  if(op==1){let m;try{m=JSON.parse(pl.toString())}catch(_){continue}this.msgs.push(m);this.waiters=this.waiters.filter(w=>{if(w.f(m)){w.r(m);return false}return true})}else if(op==8){this.closed=true}else if(op==9){}}}
 send(o){const p=Buffer.from(typeof o=='string'?o:JSON.stringify(o)),n=p.length,mask=crypto.randomBytes(4);let h;if(n<126)h=Buffer.from([129,128|n]);else if(n<65536){h=Buffer.alloc(4);h[0]=129;h[1]=128|126;h.writeUInt16BE(n,2)}else{h=Buffer.alloc(10);h[0]=129;h[1]=128|127;h.writeUInt32BE(0,2);h.writeUInt32BE(n,6)}
  const m=Buffer.from(p);for(let i=0;i<n;i++)m[i]^=mask[i&3];this.sock.write(Buffer.concat([h,mask,m]))}
 wait(f,ms=3000){const hit=this.msgs.find(f);if(hit)return Promise.resolve(hit);return new Promise((res,rej)=>{const w={f,r:res};this.waiters.push(w);setTimeout(()=>{this.waiters=this.waiters.filter(x=>x!==w);rej(new Error('timeout waiting for message'))},ms)})}
 has(f){return this.msgs.some(f)} clear(){this.msgs=[]}
 async rpc(o,f,ms){this.clear();this.send(o);return this.wait(f,ms)}
 close(){try{this.sock.destroy()}catch(_){}}}
module.exports={C};
