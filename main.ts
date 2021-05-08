
import { flags } from "./deps.ts";
import main from "./dirscan.ts";
const flagsOptions = {string: ["source", "dest"], default: {"dest":"output"}};
const parsed = flags.parse(Deno.args, flagsOptions);

main(parsed.source, parsed.dest);
