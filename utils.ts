import * as d from "./deps.ts";
/** (Async) reads fully text file with given path
 * @param fname path of a text file
 * @return Promise of string
* */
const decoder = new TextDecoder('utf-8');
export async function readSource(fname: string): Promise<string> {
  return decoder.decode(await Deno.readFile(fname));
}

/**
* Checks if dirName exists; if so, calls fn(dirName).
* @param dirName directory checked if exists
* @return result of a call to fn(dirName) 
* @throws Error if dirName does not exist
* */
export async function execFnIfDirExists<Result>(dirName: string, fn: (dir: string)=>Promise<Result>): Promise<Result> {
    const ex = await d.exists(dirName);
    if (ex) {
      return fn(dirName);
    } else {
      throw new Error(`Directory ${dirName} does not exist`);
  }
}
