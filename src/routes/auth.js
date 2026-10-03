const express=require('express');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const rateLimit=require('express-rate-limit');
const {z}=require('zod');
const db=require('../db');
const env=require('../config');
const router=express.Router();

const loginLimit=rateLimit({windowMs:15*60*1000,max:10,standardHeaders:true,legacyHeaders:false,message:{error:'Demasiados intentos de inicio de sesión. Intenta nuevamente más tarde.'}});
router.post('/login',loginLimit,async(req,res,next)=>{try{
  const d=z.object({empresa:z.string().trim().min(2).max(80),usuario:z.string().trim().min(3).max(100),clave:z.string().min(1).max(200)}).parse(req.body);
  const r=await db.query('SELECT u.id,u.tenant_id,u.username,u.full_name,u.role,u.password_hash,u.active FROM users u JOIN tenants t ON t.id=u.tenant_id WHERE t.slug=$1 AND t.active=true AND u.username=$2 LIMIT 1',[d.empresa.toLowerCase(),d.usuario.toLowerCase()]);
  const u=r.rows[0];
  if(!u||!u.active||!(await bcrypt.compare(d.clave,u.password_hash)))return res.status(401).json({error:'Usuario o contraseña inválidos.'});
  const token=jwt.sign({sub:u.id,tenantId:u.tenant_id,username:u.username,role:u.role,name:u.full_name},env.JWT_SECRET,{expiresIn:'8h'});
  await db.query('INSERT INTO audit_logs(tenant_id,user_id,action,entity,metadata) VALUES($1,$2,$3,$4,$5)',[u.tenant_id,u.id,'auth.login','users',JSON.stringify({username:u.username})]);
  res.json({token,usuario:u.username,nombre:u.full_name,rol:u.role,empresa:d.empresa.toLowerCase()});
}catch(e){next(e)}});

module.exports=router;