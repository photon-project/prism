import { TaskEither, fromEither } from "fp-ts/lib/TaskEither";
import { PathLike, readFileSync, writeFileSync, mkdirSync } from "fs";
import { Either, right, left } from "fp-ts/lib/Either";
import { dirname } from "path";
import { sync as mkdirpSync } from "mkdirp";

export const ReadSnapshot = (snapshotPath: PathLike): TaskEither<{}, {}> => {
  return fromEither(readFile(snapshotPath));
};

export const WriteSnapshot = (snapshotPath: PathLike, contents: string): TaskEither<{}, any> => {
  return fromEither(writeFile(snapshotPath, contents));
};

const readFile = (filePath: PathLike): Either<{}, {}> => {
  try {
    const file = readFileSync(filePath).toString();
    return right(JSON.parse(file));
  } catch (e) {
    return left({error: `Could not open file ${filePath}`});
  }
};

const writeFile = (filePath: PathLike, contents: string): Either<{}, {}> => {
  try {
    const dir = dirname(filePath.toString());
    mkdirpSync(dir)
    writeFileSync(filePath, contents);
    return right({message: `Snapshot saved to ${filePath}`});
  } catch (e) {
    return left({error: `Could not write to file ${filePath}`});
  }
};
