"use client";
import { useEffect,useRef } from "react";

type Command="bold"|"italic"|"underline"|"insertUnorderedList"|"insertOrderedList"|"formatBlock"|"createLink"|"removeFormat";
export function RichTextEditor({value,onChange}:{value:string;onChange:(html:string)=>void}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(ref.current&&ref.current.innerHTML!==value)ref.current.innerHTML=value||"<p></p>"},[value]);
 function run(command:Command,arg?:string){ref.current?.focus();document.execCommand(command,false,arg);onChange(ref.current?.innerHTML??"")}
 function link(){const url=window.prompt("Havolani kiriting (https://...)");if(url)run("createLink",url)}
 return <div className="rich-editor"><div className="rich-toolbar"><button type="button" onClick={()=>run("formatBlock","p")}>P</button><button type="button" onClick={()=>run("formatBlock","h2")}>H2</button><button type="button" onClick={()=>run("formatBlock","h3")}>H3</button><button type="button" onClick={()=>run("bold")}><strong>B</strong></button><button type="button" onClick={()=>run("italic")}><em>I</em></button><button type="button" onClick={()=>run("underline")}><u>U</u></button><button type="button" onClick={()=>run("insertUnorderedList")}>• Ro‘yxat</button><button type="button" onClick={()=>run("insertOrderedList")}>1. Ro‘yxat</button><button type="button" onClick={()=>run("formatBlock","blockquote")}>Iqtibos</button><button type="button" onClick={link}>Havola</button><button type="button" onClick={()=>run("removeFormat")}>Tozalash</button></div><div ref={ref} className="rich-editor-canvas" contentEditable suppressContentEditableWarning onInput={e=>onChange(e.currentTarget.innerHTML)} /></div>
}
