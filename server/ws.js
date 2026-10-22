'use strict';
// Minimal dependency-free WebSocket server (RFC 6455): text frames, fragmentation, ping/pong, close, payload cap.
const crypto=require('crypto');
const GUID='258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
class Conn{
 constructor(sock,maxPayload){this.sock=sock;this.max=maxPayload;this.buf=Buffer.alloc(0);this.frag=null;this.closed=false;this.onmessage=()=>{};this.onclose=()=>{};this.lastPong=Date.now();
  sock.on('data',d=>this._data(d));sock.on('close',()=>this._end());sock.on('error',()=>this._end());sock.setNoDelay(true)}
 _end(){if(this.closed)return;this.closed=true;try{this.sock.destroy()}catch(_){}this.onclose()}
 _data(d){this.buf=Buffer.concat([this.buf,d]);if(this.buf.length>this.max*2+16){return this.close(1009)}
  for(;;){const b=this.buf;if(b.length<2)return;const fin=!!(b[0]&128),op=b[0]&15,masked=!!(b[1]&128);let len=b[1]&127,off=2;
   if(len==126){if(b.length<4)return;len=b.readUInt16BE(2);off=4}else if(len==127){if(b.length<10)return;const hi=b.readUInt32BE(2),lo=b.readUInt32BE(6);if(hi)return this.close(1009);len=lo;off=10}
   if(!masked)return this.close(1002);if(len>this.max)return this.close(1009);if(b.length<off+4+len)return;
   const mask=b.subarray(off,off+4),pl=Buffer.from(b.subarray(off+4,off+4+len));for(let i=0;i<pl.length;i++)pl[i]^=mask[i&3];this.buf=b.subarray(off+4+len);
   if(op==8){this.close(1000);return}if(op==9){this._frame(10,pl);continue}if(op==10){this.lastPong=Date.now();continue}
   if(op==0||op==1){if(op==1)this.frag={parts:[pl],n:pl.length};else{if(!this.frag)return this.close(1002);this.frag.parts.push(pl);this.frag.n+=pl.length;if(this.frag.n>this.max)return this.close(1009)}
    if(fin){const m=Buffer.concat(this.frag.parts).toString('utf8');this.frag=null;try{this.onmessage(m)}catch(e){if(process.env.RB_DEBUG)console.error("handler error",e.stack)}}}
   else return this.close(1003)}}
 _frame(op,pl){if(this.closed)return;const n=pl.length;let h;if(n<126)h=Buffer.from([128|op,n]);else if(n<65536){h=Buffer.alloc(4);h[0]=128|op;h[1]=126;h.writeUInt16BE(n,2)}else{h=Buffer.alloc(10);h[0]=128|op;h[1]=127;h.writeUInt32BE(0,2);h.writeUInt32BE(n,6)}
  try{this.sock.write(Buffer.concat([h,pl]))}catch(_){}}
 send(s){this._frame(1,Buffer.from(s,'utf8'))}
 ping(){this._frame(9,Buffer.alloc(0))}
 get backlog(){return this.sock.writableLength}
 close(code){if(this.closed)return;const b=Buffer.alloc(2);b.writeUInt16BE(code||1000);this._frame(8,b);this.closed=true;setTimeout(()=>{try{this.sock.destroy()}catch(_){}},200);this.onclose()}}
function upgrade(req,sock,head,{maxPayload=65536,originOk=()=>true}={}){
 const key=req.headers['sec-websocket-key'];if(!key||String(req.headers.upgrade).toLowerCase()!='websocket'||req.headers['sec-websocket-version']!='13'){sock.end('HTTP/1.1 400 Bad Request\r\n\r\n');return null}
 if(!originOk(req.headers.origin)){sock.end('HTTP/1.1 403 Forbidden\r\n\r\n');return null}
 const acc=crypto.createHash('sha1').update(key+GUID).digest('base64');
 sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+acc+'\r\n\r\n');
 const c=new Conn(sock,maxPayload);if(head&&head.length)c._data(head);return c}
module.exports={upgrade};
