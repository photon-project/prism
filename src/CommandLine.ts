#!/usr/bin/env node

import * as commander from "commander";

import { liftA2 } from "fp-ts/lib/Apply";
import { Either, either, left, right } from "fp-ts/lib/Either";
import { compose, curry, flip } from "fp-ts/lib/function";
import { fromEither, taskEither } from "fp-ts/lib/TaskEither";
import * as jsome from "jsome";
import { isEmpty, isNil, or } from "ramda";
import { PathLike, readFileSync, writeFileSync } from "fs";
import { Run } from "./Index";
import { RunConfig } from "src/types/Types";
import * as Yaml from "yamljs";
import * as Ajv from "ajv";
import * as Emoji from 'node-emoji';


const ConfigSchema = require('./schemas/config.json');

const main = (): void => {
  const version = require("../package.json").version;
  commander
    .version(version)
    .option("-c, --config-file [file]", "Path of the Config file")
    .option("-s, --save", "Saves the captured data as a snapshot instead of running a comparison")
    .parse(process.argv);

  const writeFlag = commander.save;
  const config = checkOption("Config File", commander.configFile)
    .chain(readFile)
    .chain(parseYaml)
    .chain(validateConfig);

  const action = writeFlag ? "write" : "compare";
  const curriedRun = flip(curry(Run))(action);

  fromEither(config)
    .chain(curriedRun)
    .run()
    .then(res =>
      res.fold(
        error => {
          console.error(Emoji.emojify(':disappointed:  Failed with the following errors'));
          jsome(error);
          process.exit(1);
        },
        data => {
          console.error(Emoji.emojify(':clap:  Run Successful.'));
          jsome(data);
          process.exit(0);
        },
      ),
    );
};

const checkOption = (name: string, opt: string): Either<any, string> => {
  const error = {
    message: `Cannot continue without ${name}`,
    success: false,
  };
  return or(isEmpty(opt), isNil(opt)) ? left(error) : right(opt);
};

const readFile = (path: PathLike): Either<any, string> => {
  try {
    const file = readFileSync(path).toString();
    return right(file);
  } catch (e) {
    return left(`Could not read Config file: ${path}`);
  }
};

const parseYaml = (string: string): Either<any, {}> => {
  try {
    return right(Yaml.parse(string));
  } catch (e) {
    return left(`Could not read YAML from file: ${string}`);
  }
};

const validateConfig = (config: {}): Either<any, RunConfig> => {
  try {
    const ajv = new Ajv();
    if (ajv.validate(ConfigSchema, config)) {
      return right(config as RunConfig);
    } else {
      return left({ message: `Schema validation failed`, context: config, error: ajv.errors });
    }
  } catch (e) {
    return left({ message: "Could not validate schema file", context: config, error: e });
  }
};

main();
