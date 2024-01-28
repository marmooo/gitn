import * as path from "https://deno.land/std/path/mod.ts";
import { TextLineStream } from "https://deno.land/std/streams/mod.ts";
import { $ } from "npm:zx@7.2.3";

async function gitClone(repoDir, repoListFile) {
  Deno.chdir(repoDir);
  const file = await Deno.open(repoListFile);
  const lineStream = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  for await (const repoNameDir of lineStream) {
    if (repoNameDir.startsWith(";")) continue;
    console.log(`%c${repoNameDir}`, "font-weight: bold");
    try {
      await $`git clone ${repoNameDir}`.quiet();
    } catch (err) {
      console.log(err);
    }
  }
}

async function gitCommand(cmd, repoDir, repoListFile, args = []) {
  repoDir = path.resolve(repoDir);
  const file = await Deno.open(repoListFile);
  const lineStream = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  for await (const repoNameDir of lineStream) {
    if (repoNameDir.startsWith(";")) continue;
    let [url, repoName] = repoNameDir.split(" ");
    if (!repoName) {
      if (url.endsWith("/")) url = url.slice(0, -1);
      if (url.endsWith(".git")) url = url.slice(0, -4);
      repoName = url.split("/").at(-1);
    }
    Deno.chdir(`${repoDir}${path.sep}${repoName}`);
    console.log(`%c${repoName}`, "font-weight: bold");
    try {
      const quotedArgs = args.map((arg) => `"${arg}"`).join(" ");
      const result = await $`git ${cmd} ${quotedArgs}`.quiet();
      console.log(result.stdout);
    } catch (err) {
      console.log(err);
    }
  }
}

function showHelp() {
  const help = `Usage: gitn [cmd] [dir] [list] [args?...]

  gitn clone vendor/ repos.lst
  gitn pull vendor/ repos.lst
  gitn push vendor/ repos.lst
  gitn status . repos.lst
  gitn add . repos.lst *
  gitn commit . repos.lst -m "comment"`;
  console.log(help);
}

if (Deno.args.length < 3) {
  showHelp();
} else {
  switch (Deno.args[0]) {
    case "help":
    case "--help":
      showHelp();
      break;
    case "clone":
      gitClone(Deno.args[1], Deno.args[2], Deno.args.slice(3));
      break;
    default:
      gitCommand(Deno.args[0], Deno.args[1], Deno.args[2], Deno.args.slice(3));
  }
}
