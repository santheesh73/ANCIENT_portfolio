import {chromium} from "playwright";
import {mkdir, writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import sharp from "sharp";

const out=resolve(process.argv[2]??"test-results/visual");
const base=process.env.ARCHIVE_PREVIEW_URL??"http://127.0.0.1:3100";
const record=process.argv.includes("--motion");
const plates=process.argv.includes("--plates");
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:"chrome",args:["--enable-webgl","--ignore-gpu-blocklist","--enable-unsafe-swiftshader"]});

async function capture(width,height,mobile){
  const page=await browser.newPage({viewport:{width,height}});
  page.on("pageerror",error=>console.error(error));
  page.on("console",message=>{if(message.type()==="error") console.error(message.text());});
  await page.goto(base,{waitUntil:"networkidle"});
  await page.waitForSelector("[data-artwork=live]",{timeout:20000});
  const move=async (id,fraction=0)=>{
    await page.locator("#"+id).evaluate((section,part)=>window.scrollTo({top:section.offsetTop+section.offsetHeight*part,behavior:"instant"}),fraction);
    await page.waitForTimeout(900);
  };
  const screenshot=async(name, plateName)=>{
    await page.screenshot({path:resolve(out,(mobile?"mobile-":"")+name+".jpg"),quality:88,timeout:20000});
    if(!plates || !plateName) return;
    const paint=await page.addStyleTag({content:"body .site-header,.landmark,.route-controls,.route-progress,.expedition .backdrop::after{visibility:hidden !important}"});
    const still=await page.screenshot({timeout:20000});
    await sharp(still).resize({width:1440,withoutEnlargement:true}).webp({quality:78}).toFile("public/plates/"+plateName+".webp");
    await paint.evaluate(style=>style.remove());
  };
  await page.waitForTimeout(800);
  await screenshot("frontier",mobile?"mobile-frontier":"frontier");
  if(!mobile){
    await move("approach",.5);
    await screenshot("crossing");
    await move("observatory");
    await screenshot("observatory","outer-observatory");
  }
  await move("philosophy");
  await screenshot("chamber",mobile?"mobile-chamber":"chamber");
  if(!mobile){
    await move("passage");
    await screenshot("passage","vault-passage");
  }
  await move("gallery");
  await screenshot("vault",mobile?"mobile-vault":"vault");
  if(!mobile){
    await move("exhibit-orion");
    await screenshot("orion");
    await move("contact");
    await screenshot("gate","frontier-gate");
  }
  if(!mobile && record){
    await move("hero");
    const clip=await page.locator("canvas").evaluate(async canvas=>{
      const stream=canvas.captureStream(30);
      const movie=new MediaRecorder(stream,{mimeType:"video/webm;codecs=vp8",videoBitsPerSecond:3600000});
      const chunks=[];
      const stop=new Promise(resolve=>{
        movie.addEventListener("dataavailable",event=>chunks.push(event.data));
        movie.addEventListener("stop",()=>resolve(new Blob(chunks,{type:"video/webm"})),{once:true});
      });
      movie.start();
      const from=window.scrollY;
      const to=document.getElementById("contact").offsetTop;
      await new Promise(resolve=>{
        const start=performance.now();
        const frame=(now)=>{
          const t=Math.min(1,(now-start)/17000);
          window.scrollTo({top:from+(to-from)*t,behavior:"instant"});
          if(t<1) requestAnimationFrame(frame);
          else setTimeout(resolve,850);
        };
        requestAnimationFrame(frame);
      });
      movie.stop();
      const file=await stop;
      const data=await new Promise(resolve=>{
        const reader=new FileReader();
        reader.onload=()=>resolve(reader.result);
        reader.readAsDataURL(file);
      });
      stream.getTracks().forEach(track=>track.stop());
      return data.split(",")[1];
    });
    await writeFile(resolve(out,"continuous-camera.webm"),Buffer.from(clip,"base64"));
  }
  await page.close();
}

try {
  await capture(1440,900,false);
  await capture(390,844,true);
} finally {
  await browser.close();
}
