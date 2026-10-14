// Build-only read credential. Never imported into browser code.
let input='';for await(const chunk of process.stdin)input+=chunk;
const fields=Object.fromEntries(input.trim().split('\n').map(line=>{const i=line.indexOf('=');return [line.slice(0,i),line.slice(i+1)];}));
if(process.argv.at(-1)==='get' && fields.protocol==='https' && fields.host==='github.com' && fields.path?.replace(/\.git$/,'')==='digital-Alchemy-mcmg/Envoy_Diplomat' && process.env.MARA_B_SOURCE_TOKEN)process.stdout.write(`username=x-access-token\npassword=${process.env.MARA_B_SOURCE_TOKEN}\n\n`);

export {};
