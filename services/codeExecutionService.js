const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { stdout, stderr } = require("process");
const { error } = require("console");

const EXECUTION_TIMEOUT_MS = 3000;

const createWorkingDirectory = async (submissionId) => {
  const workspacePath = path.join(
    __dirname,
    "..",
    "temp",
    submissionId.toString(),
  );

  await fs.promises.mkdir(workspacePath, {
    recursive: true,
  });

  return workspacePath;
};

const writeSourceFile = async (workspacePath, code, language) => {
  const extensions = {
    python: ".py",
    cpp: ".cpp",
    java: ".java",
  };

  const extension = extensions[language];

  const filePath = path.join(workspacePath, `solution${extension}`);

  await fs.promises.writeFile(filePath, code);

  return filePath;
};

const runProgram = async (filePath, input) => {
  const extension = path.extname(filePath);

  const runners = {
    ".py": runPython,
    ".cpp": runCpp,
    ".java": runJava,
  };

  const runner = runners[extension];

  if (!runner) {
    throw new Error("Unsupported Language");
  }

  return await runner(filePath);
};

const runPython = (filePath, input) => {
  return new Promise((resolve, reject) => {
    const child = spawn("py", [filePath]);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    const stdout = [];
    const stderr = [];

    child.stdout.on("data", (chunk) => {
      stdout.push(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr.push(chunk);
    });

    const timeoutId = setTimeout(() => {
      child.kill();
    }, EXECUTION_TIMEOUT_MS);

    child.on("error", (error) => {
      clearTimeout(timeoutId);
      return reject(error);
    });

    child.on("close", (code, signal) => {
      clearTimeout(timeoutId);

      const output = stdout.join("");
      const stderrOutput = stderr.join("");

      if (signal) {
        const executionError = new Error("Execution timed out");
        executionError.type = EXECUTION_ERROR_TYPES.TIMEOUT;
        return reject(executionError);
      }

      if (code === 0) {
        return resolve({
          stdout: output,
          stderr: stderrOutput,
        });
      }
      const executionError = new Error("Python execution failed");
      executionError.type = EXECUTION_ERROR_TYPES.EXECUTION_FAILED;

      executionError.stdout = output;
      executionError.stderr = stderrOutput;
      executionError.exitCode = code;

      return reject(executionError);
    });

    child.stdin.write(input ?? "");
    child.stdin.end();
  });
};

const executeCode = async ({
  submissionId,
  code,
  language,
  input,
  expectedOutput,
}) => {
  try {
    const workspacePath = await createWorkingDirectory(submissionId);

    const filePath = await writeSourceFile(workspacePath, code, language);

    const { stdout, stderr } = await runProgram(filePath, input);

    const actualOutput = stdout.trim();
    const expected = expectedOutput.trim();

    const verdict = actualOutput === expected ? "Accepted" : "Wrong Answer";

    return {
      verdict,
      stdout,
      stderr,
      runtime: 0,
      memory: 0,
    };
  } catch (error) {
    const verdict =
      error.type == EXECUTION_ERROR_TYPES.TIMEOUT
        ? "Time Limit Exceeded"
        : "Runtime Error";

    return {
      verdict,
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? "",
      runtime: 0,
      memory: 0,
    };
  }
};
// const executeCode = async (code, language) => {
//   return {
//     verdict: "Accepted",
//     runtime: 35,
//     memory: 128,
//   };
// };

module.exports = {
  createWorkingDirectory,
  writeSourceFile,
  runProgram,
  runPython,
};
