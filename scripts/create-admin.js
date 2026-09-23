'use strict';
require('dotenv').config();
const {MongoClient}=require('mongodb');
const bcrypt=require('bcryptjs');
const crypto=require('crypto');

const uri=String(process.env.MONGODB_URI||'').trim();
const dbName=String(process.env.MONGODB_DB||'devdaha_school_cms').trim();
const username=process.argv[2]||process.env.ADMIN_USERNAME;
const password=process.argv[3]||process.env.ADMIN_PASSWORD;
const email=process.argv[4]||process.env.ADMIN_RESET_EMAIL||'';

if(!uri){console.error('MONGODB_URI is required. Put it in .env first.');process.exit(1)}
if(!username||!password){console.error('Usage: npm run create-admin -- <username> <password> [email]');process.exit(1)}
if(String(password).length<10||!/[A-Za-z]/.test(String(password))||!/\d/.test(String(password))){console.error('Password must be at least 10 characters and contain letters and numbers.');process.exit(1)}

(async()=>{
  const client=new MongoClient(uri,{serverSelectionTimeoutMS:10000});
  try{
    await client.connect();
    const db=client.db(dbName);
    const admins=db.collection('admins');
    const t=new Date();
    const hash=await bcrypt.hash(password,12);
    await admins.updateOne({username},{$set:{username,password_hash:hash,email,updated_at:t},$setOnInsert:{id:crypto.randomUUID(),created_at:t}},{upsert:true});
    console.log(`Admin account ready: ${username}${email?` (${email})`:''}`);
  }catch(e){console.error('Unable to create admin in MongoDB:',e.message);process.exitCode=1}
  finally{await client.close().catch(()=>{})}
})();
