import * as path from "https://deno.land/std/path/mod.ts";
import { readLines } from "https://deno.land/std/io/mod.ts";
import { $ } from "https://deno.land/x/deno_dx/mod.ts";

async function gitClone(repoDir, repoListFile) {
  Deno.chdir(repoDir);
  const fileReader = await Deno.open(repoListFile);
  for await (const repoNameDir of readLines(fileReader)) {
    if (repoNameDir.startsWith(";")) continue;
    try {
      console.log(`%c${repoNameDir}`, "font-weight: bold");
      await $`git clone ${repoNameDir}`;
    } catch (err) {
      console.log(`%c${repoNameDir}`, "font-weight: bold");
      console.log(err);
    }
  }
}

async function gitCommand(cmd, repoDir, repoListFile, args = []) {
  repoDir = path.resolve(repoDir);
  const fileReader = await Deno.open(repoListFile);
  for await (const repoNameDir of readLines(fileReader)) {
    if (repoNameDir.startsWith(";")) continue;
    let [url, repoName] = repoNameDir.split(" ");
    if (!repoName) {
      if (url.endsWith("/")) url = url.slice(0, -1);
      repoName = url.split("/").at(-1);
    }
    Deno.chdir(`${repoDir}${path.sep}${repoName}`);
    try {
      const result = await $`git ${cmd} ${args.join(" ")}`;
      console.log(`%c${repoName}`, "font-weight: bold");
      console.log(result);
    } catch (err) {
      console.log(`%c${repoName}`, "font-weight: bold");
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
    case "init":
    case "add":
    case "mv":
    case "restore":
    case "rm":
    case "bisect":
    case "diff":
    case "grep":
    case "log":
    case "show":
    case "status":
    case "branch":
    case "commit":
    case "merge":
    case "rebase":
    case "reset":
    case "switch":
    case "tag":
    case "fetch":
    case "pull":
    case "push":
      gitCommand(Deno.args[0], Deno.args[1], Deno.args[2], Deno.args.slice(3));
      // falls through
    default:
      showHelp();
  }
}
