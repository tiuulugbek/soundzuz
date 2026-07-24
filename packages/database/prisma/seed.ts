import "dotenv/config";
import { hash } from "bcryptjs";
import { createPrismaClient } from "../src/index.js";
import { catalogStatements } from "./catalog-sample.js";
const prisma=createPrismaClient();
async function main():Promise<void>{const email=(process.env.ADMIN_SEED_EMAIL??"admin@soundz.uz").toLowerCase();const password=process.env.ADMIN_SEED_PASSWORD??"ChangeMe123!";const passwordHash=await hash(password,12);const roleDefinitions=[
  ["SUPER_ADMIN","Super Administrator"],
  ["CONTENT_MANAGER","Content Manager"],
  ["PRODUCT_MANAGER","Product Manager"],
  ["CALL_CENTER","Call Center"],
  ["BRANCH_MANAGER","Branch Manager"],
  ["VIEWER","Read-only Viewer"],
] as const;const roles=new Map<string,string>();for(const [code,name] of roleDefinitions){const role=await prisma.role.upsert({where:{code},update:{name},create:{code,name}});roles.set(code,role.id)}const user=await prisma.user.upsert({where:{email},update:{passwordHash,firstName:"Soundz",status:"ACTIVE"},create:{email,passwordHash,firstName:"Soundz",status:"ACTIVE"}});const superAdminId=roles.get("SUPER_ADMIN");if(superAdminId)await prisma.userRole.upsert({where:{userId_roleId:{userId:user.id,roleId:superAdminId}},update:{},create:{userId:user.id,roleId:superAdminId}});if(process.env.SEED_DEMO_DATA==="true"){const branch=await prisma.branch.upsert({where:{slug:"demo-filial"},update:{name:"Demo filial — haqiqiy ma’lumot bilan almashtiring",isActive:true},create:{slug:"demo-filial",name:"Demo filial — haqiqiy ma’lumot bilan almashtiring",isActive:true}});const service=await prisma.service.upsert({where:{code:"HEARING_TEST"},update:{name:"Eshitishni tekshirtirish",durationMinutes:30,isActive:true},create:{code:"HEARING_TEST",name:"Eshitishni tekshirtirish",durationMinutes:30,isActive:true}});await prisma.branchService.upsert({where:{branchId_serviceId:{branchId:branch.id,serviceId:service.id}},update:{isActive:true,slotCapacity:1},create:{branchId:branch.id,serviceId:service.id,isActive:true,slotCapacity:1}});for(const weekday of [1,2,3,4,5,6])await prisma.branchSchedule.upsert({where:{branchId_weekday:{branchId:branch.id,weekday}},update:{openMinute:540,closeMinute:1080,isClosed:false},create:{branchId:branch.id,weekday,openMinute:540,closeMinute:1080,isClosed:false}});console.log("Seeded optional demo branch and hearing-test service")}if(process.env.SEED_CATALOG==="true"||process.env.SEED_CATALOG==="1"){const stmts=catalogStatements();for(const s of stmts)await prisma.$executeRawUnsafe(s.text,...(s.values as unknown[]));console.log(`Seeded catalog sample: ${stmts.length} statements (3 brands, 9 models, uz/ru/en)`)}console.log(`Seeded admin: ${email}`)}
main().finally(async()=>prisma.$disconnect()).catch((error:unknown)=>{console.error(error);process.exitCode=1});
